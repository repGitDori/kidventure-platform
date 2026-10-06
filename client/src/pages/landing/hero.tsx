import { hero, promises } from "./content";
import { HeroIllustration, Scribble, Sparkle } from "./doodles";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-kv-cream">
      <Sparkle className="absolute left-[6%] top-16 hidden h-6 w-6 text-kv-sun md:block" />
      <Sparkle className="absolute right-[45%] top-10 hidden h-4 w-4 text-kv-sky md:block" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:pb-24 md:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-body text-sm font-bold text-kv-sageDark shadow-sm ring-1 ring-kv-sand">
            <span className="h-2 w-2 animate-pulse rounded-full bg-kv-sage" />
            {hero.badge}
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] text-kv-ink sm:text-6xl lg:text-7xl">
            {hero.titleStart}{" "}
            <span className="relative inline-block text-kv-coral">
              {hero.titleHighlight}
              <Scribble className="absolute -bottom-3 left-0 h-4 w-full text-kv-sun" />
            </span>
          </h1>

          <p className="mt-8 max-w-xl font-body text-lg leading-relaxed text-kv-inkSoft md:text-xl">
            {hero.description}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#enroll"
              className="rounded-full bg-kv-coral px-8 py-4 text-center font-display text-xl font-semibold text-white shadow-[0_5px_0_#C9573A] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
            >
              Request a spot
            </a>
            <a
              href="#about"
              className="rounded-full border-2 border-kv-ink bg-white px-8 py-4 text-center font-display text-xl font-semibold text-kv-ink transition-colors hover:bg-kv-ink hover:text-white"
            >
              Meet your provider
            </a>
          </div>
        </div>

        <div className="relative">
          <HeroIllustration className="w-full" />
          <div className="absolute -left-2 top-6 rotate-[-6deg] animate-float rounded-2xl bg-white px-4 py-2 font-display font-semibold text-kv-ink shadow-lg sm:left-0">
            🎓 Degreed educator
          </div>
          <div
            className="absolute -bottom-3 right-0 rotate-[5deg] animate-float rounded-2xl bg-kv-sun px-4 py-2 font-display font-semibold text-kv-ink shadow-lg sm:bottom-8 sm:right-2"
            style={{ animationDelay: "1.5s" }}
          >
            🏡 Only a few spots
          </div>
        </div>
      </div>

      {/* promise strip */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <ul className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(46,42,59,0.35)] ring-1 ring-kv-sand sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
          {promises.map((p, i) => (
            <li key={p.title} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white ${
                  ["bg-kv-sage", "bg-kv-sky", "bg-kv-sun", "bg-kv-lilac"][i % 4]
                }`}
              >
                {i + 1}
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-kv-ink">{p.title}</h2>
                <p className="font-body text-sm leading-relaxed text-kv-inkSoft">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
