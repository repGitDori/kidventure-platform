import { useContext, useEffect, useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { UserContext } from "@/App";
import { site } from "./content";
import { Logo } from "./doodles";

const links = [
  { href: "#programs", label: "Programs" },
  { href: "#our-day", label: "Our Day" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "bg-kv-cream/90 shadow-[0_6px_24px_-12px_rgba(46,42,59,0.25)] backdrop-blur" : "bg-kv-cream"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <a href="#top" className="flex items-center gap-2.5">
          <Logo className="h-11 w-11" />
          <span className="font-display text-2xl font-bold tracking-tight text-kv-ink">{site.name}</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body font-semibold text-kv-inkSoft transition-colors hover:text-kv-coral"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="font-body font-semibold text-kv-inkSoft transition-colors hover:text-kv-coral"
          >
            {user ? "Parent portal" : "Log in"}
          </Link>
          <a
            href="#waitlist"
            className="rounded-full bg-kv-coral px-6 py-3 font-display text-lg font-semibold text-white shadow-[0_4px_0_#C9573A] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Join the list
          </a>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-kv-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-kv-sand bg-kv-cream px-4 pb-6 lg:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-body text-lg font-semibold text-kv-ink hover:bg-kv-sand"
              >
                {link.label}
              </a>
            ))}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-xl px-3 py-3 font-body text-lg font-semibold text-kv-inkSoft hover:bg-kv-sand"
            >
              {user ? "Parent portal" : "Log in"}
            </Link>
          </nav>
          <a
            href="#waitlist"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-kv-coral px-6 py-3 text-center font-display text-lg font-semibold text-white"
          >
            Join the interest list
          </a>
        </div>
      )}
    </header>
  );
}
