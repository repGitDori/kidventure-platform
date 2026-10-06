import { site } from "./content";
import { Sparkle } from "./doodles";
import EnrollForm from "./enroll-form";

const nextSteps = [
  { title: "Send your request", text: "Tell us about your family, schedule, goals and budget." },
  { title: "We'll call you", text: "We personally reach out within a couple of days." },
  { title: "Come visit", text: "Meet us, see the space and ask anything you like." },
];

export default function Enroll() {
  return (
    <section id="enroll" className="scroll-mt-20 bg-kv-cream px-4 py-16 md:py-24">
      <div className="relative mx-auto max-w-6xl rounded-[2.5rem] bg-kv-sun p-3 shadow-[0_30px_60px_-30px_rgba(46,42,59,0.45)] md:p-4">
        <Sparkle className="absolute right-10 top-10 hidden h-10 w-10 text-white lg:block" />
        <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
          <div className="p-5 md:p-8 lg:sticky lg:top-24 lg:self-start">
            <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 font-body text-sm font-bold text-kv-ink">
              Limited spots · {site.area}
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-kv-ink md:text-5xl">
              Request a spot for your little one
            </h2>
            <p className="mt-4 font-body text-lg text-kv-ink/80">
              Because this is a small in-home daycare, only a few spots are available. Share what you're looking for and
              we'll see if we're a great fit for each other.
            </p>
            <ol className="mt-8 space-y-4">
              {nextSteps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kv-ink font-display font-bold text-kv-sun">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold text-kv-ink">{step.title}</p>
                    <p className="font-body text-kv-ink/75">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[2rem] bg-white p-5 sm:p-8 md:p-10">
            <EnrollForm />
          </div>
        </div>
      </div>
    </section>
  );
}
