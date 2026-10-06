import WaitlistForm from "@/components/ui/waitlist-form";
import { Sparkle } from "./doodles";

export default function Waitlist() {
  return (
    <section id="waitlist" className="bg-kv-cream px-4 py-16 md:py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-kv-sun p-2 shadow-[0_30px_60px_-30px_rgba(46,42,59,0.45)]">
        <Sparkle className="absolute right-8 top-8 hidden h-10 w-10 text-white md:block" />
        <Sparkle className="absolute bottom-10 left-6 hidden h-6 w-6 text-kv-coral md:block" />
        <div className="grid gap-8 p-6 md:grid-cols-[2fr_3fr] md:p-10">
          <div className="md:pt-6">
            <h2 className="font-display text-4xl font-bold leading-tight text-kv-ink md:text-5xl">
              Save your little one a spot
            </h2>
            <p className="mt-4 font-body text-lg text-kv-ink/80">
              Spaces will be limited. Join our interest list to be first in line for tours, opening news and enrollment.
            </p>
            <ul className="mt-6 space-y-2 font-body font-semibold text-kv-ink">
              <li>✓ No commitment, no fees</li>
              <li>✓ Early access to tours</li>
              <li>✓ We never share your details</li>
            </ul>
          </div>
          <div className="rounded-[2rem] bg-white p-6 md:p-8">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
