import { useState, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { UserContext } from "@/App";
import QRGenerator from "@/components/auth/QRGenerator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, User } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [driverLicense, setDriverLicense] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, setLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDriverLicense(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create a FormData object to handle file upload
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      
      if (driverLicense) {
        data.append("driverLicense", driverLicense);
      }
      
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      const updatedUser = await response.json();
      
      setUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Prevent rendering until redirect occurs
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {user.role === 'parent' && (
                  <div className="space-y-2">
                    <Label htmlFor="driverLicense">Upload Driver's License</Label>
                    <Input
                      id="driverLicense"
                      name="driverLicense"
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-gray-500">
                      Upload your driver's license for verification purposes. We securely store this information.
                    </p>
                    {user.driverLicense && (
                      <p className="text-sm text-green-600">
                        ✓ Driver's license on file
                      </p>
                    )}
                  </div>
                )}
                
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="space-y-6">
            <QRGenerator />
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Password</h3>
              <p className="text-gray-600 mb-6">
                Update your password to maintain account security.
              </p>
              
              <Button variant="outline">
                Change Password
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}