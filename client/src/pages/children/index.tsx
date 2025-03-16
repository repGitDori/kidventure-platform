import { useState, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { Role } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  User, 
  Plus, 
  Calendar, 
  ClipboardList, 
  Pencil, 
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import { calculateChildAge } from "@/lib/utils";

// Form schema for adding/editing children
const childFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  dateOfBirth: z.string().refine(date => {
    const dateObj = new Date(date);
    const today = new Date();
    return dateObj <= today && dateObj >= new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }, { message: "Date of birth must be valid and not in the future or more than 18 years ago." }),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  customField: z.string().optional(),
  customFieldValue: z.string().optional(),
  profileImage: z.string().optional(),
  notes: z.string().optional()
});

type ChildFormValues = z.infer<typeof childFormSchema>;

export default function ChildrenPage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Fetch children
  const { data: children, isLoading } = useQuery({
    queryKey: ['/api/children'],
    enabled: !!user
  });

  // Create child mutation
  const createChildMutation = useMutation({
    mutationFn: async (data: ChildFormValues) => {
      const response = await apiRequest('POST', '/api/children', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Child Added",
        description: "The child has been successfully added to your account.",
      });
    },
    onError: (error) => {
      console.error("Error adding child:", error);
      toast({
        title: "Error",
        description: "There was a problem adding the child. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update child mutation
  const updateChildMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ChildFormValues }) => {
      const response = await apiRequest('PATCH', `/api/children/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setIsEditDialogOpen(false);
      setSelectedChild(null);
      toast({
        title: "Child Updated",
        description: "The child's information has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating child:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the child. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add child form
  const addForm = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: format(new Date(), 'yyyy-MM-dd'),
      notes: ""
    }
  });

  // Edit child form
  const editForm = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      notes: ""
    }
  });

  // Handle add child submit
  const onAddSubmit = (data: ChildFormValues) => {
    createChildMutation.mutate(data);
  };

  // Handle edit child submit
  const onEditSubmit = (data: ChildFormValues) => {
    if (selectedChild) {
      updateChildMutation.mutate({ id: selectedChild.id, data });
    }
  };

  // Open edit dialog and set form values
  const handleEditClick = (child: any) => {
    setSelectedChild(child);
    editForm.reset({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: format(new Date(child.dateOfBirth), 'yyyy-MM-dd'),
      notes: child.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  // Reset form when add dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      addForm.reset();
    }
  }, [isAddDialogOpen, addForm]);

  if (userLoading || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Children</h1>
              <p className="text-gray-600">
                {user.role === Role.PARENT 
                  ? "Manage your children's information and enrollment" 
                  : "Manage children and view enrollment information"}
              </p>
            </div>
            {user.role === Role.PARENT && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Child</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a Child</DialogTitle>
                    <DialogDescription>
                      Enter your child's information below to add them to your account.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                      <FormField
                        control={addForm.control}
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
                        control={addForm.control}
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
                        control={addForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Notes</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Allergies, medical conditions, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createChildMutation.isPending}
                          className="w-full"
                        >
                          {createChildMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : "Add Child"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : children && children.length > 0 ? (
            user.role === Role.PARENT ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child: any) => (
                  <Card key={child.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle>{child.firstName} {child.lastName}</CardTitle>
                            <CardDescription>
                              Age: {calculateChildAge(new Date(child.dateOfBirth))}
                            </CardDescription>
                          </div>
                        </div>
                        <Dialog open={isEditDialogOpen && selectedChild?.id === child.id} onOpenChange={(open) => {
                          if (!open) setSelectedChild(null);
                          setIsEditDialogOpen(open);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditClick(child)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Child Information</DialogTitle>
                              <DialogDescription>
                                Update your child's information below.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...editForm}>
                              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                <FormField
                                  control={editForm.control}
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
                                  control={editForm.control}
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
                                  control={editForm.control}
                                  name="dateOfBirth"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Date of Birth</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={editForm.control}
                                  name="notes"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Special Notes</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="Allergies, medical conditions, etc." />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <DialogFooter>
                                  <Button 
                                    type="submit" 
                                    disabled={updateChildMutation.isPending}
                                    className="w-full"
                                  >
                                    {updateChildMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                      </>
                                    ) : "Update Child"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="info">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="info">Info</TabsTrigger>
                          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                          <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                              <p>{format(new Date(child.dateOfBirth), 'MMMM d, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Age</p>
                              <p>{calculateChildAge(new Date(child.dateOfBirth))} years</p>
                            </div>
                          </div>
                          {child.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Special Notes</p>
                              <p className="text-sm">{child.notes}</p>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="enrollment">
                          <div className="py-4">
                            <p className="text-sm text-gray-500 text-center">No active enrollments.</p>
                            <div className="flex justify-center mt-4">
                              <Button variant="outline" size="sm">Enroll in Program</Button>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="schedule">
                          <div className="py-4">
                            <p className="text-sm text-gray-500 text-center">No scheduled appointments.</p>
                            <div className="flex justify-center mt-4">
                              <Button variant="outline" size="sm" asChild>
                                <a href="/schedule">View Schedule</a>
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/schedule?childId=${child.id}`} className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Book Appointment
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        View History
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              // Admin/Staff View
              <Card>
                <CardHeader>
                  <CardTitle>All Children</CardTitle>
                  <CardDescription>
                    View and manage all children enrolled in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {children.map((child: any) => (
                        <TableRow key={child.id}>
                          <TableCell className="font-medium">
                            {child.firstName} {child.lastName}
                          </TableCell>
                          <TableCell>{calculateChildAge(new Date(child.dateOfBirth))}</TableCell>
                          <TableCell>Parent Name</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                              <span>Yes</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Children Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {user.role === Role.PARENT 
                    ? "You haven't added any children to your account yet. Add your first child to get started."
                    : "There are no children registered in the system yet."}
                </p>
                {user.role === Role.PARENT && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Add Your First Child</Button>
                    </DialogTrigger>
                    {/* Dialog content same as above */}
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}