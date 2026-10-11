import { useState, type ReactNode } from "react";
import { useFieldArray, useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import {
  budgetOptions,
  cityOptions,
  dayOptions,
  focusTopicOptions,
  heardFromOptions,
  inquirySchema,
  scheduleOptions,
  type InquiryInput,
} from "@shared/inquiry";
import { sendInquiry } from "@/lib/submit-form";

const inputClass =
  "w-full rounded-2xl border-2 border-kv-sand bg-white px-4 py-3 font-body text-base text-kv-ink placeholder:text-kv-inkSoft/50 outline-none transition focus:border-kv-coral focus:ring-4 focus:ring-kv-coral/15";

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: FieldError | { message?: string };
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block font-body font-bold text-kv-ink">
          {label}
        </label>
      )}
      {hint && <p className="-mt-1 mb-2 font-body text-sm text-kv-inkSoft">{hint}</p>}
      {children}
      {error?.message && (
        <p role="alert" className="mt-1.5 font-body text-sm font-semibold text-kv-coralDark">
          {error.message}
        </p>
      )}
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
  multiple,
  name,
}: {
  options: readonly { value: T; label: string }[];
  value: T[] | T | undefined;
  onChange: (v: any) => void;
  multiple?: boolean;
  name: string;
}) {
  const selected = (v: T) => (multiple ? ((value as T[]) ?? []).includes(v) : value === v);
  const toggle = (v: T) => {
    if (!multiple) return onChange(v);
    const current = (value as T[]) ?? [];
    onChange(selected(v) ? current.filter((x) => x !== v) : [...current, v]);
  };
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={selected(o.value)}
          onClick={() => toggle(o.value)}
          className={`rounded-full border-2 px-4 py-2 font-body text-sm font-bold transition ${
            selected(o.value)
              ? "border-kv-coral bg-kv-coral text-white"
              : "border-kv-sand bg-white text-kv-ink hover:border-kv-coral/60"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 border-t-2 border-dashed border-kv-sand pt-8 first:border-t-0 first:pt-0">
      <legend className="flex items-center gap-3 font-display text-2xl font-semibold text-kv-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kv-sun font-display text-lg text-kv-ink">
          {number}
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export default function EnrollForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      parentName: "",
      email: "",
      phone: "",
      children: [{ name: "", birthdate: "" }],
      startDate: "",
      days: [],
      hours: "",
      expectations: "",
      focusTopics: [],
      otherTopics: "",
      notes: "",
      heardFrom: "",
      website: "",
    },
  });
  const { register, handleSubmit, watch, setValue, formState } = form;
  const { errors } = formState;
  const children = useFieldArray({ control: form.control, name: "children" });

  const onSubmit = async (data: InquiryInput) => {
    setStatus("sending");
    try {
      await sendInquiry(data);
      setStatus("sent");
      document.getElementById("enroll")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="py-10 text-center" role="status">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-kv-sage text-4xl">🎉</div>
        <h3 className="mt-6 font-display text-3xl font-bold text-kv-ink">Thank you!</h3>
        <p className="mx-auto mt-3 max-w-md font-body text-lg text-kv-inkSoft">
          Your request is in. We'll reach out within a couple of days to chat and set up a visit.
        </p>
      </div>
    );
  }

  const today = new Date();
  const minMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* Honeypot for spam bots — hidden from people and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <Step number={1} title="About you">
        <Field label="Your name" htmlFor="parentName" error={errors.parentName}>
          <input id="parentName" autoComplete="name" className={inputClass} {...register("parentName")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" className={inputClass} {...register("email")} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <input id="phone" type="tel" autoComplete="tel" className={inputClass} {...register("phone")} />
          </Field>
        </div>
        <Field label="Where do you live?" error={errors.city}>
          <Chips
            name="City"
            options={cityOptions}
            value={watch("city")}
            onChange={(v) => setValue("city", v, { shouldValidate: formState.isSubmitted })}
          />
        </Field>
      </Step>

      <Step number={2} title="Your little ones">
        <div className="space-y-3">
          {children.fields.map((field, index) => (
            <div key={field.id} className="grid items-start gap-3 rounded-2xl bg-kv-cream p-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label={`Child ${index + 1} name (optional)`} htmlFor={`child-${index}-name`}>
                <input id={`child-${index}-name`} className={inputClass} {...register(`children.${index}.name`)} />
              </Field>
              <Field
                label="Birthdate or due date"
                htmlFor={`child-${index}-birthdate`}
                error={errors.children?.[index]?.birthdate}
              >
                <input
                  id={`child-${index}-birthdate`}
                  type="date"
                  className={inputClass}
                  {...register(`children.${index}.birthdate`)}
                />
              </Field>
              {children.fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => children.remove(index)}
                  className="mt-8 rounded-full p-2 text-kv-inkSoft hover:bg-white hover:text-kv-coralDark"
                  aria-label={`Remove child ${index + 1}`}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {children.fields.length < 5 && (
          <button
            type="button"
            onClick={() => children.append({ name: "", birthdate: "" })}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-body font-bold text-kv-coral hover:bg-kv-cream"
          >
            <Plus className="h-4 w-4" /> Add another child
          </button>
        )}
      </Step>

      <Step number={3} title="Schedule">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ideal start month" htmlFor="startDate" error={errors.startDate}>
            <input id="startDate" type="month" min={minMonth} className={inputClass} {...register("startDate")} />
          </Field>
          <Field label="Typical hours (optional)" htmlFor="hours">
            <input id="hours" placeholder="e.g. 8:00 am – 5:00 pm" className={inputClass} {...register("hours")} />
          </Field>
        </div>
        <Field label="Full-time or part-time?" error={errors.schedule}>
          <Chips
            name="Schedule"
            options={scheduleOptions}
            value={watch("schedule")}
            onChange={(v) => setValue("schedule", v, { shouldValidate: formState.isSubmitted })}
          />
        </Field>
        <Field label="Which days?" error={errors.days}>
          <Chips
            name="Days"
            multiple
            options={dayOptions}
            value={watch("days")}
            onChange={(v) => setValue("days", v, { shouldValidate: formState.isSubmitted })}
          />
        </Field>
      </Step>

      <Step number={4} title="What matters to you">
        <Field
          label="What are you hoping for in a daycare?"
          hint="Your child's personality, routines, what worked (or didn't) before…"
          htmlFor="expectations"
          error={errors.expectations}
        >
          <textarea id="expectations" rows={4} className={`${inputClass} resize-y`} {...register("expectations")} />
        </Field>
        <Field label="Topics you'd like us to focus on" hint="Pick as many as you like." error={errors.focusTopics}>
          <Chips
            name="Focus topics"
            multiple
            options={focusTopicOptions}
            value={watch("focusTopics")}
            onChange={(v) => setValue("focusTopics", v, { shouldValidate: formState.isSubmitted })}
          />
        </Field>
        <Field label="Anything else to focus on? (optional)" htmlFor="otherTopics">
          <input id="otherTopics" className={inputClass} {...register("otherTopics")} />
        </Field>
      </Step>

      <Step number={5} title="Budget & details">
        <Field label="Weekly budget per child" hint="This helps us find the right fit — it's not a commitment." error={errors.budget}>
          <Chips
            name="Budget"
            options={budgetOptions}
            value={watch("budget")}
            onChange={(v) => setValue("budget", v, { shouldValidate: formState.isSubmitted })}
          />
        </Field>
        <Field label="Allergies, special needs or other notes (optional)" htmlFor="notes">
          <textarea id="notes" rows={3} className={`${inputClass} resize-y`} {...register("notes")} />
        </Field>
        <Field label="How did you hear about us? (optional)" htmlFor="heardFrom">
          <select id="heardFrom" className={inputClass} {...register("heardFrom")}>
            <option value="">Choose one</option>
            {heardFromOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="" error={errors.consent}>
          <label className="flex cursor-pointer items-start gap-3 font-body text-kv-ink">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-kv-coral" {...register("consent")} />
            <span>It's okay to contact me by email or phone about care for my child.</span>
          </label>
        </Field>
      </Step>

      {status === "error" && (
        <p role="alert" className="rounded-2xl bg-[#FBE3DA] p-4 font-body font-semibold text-kv-coralDark">
          Sorry, we couldn't send your request ({errorMessage}). Please try again, or email us directly.
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="font-body font-semibold text-kv-coralDark">
          Please check the highlighted fields above.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-kv-coral px-8 py-4 font-display text-xl font-semibold text-white shadow-[0_5px_0_#C9573A] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-70"
      >
        {status === "sending" && <Loader2 className="h-5 w-5 animate-spin" />}
        {status === "sending" ? "Sending…" : "Request a spot"}
      </button>
      <p className="text-center font-body text-sm text-kv-inkSoft">
        We'll only use your details to talk with you about care. We never share them.
      </p>
    </form>
  );
}
