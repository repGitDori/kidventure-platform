import { useContext, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/App";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BranchSelector from "@/components/dashboard/BranchSelector";
import { DatePicker } from "@/components/ui/date-picker";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays, startOfWeek } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  User2, 
  Plus, 
  Loader2,
  CalendarDays,
  Users,
  ChevronRight,
  ChevronLeft,
  Baby as Child
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getDayOfWeekName, formatTime, calculateChildAge, getAgeGroup } from "@/lib/utils";
import { useLocation } from "wouter";

// Define a schema for booking appointments
const appointmentSchema = z.object({
  childId: z.number({
    required_error: "Please select a child"
  }),
  slotId: z.number({
    required_error: "Please select a time slot"
  }),
  date: z.date({
    required_error: "Please select a date"
  }),
  notes: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

// Define age groups and their colors
const ageGroupColors = {
  infant: 'bg-purple-100 text-purple-800 border-purple-200',
  toddler: 'bg-green-100 text-green-800 border-green-200',
  children: 'bg-blue-100 text-blue-800 border-blue-200'
};

export default function SchedulePage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 7);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'ageGroups'>('ageGroups');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    setLocation("/login");
    return null;
  }
  
  // Fetch classes for the selected branch
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: [`/api/branches/${selectedBranchId}/classes`],
    enabled: !!selectedBranchId
  });
  
  // Fetch all children (limited by role)
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['/api/children'],
    enabled: !!user
  });
  
  // Fetch schedule slots
  const { data: scheduleSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/slots'],
    enabled: !!user
  });
  
  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', format(selectedWeek, 'yyyy-MM-dd')],
    enabled: !!user
  });

  // Create appointment form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      childId: 0,
      slotId: 0,
      date: new Date(),
      notes: ""
    }
  });

  // Appointment creation mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const response = await apiRequest('POST', '/api/appointments', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsAddAppointmentOpen(false);
      toast({
        title: "Appointment Booked",
        description: "The appointment has been successfully scheduled.",
      });
    },
    onError: (error) => {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "There was a problem booking the appointment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: AppointmentFormValues) => {
    createAppointmentMutation.mutate(data);
  };

  // Prepare the week days array
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(selectedWeek, i);
      return {
        date,
        name: format(date, 'EEEE'),
        shortName: format(date, 'EEE'),
        dateString: format(date, 'yyyy-MM-dd')
      };
    });
  }, [selectedWeek]);

  // Group children by age group
  const childrenByAgeGroup = useMemo(() => {
    if (!children || !Array.isArray(children)) return { infant: [], toddler: [], children: [] };
    
    return children.reduce((acc: { infant: any[], toddler: any[], children: any[] }, child: any) => {
      const age = calculateChildAge(new Date(child.dateOfBirth));
      const ageGroup = getAgeGroup(age);
      
      if (ageGroup === 'infant') {
        acc.infant.push({ ...child, age });
      } else if (ageGroup === 'toddler') {
        acc.toddler.push({ ...child, age });
      } else {
        acc.children.push({ ...child, age });
      }
      
      return acc;
    }, { infant: [], toddler: [], children: [] });
  }, [children]);

  // Count children by age group
  const childrenCounts = useMemo(() => {
    return {
      infant: childrenByAgeGroup.infant?.length || 0,
      toddler: childrenByAgeGroup.toddler?.length || 0,
      children: childrenByAgeGroup.children?.length || 0,
      total: (Array.isArray(children) ? children.length : 0)
    };
  }, [childrenByAgeGroup, children]);

  // Function to navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prevWeek => {
      const days = direction === 'next' ? 7 : -7;
      return addDays(prevWeek, days);
    });
  };

  // Function to open appointment dialog with slot
  const openAppointmentDialog = (slot: any) => {
    setSelectedSlot(slot);
    form.reset({
      childId: 0,
      slotId: slot.id,
      date: new Date(),
      notes: ""
    });
    setIsAddAppointmentOpen(true);
  };

  // Days of the week for schedule display
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
              <p className="text-gray-600">
                View and manage class schedules and appointments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BranchSelector onBranchChange={setSelectedBranchId} initialBranchId={selectedBranchId} />
              {user?.role !== 'parent' && (
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Slot</span>
                </Button>
              )}
            </div>
          </div>

          {/* Child counts by age group */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Infants</p>
                  <p className="text-2xl font-bold">{childrenCounts.infant}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Child className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toddlers</p>
                  <p className="text-2xl font-bold">{childrenCounts.toddler}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Child className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Children</p>
                  <p className="text-2xl font-bold">{childrenCounts.children}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Child className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{childrenCounts.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-primary/10' : ''}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode('ageGroups')}
                className={viewMode === 'ageGroups' ? 'bg-primary/10' : ''}
              >
                <Users className="h-4 w-4 mr-1" />
                Age Groups
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(selectedWeek, 'MMM d')} - {format(addDays(selectedWeek, 6), 'MMM d, yyyy')}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Age Group View */}
          {viewMode === 'ageGroups' && (
            <div className="space-y-6">
              {childrenLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Infant Group */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <Child className="h-3 w-3 text-purple-600" />
                        </div>
                        Infant Group
                      </CardTitle>
                      <CardDescription>Children under 1 year old</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {childrenByAgeGroup.infant.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No infants registered</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {childrenByAgeGroup.infant.map((child: any) => (
                            <div key={child.id} className="border rounded-lg p-3 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <User2 className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                                <p className="text-xs text-gray-500">{child.age < 1 ? 'Under 1 year' : `${child.age} years`}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                
                  {/* Toddler Group */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <Child className="h-3 w-3 text-green-600" />
                        </div>
                        Toddler Group
                      </CardTitle>
                      <CardDescription>Children 1-2 years old</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {childrenByAgeGroup.toddler.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No toddlers registered</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {childrenByAgeGroup.toddler.map((child: any) => (
                            <div key={child.id} className="border rounded-lg p-3 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User2 className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                                <p className="text-xs text-gray-500">{child.age} years</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                
                  {/* Children Group */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <Child className="h-3 w-3 text-blue-600" />
                        </div>
                        Children Group
                      </CardTitle>
                      <CardDescription>Children 3+ years old</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {childrenByAgeGroup.children.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No children registered</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {childrenByAgeGroup.children.map((child: any) => (
                            <div key={child.id} className="border rounded-lg p-3 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                                <p className="text-xs text-gray-500">{child.age} years</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
          
          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <Tabs defaultValue="weekly">
              <TabsList className="mb-6">
                <TabsTrigger value="weekly" className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>Weekly Schedule</span>
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>My Appointments</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly">
                {classesLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : classes && Array.isArray(classes) && classes.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Class Schedule</CardTitle>
                      <CardDescription>All classes at {selectedBranchId === 1 ? "KidVenture Downtown" : "KidVenture Eastside"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {daysOfWeek.map((day, index) => (
                          <div key={day} className="border rounded-lg p-4">
                            <h3 className="font-medium text-gray-800 mb-3">{day}</h3>
                            <div className="space-y-3">
                              {Array.isArray(classes) && classes.some((cls: any) => {
                                // Get slots for this class on this day
                                return Array.isArray(scheduleSlots) && scheduleSlots.some((slot: any) => 
                                  slot.classId === cls.id && slot.dayOfWeek === index + 1
                                );
                              }) ? (
                                classes.map((cls: any) => {
                                  // Get slots for this class on this day
                                  const classSlots = scheduleSlots?.filter((slot: any) => 
                                    slot.classId === cls.id && slot.dayOfWeek === index + 1
                                  ) || [];
                                  
                                  return classSlots.length > 0 ? (
                                    classSlots.map((slot: any) => {
                                      // Count children in each age group for this slot
                                      const slotAppointments = appointments?.filter((app: any) => 
                                        app.slotId === slot.id
                                      ) || [];
                                      
                                      const childrenInSlot = slotAppointments.map((app: any) => {
                                        const child = children?.find((c: any) => c.id === app.childId);
                                        return child;
                                      }).filter(Boolean);
                                      
                                      const infantCount = childrenInSlot.filter((child: any) => 
                                        getAgeGroup(calculateChildAge(new Date(child.dateOfBirth))) === 'infant'
                                      ).length;
                                      
                                      const toddlerCount = childrenInSlot.filter((child: any) => 
                                        getAgeGroup(calculateChildAge(new Date(child.dateOfBirth))) === 'toddler'
                                      ).length;
                                      
                                      const childrenCount = childrenInSlot.filter((child: any) => 
                                        getAgeGroup(calculateChildAge(new Date(child.dateOfBirth))) === 'children'
                                      ).length;
                                      
                                      return (
                                        <div key={slot.id} className="p-2 bg-primary bg-opacity-10 rounded border border-primary border-opacity-20">
                                          <p className="font-medium text-sm">{cls.name}</p>
                                          <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                          </div>
                                          {/* Child count badges */}
                                          <div className="flex gap-1 mt-2">
                                            {infantCount > 0 && (
                                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                                {infantCount} infant{infantCount !== 1 ? 's' : ''}
                                              </Badge>
                                            )}
                                            {toddlerCount > 0 && (
                                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                                {toddlerCount} toddler{toddlerCount !== 1 ? 's' : ''}
                                              </Badge>
                                            )}
                                            {childrenCount > 0 && (
                                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                {childrenCount} child{childrenCount !== 1 ? 'ren' : ''}
                                              </Badge>
                                            )}
                                          </div>
                                          {/* Add child button for staff/admin */}
                                          {user?.role !== 'parent' && (
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="w-full mt-2 h-7 text-xs"
                                              onClick={() => openAppointmentDialog(slot)}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add Child
                                            </Button>
                                          )}
                                        </div>
                                      );
                                    })
                                  ) : null;
                                })
                              ) : (
                                <p className="text-xs text-gray-500">No classes</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Classes Available</h3>
                      <p className="text-gray-500 mb-4">
                        There are no classes scheduled for this branch yet.
                      </p>
                      {user?.role !== 'parent' && (
                        <Button>Add Class</Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="appointments">
                {user?.role === 'parent' ? (
                  childrenLoading ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : children && children.length > 0 ? (
                    <div className="space-y-6">
                      {children.map((child: any) => (
                        <Card key={child.id}>
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <CardTitle>{child.firstName} {child.lastName}</CardTitle>
                                <CardDescription>
                                  Appointments and classes
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* This would fetch appointments for this child in production */}
                            <div className="text-center py-4 text-gray-500">
                              No upcoming appointments for {child.firstName}.
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              Book Appointment
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <User2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Children Found</h3>
                        <p className="text-gray-500 mb-4">
                          You need to add your children before booking appointments.
                        </p>
                        <Button>Add Child</Button>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointments Management</CardTitle>
                      <CardDescription>
                        View and manage appointments for your classes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Staff and admin view */}
                      <div className="text-center py-8 text-gray-500">
                        Select a date to view appointments.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {/* Add Appointment Dialog */}
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Child to Schedule</DialogTitle>
                <DialogDescription>
                  Select a child to add to this time slot.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="childId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a child" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {children?.map((child: any) => (
                              <SelectItem key={child.id} value={child.id.toString()}>
                                {child.firstName} {child.lastName} ({calculateChildAge(new Date(child.dateOfBirth))} years)
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
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any special instructions or notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createAppointmentMutation.isPending}
                    >
                      {createAppointmentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : "Schedule Appointment"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
