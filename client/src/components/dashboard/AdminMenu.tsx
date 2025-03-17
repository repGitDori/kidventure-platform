import { Link } from "wouter";
import {
  BarChart2,
  Users,
  ClipboardList,
  Settings,
  Layout,
  Award,
  Book,
  Building2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminMenu() {
  const menuItems = [
    {
      title: "Dashboard",
      description: "View system overview and statistics",
      icon: <Layout className="h-8 w-8 text-primary" />,
      href: "/dashboard/admin",
    },
    {
      title: "User Management",
      description: "Manage staff, parents and permissions",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      href: "/users",
    },
    {
      title: "Branch Management",
      description: "Configure and manage all branches",
      icon: <Building2 className="h-8 w-8 text-emerald-500" />,
      href: "/branches",
    },
    {
      title: "Reports & Analytics",
      description: "View attendance and performance metrics",
      icon: <BarChart2 className="h-8 w-8 text-amber-500" />,
      href: "/reports",
    },
    {
      title: "Resources Management",
      description: "Manage educational content",
      icon: <Book className="h-8 w-8 text-indigo-500" />,
      href: "/resources/manage",
    },
    {
      title: "Staff Assignments",
      description: "Assign staff to branches and classes",
      icon: <Award className="h-8 w-8 text-red-500" />,
      href: "/staff-assignments",
    },
    {
      title: "Waitlist Entries",
      description: "Review and manage waitlist sign-ups",
      icon: <ClipboardList className="h-8 w-8 text-purple-500" />,
      href: "/admin/waitlist",
    },
    {
      title: "Contact Messages",
      description: "Manage contact form submissions",
      icon: <Mail className="h-8 w-8 text-orange-500" />,
      href: "/contact-messages",
    },
    {
      title: "System Settings",
      description: "Configure global system preferences",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      href: "/settings",
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <Card key={item.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <div className="p-2 rounded-full bg-gray-50">{item.icon}</div>
            </div>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={item.href}>
              <Button className="w-full">Access</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
