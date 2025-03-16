import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-gray-800 leading-tight mb-4">
            Where Learning 
            <span className="text-primary"> Adventures</span> 
            Begin
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            KidVenture helps children learn through play with our innovative educational platform. Join our waitlist to be the first to experience our exciting new approach to learning!
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="#waitlist" 
              className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white font-heading font-semibold text-lg rounded-xl shadow-lg transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Join Waitlist
            </a>
            <a 
              href="#features" 
              className="inline-block px-8 py-4 bg-white border-2 border-primary text-primary font-heading font-semibold text-lg rounded-xl shadow-md hover:bg-primary-light hover:text-white transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600&h=500" 
              alt="Children learning together" 
              className="rounded-3xl shadow-xl"
              width="600"
              height="500"
            />
            <div className="absolute -top-4 -right-4 bg-amber-500 text-white text-sm font-heading font-bold px-4 py-2 rounded-xl rotate-3 shadow-md">
              Coming Soon!
            </div>
            <div className="animate-bounce-slow absolute -bottom-6 -left-6 bg-purple-300 text-purple-800 text-sm font-heading font-bold px-4 py-2 rounded-xl -rotate-2 shadow-md">
              Early Access Available!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
