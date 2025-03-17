import { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, User, Eye, Upload, MessageSquare, Lock, PlusCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { User as UserType, Role } from "@shared/schema";
import { UserContext } from "@/App";
import { SpinningAddButton } from "@/components/users/SpinningAddButton";
import { AddUserDialog } from "@/components/users/AddUserDialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { calculateChildAge } from "@/lib/utils";
import { Child } from "@shared/schema";

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  description: z.string().optional(),
  profileImage: z.string().optional(),
  securityQuestion1: z.string().optional(),
  securityAnswer1: z.string().optional(),
  securityQuestion2: z.string().optional(),
  securityAnswer2: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [impersonating, setImpersonating] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    refetchOnWindowFocus: false,
  });

  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['/api/children', selectedUser?.id],
    enabled: !!selectedUser && selectedUser.role === Role.PARENT,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number, userData: Partial<UserType> }) => {
      const response = await apiRequest(`/api/users/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.userData),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Profile updated",
        description: "User profile has been successfully updated.",
      });
      setOpenDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const impersonateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('/api/admin/impersonate/' + userId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Access granted",
        description: "You are now viewing the application as the selected user.",
      });
      setImpersonating(true);
      // In a real implementation, this would redirect or update context
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to access user account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      description: "",
      profileImage: "",
      securityQuestion1: "",
      securityAnswer1: "",
      securityQuestion2: "",
      securityAnswer2: "",
    },
  });

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        username: selectedUser.username || "",
        description: selectedUser.description || "",
        profileImage: selectedUser.profileImage || "",
        securityQuestion1: selectedUser.securityQuestion1 || "",
        securityAnswer1: selectedUser.securityAnswer1 || "",
        securityQuestion2: selectedUser.securityQuestion2 || "",
        securityAnswer2: selectedUser.securityAnswer2 || "",
      });
    }
  }, [selectedUser, form]);

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleImpersonateUser = (userId: number) => {
    impersonateUserMutation.mutate(userId);
  };

  const onSubmit = (data: ProfileFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        userData: {
          ...data,
          lastModifiedBy: 1, // Assuming the admin user ID is 1
          lastModifiedAt: new Date(),
        },
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-red-100 text-red-800";
      case Role.STAFF:
        return "bg-blue-100 text-blue-800";
      case Role.PARENT:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <p className="text-gray-600 mb-8">Manage user profiles, security settings, and access controls.</p>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(users) && users.map((user: UserType) => (
            <Card key={user.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImage || ""} alt={user.username} />
                      <AvatarFallback>{`${user.firstName?.[0]}${user.lastName?.[0]}`}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                  {user.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.description}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end">
                <Button
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewUser(user)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleImpersonateUser(user.id)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Access
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage User: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
            <DialogDescription>
              Edit user profile, security settings, and manage access.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="children" disabled={selectedUser?.role !== Role.PARENT}>
                Children
              </TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={selectedUser?.profileImage || ""} alt={selectedUser?.username} />
                      <AvatarFallback>{`${selectedUser?.firstName?.[0]}${selectedUser?.lastName?.[0]}`}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" /> Upload Image
                    </Button>
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
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell us about yourself"
                            className="resize-none"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={updateUserMutation.isPending}>
                      {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                {selectedUser?.role === Role.PARENT && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Security Questions</h3>
                      <p className="text-sm text-gray-500">
                        Security questions are used to verify the identity of parents when accessing sensitive information.
                      </p>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="securityQuestion1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Security Question 1</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="securityAnswer1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Answer 1</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="securityQuestion2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Security Question 2</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="securityAnswer2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Answer 2</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Button variant="outline" className="w-full">
                        <Lock className="mr-2 h-4 w-4" /> Reset Password
                      </Button>
                    </div>
                  </>
                )}

                {selectedUser?.role !== Role.PARENT && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Lock className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">Security Questions Not Required</h3>
                    <p className="text-sm text-gray-500 max-w-md mt-2">
                      Security questions are only required for parent accounts. Staff and admin accounts use standard authentication.
                    </p>
                    <Button variant="outline" className="mt-6">
                      <Lock className="mr-2 h-4 w-4" /> Reset Password
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="children">
              {selectedUser?.role === Role.PARENT && (
                <>
                  <h3 className="text-lg font-medium mb-4">Children</h3>
                  
                  {childrenLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : Array.isArray(children) && children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {children.map((child: Child) => (
                        <Card key={child.id} className="overflow-hidden">
                          <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                            {child.profileImage ? (
                              <img 
                                src={child.profileImage} 
                                alt={`${child.firstName} ${child.lastName}`}
                                className="object-cover w-full h-48" 
                              />
                            ) : (
                              <div className="flex items-center justify-center h-48 bg-gray-100">
                                <User className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <CardContent className="pt-4">
                            <CardTitle className="text-lg">
                              {child.firstName} {child.lastName}
                            </CardTitle>
                            <div className="mt-2 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Date of Birth:</span>
                                <span>{new Date(child.dateOfBirth).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Age:</span>
                                <span>{calculateChildAge(new Date(child.dateOfBirth))} years</span>
                              </div>
                              {child.eyeColor && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Eye Color:</span>
                                  <span>{child.eyeColor}</span>
                                </div>
                              )}
                              {child.hairColor && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Hair Color:</span>
                                  <span>{child.hairColor}</span>
                                </div>
                              )}
                              {child.customField && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{child.customField}:</span>
                                  <span>{child.customFieldValue}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No children found for this parent.</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="access">
              <div className="space-y-6">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Access User's Account</h3>
                      <p className="text-sm text-gray-500">
                        View the application exactly as this user would see it.
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleImpersonateUser(selectedUser?.id || 0)}
                      disabled={impersonateUserMutation.isPending || !selectedUser}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {impersonateUserMutation.isPending ? "Processing..." : "Access Account"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">QR Code Login</h3>
                      <p className="text-sm text-gray-500">
                        Allow this user to log in using a QR code.
                      </p>
                    </div>
                    <Switch 
                      checked={selectedUser?.qrEnabled || false}
                      // In a real implementation, this would update the user's qrEnabled setting
                    />
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Account Status</h3>
                      <p className="text-sm text-gray-500">
                        Enable or disable this user's ability to log in.
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}