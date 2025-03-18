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
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { DatePicker } from "@/components/ui/date-picker";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function ReportsPage() {
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <div className="flex space-x-2">
              <Button variant="outline">Export CSV</Button>
              <Button variant="outline">Print Report</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Children</p>
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
                  <p className="text-sm font-medium text-gray-500">Daily Attendance (Avg)</p>
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
                  <p className="text-sm font-medium text-gray-500">Active Branches</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Building className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Report Filters</CardTitle>
                </div>
                <CardDescription>
                  Filter data by branch, date range, and other parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              <TabsContent value="attendance" className="space-y-4">
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

              <TabsContent value="enrollment" className="space-y-4">
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

              <TabsContent value="demographics" className="space-y-4">
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

              <TabsContent value="staffing" className="space-y-4">
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
                        <Tooltip formatter={(value) => [`1:${Math.round(1/value)}`, 'Ratio']} />
                        <Legend />
                        <Bar dataKey="ratio" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}