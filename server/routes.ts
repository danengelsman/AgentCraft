import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { generateAgentResponse, getSystemPromptForTemplate } from "./services/ai";
import { z } from "zod";

// Middleware to ensure user exists (for MVP, we'll use a default user)
async function ensureUser(req: Request, res: Response, next: NextFunction) {
  try {
    // For MVP, use a default user - in production, this would come from session/auth
    let user = await storage.getUserByUsername("demo");
    
    if (!user) {
      user = await storage.createUser({
        username: "demo",
        password: "demo", // In production, this would be hashed
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate user" });
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; password: string };
    }
  }
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply user middleware to all /api routes
  app.use("/api", ensureUser);

  // GET /api/templates - List all available templates
  app.get("/api/templates", (req, res) => {
    res.json(templates);
  });

  // GET /api/agents - List user's agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgentsByUserId(req.user!.id);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  // POST /api/agents - Create a new agent
  app.post("/api/agents", async (req, res) => {
    try {
      const { name, description, template, status } = req.body;

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
        userId: req.user!.id,
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
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  // PATCH /api/agents/:id - Update an agent
  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updated = await storage.updateAgent(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  // DELETE /api/agents/:id - Delete an agent
  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteAgent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // GET /api/conversations - List user's conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUserId(req.user!.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // GET /api/conversations/:id/messages - Get all messages in a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      if (conversation.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // POST /api/agents/:agentId/chat - Send a message to an agent
  app.post("/api/agents/:agentId/chat", async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const agent = await storage.getAgent(req.params.agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      if (agent.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== req.user!.id) {
          return res.status(403).json({ error: "Invalid conversation" });
        }
      } else {
        conversation = await storage.createConversation({
          agentId: agent.id,
          userId: req.user!.id,
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
