import { site } from "./content";
import { Logo } from "./doodles";

export default function Footer() {
  return (
    <footer className="bg-kv-ink px-4 py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <div>
            <p className="font-display text-xl font-bold">{site.name}</p>
            <p className="font-body text-sm text-white/60">{site.tagline}</p>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body text-white/75" aria-label="Footer">
          <a href="#programs" className="hover:text-kv-sun">Programs</a>
          <a href="#our-day" className="hover:text-kv-sun">Our Day</a>
          <a href="#about" className="hover:text-kv-sun">About</a>
          <a href="#faq" className="hover:text-kv-sun">FAQ</a>
          <a href="#contact" className="hover:text-kv-sun">Contact</a>
        </nav>
        <p className="font-body text-sm text-white/50">
          &copy; {new Date().getFullYear()} {site.name}. Made with love.
        </p>
      </div>
    </footer>
  );
}
