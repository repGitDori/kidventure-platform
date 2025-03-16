import { 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  ClipboardList,
  Users,
  Settings 
} from "lucide-react";
import type { Feature } from "@/lib/types";

export default function Features() {
  const features: Feature[] = [
    {
      title: "Safe Learning Environment",
      description: "Our platform prioritizes child safety with secure authentication, age-appropriate content, and privacy protection measures.",
      icon: <ShieldCheck className="h-8 w-8" />,
      iconBg: "bg-primary-light",
      iconColor: "text-primary-dark"
    },
    {
      title: "Educational Content",
      description: "Access a library of educational resources designed by experts to engage children while supporting their learning journey.",
      icon: <BookOpen className="h-8 w-8" />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700"
    },
    {
      title: "Easy Scheduling",
      description: "Book classes and track your child's sessions with our intuitive scheduling system that works across all branches.",
      icon: <Calendar className="h-8 w-8" />,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700"
    },
    {
      title: "Progress Tracking",
      description: "Monitor your child's development with detailed progress reports and personalized learning insights.",
      icon: <ClipboardList className="h-8 w-8" />,
      iconBg: "bg-green-100",
      iconColor: "text-green-700"
    },
    {
      title: "Multi-Branch Management",
      description: "Seamlessly manage multiple locations with branch-specific views, staff assignments, and resource allocation.",
      icon: <Users className="h-8 w-8" />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-700"
    },
    {
      title: "Customizable Experience",
      description: "Tailor the platform to meet your needs with customizable dashboards, notifications, and preferences.",
      icon: <Settings className="h-8 w-8" />,
      iconBg: "bg-primary-light",
      iconColor: "text-primary-dark"
    }
  ];
  
  return (
    <section id="features" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-800 mb-4">
            Designed for Kids, Trusted by Parents
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform offers a comprehensive ecosystem for children's education and development with features that benefit kids, parents, and educators.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card bg-white rounded-2xl shadow-lg p-6 transition-transform hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-heading font-bold text-xl mb-2 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
