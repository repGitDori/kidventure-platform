import { Link } from "wouter";
import { Twitter, Youtube, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Subscribed successfully!",
      description: "Thanks for subscribing to our newsletter.",
    });
    
    setEmail("");
  };
  
  const quickLinks = [
    { label: "Features", url: "/#features" },
    { label: "About Us", url: "/#about" },
    { label: "FAQ", url: "/#faq" },
    { label: "Join Waitlist", url: "/#waitlist" },
    { label: "Contact", url: "/#contact" },
  ];
  
  const legalLinks = [
    { label: "Terms of Service", url: "#" },
    { label: "Privacy Policy", url: "#" },
    { label: "Cookie Policy", url: "#" },
    { label: "GDPR Compliance", url: "#" },
    { label: "COPPA Compliance", url: "#" },
  ];
  
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M6 14c0-3.5 2.5-6.5 6-6.5s6 3 6 6.5M8 15c-1.5 0-2.25 0.5-3 2c0.75-0.5 1.5-0.5 3 0c1.5 0.5 3 0.5 4.5 0c1.5-0.5 2.25-0.5 3 0c-0.75-1.5-1.5-2-3-2M7 10l-1.5-1M17 10l1.5-1M9 8.5l1 1M15 8.5l-1 1" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl">Kid-Venture</h3>
                <p className="text-xs text-gray-400">Learning made fun</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Empowering children through playful education and helping parents and educators nurture young minds.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.url}>
                    <a className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.url}>
                    <a className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Subscribe</h4>
            <p className="text-gray-400 text-sm mb-4">
              Get updates on our launch and receive educational tips.
            </p>
            <form className="flex" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Your email"
                className="text-sm bg-gray-700 border-gray-600 rounded-l-lg focus:border-primary flex-grow text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white rounded-r-lg"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Kid-Venture Learning. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
