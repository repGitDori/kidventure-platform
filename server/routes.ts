import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";
import { 
  insertUserSchema, insertBranchSchema, insertChildSchema, 
  insertClassSchema, insertScheduleSlotSchema, insertAppointmentSchema,
  insertResourceSchema, insertWaitlistSchema, insertContactMessageSchema,
  insertProfileChangeRequestSchema, loginSchema, Role
} from "@shared/schema";
import { z } from "zod";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session and authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || 'kidventure-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // 24 hours
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production'
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(new LocalStrategy(
    { usernameField: 'identifier' },
    async (identifier, password, done) => {
      try {
        const user = await storage.getUserByIdentifier(identifier);
        if (!user) {
          return done(null, false, { message: 'Invalid username/email or password' });
        }
        
        const isPasswordValid = await storage.verifyPassword(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid username/email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check authentication
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Middleware to check role
  const hasRole = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = req.user as any;
      // Admin users have access to everything
      if (user.role === Role.ADMIN) {
        return next();
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      next();
    };
  };

  // Authentication routes
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || 'Authentication failed' });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Remove password from response
          const { password, ...userResponse } = user;
          return res.json(userResponse);
        });
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const userSchema = insertUserSchema.extend({
        confirmPassword: z.string()
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
      
      const result = userSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const { confirmPassword, ...userData } = result.data;
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      
      // Check if email already exists (if provided)
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with parent role by default
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: Role.PARENT
      });
      
      // Login the new user
      req.logIn(newUser, (err) => {
        if (err) {
          return next(err);
        }
        
        // Remove password from response
        const { password, ...userResponse } = newUser;
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', isAuthenticated, (req, res) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Remove password from response
    const { password, ...userResponse } = user;
    res.json(userResponse);
  });

  // QR code authentication routes
  app.post('/api/auth/generate-qr-token', isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      
      // Generate a secure random token
      const secureToken = await bcrypt.hash(user.id.toString() + Date.now().toString(), 10);
      
      // Update user with secure token and enable QR
      const updatedUser = await storage.updateUser(user.id, { 
        secureToken, 
        qrEnabled: true 
      });
      
      if (!updatedUser) {
        return res.status(400).json({ message: 'Failed to enable QR login' });
      }
      
      // Create QR code URL with user ID and token
      // This would typically be a deep link to your app in production
      const qrUrl = `kidventure://qr-login?uid=${user.id}&token=${secureToken}`;
      
      res.json({ 
        success: true,
        qrUrl,
        message: 'QR code generated successfully' 
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/auth/disable-qr', isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      
      // Disable QR login by removing token and setting qrEnabled to false
      const updatedUser = await storage.updateUser(user.id, { 
        secureToken: null, 
        qrEnabled: false 
      });
      
      if (!updatedUser) {
        return res.status(400).json({ message: 'Failed to disable QR login' });
      }
      
      res.json({ 
        success: true,
        message: 'QR login disabled successfully' 
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/auth/qr-login', async (req, res, next) => {
    try {
      const { uid, token } = req.body;
      
      if (!uid || !token) {
        return res.status(400).json({ message: 'Invalid QR code data' });
      }
      
      const userId = Number(uid);
      const user = await storage.getUser(userId);
      
      if (!user || !user.qrEnabled || user.secureToken !== token) {
        return res.status(401).json({ message: 'Invalid or expired QR code' });
      }
      
      // Log the user in
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Remove password from response
        const { password, ...userResponse } = user;
        return res.json(userResponse);
      });
    } catch (error) {
      next(error);
    }
  });

  // Branch routes
  app.get('/api/branches', async (_req, res, next) => {
    try {
      const branches = await storage.getAllBranches();
      res.json(branches);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/branches/:id', async (req, res, next) => {
    try {
      const branch = await storage.getBranch(Number(req.params.id));
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
      res.json(branch);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/branches', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const result = insertBranchSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const branch = await storage.createBranch(result.data);
      res.status(201).json(branch);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/branches/:id', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const branch = await storage.getBranch(id);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
      
      const result = insertBranchSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const updatedBranch = await storage.updateBranch(id, result.data);
      res.json(updatedBranch);
    } catch (error) {
      next(error);
    }
  });

  // Children routes
  app.get('/api/children', isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      if (user.role === Role.PARENT) {
        const children = await storage.getChildrenByParent(user.id);
        return res.json(children);
      } else {
        // Admin and staff can see all children for now
        // In a real app, you might want to filter by branch for staff
        const allChildren: any[] = [];
        for (let i = 1; i < storage.userId; i++) {
          const parentUser = await storage.getUser(i);
          if (parentUser && parentUser.role === Role.PARENT) {
            const children = await storage.getChildrenByParent(i);
            allChildren.push(...children);
          }
        }
        return res.json(allChildren);
      }
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/children', hasRole([Role.PARENT]), async (req, res, next) => {
    try {
      const user = req.user as any;
      
      const result = insertChildSchema.safeParse({
        ...req.body,
        parentId: user.id
      });
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const child = await storage.createChild(result.data);
      res.status(201).json(child);
    } catch (error) {
      next(error);
    }
  });

  // Classes routes
  app.get('/api/branches/:branchId/classes', async (req, res, next) => {
    try {
      const branchId = Number(req.params.branchId);
      const branch = await storage.getBranch(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
      
      const classes = await storage.getClassesByBranch(branchId);
      res.json(classes);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/classes', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      const result = insertClassSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const klass = await storage.createClass(result.data);
      res.status(201).json(klass);
    } catch (error) {
      next(error);
    }
  });

  // Schedule slots routes
  app.get('/api/classes/:classId/slots', async (req, res, next) => {
    try {
      const classId = Number(req.params.classId);
      const klass = await storage.getClass(classId);
      if (!klass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      const slots = await storage.getSlotsByClass(classId);
      res.json(slots);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all schedule slots
  app.get('/api/slots', async (req, res, next) => {
    try {
      // For a real system, we would implement pagination here
      // Get all schedule slots from all classes
      const classes = await storage.getAllClasses();
      const allSlots = [];
      
      for (const klass of classes) {
        const slots = await storage.getSlotsByClass(klass.id);
        allSlots.push(...slots);
      }
      
      res.json(allSlots);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/slots', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      const result = insertScheduleSlotSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const slot = await storage.createSlot(result.data);
      res.status(201).json(slot);
    } catch (error) {
      next(error);
    }
  });

  // Appointments routes
  app.get('/api/children/:childId/appointments', hasRole([Role.PARENT, Role.STAFF, Role.ADMIN]), async (req, res, next) => {
    try {
      const childId = Number(req.params.childId);
      const user = req.user as any;
      
      // If parent, verify they are the parent of this child
      if (user.role === Role.PARENT) {
        const child = await storage.getChild(childId);
        if (!child || child.parentId !== user.id) {
          return res.status(403).json({ message: 'You are not authorized to access this child\'s appointments' });
        }
      }
      
      const appointments = await storage.getAppointmentsByChild(childId);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all appointments
  app.get('/api/appointments', hasRole([Role.STAFF, Role.ADMIN]), async (req, res, next) => {
    try {
      // For a real system, we would implement pagination, filtering by date range, etc.
      // Get all appointments from storage
      const allAppointments = [];
      
      // Find appointments from all children
      const children = await storage.getAllChildren();
      
      for (const child of children) {
        const childAppointments = await storage.getAppointmentsByChild(child.id);
        allAppointments.push(...childAppointments);
      }
      
      res.json(allAppointments);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/appointments', hasRole([Role.PARENT, Role.STAFF, Role.ADMIN]), async (req, res, next) => {
    try {
      const result = insertAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const user = req.user as any;
      if (user.role === Role.PARENT) {
        // Verify parent owns the child
        const child = await storage.getChild(result.data.childId);
        if (!child || child.parentId !== user.id) {
          return res.status(403).json({ message: 'You are not authorized to book appointments for this child' });
        }
      }
      
      // Check if slot exists
      const slot = await storage.getSlot(result.data.slotId);
      if (!slot) {
        return res.status(404).json({ message: 'Schedule slot not found' });
      }
      
      // Check for duplicate appointment
      const existingAppointments = await storage.getAppointmentsBySlot(result.data.slotId, new Date(result.data.date));
      if (existingAppointments.some(a => a.childId === result.data.childId)) {
        return res.status(400).json({ message: 'Child already has an appointment for this slot on this date' });
      }
      
      const appointment = await storage.createAppointment(result.data);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  });

  // Resources routes
  app.get('/api/resources', async (req, res, next) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const category = req.query.category as string | undefined;
      
      if (category) {
        const resources = await storage.getResourcesByCategory(category);
        return res.json(resources);
      }
      
      const resources = await storage.getAllResources(limit);
      res.json(resources);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/resources/:id', async (req, res, next) => {
    try {
      const resource = await storage.getResource(Number(req.params.id));
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json(resource);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/resources', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      const user = req.user as any;
      
      const result = insertResourceSchema.safeParse({
        ...req.body,
        createdById: user.id
      });
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const resource = await storage.createResource(result.data);
      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  });

  // Waitlist route
  app.post('/api/waitlist', async (req, res, next) => {
    try {
      const result = insertWaitlistSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      // Extract IP address from request
      let ipAddress: string | undefined = undefined;
      
      // Get IP from various possible sources
      const xForwardedFor = req.headers['x-forwarded-for'];
      if (xForwardedFor) {
        ipAddress = Array.isArray(xForwardedFor) 
          ? xForwardedFor[0] 
          : xForwardedFor.split(',')[0].trim();
      } else if (req.socket.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
      } else if (req.connection && req.connection.remoteAddress) {
        ipAddress = req.connection.remoteAddress;
      }
      
      // Combine data with IP address if not already provided
      const enrichedData = {
        ...result.data,
        ipAddress: result.data.ipAddress || ipAddress,
      };
      
      const waitlistEntry = await storage.addToWaitlist(enrichedData);
      res.status(201).json(waitlistEntry);
    } catch (error) {
      next(error);
    }
  });

  // Contact route
  app.post('/api/contact', async (req, res, next) => {
    try {
      const result = insertContactMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const message = await storage.createContactMessage(result.data);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes
  app.get('/api/admin/waitlist', hasRole([Role.ADMIN]), async (_req, res, next) => {
    try {
      const entries = await storage.getWaitlistEntries();
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/admin/messages', hasRole([Role.ADMIN]), async (_req, res, next) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/admin/messages/:id/read', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const message = await storage.markContactMessageAsRead(Number(req.params.id));
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  // Admin check-in/check-out routes
  app.post('/api/admin/check-in', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      const { childId, date } = req.body;
      
      if (!childId || !date) {
        return res.status(400).json({ message: 'Child ID and date are required' });
      }
      
      const child = await storage.getChild(Number(childId));
      if (!child) {
        return res.status(404).json({ message: 'Child not found' });
      }
      
      // In a real app, you would create an attendance record
      // For now we'll just return a success message
      res.json({ 
        success: true,
        message: `Check-in recorded for ${child.firstName} ${child.lastName}`,
        timestamp: new Date()
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/admin/check-out', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      const { childId, date } = req.body;
      
      if (!childId || !date) {
        return res.status(400).json({ message: 'Child ID and date are required' });
      }
      
      const child = await storage.getChild(Number(childId));
      if (!child) {
        return res.status(404).json({ message: 'Child not found' });
      }
      
      // In a real app, you would update the attendance record
      // For now we'll just return a success message
      res.json({ 
        success: true,
        message: `Check-out recorded for ${child.firstName} ${child.lastName}`,
        timestamp: new Date()
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin user management routes
  app.get('/api/admin/users', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      // In a real app with a database, you would fetch all users
      // For our in-memory storage, we need to collect all users
      const allUsers: any[] = [];
      
      for (let i = 1; i <= 100; i++) { // Limit to prevent infinite loops
        const user = await storage.getUser(i);
        if (user) {
          // Remove password before sending
          const { password, ...userData } = user;
          allUsers.push(userData);
        }
      }
      
      res.json(allUsers);
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/admin/users', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const newUser = await storage.createUser(result.data);
      
      // Remove password before sending
      const { password, ...userData } = newUser;
      res.status(201).json(userData);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch('/api/admin/users/:id', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const result = insertUserSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const updatedUser = await storage.updateUser(id, result.data);
      
      if (!updatedUser) {
        return res.status(400).json({ message: 'Failed to update user' });
      }
      
      // Remove password before sending
      const { password, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      next(error);
    }
  });
  
  // Admin payment management routes
  app.get('/api/admin/payments', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      // In a real app, you would fetch payments from the database
      // For our demo, we'll return a message
      res.json({
        message: 'Payment management requires database implementation',
        hint: 'This would return all payments in a real application'
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin schedule management
  app.get('/api/admin/schedule', hasRole([Role.ADMIN, Role.STAFF]), async (req, res, next) => {
    try {
      // Get all schedule slots
      const allClasses = [];
      const allSlots = [];
      
      // For each class, get its slots
      for (let i = 1; i <= 100; i++) { // Limit to prevent infinite loops
        const klass = await storage.getClass(i);
        if (klass) {
          allClasses.push(klass);
          const slots = await storage.getSlotsByClass(klass.id);
          allSlots.push(...slots);
        }
      }
      
      res.json({
        classes: allClasses,
        scheduleSlots: allSlots
      });
    } catch (error) {
      next(error);
    }
  });

  // Profile change request routes
  // Submit a profile change request
  app.post('/api/users/profile-requests', isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      
      const result = insertProfileChangeRequestSchema.safeParse({
        ...req.body,
        userId: user.id,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input', errors: result.error.format() });
      }
      
      const request = await storage.createProfileChangeRequest(result.data);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  });
  
  // Get profile change requests for current user
  app.get('/api/users/profile-requests', isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const requests = await storage.getProfileChangeRequestsByUser(user.id);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });
  
  // Get specific profile change request
  app.get('/api/users/profile-requests/:id', isAuthenticated, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const user = req.user as any;
      
      const request = await storage.getProfileChangeRequestById(id);
      if (!request) {
        return res.status(404).json({ message: 'Profile change request not found' });
      }
      
      // Only allow users to view their own requests (unless admin)
      if (request.userId !== user.id && user.role !== Role.ADMIN) {
        return res.status(403).json({ message: 'You are not authorized to view this request' });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });
  
  // Admin routes for profile change requests
  // Get all pending profile change requests
  app.get('/api/admin/profile-requests', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const requests = await storage.getPendingProfileChangeRequests();
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });
  
  // Approve a profile change request
  app.post('/api/admin/profile-requests/:id/approve', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const adminUser = req.user as any;
      const notes = req.body.notes;
      
      const request = await storage.approveProfileChangeRequest(id, adminUser.id, notes);
      if (!request) {
        return res.status(404).json({ message: 'Profile change request not found' });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });
  
  // Reject a profile change request
  app.post('/api/admin/profile-requests/:id/reject', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const adminUser = req.user as any;
      const notes = req.body.notes;
      
      const request = await storage.rejectProfileChangeRequest(id, adminUser.id, notes);
      if (!request) {
        return res.status(404).json({ message: 'Profile change request not found' });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  // User management routes
  app.get('/api/users', hasRole([Role.ADMIN]), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/users/:id', isAuthenticated, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const user = req.user as any;
      
      // Only admins can access any user, others can only access their own
      if (user.role !== Role.ADMIN && user.id !== id) {
        return res.status(403).json({ message: 'Not authorized to access this user profile' });
      }
      
      const userProfile = await storage.getUser(id);
      if (!userProfile) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = userProfile;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch('/api/users/:id', isAuthenticated, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const user = req.user as any;
      
      // Only admins can modify any user, others can only modify their own through profile change requests
      if (user.role !== Role.ADMIN && user.id !== id) {
        return res.status(403).json({ message: 'Not authorized to modify this user' });
      }
      
      // Admin can directly update users
      if (user.role === Role.ADMIN) {
        const updatedUser = await storage.updateUser(id, req.body);
        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        return res.json(userWithoutPassword);
      }
      
      // Other users must use the profile change request system
      return res.status(403).json({ 
        message: 'Regular users must use the profile change request system to update their profiles' 
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
