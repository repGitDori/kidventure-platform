import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import QRLoginPage from "@/pages/auth/qr-login";
import DashboardPage from "@/pages/dashboard";
import AdminDashboard from "@/pages/dashboard/admin";
import StaffDashboard from "@/pages/dashboard/staff";
import ParentDashboard from "@/pages/dashboard/parent";
import BranchesPage from "@/pages/branches";
import BranchDetailPage from "@/pages/branches/[id]";
import SchedulePage from "@/pages/schedule";
import ResourcesPage from "@/pages/resources";
import ProfilePage from "@/pages/profile";
import ChildrenPage from "@/pages/children";
import UsersPage from "@/pages/users";
import { useEffect, useState, createContext } from "react";

export const UserContext = createContext<{
  user: any;
  setUser: (user: any) => void;
  isLoading: boolean;
}>({
  user: null,
  setUser: () => {},
  isLoading: false  // Changed to false as the default state
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/qr-login" component={QRLoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/staff" component={StaffDashboard} />
      <Route path="/dashboard/parent" component={ParentDashboard} />
      <Route path="/branches" component={BranchesPage} />
      <Route path="/branches/:id" component={BranchDetailPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/children" component={ChildrenPage} />
      <Route path="/users" component={UsersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// This component must be inside the QueryClientProvider to use useQuery
function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    // Return null on 401 responses
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    }
  });
  
  useEffect(() => {
    if (!isLoading) {
      setCheckingAuth(false);
      if (!isError) {
        setUser(data);
      }
    }
  }, [data, isLoading, isError]);
  
  return (
    <UserContext.Provider value={{ user, setUser, isLoading: checkingAuth }}>
      <Router />
      <Toaster />
    </UserContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
