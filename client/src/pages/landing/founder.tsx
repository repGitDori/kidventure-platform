import { founderNote, site } from "./content";
import { Logo, Scribble } from "./doodles";

export default function Founder() {
  return (
    <section id="about" className="overflow-hidden bg-kv-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[2fr_3fr] md:py-24">
        {/* Swap this card for a real photo of the space or the founder when you have one. */}
        <div className="relative mx-auto aspect-square w-full max-w-[18rem] sm:max-w-sm">
          <div className="absolute inset-0 rotate-6 rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-kv-sage" />
          <div className="absolute inset-3 -rotate-3 flex flex-col items-center justify-center rounded-[55%_45%_48%_52%/52%_55%_45%_48%] bg-white p-10 text-center shadow-xl">
            <Logo className="h-24 w-24" />
            <p className="mt-4 font-display text-3xl font-bold text-kv-ink">{site.name}</p>
            <p className="font-display text-lg text-kv-coral">{site.tagline}</p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-4xl font-bold text-kv-ink md:text-5xl">
            {founderNote.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="relative inline-block">
              {founderNote.title.split(" ").slice(-1)}
              <Scribble className="absolute -bottom-2 left-0 h-3 w-full text-kv-sage" />
            </span>
          </h2>
          <div className="mt-8 space-y-5 font-body text-lg leading-relaxed text-kv-inkSoft">
            {founderNote.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-6 font-display text-xl font-semibold text-kv-coral">{founderNote.signature}</p>
        </div>
      </div>
    </section>
  );
}
