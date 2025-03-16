import { useContext } from "react";
import { UserContext } from "@/App";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import BranchSelector from "@/components/dashboard/BranchSelector";
import AdminMenu from "@/components/dashboard/AdminMenu";
import { BarChart3, Users, BookOpen, Building2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  
  // Mock data for the dashboard statistics - would be fetched from API in production
  const stats = [
    {
      title: "Total Users",
      value: "184",
      change: "+12%",
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      iconBg: "bg-indigo-100"
    },
    {
      title: "Active Branches",
      value: "2",
      change: "+0%",
      icon: <Building2 className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-100"
    },
    {
      title: "Resources",
      value: "47",
      change: "+5%",
      icon: <BookOpen className="h-5 w-5 text-amber-600" />,
      iconBg: "bg-amber-100"
    },
    {
      title: "Waitlist Entries",
      value: "156",
      change: "+24%",
      icon: <BarChart3 className="h-5 w-5 text-rose-600" />,
      iconBg: "bg-rose-100"
    }
  ];
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}! Here's an overview of the system.
          </p>
        </div>
        <BranchSelector onBranchChange={() => {}} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className="text-sm text-green-500 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-2 rounded-full ${stat.iconBg}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Administrative Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMenu />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              To view recent signups, visit the User Management section.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
