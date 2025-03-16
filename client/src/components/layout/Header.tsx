import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Menu, 
  X
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const setUser = userContext?.setUser;
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      if (setUser) {
        setUser(null);
      }
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out.",
        variant: "destructive",
      });
    }
  };
  
  const navigationLinks = [
    { href: "#features", label: "Features" },
    { href: "#about", label: "About Us" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];
  
  const isLandingPage = location === "/";
  
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <Link href="/" className="font-heading font-bold text-2xl text-primary-dark">
              Kid-Venture
            </Link>
            <p className="text-xs text-neutral-500">Learning made fun</p>
          </div>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-8 font-medium">
            {isLandingPage ? (
              navigationLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="text-gray-700 hover:text-primary transition-colors">
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-gray-700 hover:text-primary transition-colors">
                    Resources
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="border-l border-gray-300 h-8 mx-2"></div>
              <Link href="/profile" className="text-gray-700 hover:text-primary transition-colors">
                My Profile
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" asChild>
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/register" asChild>
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[350px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="font-bold text-xl">Menu</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex flex-col space-y-4">
                {isLandingPage ? (
                  navigationLinks.map((link) => (
                    <a 
                      key={link.label}
                      href={link.href} 
                      className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))
                ) : (
                  <>
                    <Link 
                      href="/dashboard"
                      className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/schedule"
                      className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Schedule
                    </Link>
                    <Link 
                      href="/resources"
                      className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Resources
                    </Link>
                  </>
                )}
              </nav>
              
              <div className="mt-auto pb-8 space-y-4">
                {user ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href="/profile"
                      className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" asChild>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register" asChild>
                      <Button 
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
