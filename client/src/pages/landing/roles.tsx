import { 
  Users, 
  Briefcase, 
  Shield
} from "lucide-react";
import type { RoleFeature } from "@/lib/types";

export default function Roles() {
  const roles: RoleFeature[] = [
    {
      role: "For Parents",
      icon: <Users className="h-8 w-8 text-primary" />,
      iconBg: "bg-primary bg-opacity-10",
      features: [
        "Easy class booking and scheduling",
        "Child progress tracking and reports",
        "Educational resources library",
        "Direct communication with staff"
      ]
    },
    {
      role: "For Staff",
      icon: <Briefcase className="h-8 w-8 text-orange-500" />,
      iconBg: "bg-orange-500 bg-opacity-10",
      features: [
        "Class and session management",
        "Student progress recording",
        "Resource utilization tools",
        "Parent communication portal"
      ]
    },
    {
      role: "For Admins",
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      iconBg: "bg-purple-500 bg-opacity-10",
      features: [
        "Multi-branch oversight",
        "Staff management and assignments",
        "Customizable reporting dashboard",
        "System-wide configuration tools"
      ]
    }
  ];
  
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-800 mb-4">
            Designed for Everyone
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides role-specific experiences for all users, ensuring everyone gets exactly what they need.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
            >
              <div className="h-4 bg-primary"></div>
              <div className="p-6">
                <div className={`w-16 h-16 ${role.iconBg} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                  {role.icon}
                </div>
                <h3 className="font-heading font-bold text-xl text-center mb-4 text-gray-800">
                  {role.role}
                </h3>
                <ul className="space-y-3">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mt-0.5 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
