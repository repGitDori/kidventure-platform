import { z } from "zod";

// Enrollment inquiry submitted from the public landing page.
// Shared by the client form (validation + options) and the server route.

export const cityOptions = [
  { value: "lehi", label: "Lehi" },
  { value: "american-fork", label: "American Fork" },
  { value: "other", label: "Elsewhere in Utah County" },
] as const;

export const scheduleOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "flexible", label: "Not sure yet" },
] as const;

export const dayOptions = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
] as const;

export const focusTopicOptions = [
  { value: "letters-reading", label: "Letters & early reading" },
  { value: "numbers-counting", label: "Numbers & counting" },
  { value: "social-skills", label: "Sharing & making friends" },
  { value: "emotions", label: "Feelings & self-regulation" },
  { value: "kindergarten-readiness", label: "Kindergarten readiness" },
  { value: "potty-training", label: "Potty training" },
  { value: "outdoor-nature", label: "Outdoor & nature play" },
  { value: "arts-crafts", label: "Arts & crafts" },
  { value: "music-movement", label: "Music & movement" },
  { value: "science-stem", label: "Science & discovery" },
  { value: "second-language", label: "Spanish / second language" },
  { value: "routines", label: "Healthy routines (naps, meals)" },
] as const;

export const budgetOptions = [
  { value: "under-150", label: "Under $150 / week" },
  { value: "150-200", label: "$150 – $200 / week" },
  { value: "200-250", label: "$200 – $250 / week" },
  { value: "250-300", label: "$250 – $300 / week" },
  { value: "300-plus", label: "$300+ / week" },
  { value: "discuss", label: "I'd like to discuss" },
] as const;

export const heardFromOptions = [
  { value: "friend", label: "Friend or neighbor" },
  { value: "facebook", label: "Facebook / Instagram" },
  { value: "google", label: "Google search" },
  { value: "church", label: "Church or community group" },
  { value: "other", label: "Other" },
] as const;

const values = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

export const inquiryChildSchema = z.object({
  name: z.string().trim().max(60).optional().default(""),
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Please enter a birthdate or due date" }),
});

export const inquirySchema = z.object({
  parentName: z.string().trim().min(2, { message: "Please enter your name" }).max(100),
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(200),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Please enter a phone number" })
    .max(30)
    .regex(/^[0-9+().\-\s]+$/, { message: "Please enter a valid phone number" }),
  city: z.enum(values(cityOptions), { required_error: "Please choose your city" }),
  children: z.array(inquiryChildSchema).min(1).max(5),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, { message: "When would you like to start?" }),
  schedule: z.enum(values(scheduleOptions), { required_error: "Please choose a schedule" }),
  days: z.array(z.enum(values(dayOptions))).min(1, { message: "Pick at least one day" }),
  hours: z.string().trim().max(100).optional().default(""),
  expectations: z
    .string()
    .trim()
    .min(10, { message: "Tell us a little about what you're looking for" })
    .max(2000),
  focusTopics: z.array(z.enum(values(focusTopicOptions))).min(1, { message: "Pick at least one topic" }),
  otherTopics: z.string().trim().max(500).optional().default(""),
  budget: z.enum(values(budgetOptions), { required_error: "Please choose a budget range" }),
  notes: z.string().trim().max(2000).optional().default(""),
  heardFrom: z.union([z.enum(values(heardFromOptions)), z.literal("")]).optional().default(""),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree so we can contact you" }) }),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional().default(""),
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type InquiryData = z.output<typeof inquirySchema>;

export type InquiryStatus = "new" | "contacted" | "toured" | "enrolled" | "closed";

export type Inquiry = Omit<InquiryData, "website" | "consent"> & {
  id: number;
  status: InquiryStatus;
  createdAt: string;
};

export const labelFor = (
  options: readonly { value: string; label: string }[],
  value: string,
) => options.find((o) => o.value === value)?.label ?? value;
