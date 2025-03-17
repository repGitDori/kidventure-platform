import { useState } from "react";
import { User, Lock, Building, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Role } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionsManager, UserPermissions } from "./PermissionsManager";

// Form schema for adding a new user
const newUserFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  role: z.enum([Role.ADMIN, Role.STAFF, Role.PARENT]),
  description: z.string().optional(),
  profileImage: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type NewUserFormValues = z.infer<typeof newUserFormSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (userData: any) => void;
}

export function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    userId: 0, // Temporary ID for new user
    permissions: [],
    facilityAccess: []
  });

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: Role.STAFF,
      description: "",
      profileImage: "",
    },
  });

  // Watch the role field to conditionally show tabs
  const userRole = form.watch("role");
  const showPermissions = userRole === Role.ADMIN || userRole === Role.STAFF;

  const handlePermissionsChange = (newPermissions: UserPermissions) => {
    setUserPermissions(newPermissions);
  };

  const onSubmit = (data: NewUserFormValues) => {
    // Add permissions data if applicable
    const userData = {
      ...data,
      permissions: userRole !== Role.PARENT ? userPermissions.permissions : undefined,
      facilityAccess: userRole !== Role.PARENT ? userPermissions.facilityAccess : undefined,
    };
    
    // Pass the data to parent component
    onAddUser(userData);
    
    // Reset form and close dialog
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new staff or admin user with specific permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="credentials">Account Credentials</TabsTrigger>
                <TabsTrigger 
                  value="permissions" 
                  disabled={!showPermissions}
                >
                  Permissions & Access
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback>
                      <User className="h-12 w-12 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  <FormDescription>
                    Profile image can be set after account creation
                  </FormDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Role.ADMIN}>
                            <div className="flex items-center">
                              <ShieldCheck className="h-4 w-4 mr-2 text-red-500" />
                              Administrator
                            </div>
                          </SelectItem>
                          <SelectItem value={Role.STAFF}>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-blue-500" />
                              Staff Member
                            </div>
                          </SelectItem>
                          <SelectItem value={Role.PARENT}>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-green-500" />
                              Parent
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === Role.ADMIN 
                          ? "Administrators have complete access to the system."
                          : field.value === Role.STAFF
                          ? "Staff members have limited access based on assigned permissions."
                          : "Parents can manage their children and access educational resources."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief description of the user's role and responsibilities"
                          className="resize-none"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("credentials")}
                  >
                    Next: Account Credentials
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("profile")}
                  >
                    Back: Profile Information
                  </Button>
                  
                  {showPermissions ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab("permissions")}
                    >
                      Next: Permissions & Access
                    </Button>
                  ) : (
                    <Button type="submit">Create User</Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <PermissionsManager 
                  userPermissions={userPermissions}
                  onPermissionsChange={handlePermissionsChange}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("credentials")}
                  >
                    Back: Account Credentials
                  </Button>
                  <Button type="submit">Create User</Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}