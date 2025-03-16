import { useContext, useState } from "react";
import { UserContext } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import BranchSelector from "@/components/dashboard/BranchSelector";
import { CalendarClock, Users, Calendar, BadgeCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function StaffDashboard() {
  const { user } = useContext(UserContext);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1); // Default to first branch
  
  // Fetch staff's assigned branches
  const { data: staffBranches, isLoading: loadingBranches } = useQuery({
    queryKey: [`/api/branches`], // In production, would use endpoint for staff's branches
  });

  // Fetch classes for selected branch
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: [`/api/branches/${selectedBranchId}/classes`],
    enabled: !!selectedBranchId
  });
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}! 
            <span className="font-medium ml-1">(@{user?.username})</span>
          </p>
          <p className="text-sm text-gray-500">
            Here's your overview for today.
          </p>
        </div>
        <BranchSelector onBranchChange={setSelectedBranchId} initialBranchId={selectedBranchId} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Classes</p>
                <h3 className="text-2xl font-bold mt-1">3</h3>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Enrolled Children</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                <h3 className="text-2xl font-bold mt-1">2</h3>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                <h3 className="text-2xl font-bold mt-1">12/15</h3>
              </div>
              <div className="p-2 rounded-full bg-amber-100">
                <BadgeCheck className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              Your classes and appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClasses ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : classes && classes.length > 0 ? (
              <div className="space-y-4">
                {classes.slice(0, 3).map((cls: any) => (
                  <div key={cls.id} className="flex items-center p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cls.name}</h4>
                      <p className="text-sm text-gray-500">
                        Today • 15:00 - 16:30
                      </p>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Link href="/schedule">
                    <Button variant="outline">View Full Schedule</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No classes scheduled for today.
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>
              New children enrolled in your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <span className="font-medium text-gray-700">EJ</span>
                </div>
                <div>
                  <h4 className="font-medium">Emma Johnson</h4>
                  <p className="text-sm text-gray-500">
                    Enrolled in: Creative Art Workshop
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <span className="font-medium text-gray-700">NJ</span>
                </div>
                <div>
                  <h4 className="font-medium">Noah Johnson</h4>
                  <p className="text-sm text-gray-500">
                    Enrolled in: Science Explorers
                  </p>
                </div>
              </div>
              <div className="text-center mt-4">
                <Link href="/children">
                  <Button variant="outline">View All Children</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-5 h-5 rounded-full border-2 border-primary mr-3 mt-0.5"></div>
              <div>
                <h4 className="font-medium">Update progress reports</h4>
                <p className="text-sm text-gray-500">Due by {formatDate(new Date(Date.now() + 86400000 * 3))}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-5 h-5 rounded-full border-2 border-primary mr-3 mt-0.5"></div>
              <div>
                <h4 className="font-medium">Prepare materials for Art Workshop</h4>
                <p className="text-sm text-gray-500">Due by {formatDate(new Date(Date.now() + 86400000 * 1))}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-5 h-5 rounded-full border-2 border-primary mr-3 mt-0.5"></div>
              <div>
                <h4 className="font-medium">Contact parents about upcoming event</h4>
                <p className="text-sm text-gray-500">Due by {formatDate(new Date(Date.now() + 86400000 * 5))}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
