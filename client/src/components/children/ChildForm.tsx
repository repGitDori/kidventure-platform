import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Child } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

// Schema for the child form
const childFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  customField: z.string().optional(),
  customFieldValue: z.string().optional(),
  notes: z.string().optional(),
  profileImage: z.string().optional(),
});

export type ChildFormValues = z.infer<typeof childFormSchema>;

interface ChildFormProps {
  child?: Child;
  onSubmit: (data: ChildFormValues) => void;
  isSubmitting: boolean;
}

export default function ChildForm({ child, onSubmit, isSubmitting }: ChildFormProps) {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(child?.profileImage || null);

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      firstName: child?.firstName || "",
      lastName: child?.lastName || "",
      dateOfBirth: child?.dateOfBirth ? new Date(child.dateOfBirth) : undefined,
      eyeColor: child?.eyeColor || "",
      hairColor: child?.hairColor || "",
      customField: child?.customField || "",
      customFieldValue: child?.customFieldValue || "",
      notes: child?.notes || "",
      profileImage: child?.profileImage || "",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // In a real implementation, this would upload to a server/cloud storage
      // For now, we'll just create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setPreviewImage(tempUrl);
      
      // We'd normally get a URL back from the server after upload
      // and set it in the form, but for now we'll just use the temp URL
      form.setValue("profileImage", tempUrl);
      
      toast({
        title: "Image selected",
        description: "Image has been selected successfully.",
      });
    }
  };

  const handleFormSubmit = (data: ChildFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage src={previewImage || ""} alt="Child photo" />
            <AvatarFallback>
              <User className="h-12 w-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div className="relative">
            <Button type="button" variant="outline" size="sm" className="relative">
              <Upload className="h-4 w-4 mr-2" /> Upload Photo
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
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
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eyeColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eye Color</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Blue, Brown, Green, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hairColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hair Color</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Blonde, Brown, Black, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Field Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Allergies" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customFieldValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Peanuts, Dairy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Any additional information about the child"
                  className="resize-none"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : child ? "Update Child" : "Add Child"}
          </Button>
        </div>
      </form>
    </Form>
  );
}