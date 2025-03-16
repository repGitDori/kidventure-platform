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
  X,
  Smile
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
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Smile className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <Link href="/">
              <a className="font-heading font-bold text-2xl text-primary-dark">KidVenture</a>
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
                  <Link href="/dashboard">
                    <a className="text-gray-700 hover:text-primary transition-colors">Dashboard</a>
                  </Link>
                </li>
                <li>
                  <Link href="/schedule">
                    <a className="text-gray-700 hover:text-primary transition-colors">Schedule</a>
                  </Link>
                </li>
                <li>
                  <Link href="/resources">
                    <a className="text-gray-700 hover:text-primary transition-colors">Resources</a>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                Hello, {user.firstName}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/register">
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
                    <Link href="/dashboard">
                      <a 
                        className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/schedule">
                      <a 
                        className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Schedule
                      </a>
                    </Link>
                    <Link href="/resources">
                      <a 
                        className="px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Resources
                      </a>
                    </Link>
                  </>
                )}
              </nav>
              
              <div className="mt-auto pb-8 space-y-4">
                {user ? (
                  <>
                    <div className="text-sm text-gray-600 px-3">
                      Logged in as {user.firstName} {user.lastName}
                    </div>
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
                    <Link href="/login">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register">
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
