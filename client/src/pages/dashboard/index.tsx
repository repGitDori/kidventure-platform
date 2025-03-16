import { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { UserContext } from "@/App";
import { Role } from "@shared/schema";
import AdminDashboard from "./admin";
import StaffDashboard from "./staff";
import ParentDashboard from "./parent";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useContext(UserContext);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case Role.ADMIN:
        return <AdminDashboard />;
      case Role.STAFF:
        return <StaffDashboard />;
      case Role.PARENT:
        return <ParentDashboard />;
      default:
        return (
          <div className="p-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Invalid Role</h2>
                <p>Your account does not have a valid role assigned. Please contact support.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}
