import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { WaitlistFormData } from "@/lib/types";

const waitlistSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.string({ required_error: "Please select a role" }),
  interests: z.array(z.string()).min(1, { message: "Select at least one interest" }),
  newsletter: z.boolean().default(false),
  // Additional fields for tracking (optional in the form since they're added automatically)
  deviceInfo: z.any().optional(),
  locationInfo: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
});

export default function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [deviceInfo, setDeviceInfo] = useState<Record<string, any>>({});
  const [locationInfo, setLocationInfo] = useState<Record<string, any>>({});
  
  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      interests: [],
      newsletter: false,
    },
  });
  
  // Collect device information
  useEffect(() => {
    // Basic device info
    const info: Record<string, any> = {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeZoneOffset: new Date().getTimezoneOffset(),
      cookiesEnabled: navigator.cookieEnabled,
      browserFingerprint: `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`,
    };
    
    // Add connection info if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        info.connectionType = conn.effectiveType;
        info.downlink = conn.downlink;
        info.rtt = conn.rtt;
        info.saveData = conn.saveData;
      }
    }
    
    // Add battery info if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        info.batteryLevel = battery.level;
        info.batteryCharging = battery.charging;
        setDeviceInfo({ ...info });
      }).catch(() => {
        setDeviceInfo(info);
      });
    } else {
      setDeviceInfo(info);
    }
    
    // Try to get location information if permitted
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationInfo({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        () => {
          // Silently handle error - don't want to prompt the user if they decline
          setLocationInfo({ error: "Geolocation permission denied or unavailable" });
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);
  
  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    
    try {
      // Enrich the data with device and location information
      const enrichedData: WaitlistFormData = {
        ...data,
        deviceInfo,
        locationInfo,
        userAgent: navigator.userAgent,
        referrer: document.referrer || window.location.href,
      };
      
      await apiRequest('POST', '/api/waitlist', enrichedData);
      
      toast({
        title: "Thanks for joining our waitlist!",
        description: "We'll be in touch soon with more information.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      
      toast({
        title: "Submission failed",
        description: "There was a problem adding you to the waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const interestOptions = [
    { id: "learning", label: "Educational Resources" },
    { id: "classes", label: "Classes & Activities" },
    { id: "tracking", label: "Progress Tracking" },
    { id: "community", label: "Community Features" },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your first name"
                    {...field}
                    disabled={isSubmitting}
                  />
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
                  <Input
                    placeholder="Your last name"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a...</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="teacher">Teacher/Educator</SelectItem>
                  <SelectItem value="school">School Administrator</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>I'm interested in (select all that apply)</FormLabel>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interestOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="interests"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="newsletter"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  I'd like to receive updates about KidVenture's launch and educational resources.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Join the Waitlist"}
        </Button>
        
        <p className="text-center text-xs text-gray-500 mt-3">
          By joining, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </Form>
  );
}
