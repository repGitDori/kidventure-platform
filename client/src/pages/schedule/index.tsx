import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BranchSelector from "@/components/dashboard/BranchSelector";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  User2, 
  Plus, 
  Loader2,
  CalendarDays
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDayOfWeekName, formatTime } from "@/lib/utils";
import { useLocation } from "wouter";

export default function SchedulePage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1); // Default to first branch
  
  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    setLocation("/login");
    return null;
  }
  
  // Fetch classes for the selected branch
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: [`/api/branches/${selectedBranchId}/classes`],
    enabled: !!selectedBranchId
  });
  
  // Fetch children if user is a parent
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['/api/children'],
    enabled: user?.role === 'parent'
  });
  
  // Days of the week for schedule display
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
              <p className="text-gray-600">
                View and manage class schedules and appointments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BranchSelector onBranchChange={setSelectedBranchId} initialBranchId={selectedBranchId} />
              {user?.role !== 'parent' && (
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Slot</span>
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="weekly">
            <TabsList className="mb-6">
              <TabsTrigger value="weekly" className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>Weekly Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>My Appointments</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly">
              {classesLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : classes && classes.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Class Schedule</CardTitle>
                    <CardDescription>All classes at {selectedBranchId === 1 ? "KidVenture Downtown" : "KidVenture Eastside"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {daysOfWeek.map((day, index) => (
                        <div key={day} className="border rounded-lg p-4">
                          <h3 className="font-medium text-gray-800 mb-3">{day}</h3>
                          <div className="space-y-3">
                            {/* For each class, check if it has slots on this day */}
                            {classes.some((cls: any) => {
                              // Simulate fetching slots for this class
                              // In production, this would be fetched from the API
                              const slots = [
                                { id: 1, classId: 1, dayOfWeek: 1, startTime: "15:00", endTime: "16:30" },
                                { id: 2, classId: 1, dayOfWeek: 3, startTime: "15:00", endTime: "16:30" },
                                { id: 3, classId: 2, dayOfWeek: 2, startTime: "16:00", endTime: "17:30" }
                              ];
                              return slots.some(slot => slot.classId === cls.id && slot.dayOfWeek === index);
                            }) ? (
                              classes.map((cls: any) => {
                                // Show class if it has a slot on this day
                                const slots = [
                                  { id: 1, classId: 1, dayOfWeek: 1, startTime: "15:00", endTime: "16:30" },
                                  { id: 2, classId: 1, dayOfWeek: 3, startTime: "15:00", endTime: "16:30" },
                                  { id: 3, classId: 2, dayOfWeek: 2, startTime: "16:00", endTime: "17:30" }
                                ];
                                const classSlots = slots.filter(slot => slot.classId === cls.id && slot.dayOfWeek === index);
                                
                                return classSlots.length > 0 ? (
                                  classSlots.map(slot => (
                                    <div key={slot.id} className="p-2 bg-primary bg-opacity-10 rounded border border-primary border-opacity-20">
                                      <p className="font-medium text-sm">{cls.name}</p>
                                      <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                      </div>
                                    </div>
                                  ))
                                ) : null;
                              })
                            ) : (
                              <p className="text-xs text-gray-500">No classes</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Classes Available</h3>
                    <p className="text-gray-500 mb-4">
                      There are no classes scheduled for this branch yet.
                    </p>
                    {user?.role !== 'parent' && (
                      <Button>Add Class</Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="appointments">
              {user?.role === 'parent' ? (
                childrenLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : children && children.length > 0 ? (
                  <div className="space-y-6">
                    {children.map((child: any) => (
                      <Card key={child.id}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle>{child.firstName} {child.lastName}</CardTitle>
                              <CardDescription>
                                Appointments and classes
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* This would fetch appointments for this child in production */}
                          <div className="text-center py-4 text-gray-500">
                            No upcoming appointments for {child.firstName}.
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Book Appointment
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <User2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Children Found</h3>
                      <p className="text-gray-500 mb-4">
                        You need to add your children before booking appointments.
                      </p>
                      <Button>Add Child</Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Appointments Management</CardTitle>
                    <CardDescription>
                      View and manage appointments for your classes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Staff and admin view */}
                    <div className="text-center py-8 text-gray-500">
                      Select a date to view appointments.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
