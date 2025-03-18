import { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Calendar, 
  Bookmark, 
  User2, 
  Clock, 
  BookOpen,
  CalendarClock,
  Loader2,
  Baby,
  Users
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ParentDashboard() {
  const { user } = useContext(UserContext);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  
  // Fetch children
  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ['/api/children'],
  });
  
  // Group children by age category
  const childrenByCategory = useMemo(() => {
    if (!children || !Array.isArray(children)) return { infant: 0, toddler: 0, child: 0 };
    
    return children.reduce((acc: { infant: number, toddler: number, child: number }, child: any) => {
      const dob = new Date(child.dateOfBirth);
      const ageInYears = Math.floor((new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (ageInYears < 1) {
        acc.infant++;
      } else if (ageInYears < 3) {
        acc.toddler++;
      } else {
        acc.child++;
      }
      
      return acc;
    }, { infant: 0, toddler: 0, child: 0 });
  }, [children]);
  
  // Set first child as selected once data is loaded
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);
  
  // Fetch appointments for selected child
  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: [`/api/children/${selectedChild}/appointments`],
    enabled: !!selectedChild
  });
  
  // Fetch resources
  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ['/api/resources', { limit: 3 }],
  });
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName}! 
          <span className="font-medium ml-1">(@{user?.username})</span>
        </p>
        <p className="text-sm text-gray-500">
          Here's an overview of your children's activities.
        </p>
      </div>
      
      {/* Age group summary */}
      {!loadingChildren && children && children.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Infants</p>
                <p className="text-2xl font-bold">{childrenByCategory.infant}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Baby className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Toddlers</p>
                <p className="text-2xl font-bold">{childrenByCategory.toddler}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Baby className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Children</p>
                <p className="text-2xl font-bold">{childrenByCategory.child}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold">{children.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Child selector */}
      {loadingChildren ? (
        <Card className="mb-8">
          <CardContent className="p-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : children && children.length > 0 ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              {children.map((child: any) => (
                <Button 
                  key={child.id}
                  variant={selectedChild === child.id ? "default" : "outline"}
                  onClick={() => setSelectedChild(child.id)}
                  className="flex items-center gap-2"
                >
                  <User2 className="h-4 w-4" />
                  {child.firstName} {child.lastName}
                </Button>
              ))}
              <Link href="/children">
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>Manage Children</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="mb-4">You haven't added any children yet.</p>
            <Link href="/children">
              <Button>Add a Child</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <span>Upcoming Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAppointments || !selectedChild ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment: any) => (
                  <div key={appointment.id} className="flex p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Class Name</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(appointment.date))} • 15:00 - 16:30
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No upcoming appointments.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/schedule">
              <Button variant="outline" className="w-full">View All Appointments</Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Educational resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Educational Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingResources ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map((resource: any) => (
                  <div key={resource.id} className="flex p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                      <Bookmark className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-gray-500">{resource.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No resources available.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/resources">
              <Button variant="outline" className="w-full">Browse All Resources</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used tools and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/schedule">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center">
                <Calendar className="h-5 w-5" />
                <span>Book Appointment</span>
              </Button>
            </Link>
            <Link href="/children">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center">
                <User2 className="h-5 w-5" />
                <span>Manage Children</span>
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 items-center justify-center">
                <BookOpen className="h-5 w-5" />
                <span>View Resources</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
