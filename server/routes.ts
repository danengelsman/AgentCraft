import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertMessageSchema, insertConversationSchema, onboardingProgressUpdateSchema, userProfileUpdateSchema, userNotificationsUpdateSchema, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { generateAgentResponse, getSystemPromptForTemplate } from "./services/ai";
import { hashPassword, verifyPassword, generateResetToken, hashResetToken, verifyResetToken, getResetTokenExpiry, isResetTokenValid } from "./services/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./services/email";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { z } from "zod";
import { authRateLimiter, passwordResetRateLimiter, aiRateLimiter, auditMiddleware } from "./middleware/security";
import { createLogger, auditLog } from "./services/logger";
import { config } from "./config/production";

const logger = createLogger('routes');

// Helper function to format timestamps as relative time
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Template definitions
const templates = [
  {
    id: "website-faq",
    name: "Website FAQ Chatbot",
    description: "Answers common questions about your business",
    category: "Customer Support",
  },
  {
    id: "lead-qualification",
    name: "Lead Qualification",
    description: "Qualifies incoming leads and gathers key information",
    category: "Sales",
  },
  {
    id: "appointment-scheduler",
    name: "Appointment Scheduler",
    description: "Books appointments and manages your calendar",
    category: "Operations",
  },
  {
    id: "email-responder",
    name: "Email Responder",
    description: "Drafts professional email responses automatically",
    category: "Communication",
  },
  {
    id: "social-media-manager",
    name: "Social Media Manager",
    description: "Creates content and engages with your audience",
    category: "Marketing",
  },
  {
    id: "customer-onboarding",
    name: "Customer Onboarding",
    description: "Guides new customers through setup and training",
    category: "Customer Success",
  },
  {
    id: "product-recommender",
    name: "Product Recommender",
    description: "Suggests products based on customer needs",
    category: "Sales",
  },
  {
    id: "sales-outreach",
    name: "Sales Outreach",
    description: "Crafts personalized outreach messages to prospects",
    category: "Sales",
  },
  {
    id: "meeting-summarizer",
    name: "Meeting Summarizer",
    description: "Summarizes meetings and extracts action items",
    category: "Productivity",
  },
  {
    id: "review-responder",
    name: "Review Responder",
    description: "Responds to customer reviews professionally",
    category: "Customer Support",
  },
  {
    id: "feedback-collector",
    name: "Feedback Collector",
    description: "Gathers customer feedback and insights",
    category: "Customer Success",
  },
  {
    id: "invoice-reminder",
    name: "Invoice Reminder",
    description: "Sends payment reminders and answers billing questions",
    category: "Finance",
  },
];

