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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings,
  Bell,
  Shield,
  UserCog,
  Mail,
  Palette,
  FileText,
  CloudUpload,
  RefreshCw,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";

const generalSettingsSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters."),
  contactEmail: z.string().email("Please enter a valid email address."),
  supportPhone: z.string().min(5, "Please enter a valid phone number."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  maxChildrenPerClass: z.coerce.number().min(1, "Must be at least 1").max(50, "Cannot exceed 50"),
  defaultBranchId: z.coerce.number(),
  timezone: z.string(),
  dateFormat: z.string(),
  enableMaintenanceMode: z.boolean().default(false),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
  emailOnNewRegistration: z.boolean().default(true),
  emailOnNewAppointment: z.boolean().default(true),
  emailOnCancellation: z.boolean().default(true),
  emailOnContactForm: z.boolean().default(true),
  smsOnAppointmentReminder: z.boolean().default(false),
  dailyReportEmail: z.boolean().default(false),
  weeklyReportEmail: z.boolean().default(true),
});

const securitySettingsSchema = z.object({
  sessionTimeout: z.coerce.number().min(5, "Minimum 5 minutes").max(1440, "Maximum 24 hours"),
  maxLoginAttempts: z.coerce.number().min(3, "Minimum 3 attempts").max(10, "Maximum 10 attempts"),
  requireStrongPasswords: z.boolean().default(true),
  passwordResetTimeout: z.coerce.number().min(5, "Minimum 5 minutes").max(1440, "Maximum 24 hours"),
  twoFactorAuth: z.boolean().default(false),
  ipRestriction: z.boolean().default(false),
  allowedIPs: z.string().optional(),
  forcePasswordChange: z.coerce.number().min(30, "Minimum 30 days").max(365, "Maximum 365 days"),
});

