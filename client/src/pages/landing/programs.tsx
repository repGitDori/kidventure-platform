import { Check } from "lucide-react";
import { programs } from "./content";
import { ProgramIcon, Squiggle, Wave } from "./doodles";

const palette = {
  sage: { card: "bg-[#E6F1E8]", chip: "bg-kv-sage", check: "text-kv-sageDark" },
  sun: { card: "bg-[#FDF0D2]", chip: "bg-kv-sun", check: "text-[#B07A0E]" },
  coral: { card: "bg-[#FBE3DA]", chip: "bg-kv-coral", check: "text-kv-coralDark" },
};

export default function Programs() {
  return (
    <section id="learning" className="relative bg-white">
      <Wave className="-mt-px text-kv-cream" flip />
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Squiggle className="mx-auto mb-4 h-4 w-24 text-kv-coral" />
          <h2 className="font-display text-4xl font-bold text-kv-ink md:text-5xl">What we learn together</h2>
          <p className="mt-4 font-body text-lg text-kv-inkSoft">
            A balanced day of play, early learning and character building, planned by a degreed educator and adapted to each child.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {programs.map((program, i) => {
            const c = palette[program.color];
            return (
              <article
                key={program.name}
                className={`${c.card} relative flex flex-col rounded-[2rem] p-8 transition-transform hover:-translate-y-1 ${
                  i === 1 ? "md:-translate-y-4 md:hover:-translate-y-5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <ProgramIcon variant={program.color} className="h-16 w-16" />
                  <span className={`${c.chip} rounded-full px-3 py-1 font-body text-xs font-bold uppercase tracking-wide text-white`}>
                    {program.tag}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-kv-ink">{program.name}</h3>
                <p className="mt-3 font-body leading-relaxed text-kv-inkSoft">{program.description}</p>
                <ul className="mt-6 space-y-2.5">
                  {program.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 font-body font-semibold text-kv-ink">
                      <Check className={`h-5 w-5 shrink-0 ${c.check}`} strokeWidth={3} />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
