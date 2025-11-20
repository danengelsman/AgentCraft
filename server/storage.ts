import { 
  type User, 
  type InsertUser, 
  type Agent, 
  type InsertAgent,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Analytics,
  type InsertAnalytics,
  users,
  agents,
  conversations,
  messages,
  analytics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAgentsByUserId(userId: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<void>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByAgentId(agentId: string): Promise<Conversation[]>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Messages
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Analytics
  getAnalyticsByAgentId(agentId: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Agents
  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    return db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updated] = await db.update(agents).set(agent).where(eq(agents.id, id)).returning();
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsByAgentId(agentId: string): Promise<Conversation[]> {
    return db.select().from(conversations).where(eq(conversations.agentId, agentId)).orderBy(desc(conversations.updatedAt));
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  // Messages
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Analytics
  async getAnalyticsByAgentId(agentId: string): Promise<Analytics[]> {
    return db.select().from(analytics).where(eq(analytics.agentId, agentId)).orderBy(desc(analytics.date));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db.insert(analytics).values(analyticsData).returning();
    return newAnalytics;
  }
}

export const storage = new DbStorage();
