import { dailyRhythm } from "./content";
import { Sparkle, Wave } from "./doodles";

const dots = ["bg-kv-sun", "bg-kv-sky", "bg-kv-sage", "bg-kv-coral", "bg-kv-lilac", "bg-kv-sun"];

export default function DailyRhythm() {
  return (
    <section id="our-day" className="relative bg-kv-ink text-white">
      <Wave className="-mt-px text-white" flip />
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Sparkle className="h-8 w-8 text-kv-sun" />
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">A day at Kid‑Venture</h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-white/75">
              Children thrive on rhythm. Our days flow between busy and calm, together and independent, indoors and out —
              so every child feels secure and ready to explore.
            </p>
          </div>

          <ol className="relative grid gap-5 sm:grid-cols-2">
            {dailyRhythm.map((item, i) => (
              <li
                key={item.time}
                className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${dots[i % dots.length]}`} />
                  <span className="font-display text-lg font-semibold text-kv-sun">{item.time}</span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 font-body text-white/75">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <Wave className="text-kv-cream" />
    </section>
  );
}
