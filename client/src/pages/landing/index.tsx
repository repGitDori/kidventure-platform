import { useEffect } from "react";
import Nav from "@/pages/landing/nav";
import Hero from "@/pages/landing/hero";
import Programs from "@/pages/landing/programs";
import DailyRhythm from "@/pages/landing/daily-rhythm";
import Founder from "@/pages/landing/founder";
import Enroll from "@/pages/landing/enroll";
import FAQ from "@/pages/landing/faq";
import Contact from "@/pages/landing/contact";
import Footer from "@/pages/landing/footer";

export default function LandingPage() {
  // Smooth scrolling for in-page anchor links, offset for the fixed header
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      const targetId = anchor?.getAttribute("href");
      if (!targetId?.startsWith("#") || targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: targetElement.getBoundingClientRect().top + window.scrollY - 80,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <div className="kv-landing bg-kv-cream font-body text-kv-ink">
      <Nav />
      <main>
        <Hero />
        <Programs />
        <DailyRhythm />
        <Founder />
        <Enroll />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
