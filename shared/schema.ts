import { pgTable, text, serial, integer, timestamp, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',
  PARENT = 'parent'
}

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role", { enum: Object.values(Role) }).notNull().default(Role.PARENT),
  profileImage: text("profile_image"),
  description: text("description"),
  securityQuestion1: text("security_question_1"),
  securityAnswer1: text("security_answer_1"),
  securityQuestion2: text("security_question_2"),
  securityAnswer2: text("security_answer_2"),
  secureToken: text("secure_token"),
  driverLicense: text("driver_license"),
  qrEnabled: boolean("qr_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at"),
});

// Branches table
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  capacity: integer("capacity").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff assignments to branches
export const staffBranches = pgTable("staff_branches", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => users.id),
  branchId: integer("branch_id").notNull().references(() => branches.id),
  isManager: boolean("is_manager").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    staffBranchIdx: uniqueIndex("staff_branch_idx").on(table.staffId, table.branchId),
  };
});

// Children table
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(), 
  dateOfBirth: timestamp("date_of_birth").notNull(),
  parentId: integer("parent_id").notNull().references(() => users.id),
  profileImage: text("profile_image"),
  eyeColor: text("eye_color"),
  hairColor: text("hair_color"),
  customField: text("custom_field"),
  customFieldValue: text("custom_field_value"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at"),
});

// Child enrollment in branches
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => children.id),
  branchId: integer("branch_id").notNull().references(() => branches.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    childBranchIdx: uniqueIndex("child_branch_idx").on(table.childId, table.branchId),
  };
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  branchId: integer("branch_id").notNull().references(() => branches.id),
  staffId: integer("staff_id").notNull().references(() => users.id),
  maxCapacity: integer("max_capacity").notNull().default(20),
  ageMin: integer("age_min").notNull().default(3),
  ageMax: integer("age_max").notNull().default(12),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schedule slots for classes
export const scheduleSlots = pgTable("schedule_slots", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classes.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6, Sunday to Saturday
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments (bookings) for children in classes
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => children.id),
  slotId: integer("slot_id").notNull().references(() => scheduleSlots.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default('scheduled'), // scheduled, attended, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    childSlotDateIdx: uniqueIndex("child_slot_date_idx").on(table.childId, table.slotId, table.date),
  };
});

// Educational resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  ageMin: integer("age_min").notNull().default(3),
  ageMax: integer("age_max").notNull().default(12),
  isPublished: boolean("is_published").notNull().default(true),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Waitlist entries
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  interests: jsonb("interests").notNull(),
  newsletter: boolean("newsletter").notNull().default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceInfo: jsonb("device_info"),
  locationInfo: jsonb("location_info"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact form messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Profile change requests
export const profileChangeRequests = pgTable("profile_change_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  requestData: jsonb("request_data").notNull(), // JSON object with requested changes
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  adminId: integer("admin_id").references(() => users.id),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true });
export const insertStaffBranchSchema = createInsertSchema(staffBranches).omit({ id: true, createdAt: true });
export const insertChildSchema = createInsertSchema(children).omit({ id: true, createdAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true });
export const insertScheduleSlotSchema = createInsertSchema(scheduleSlots).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWaitlistSchema = createInsertSchema(waitlist).omit({ id: true, createdAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export const insertProfileChangeRequestSchema = createInsertSchema(profileChangeRequests).omit({ id: true, createdAt: true, updatedAt: true });

// Login schema
export const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type StaffBranch = typeof staffBranches.$inferSelect;
export type InsertStaffBranch = z.infer<typeof insertStaffBranchSchema>;
export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type ScheduleSlot = typeof scheduleSlots.$inferSelect;
export type InsertScheduleSlot = z.infer<typeof insertScheduleSlotSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ProfileChangeRequest = typeof profileChangeRequests.$inferSelect;
export type InsertProfileChangeRequest = z.infer<typeof insertProfileChangeRequestSchema>;
export type Login = z.infer<typeof loginSchema>;
