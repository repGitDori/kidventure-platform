import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarClock,
  Users,
  Building,
  Loader2,
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react";
import { useLocation } from "wouter";
import { DatePicker } from "@/components/ui/date-picker";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  // Fetch branches
  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['/api/branches'],
  });

  // Fetch attendance data - would be implemented with real API endpoints
  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['/api/reports/attendance', selectedBranch, dateRange],
    enabled: false, // Disabled until API is implemented
  });

  // Fetch enrollment data - would be implemented with real API endpoints
  const { data: enrollmentData, isLoading: loadingEnrollment } = useQuery({
    queryKey: ['/api/reports/enrollments', selectedBranch],
    enabled: false, // Disabled until API is implemented
  });

  // Age distribution data
  const ageDistribution = [
    { name: 'Infants (0-1)', value: 12 },
    { name: 'Toddlers (1-3)', value: 24 },
    { name: 'Children (3-6)', value: 35 },
    { name: 'School Age (6+)', value: 18 },
  ];

  // Attendance by day data
  const attendanceByDay = [
    { name: 'Monday', attendance: 45 },
    { name: 'Tuesday', attendance: 52 },
    { name: 'Wednesday', attendance: 49 },
    { name: 'Thursday', attendance: 53 },
    { name: 'Friday', attendance: 50 },
    { name: 'Saturday', attendance: 25 },
    { name: 'Sunday', attendance: 0 },
  ];

  // Enrollment trends
  const enrollmentTrends = [
    { month: 'Jan', enrollments: 35 },
    { month: 'Feb', enrollments: 38 },
    { month: 'Mar', enrollments: 40 },
    { month: 'Apr', enrollments: 42 },
    { month: 'May', enrollments: 45 },
    { month: 'Jun', enrollments: 48 },
    { month: 'Jul', enrollments: 51 },
    { month: 'Aug', enrollments: 53 },
    { month: 'Sep', enrollments: 55 },
    { month: 'Oct', enrollments: 58 },
    { month: 'Nov', enrollments: 60 },
    { month: 'Dec', enrollments: 62 },
  ];

  // Staff to child ratios
  const staffChildRatios = [
    { name: 'Infants', ratio: 0.25 },
    { name: 'Toddlers', ratio: 0.15 },
    { name: 'Children', ratio: 0.10 },
    { name: 'School Age', ratio: 0.08 },
  ];

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                View attendance, enrollment, and demographic data
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Children</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Attendance</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CalendarClock className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Building className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches && Array.isArray(branches) && branches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={dateRange.startDate}
                setDate={(date) =>
                  setDateRange((prev) => ({ ...prev, startDate: date }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={dateRange.endDate}
                setDate={(date) =>
                  setDateRange((prev) => ({ ...prev, endDate: date }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trends</CardTitle>
              <CardDescription>Average attendance by day of the week</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
              <CardDescription>Monthly enrollment statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
              <CardDescription>Children by age group</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staffing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff to Child Ratios</CardTitle>
              <CardDescription>Staff to child ratio by age group</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffChildRatios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`1:${Math.round(1/value)}`, 'Ratio']} />
                  <Legend />
                  <Bar dataKey="ratio" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}