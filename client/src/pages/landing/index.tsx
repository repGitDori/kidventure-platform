import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/pages/landing/hero";
import Features from "@/pages/landing/features";
import Roles from "@/pages/landing/roles";
import Waitlist from "@/pages/landing/waitlist";
import FAQ from "@/pages/landing/faq";
import Contact from "@/pages/landing/contact";

export default function LandingPage() {
  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        
        const targetId = target.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId || '');
        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - 80, // Offset for header
            behavior: 'smooth'
          });
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);
  
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Roles />
        <Waitlist />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
