import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertMessageSchema, insertConversationSchema, onboardingProgressUpdateSchema } from "@shared/schema";
import { generateAgentResponse, getSystemPromptForTemplate } from "./services/ai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth endpoint - get current user
  app.get('/api/auth/user', async (req, res) => {
    try {
      // Return null if not authenticated (instead of 401)
      const userId = req.user?.claims?.sub;
      if (!req.isAuthenticated() || !userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // GET /api/onboarding/progress - Get user's onboarding progress
  app.get('/api/onboarding/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in session" });
      }

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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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

  // GET /api/templates - List all available templates
  app.get("/api/templates", (req, res) => {
    res.json(templates);
  });

  // GET /api/agents - List user's agents
  app.get("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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

  // GET /api/conversations - List user's conversations
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
      const userId = req.user?.claims?.sub;
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
