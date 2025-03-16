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
