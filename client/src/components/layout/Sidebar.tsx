import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  Users, 
  Building2, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { UserContext } from "@/App";
import { useToast } from "@/hooks/use-toast";
import type { DashboardMenuItem } from "@/lib/types";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, setUser } = useContext(UserContext);
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
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
  
  // Generate menu items based on user role
  const menuItems: DashboardMenuItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Schedule",
      href: "/schedule",
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      label: "Resources",
      href: "/resources",
      icon: <BookOpen className="h-5 w-5" />,
    }
  ];
  
  // Add role-specific items
  if (user?.role === 'admin') {
    menuItems.push(
      {
        label: "Users",
        href: "/users",
        icon: <Users className="h-5 w-5" />,
      },
      {
        label: "Branches",
        href: "/branches",
        icon: <Building2 className="h-5 w-5" />,
      }
    );
  } else if (user?.role === 'staff') {
    menuItems.push(
      {
        label: "Children",
        href: "/children",
        icon: <Users className="h-5 w-5" />,
      },
      {
        label: "Branches",
        href: "/branches",
        icon: <Building2 className="h-5 w-5" />,
      }
    );
  } else if (user?.role === 'parent') {
    menuItems.push(
      {
        label: "My Children",
        href: "/children",
        icon: <Users className="h-5 w-5" />,
      }
    );
  }
  
  // Add settings to all users
  menuItems.push({
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  });
  
  return (
    <aside className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-[80px]" : "w-[250px]"
    )}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <div className="font-bold text-xl text-primary">KidVenture</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <Separator />
      
      <div className="p-4">
        {!collapsed && (
          <div className="text-sm font-medium text-gray-500 mb-2">
            {user?.role === 'admin' ? 'Administrator' : 
              user?.role === 'staff' ? 'Staff Member' : 'Parent'}
          </div>
        )}
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-medium truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      <nav className="p-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a className={cn(
                  "flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors",
                  location === item.href && "bg-primary/10 text-primary",
                  collapsed ? "justify-center" : "space-x-3"
                )}>
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-2 mt-auto">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            collapsed && "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {!collapsed && <span>Log out</span>}
        </Button>
      </div>
    </aside>
  );
}
