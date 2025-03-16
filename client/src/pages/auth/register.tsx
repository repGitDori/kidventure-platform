import { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RegisterForm from "@/components/auth/RegisterForm";
import { UserContext } from "@/App";
import { Smile } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useContext(UserContext);
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
            <Smile className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
            <Smile className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Sign up to access KidVenture's features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