const appearanceSettingsSchema = z.object({
  primaryColor: z.string(),
  theme: z.string(),
  logoUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  faviconUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  customCss: z.string().optional(),
  enableCustomFonts: z.boolean().default(false),
  headerFont: z.string().optional(),
  bodyFont: z.string().optional(),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
type AppearanceSettingsValues = z.infer<typeof appearanceSettingsSchema>;

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['/api/settings'],
    // Currently we don't have an API for settings, this would be replaced with actual API call
    enabled: false
  });

  // Fetch branches for dropdown
  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['/api/branches'],
  });

  // Forms
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "KidVenture Learning Center",
      contactEmail: "info@kidventure.com",
      supportPhone: "(555) 123-4567",
      address: "123 Main St, Anytown, USA",
      maxChildrenPerClass: 15,
      defaultBranchId: 1,
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      enableMaintenanceMode: false,
    },
  });

  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false,
      emailOnNewRegistration: true,
      emailOnNewAppointment: true,
      emailOnCancellation: true,
      emailOnContactForm: true,
      smsOnAppointmentReminder: false,
      dailyReportEmail: false,
      weeklyReportEmail: true,
    },
  });

  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireStrongPasswords: true,
      passwordResetTimeout: 30,
      twoFactorAuth: false,
      ipRestriction: false,
      allowedIPs: "",
      forcePasswordChange: 90,
    },
  });

  const appearanceForm = useForm<AppearanceSettingsValues>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      primaryColor: "#3b82f6",
      theme: "light",
      logoUrl: "https://example.com/logo.png",
      faviconUrl: "https://example.com/favicon.ico",
      customCss: "",
      enableCustomFonts: false,
      headerFont: "Inter",
      bodyFont: "Inter",
    },
  });

  // Save settings mutations
  const saveGeneralMutation = useMutation({
    mutationFn: async (data: GeneralSettingsValues) => {
      return await apiRequest('/api/settings/general', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "General settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveNotificationMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      return await apiRequest('/api/settings/notifications', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveSecurityMutation = useMutation({
    mutationFn: async (data: SecuritySettingsValues) => {
      return await apiRequest('/api/settings/security', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Security settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveAppearanceMutation = useMutation({
    mutationFn: async (data: AppearanceSettingsValues) => {
      return await apiRequest('/api/settings/appearance', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Appearance settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitGeneral = (data: GeneralSettingsValues) => {
    saveGeneralMutation.mutate(data);
  };

  const onSubmitNotification = (data: NotificationSettingsValues) => {
    saveNotificationMutation.mutate(data);
  };

  const onSubmitSecurity = (data: SecuritySettingsValues) => {
    saveSecurityMutation.mutate(data);
  };

  const onSubmitAppearance = (data: AppearanceSettingsValues) => {
    saveAppearanceMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">System Settings</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic information and system settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="siteName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                The name of your childcare center
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormDescription>
                                Primary contact email address
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="supportPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Support Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Customer support phone number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Main office address
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="maxChildrenPerClass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Children Per Class</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={50} {...field} />
                              </FormControl>
                              <FormDescription>
                                Maximum number of children in a class
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="defaultBranchId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Branch</FormLabel>
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
                              <FormDescription>
                                Default branch for new users
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Timezone</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                  <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                                  <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Default timezone for the system
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Format</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select date format" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                  <SelectItem value="MMMM D, YYYY">MMMM D, YYYY</SelectItem>
                                  <SelectItem value="D MMMM YYYY">D MMMM YYYY</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Format for displaying dates
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="enableMaintenanceMode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Maintenance Mode</FormLabel>
                                <FormDescription>
                                  Enable maintenance mode to temporarily block access to the site.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={saveGeneralMutation.isPending}
                        className="mt-6"
                      >
                        {saveGeneralMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save General Settings
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when notifications are sent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onSubmitNotification)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notification Channels</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Email Notifications</FormLabel>
                                  <FormDescription>
                                    Receive notifications via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="smsNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">SMS Notifications</FormLabel>
                                  <FormDescription>
                                    Receive notifications via SMS
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="pushNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Push Notifications</FormLabel>
                                  <FormDescription>
                                    Receive push notifications
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Email Notification Events</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={notificationForm.control}
                            name="emailOnNewRegistration"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>New Registration</FormLabel>
                                  <FormDescription>
                                    Send email when a new user registers
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="emailOnNewAppointment"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>New Appointment</FormLabel>
                                  <FormDescription>
                                    Send email when a new appointment is scheduled
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="emailOnCancellation"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Appointment Cancellation</FormLabel>
                                  <FormDescription>
                                    Send email when an appointment is cancelled
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="emailOnContactForm"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Contact Form Submission</FormLabel>
                                  <FormDescription>
                                    Send email when a contact form is submitted
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">SMS Notification Events</h3>
                        <FormField
                          control={notificationForm.control}
                          name="smsOnAppointmentReminder"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 w-full md:w-1/2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Appointment Reminder</FormLabel>
                                <FormDescription>
                                  Send SMS reminder before appointments
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Report Notifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={notificationForm.control}
                            name="dailyReportEmail"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Daily Report</FormLabel>
                                  <FormDescription>
                                    Send daily summary reports via email
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationForm.control}
                            name="weeklyReportEmail"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Weekly Report</FormLabel>
                                  <FormDescription>
                                    Send weekly summary reports via email
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={saveNotificationMutation.isPending}
                        className="mt-6"
                      >
                        {saveNotificationMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Notification Settings
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={securityForm.control}
                          name="sessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Timeout (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min={5} max={1440} {...field} />
                              </FormControl>
                              <FormDescription>
                                Minutes of inactivity before user is logged out
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="maxLoginAttempts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Login Attempts</FormLabel>
                              <FormControl>
                                <Input type="number" min={3} max={10} {...field} />
                              </FormControl>
                              <FormDescription>
                                Number of failed attempts before account lockout
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={securityForm.control}
                          name="requireStrongPasswords"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Require Strong Passwords</FormLabel>
                                <FormDescription>
                                  Require complex passwords with special characters, numbers, and mixed case
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="passwordResetTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password Reset Timeout (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min={5} max={1440} {...field} />
                              </FormControl>
                              <FormDescription>
                                Minutes before password reset link expires
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={securityForm.control}
                          name="twoFactorAuth"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Two-Factor Authentication</FormLabel>
                                <FormDescription>
                                  Require two-factor authentication for all users
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="ipRestriction"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>IP Restriction</FormLabel>
                                <FormDescription>
                                  Restrict access to specific IP addresses
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {securityForm.watch("ipRestriction") && (
                        <FormField
                          control={securityForm.control}
                          name="allowedIPs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allowed IP Addresses</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter IP addresses, one per line"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter IP addresses or CIDR ranges, one per line (e.g. 192.168.1.1 or 192.168.1.0/24)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={securityForm.control}
                        name="forcePasswordChange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Force Password Change (days)</FormLabel>
                            <FormControl>
                              <Input type="number" min={30} max={365} {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of days before requiring users to change their password
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        disabled={saveSecurityMutation.isPending}
                        className="mt-6"
                      >
                        {saveSecurityMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Security Settings
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Configure the look and feel of your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appearanceForm}>
                    <form onSubmit={appearanceForm.handleSubmit(onSubmitAppearance)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={appearanceForm.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Color</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input type="color" {...field} className="w-12 h-10 p-1" />
                                </FormControl>
                                <Input value={field.value} onChange={field.onChange} className="flex-1" />
                              </div>
                              <FormDescription>
                                Main color used throughout the application
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={appearanceForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System Default</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Default color theme for the application
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={appearanceForm.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                URL to your company logo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={appearanceForm.control}
                          name="faviconUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Favicon URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                URL to your site favicon
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={appearanceForm.control}
                        name="customCss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom CSS</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter custom CSS"
                                className="font-mono min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Custom CSS to be applied to the application
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <FormField
                          control={appearanceForm.control}
                          name="enableCustomFonts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable Custom Fonts</FormLabel>
                                <FormDescription>
                                  Use custom fonts instead of system defaults
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {appearanceForm.watch("enableCustomFonts") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <FormField
                              control={appearanceForm.control}
                              name="headerFont"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Header Font</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select font" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Inter">Inter</SelectItem>
                                      <SelectItem value="Roboto">Roboto</SelectItem>
                                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                                      <SelectItem value="Lato">Lato</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Font used for headings
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={appearanceForm.control}
                              name="bodyFont"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Body Font</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select font" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Inter">Inter</SelectItem>
                                      <SelectItem value="Roboto">Roboto</SelectItem>
                                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                                      <SelectItem value="Lato">Lato</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Font used for body text
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={saveAppearanceMutation.isPending}
                        className="mt-6"
                      >
                        {saveAppearanceMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Appearance Settings
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}