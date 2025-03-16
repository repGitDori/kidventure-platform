import {
  users, branches, staffBranches, children, enrollments,
  classes, scheduleSlots, appointments, resources, waitlist,
  contactMessages, profileChangeRequests, type User, type InsertUser, type Branch, 
  type InsertBranch, type StaffBranch, type InsertStaffBranch,
  type Child, type InsertChild, type Enrollment, type InsertEnrollment,
  type Class, type InsertClass, type ScheduleSlot, type InsertScheduleSlot,
  type Appointment, type InsertAppointment, type Resource, type InsertResource,
  type Waitlist, type InsertWaitlist, type ContactMessage, type InsertContactMessage,
  type ProfileChangeRequest, type InsertProfileChangeRequest, Role
} from "@shared/schema";
import bcrypt from 'bcryptjs';

export interface IStorage {
  // Users
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Authentication
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  
  // Branches
  getAllBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, data: Partial<Branch>): Promise<Branch | undefined>;
  
  // Staff-Branch assignments
  getStaffBranches(staffId: number): Promise<StaffBranch[]>;
  getBranchStaff(branchId: number): Promise<StaffBranch[]>;
  assignStaffToBranch(staffBranch: InsertStaffBranch): Promise<StaffBranch>;
  updateStaffBranch(id: number, data: Partial<StaffBranch>): Promise<StaffBranch | undefined>;
  
  // Children
  getChildrenByParent(parentId: number): Promise<Child[]>;
  getChild(id: number): Promise<Child | undefined>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: number, data: Partial<Child>): Promise<Child | undefined>;
  
  // Enrollments
  getEnrollmentsByChild(childId: number): Promise<Enrollment[]>;
  getEnrollmentsByBranch(branchId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment | undefined>;
  
  // Classes
  getClassesByBranch(branchId: number): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(klass: InsertClass): Promise<Class>;
  updateClass(id: number, data: Partial<Class>): Promise<Class | undefined>;
  
  // Schedule slots
  getSlotsByClass(classId: number): Promise<ScheduleSlot[]>;
  getSlot(id: number): Promise<ScheduleSlot | undefined>;
  createSlot(slot: InsertScheduleSlot): Promise<ScheduleSlot>;
  
  // Appointments
  getAppointmentsByChild(childId: number): Promise<Appointment[]>;
  getAppointmentsBySlot(slotId: number, date: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Resources
  getAllResources(limit?: number): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Waitlist
  addToWaitlist(entry: InsertWaitlist): Promise<Waitlist>;
  getWaitlistEntries(): Promise<Waitlist[]>;
  
  // Contact messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  markContactMessageAsRead(id: number): Promise<ContactMessage | undefined>;
  
  // Profile change requests
  createProfileChangeRequest(request: InsertProfileChangeRequest): Promise<ProfileChangeRequest>;
  getProfileChangeRequestsByUser(userId: number): Promise<ProfileChangeRequest[]>;
  getProfileChangeRequestById(id: number): Promise<ProfileChangeRequest | undefined>;
  getPendingProfileChangeRequests(): Promise<ProfileChangeRequest[]>;
  updateProfileChangeRequest(id: number, data: Partial<ProfileChangeRequest>): Promise<ProfileChangeRequest | undefined>;
  approveProfileChangeRequest(id: number, adminId: number, notes?: string): Promise<ProfileChangeRequest | undefined>;
  rejectProfileChangeRequest(id: number, adminId: number, notes?: string): Promise<ProfileChangeRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private branches: Map<number, Branch>;
  private staffBranches: Map<number, StaffBranch>;
  private children: Map<number, Child>;
  private enrollments: Map<number, Enrollment>;
  private classes: Map<number, Class>;
  private scheduleSlots: Map<number, ScheduleSlot>;
  private appointments: Map<number, Appointment>;
  private resources: Map<number, Resource>;
  private waitlistEntries: Map<number, Waitlist>;
  private contactMessages: Map<number, ContactMessage>;
  private profileChangeRequests: Map<number, ProfileChangeRequest>;
  
  private userId = 1;
  private branchId = 1;
  private staffBranchId = 1;
  private childId = 1;
  private enrollmentId = 1;
  private classId = 1;
  private slotId = 1;
  private appointmentId = 1;
  private resourceId = 1;
  private waitlistId = 1;
  private messageId = 1;
  private changeRequestId = 1;

  constructor() {
    this.users = new Map();
    this.branches = new Map();
    this.staffBranches = new Map();
    this.children = new Map();
    this.enrollments = new Map();
    this.classes = new Map();
    this.scheduleSlots = new Map();
    this.appointments = new Map();
    this.resources = new Map();
    this.waitlistEntries = new Map();
    this.contactMessages = new Map();
    this.profileChangeRequests = new Map();
    
    // Create admin user (Dorian with password 'cangetin')
    this.createUser({
      username: 'dorian',
      email: 'dorian@kidventure.com',
      password: bcrypt.hashSync('cangetin', 10),
      firstName: 'Dorian',
      lastName: 'Admin',
      role: Role.ADMIN
    });
    
    // Create customer user (Sarah with password 'cangetin')
    this.createUser({
      username: 'sarah',
      email: 'sarah@kidventure.com',
      password: bcrypt.hashSync('cangetin', 10),
      firstName: 'Sarah',
      lastName: 'Parent',
      role: Role.PARENT
    });
    
    // Create additional staff user for demo purposes
    this.createUser({
      username: 'staff',
      email: 'staff@kidventure.com',
      password: bcrypt.hashSync('password123', 10),
      firstName: 'Staff',
      lastName: 'User',
      role: Role.STAFF
    });
    
    // Create sample branches
    this.createBranch({
      name: 'KidVenture Downtown',
      address: '123 Main St, Anytown, USA',
      phone: '(555) 123-4567',
      email: 'downtown@kidventure.com',
      capacity: 100,
      isActive: true
    });
    
    this.createBranch({
      name: 'KidVenture Eastside',
      address: '456 Park Ave, Anytown, USA',
      phone: '(555) 987-6543',
      email: 'eastside@kidventure.com',
      capacity: 75,
      isActive: true
    });
    
    // Assign staff to branches
    this.assignStaffToBranch({
      staffId: 2, // Staff user
      branchId: 1, // Downtown branch
      isManager: true
    });
    
    // Create sample children for parent (Sarah)
    this.createChild({
      firstName: 'Emma',
      lastName: 'Parent',
      dateOfBirth: new Date('2017-05-12'),
      parentId: 2, // Sarah (parent user)
      notes: 'Allergic to nuts'
    });
    
    this.createChild({
      firstName: 'Noah',
      lastName: 'Parent',
      dateOfBirth: new Date('2019-11-03'),
      parentId: 2, // Sarah (parent user)
      notes: ''
    });
    
    // Enroll children in branches
    this.createEnrollment({
      childId: 1, // Emma
      branchId: 1, // Downtown
      startDate: new Date(),
      isActive: true
    });
    
    // Create classes
    this.createClass({
      name: 'Creative Art Workshop',
      description: 'A fun class where kids explore different art mediums and express their creativity',
      branchId: 1, // Downtown
      staffId: 2, // Staff user
      maxCapacity: 15,
      ageMin: 4,
      ageMax: 8
    });
    
    this.createClass({
      name: 'Science Explorers',
      description: 'Hands-on science experiments and discovery for curious minds',
      branchId: 1, // Downtown
      staffId: 2, // Staff user
      maxCapacity: 12,
      ageMin: 6,
      ageMax: 10
    });
    
    // Create schedule slots
    this.createSlot({
      classId: 1, // Art Workshop
      dayOfWeek: 1, // Monday
      startTime: '15:00',
      endTime: '16:30',
      isActive: true
    });
    
    this.createSlot({
      classId: 1, // Art Workshop
      dayOfWeek: 3, // Wednesday
      startTime: '15:00',
      endTime: '16:30',
      isActive: true
    });
    
    this.createSlot({
      classId: 2, // Science Explorers
      dayOfWeek: 2, // Tuesday
      startTime: '16:00',
      endTime: '17:30',
      isActive: true
    });
    
    // Create educational resources
    this.createResource({
      title: 'At-Home Science Experiments',
      description: 'Simple experiments you can do with your kids using household items',
      content: 'Long form content with experiment instructions...',
      category: 'Science',
      ageMin: 5,
      ageMax: 12,
      isPublished: true,
      createdById: 2 // Staff user
    });
    
    this.createResource({
      title: 'Healthy Snacks for Kids',
      description: 'Nutritious and delicious snack ideas that kids will love',
      content: 'Long form content with recipes and nutrition information...',
      category: 'Nutrition',
      ageMin: 3,
      ageMax: 12,
      isPublished: true,
      createdById: 2 // Staff user
    });
  }

  // Users
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    // First try to find by username
    let user = await this.getUserByUsername(identifier);
    if (user) return user;
    
    // Then try to find by email
    return await this.getUserByEmail(identifier);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Authentication
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Branches
  async getAllBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const id = this.branchId++;
    const newBranch: Branch = { ...branch, id, createdAt: new Date() };
    this.branches.set(id, newBranch);
    return newBranch;
  }

  async updateBranch(id: number, data: Partial<Branch>): Promise<Branch | undefined> {
    const branch = this.branches.get(id);
    if (!branch) return undefined;
    
    const updatedBranch = { ...branch, ...data };
    this.branches.set(id, updatedBranch);
    return updatedBranch;
  }

  // Staff-Branch assignments
  async getStaffBranches(staffId: number): Promise<StaffBranch[]> {
    return Array.from(this.staffBranches.values()).filter(sb => sb.staffId === staffId);
  }

  async getBranchStaff(branchId: number): Promise<StaffBranch[]> {
    return Array.from(this.staffBranches.values()).filter(sb => sb.branchId === branchId);
  }

  async assignStaffToBranch(staffBranch: InsertStaffBranch): Promise<StaffBranch> {
    const id = this.staffBranchId++;
    const newStaffBranch: StaffBranch = { ...staffBranch, id, createdAt: new Date() };
    this.staffBranches.set(id, newStaffBranch);
    return newStaffBranch;
  }

  async updateStaffBranch(id: number, data: Partial<StaffBranch>): Promise<StaffBranch | undefined> {
    const staffBranch = this.staffBranches.get(id);
    if (!staffBranch) return undefined;
    
    const updatedStaffBranch = { ...staffBranch, ...data };
    this.staffBranches.set(id, updatedStaffBranch);
    return updatedStaffBranch;
  }

  // Children
  async getChildrenByParent(parentId: number): Promise<Child[]> {
    return Array.from(this.children.values()).filter(child => child.parentId === parentId);
  }

  async getChild(id: number): Promise<Child | undefined> {
    return this.children.get(id);
  }

  async createChild(child: InsertChild): Promise<Child> {
    const id = this.childId++;
    const newChild: Child = { ...child, id, createdAt: new Date() };
    this.children.set(id, newChild);
    return newChild;
  }

  async updateChild(id: number, data: Partial<Child>): Promise<Child | undefined> {
    const child = this.children.get(id);
    if (!child) return undefined;
    
    const updatedChild = { ...child, ...data };
    this.children.set(id, updatedChild);
    return updatedChild;
  }

  // Enrollments
  async getEnrollmentsByChild(childId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.childId === childId);
  }

  async getEnrollmentsByBranch(branchId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.branchId === branchId);
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentId++;
    const newEnrollment: Enrollment = { ...enrollment, id, createdAt: new Date() };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment = { ...enrollment, ...data };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Classes
  async getClassesByBranch(branchId: number): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => cls.branchId === branchId);
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(klass: InsertClass): Promise<Class> {
    const id = this.classId++;
    const newClass: Class = { ...klass, id, createdAt: new Date() };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: number, data: Partial<Class>): Promise<Class | undefined> {
    const klass = this.classes.get(id);
    if (!klass) return undefined;
    
    const updatedClass = { ...klass, ...data };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  // Schedule slots
  async getSlotsByClass(classId: number): Promise<ScheduleSlot[]> {
    return Array.from(this.scheduleSlots.values()).filter(slot => slot.classId === classId);
  }

  async getSlot(id: number): Promise<ScheduleSlot | undefined> {
    return this.scheduleSlots.get(id);
  }

  async createSlot(slot: InsertScheduleSlot): Promise<ScheduleSlot> {
    const id = this.slotId++;
    const newSlot: ScheduleSlot = { ...slot, id, createdAt: new Date() };
    this.scheduleSlots.set(id, newSlot);
    return newSlot;
  }

  // Appointments
  async getAppointmentsByChild(childId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.childId === childId);
  }

  async getAppointmentsBySlot(slotId: number, date: Date): Promise<Appointment[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.appointments.values()).filter(appointment => {
      const appointmentDate = appointment.date.toISOString().split('T')[0];
      return appointment.slotId === slotId && appointmentDate === dateString;
    });
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const newAppointment: Appointment = { ...appointment, id, createdAt: new Date() };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...data };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Resources
  async getAllResources(limit?: number): Promise<Resource[]> {
    const resources = Array.from(this.resources.values())
      .filter(resource => resource.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? resources.slice(0, limit) : resources;
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.category === category && resource.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const now = new Date();
    const newResource: Resource = { 
      ...resource, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.resources.set(id, newResource);
    return newResource;
  }

  // Waitlist
  async addToWaitlist(entry: InsertWaitlist): Promise<Waitlist> {
    const id = this.waitlistId++;
    const newEntry: Waitlist = { ...entry, id, createdAt: new Date() };
    this.waitlistEntries.set(id, newEntry);
    return newEntry;
  }
  
  async getWaitlistEntries(): Promise<Waitlist[]> {
    return Array.from(this.waitlistEntries.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Contact messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.messageId++;
    const newMessage: ContactMessage = { ...message, id, createdAt: new Date() };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Profile change requests
  async createProfileChangeRequest(request: InsertProfileChangeRequest): Promise<ProfileChangeRequest> {
    const id = this.changeRequestId++;
    const now = new Date();
    const newRequest: ProfileChangeRequest = {
      ...request,
      id,
      createdAt: now,
      status: 'pending', // Default status is pending
      updatedAt: null,
    };
    this.profileChangeRequests.set(id, newRequest);
    return newRequest;
  }

  async getProfileChangeRequestsByUser(userId: number): Promise<ProfileChangeRequest[]> {
    return Array.from(this.profileChangeRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProfileChangeRequestById(id: number): Promise<ProfileChangeRequest | undefined> {
    return this.profileChangeRequests.get(id);
  }

  async getPendingProfileChangeRequests(): Promise<ProfileChangeRequest[]> {
    return Array.from(this.profileChangeRequests.values())
      .filter(request => request.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateProfileChangeRequest(id: number, data: Partial<ProfileChangeRequest>): Promise<ProfileChangeRequest | undefined> {
    const request = this.profileChangeRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      ...data,
      updatedAt: new Date() 
    };
    this.profileChangeRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async approveProfileChangeRequest(id: number, adminId: number, notes?: string): Promise<ProfileChangeRequest | undefined> {
    const request = this.profileChangeRequests.get(id);
    if (!request) return undefined;
    
    // Update the request status
    const updatedRequest = { 
      ...request, 
      status: 'approved',
      adminId,
      adminNotes: notes || null,
      updatedAt: new Date() 
    };
    this.profileChangeRequests.set(id, updatedRequest);
    
    // Apply the changes to the user profile
    if (request.userId) {
      const user = this.users.get(request.userId);
      if (user) {
        const requestData = request.requestData as Partial<User>;
        await this.updateUser(request.userId, requestData);
      }
    }
    
    return updatedRequest;
  }

  async rejectProfileChangeRequest(id: number, adminId: number, notes?: string): Promise<ProfileChangeRequest | undefined> {
    const request = this.profileChangeRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = {
      ...request,
      status: 'rejected',
      adminId,
      adminNotes: notes || null,
      updatedAt: new Date()
    };
    this.profileChangeRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
