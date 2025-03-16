import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { Role } from "@shared/schema";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Loader2, 
  Plus 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BranchesPage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    setLocation("/login");
    return null;
  }
  
  const { data: branches, isLoading } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Branch Management</h1>
              <p className="text-gray-600">
                View and manage all KidVenture branches
              </p>
            </div>
            
            {user?.role === Role.ADMIN && (
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add New Branch</span>
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : branches && branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card key={branch.id} className="overflow-hidden">
                  <div className="h-3 bg-primary"></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{branch.name}</CardTitle>
                        <CardDescription>Branch #{branch.id}</CardDescription>
                      </div>
                      <Badge
                        variant={branch.isActive ? "default" : "secondary"}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <span className="text-sm">{branch.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm">{branch.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm">{branch.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm">Capacity: {branch.capacity} children</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/branches/${branch.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Branches Found</h3>
                <p className="text-gray-500 mb-4">
                  {user?.role === Role.ADMIN
                    ? "Start by adding your first branch."
                    : "No branches are currently available."}
                </p>
                {user?.role === Role.ADMIN && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