// Session setup
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.set("trust proxy", config.TRUST_PROXY);
  app.use(getSession());

  // Health check endpoint (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // Readiness check (checks database connection)
  app.get('/api/ready', async (req, res) => {
    try {
      // Check database connection
      const testUser = await storage.getUserByEmail('health-check@test.com');
      res.json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Readiness check failed', { error });
      res.status(503).json({
        status: 'not ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // POST /api/auth/signup - Register new user
  app.post('/api/auth/signup', authRateLimiter, auditMiddleware('signup'), async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });

      // Regenerate session to prevent session fixation
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session
      req.session.userId = user.id;

      // Send welcome email (non-blocking - fire and forget)
      sendWelcomeEmail(user.email, user.firstName || undefined)
        .then(() => console.log(`[AUTH] Welcome email queued for ${user.email}`))
        .catch(err => console.warn(`[AUTH] Welcome email failed (non-critical):`, err?.message));

      // Return user without password
      const { password, resetToken, resetTokenExpiry, resetTokenSelector, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("[AUTH] Signup error:", error?.message || error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // POST /api/auth/login - Login user
  app.post('/api/auth/login', authRateLimiter, auditMiddleware('login'), async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValid = await verifyPassword(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Regenerate session to prevent session fixation
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password, resetToken, resetTokenExpiry, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error in login:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // POST /api/auth/logout - Logout user
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });

  // POST /api/auth/forgot-password - Request password reset
  app.post('/api/auth/forgot-password', passwordResetRateLimiter, auditMiddleware('forgot-password'), async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: "If that email is registered, a reset link has been sent" });
      }

      // Generate two tokens: selector (for lookup) and verifier (for validation)
      const tokenSelector = generateResetToken(); // Unhashed, for DB lookup
      const tokenVerifier = generateResetToken(); // Will be hashed for security
      const resetTokenExpiry = getResetTokenExpiry();

      // Hash the verifier token before storing
      const hashedVerifier = await hashResetToken(tokenVerifier);

      // Save selector (unhashed) and hashed verifier to database
      await storage.updateUser(user.id, {
        resetTokenSelector: tokenSelector,
        resetToken: hashedVerifier,
        resetTokenExpiry,
      });

      // Send email with combined token: selector:verifier
      const combinedToken = `${tokenSelector}:${tokenVerifier}`;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      await sendPasswordResetEmail(user.email, combinedToken, baseUrl);

      res.json({ message: "If that email is registered, a reset link has been sent" });
    } catch (error) {
      console.error("Error in forgot-password:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // POST /api/auth/reset-password - Reset password with token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      // Split the combined token into selector and verifier
      const parts = validatedData.token.split(':');
      if (parts.length !== 2) {
        return res.status(400).json({ message: "Invalid reset token format" });
      }
      
      const [tokenSelector, tokenVerifier] = parts;
      
      // Look up user by unhashed selector
      const user = await storage.getUserByResetToken(tokenSelector);
      
      if (!user || !user.resetToken || !user.resetTokenSelector) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token is still valid (time-based)
      if (!isResetTokenValid(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Verify the verifier token matches the hashed version in DB
      const isTokenValid = await verifyResetToken(tokenVerifier, user.resetToken);
      if (!isTokenValid) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(validatedData.password);

      // Update password and clear reset tokens
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenSelector: null,
        resetTokenExpiry: null,
      });

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error in reset-password:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // GET /api/auth/user - Get current authenticated user
  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(null);
      }

      // Return user without password
      const { password, resetToken, resetTokenExpiry, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // GET /api/onboarding/progress - Get user's onboarding progress
  app.get('/api/onboarding/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;

      const progress = await storage.getOnboardingProgress(userId);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      res.status(500).json({ message: "Failed to fetch onboarding progress" });
    }
  });

  // PUT /api/onboarding/progress - Update onboarding progress
  app.put('/api/onboarding/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in session" });
      }

      // Validate request body with Zod schema
      const validatedData = onboardingProgressUpdateSchema.parse(req.body);

      // Update user profile if there are valid fields
      const profileUpdates: { businessName?: string; industry?: string; goal?: string } = {};
      
      if (validatedData.businessName) {
        profileUpdates.businessName = validatedData.businessName;
      }
      if (validatedData.industry) {
        profileUpdates.industry = validatedData.industry;
      }
      if (validatedData.goal) {
        profileUpdates.goal = validatedData.goal;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await storage.updateUser(userId, profileUpdates);
      }

      // Update onboarding progress
      const progress = await storage.upsertOnboardingProgress({
        userId,
        currentStep: validatedData.currentStep,
        wizardData: validatedData.wizardData,
      });

      res.json(progress);
    } catch (error) {
      console.error("Error updating onboarding progress:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to update onboarding progress" });
    }
  });

  // POST /api/onboarding/complete - Complete onboarding and create first agent
  app.post('/api/onboarding/complete', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in session" });
      }

      const { templateId, businessName, industry, goal } = req.body;

      // Validate required fields
      if (!templateId || typeof templateId !== 'string') {
        return res.status(400).json({ error: "Template ID is required" });
      }

      // Validate businessName: required, must be string, non-empty after trim, minimum 2 characters
      if (!businessName || typeof businessName !== 'string') {
        return res.status(400).json({ error: "Business name is required" });
      }
      
      const trimmedBusinessName = businessName.trim();
      if (trimmedBusinessName.length < 2) {
        return res.status(400).json({ error: "Business name must be at least 2 characters" });
      }

      // Validate optional fields if provided
      const trimmedIndustry = industry && typeof industry === 'string' && industry.trim().length > 0 ? industry.trim() : undefined;
      
      // Validate goal: must be at least 2 chars and contain at least one alphanumeric character
      let trimmedGoal: string | undefined = undefined;
      if (goal && typeof goal === 'string') {
        const trimmed = goal.trim();
        if (trimmed.length >= 2 && /[a-zA-Z0-9]/.test(trimmed)) {
          trimmedGoal = trimmed;
        }
      }

      // Find the template
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        return res.status(400).json({ error: "Invalid template" });
      }

      // Update user profile
      await storage.updateUser(userId, {
        businessName: trimmedBusinessName,
        industry: trimmedIndustry,
        goal: trimmedGoal,
      });

      // Create the first agent with validated data
      const agentName = `${trimmedBusinessName} ${template.name}`;
      const agentDescription = `AI agent for ${trimmedBusinessName} - ${trimmedGoal || template.description}`;
      
      // Generate system prompt
      const systemPrompt = getSystemPromptForTemplate(
        template.name,
        agentName,
        agentDescription
      );

      // Validate complete agent data with Zod schema
      const agentData = insertAgentSchema.parse({
        userId,
        name: agentName,
        description: agentDescription,
        template: templateId,
        systemPrompt,
        status: "active",
      });

      const agent = await storage.createAgent(agentData);

      // Mark onboarding as complete
      await storage.upsertOnboardingProgress({
        userId,
        currentStep: 3,
        completedAt: new Date(),
        wizardData: { templateId, businessName: trimmedBusinessName, industry: trimmedIndustry, goal: trimmedGoal },
      });

      res.json({ agent, success: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid agent data", details: error.errors });
      }
      
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // PUT /api/user/profile - Update user profile information
  app.put('/api/user/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in session" });
      }

      // Validate request body with Zod schema
      const validatedData = userProfileUpdateSchema.parse(req.body);

      // Update user profile
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // PUT /api/user/notifications - Update notification preferences
  app.put('/api/user/notifications', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in session" });
      }

      // Validate request body with Zod schema
      const validatedData = userNotificationsUpdateSchema.parse(req.body);

      // Convert booleans to integers for database storage
      const updatedUser = await storage.updateUser(userId, {
        emailNotifications: validatedData.emailNotifications ? 1 : 0,
        weeklyReports: validatedData.weeklyReports ? 1 : 0,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  // GET /api/templates - List all available templates
  app.get("/api/templates", (req, res) => {
    res.json(templates);
  });

  // GET /api/agents - List user's agents
  app.get("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const agents = await storage.getAgentsByUserId(userId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  // POST /api/agents - Create a new agent
  app.post("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const { name, description, template, status } = req.body;

      // Validate required fields
      if (!name || !description || !template) {
        return res.status(400).json({ error: "Name, description, and template are required" });
      }

      // Get the template to find the correct name for system prompt
      const templateData = templates.find(t => t.id === template);
      if (!templateData) {
        return res.status(400).json({ error: "Invalid template" });
      }

      // Generate system prompt based on template
      const systemPrompt = getSystemPromptForTemplate(
        templateData.name,
        name,
        description
      );
      const agentData = insertAgentSchema.parse({
        name,
        description,
        template,
        systemPrompt,
        status: status || "active",
        userId,
      });

      const agent = await storage.createAgent(agentData);
      res.json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid agent data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create agent" });
      }
    }
  });

  // GET /api/agents/:id - Get a specific agent
  app.get("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const agent = await storage.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  // PATCH /api/agents/:id - Update an agent
  app.patch("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const agent = await storage.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Validate update fields - only allow specific fields to be updated
      const { name, description, status } = req.body;
      const updateData: Partial<{ name: string; description: string; status: string }> = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const updated = await storage.updateAgent(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  // DELETE /api/agents/:id - Delete an agent
  app.delete("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const agent = await storage.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteAgent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // GET /api/dashboard/analytics - Get dashboard analytics for the current user
  app.get("/api/dashboard/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      // Get all conversations for the user (already sorted by updatedAt desc from storage)
      const conversations = await storage.getConversationsByUserId(userId);
      
      // Get all agents for the user
      const agents = await storage.getAgentsByUserId(userId);
      
      // Fetch all messages for all conversations in a single query (avoid N+1)
      const conversationIds = conversations.map(c => c.id);
      const allMessages = await storage.getMessagesByConversationIds(conversationIds);
      
      // Group messages by conversation ID
      const conversationMessages = new Map<string, typeof allMessages>();
      allMessages.forEach(msg => {
        if (!conversationMessages.has(msg.conversationId)) {
          conversationMessages.set(msg.conversationId, []);
        }
        conversationMessages.get(msg.conversationId)?.push(msg);
      });
      
      // Calculate conversation volume by day (last 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const conversationsByDay = new Map<string, number>();
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = dayNames[date.getDay()];
        conversationsByDay.set(dayName, 0);
      }
      
      conversations.forEach(conv => {
        if (conv.createdAt >= sevenDaysAgo) {
          const dayName = dayNames[conv.createdAt.getDay()];
          conversationsByDay.set(dayName, (conversationsByDay.get(dayName) || 0) + 1);
        }
      });
      
      const conversationData = Array.from(conversationsByDay.entries()).map(([day, conversations]) => ({
        day,
        conversations
      }));
      
      // Calculate recent activity (last 10 conversations, already sorted desc by updatedAt)
      const recentConversations = conversations.slice(0, 10);
      const recentActivity = recentConversations.map((conv) => {
        const agent = agents.find(a => a.id === conv.agentId);
        const messages = conversationMessages.get(conv.id) || [];
        
        // Find the last user message for customer preview
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        const customerPreview = lastUserMessage?.content.substring(0, 50) || 'No messages';
        
        return {
          id: conv.id,
          agent: agent?.name || 'Unknown Agent',
          action: conv.title || 'Untitled Conversation',
          customer: customerPreview,
          time: conv.updatedAt.toISOString(),
          status: 'success',
        };
      });
      
      // Calculate average response time by hour from actual message data
      const responseTimesByHour = new Map<number, number[]>();
      
      // Initialize all hours
      for (let hour = 0; hour < 24; hour++) {
        responseTimesByHour.set(hour, []);
      }
      
      // Calculate response times from message pairs (using messages already fetched)
      for (const conv of conversations) {
        const messages = conversationMessages.get(conv.id) || [];
        
        for (let i = 0; i < messages.length - 1; i++) {
          const currentMsg = messages[i];
          const nextMsg = messages[i + 1];
          
          // Only count user→assistant pairs
          if (currentMsg.role === 'user' && nextMsg.role === 'assistant') {
            const userTime = new Date(currentMsg.createdAt).getTime();
            const assistantTime = new Date(nextMsg.createdAt).getTime();
            const responseTime = (assistantTime - userTime) / 1000; // seconds
            
            // Only count positive response times
            if (responseTime > 0) {
              // Use assistant reply timestamp for bucketing
              const hour = new Date(nextMsg.createdAt).getHours();
              responseTimesByHour.get(hour)?.push(responseTime);
            }
          }
        }
      }
      
      // Aggregate by 4-hour blocks
      const hourBlocks = [
        { label: "12am", hours: [0, 1, 2, 3] },
        { label: "4am", hours: [4, 5, 6, 7] },
        { label: "8am", hours: [8, 9, 10, 11] },
        { label: "12pm", hours: [12, 13, 14, 15] },
        { label: "4pm", hours: [16, 17, 18, 19] },
        { label: "8pm", hours: [20, 21, 22, 23] },
      ];
      
      const responseTimeData = hourBlocks.map(block => {
        const allTimes: number[] = [];
        block.hours.forEach(hour => {
          const times = responseTimesByHour.get(hour) || [];
          allTimes.push(...times);
        });
        
        const avgTime = allTimes.length > 0
          ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length
          : 0;
        
        return {
          hour: block.label,
          time: Number(avgTime.toFixed(2)),
        };
      });
      
      // Calculate overall average response time
      const allResponseTimes: number[] = [];
      responseTimesByHour.forEach(times => allResponseTimes.push(...times));
      const avgResponseTime = allResponseTimes.length > 0
        ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
        : 0;
      
      res.json({
        conversationData,
        responseTimeData,
        recentActivity,
        totalConversations: conversations.length,
        avgResponseTime: Number(avgResponseTime.toFixed(2)),
      });
    } catch (error) {
      console.error("Dashboard analytics error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard analytics" });
    }
  });

  // GET /api/conversations - List user's conversations
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // GET /api/conversations/:id/messages - Get all messages in a conversation
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      if (conversation.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // POST /api/agents/:agentId/chat - Send a message to an agent
  app.post("/api/agents/:agentId/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found in session" });
      }

      const { message, conversationId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const agent = await storage.getAgent(req.params.agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(403).json({ error: "Invalid conversation" });
        }
      } else {
        conversation = await storage.createConversation({
          agentId: agent.id,
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
      });

      // Get conversation history
      const messages = await storage.getMessagesByConversationId(conversation.id);
      const conversationHistory = messages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      // Generate AI response
      const aiResponse = await generateAgentResponse(
        agent.systemPrompt,
        conversationHistory
      );

      // Save AI response
      const assistantMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      });

      res.json({
        conversationId: conversation.id,
        message: assistantMessage,
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Handle OpenAI API errors specifically
      if (error?.error?.code === "insufficient_quota" || error?.status === 429) {
        return res.status(503).json({ 
          error: "OpenAI API quota exceeded. Please add credits to your OpenAI account or try again later.",
          type: "quota_exceeded"
        });
      }
      
      if (error?.error?.type === "invalid_request_error") {
        return res.status(400).json({ 
          error: "Invalid request to AI service. Please try a different message.",
          type: "invalid_request"
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate response. Please try again.",
        type: "unknown"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
