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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Loader2, 
  Edit,
  Calendar,
  GraduationCap,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useParams } from "wouter";

export default function BranchDetailPage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const params = useParams();
  const branchId = Number(params.id);
  
  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    setLocation("/login");
    return null;
  }
  
  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}`],
    enabled: !!branchId
  });
  
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: [`/api/branches/${branchId}/classes`],
    enabled: !!branchId
  });
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/branches">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {branchLoading ? "Loading branch..." : branch?.name}
            </h1>
            {branch?.isActive && (
              <Badge className="ml-2">Active</Badge>
            )}
          </div>
          
          {branchLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : branch ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Branch Information</CardTitle>
                      <CardDescription>Details and contact information</CardDescription>
                    </div>
                    {user?.role === Role.ADMIN && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Branch Name</h3>
                        <p>{branch.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Address</h3>
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <p>{branch.address}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-500 mr-2" />
                          <p>{branch.capacity} children</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Info</h3>
                        <div className="flex items-center mt-1">
                          <Phone className="h-5 w-5 text-gray-500 mr-2" />
                          <p>{branch.phone}</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Mail className="h-5 w-5 text-gray-500 mr-2" />
                          <p>{branch.email}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <Badge
                          variant={branch.isActive ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {branch.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="classes">
                <TabsList className="mb-6">
                  <TabsTrigger value="classes" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>Classes</span>
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </TabsTrigger>
                  <TabsTrigger value="staff" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Staff</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="classes">
                  {classesLoading ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : classes && classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {classes.map((cls: any) => (
                        <Card key={cls.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{cls.name}</CardTitle>
                            <CardDescription>Ages {cls.ageMin}-{cls.ageMax}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4">{cls.description}</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Max Capacity:</span>
                              <span>{cls.maxCapacity} children</span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button variant="outline" size="sm">View Details</Button>
                            {(user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
                              <Button variant="outline" size="sm">Manage</Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Classes Available</h3>
                        <p className="text-gray-500 mb-4">
                          This branch doesn't have any classes yet.
                        </p>
                        {(user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
                          <Button>Add Class</Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="schedule">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Branch Schedule</h3>
                      <p className="text-gray-500 mb-4">
                        The schedule for this branch will be displayed here.
                      </p>
                      <Button>View Schedule</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="staff">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Branch Staff</h3>
                      <p className="text-gray-500 mb-4">
                        Staff assigned to this branch will be displayed here.
                      </p>
                      {user?.role === Role.ADMIN && (
                        <Button>Manage Staff</Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Branch Not Found</h3>
                <p className="text-gray-500 mb-4">
                  The branch you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Link href="/branches">
                  <Button>View All Branches</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
