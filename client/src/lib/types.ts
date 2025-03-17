// This file contains additional type definitions for the frontend

export interface NavLink {
  href: string;
  label: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export interface RoleFeature {
  role: string;
  icon: React.ReactNode;
  iconBg: string;
  features: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface WaitlistFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  interests: string[];
  newsletter: boolean;
  // Extended data (captured automatically by the system)
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
  referrer?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface AuthFormData {
  identifier?: string;  // For login (username or email)
  email?: string;      // For registration
  username?: string;   // For registration
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

export interface DashboardMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface BranchSelectorOption {
  id: number;
  name: string;
}

export interface ProfileChangeRequestFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  driverLicense?: File | null;
  requestData?: Record<string, any>; // For storing JSON data of the changes
}

export interface ProfileChangeRequest {
  id: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  requestData: Record<string, any>;
  createdAt: Date | null;
  updatedAt: Date | null;
  adminId: number | null;
  adminNotes: string | null;
}
