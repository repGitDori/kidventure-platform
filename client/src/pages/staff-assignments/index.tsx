import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Award,
  Building,
  UserPlus,
  Users,
  X,
  Check,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const assignmentFormSchema = z.object({
  staffId: z.coerce.number(),
  branchId: z.coerce.number(),
  isManager: z.boolean().default(false),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export default function StaffAssignmentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users (staff only)
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch branches
  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['/api/branches'],
  });

  // Fetch staff-branch assignments
  const { data: staffBranches, isLoading: loadingStaffBranches } = useQuery({
    queryKey: ['/api/staff-branches'],
  });

  // Filter staff members (only admin and staff)
  const staffMembers = users ? users.filter((user: any) => 
    user.role === 'admin' || user.role === 'staff'
  ) : [];

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      staffId: 0,
      branchId: 0,
      isManager: false,
    },
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: async (data: AssignmentFormValues) => {
      try {
        const response = await fetch('/api/staff-branches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to create assignment');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Assignment error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Assignment created",
        description: "Staff member has been assigned successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff-branches'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove assignment mutation
  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await fetch(`/api/staff-branches/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove assignment');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Remove error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Assignment removed",
        description: "Staff assignment has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff-branches'] });
    },
    onError: (error) => {
      console.error('Remove mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to remove assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle manager status mutation
  const toggleManagerMutation = useMutation({
    mutationFn: async ({ id, isManager }: { id: number, isManager: boolean }) => {
      try {
        const response = await fetch(`/api/staff-branches/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isManager }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to update manager status');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Toggle manager error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Manager status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff-branches'] });
    },
    onError: (error) => {
      console.error('Toggle mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssignmentFormValues) => {
    createMutation.mutate(data);
  };

  const handleRemoveAssignment = (id: number) => {
    if (confirm("Are you sure you want to remove this assignment?")) {
      removeMutation.mutate(id);
    }
  };

  const handleToggleManager = (id: number, currentStatus: boolean) => {
    toggleManagerMutation.mutate({ id, isManager: !currentStatus });
  };

  // Get user by ID
  const getUserById = (userId: number) => {
    return users ? users.find((user: any) => user.id === userId) : null;
  };

  // Get branch by ID
  const getBranchById = (branchId: number) => {
    return branches ? branches.find((branch: any) => branch.id === branchId) : null;
  };

  // Filtering staff branches
  const filteredStaffBranches = staffBranches ? staffBranches.filter((assignment: any) => {
    const user = getUserById(assignment.staffId);
    const branch = getBranchById(assignment.branchId);
    
    const roleMatch = filterRole === "all" ? true : user?.role === filterRole;
    const branchMatch = filterBranch === "all" ? true : assignment.branchId.toString() === filterBranch;
    
    return roleMatch && branchMatch;
  }) : [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Staff Assignments</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Staff to Branch</DialogTitle>
                  <DialogDescription>
                    Assign a staff member to a specific branch location.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="staffId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Member</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staffMembers.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.firstName} {user.lastName} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches && branches.map((branch: any) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isManager"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Branch Manager</FormLabel>
                            <FormDescription>
                              Assign this staff member as a manager for this branch.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Assignment
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Branch Assignments</CardTitle>
              <CardDescription>
                View and manage staff assignments across all branch locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Filter by Role</label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Filter by Branch</label>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches && branches.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:pt-8">
                  <Button variant="outline" onClick={() => {
                    setFilterRole("all");
                    setFilterBranch("all");
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </div>

              {loadingStaffBranches || loadingUsers || loadingBranches ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead className="text-center">Manager</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaffBranches.length > 0 ? (
                        filteredStaffBranches.map((assignment: any) => {
                          const user = getUserById(assignment.staffId);
                          const branch = getBranchById(assignment.branchId);
                          return (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user ? user.email : ''}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user?.role === 'admin' ? 'default' : 'secondary'}
                                >
                                  {user?.role.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {branch ? branch.name : 'Unknown Branch'}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleManager(assignment.id, assignment.isManager)}
                                  disabled={toggleManagerMutation.isPending}
                                >
                                  {assignment.isManager ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-400" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAssignment(assignment.id)}
                                  disabled={removeMutation.isPending}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No assignments found. Try adjusting your filters or create a new assignment.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                {filteredStaffBranches ? filteredStaffBranches.length : 0} assignments shown
              </div>
              <Button variant="outline">Export Assignments</Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff by Branch</CardTitle>
                <CardDescription>
                  Overview of staff distribution by branch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {branches && branches.map((branch: any) => {
                    const branchStaff = filteredStaffBranches.filter(
                      (assignment: any) => assignment.branchId === branch.id
                    );
                    const branchManagers = branchStaff.filter(
                      (assignment: any) => assignment.isManager
                    );
                    return (
                      <div key={branch.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{branch.name}</h3>
                          <div className="flex space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{branchStaff.length} Staff</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Award className="h-4 w-4 mr-1" />
                              <span>{branchManagers.length} Managers</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
                          {branchStaff.map((assignment: any) => {
                            const user = getUserById(assignment.staffId);
                            return (
                              <div key={assignment.id} className="p-2 border rounded flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium">
                                    {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                                  </span>
                                  <div className="text-xs text-gray-500">
                                    {user?.role}
                                  </div>
                                </div>
                                {assignment.isManager && (
                                  <Badge variant="outline" className="bg-amber-50">
                                    Manager
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                          {branchStaff.length === 0 && (
                            <div className="p-2 border rounded text-sm text-gray-500">
                              No staff assigned to this branch
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branch Management</CardTitle>
                <CardDescription>
                  Branch managers and staffing summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches && branches.map((branch: any) => {
                    const branchStaff = filteredStaffBranches.filter(
                      (assignment: any) => assignment.branchId === branch.id
                    );
                    const branchManagers = branchStaff.filter(
                      (assignment: any) => assignment.isManager
                    );
                    const staffCount = branchStaff.length;
                    const managerCount = branchManagers.length;
                    const staffingStatus = staffCount === 0 ? 'unstaffed' : 
                      managerCount === 0 ? 'no-manager' : 'fully-staffed';
                    
                    return (
                      <div key={branch.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{branch.name}</h3>
                            <div className="text-sm text-gray-500">
                              Capacity: {branch.capacity || 'Unlimited'}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              staffingStatus === 'unstaffed' ? 'destructive' : 
                              staffingStatus === 'no-manager' ? 'outline' : 
                              'default'
                            }
                          >
                            {staffingStatus === 'unstaffed' ? 'Unstaffed' : 
                             staffingStatus === 'no-manager' ? 'No Manager' : 
                             'Fully Staffed'}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium">Branch Managers</h4>
                          {branchManagers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {branchManagers.map((assignment: any) => {
                                const user = getUserById(assignment.staffId);
                                return (
                                  <div key={assignment.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    <div>
                                      <div className="text-sm font-medium">
                                        {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {user?.email}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                              No managers assigned
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-sm text-gray-500">
                            Total Staff: {staffCount}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setFilterBranch(branch.id.toString());
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            View All Staff
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}