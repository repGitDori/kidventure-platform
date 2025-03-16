import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import DashboardPage from "@/pages/dashboard";
import AdminDashboard from "@/pages/dashboard/admin";
import StaffDashboard from "@/pages/dashboard/staff";
import ParentDashboard from "@/pages/dashboard/parent";
import BranchesPage from "@/pages/branches";
import BranchDetailPage from "@/pages/branches/[id]";
import SchedulePage from "@/pages/schedule";
import ResourcesPage from "@/pages/resources";
import { useEffect, useState, createContext } from "react";

export const UserContext = createContext<any>(null);

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/staff" component={StaffDashboard} />
      <Route path="/dashboard/parent" component={ParentDashboard} />
      <Route path="/branches" component={BranchesPage} />
      <Route path="/branches/:id" component={BranchDetailPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// This component must be inside the QueryClientProvider to use useQuery
function AppContent() {
  const [user, setUser] = useState<any>(null);
  
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
    if (!isLoading && !isError) {
      setUser(data);
    }
  }, [data, isLoading, isError]);
  
  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
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
