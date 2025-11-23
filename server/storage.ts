import { 
  type User, 
  type UpsertUser,
  type InsertUser, 
  type Agent, 
  type InsertAgent,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Analytics,
  type InsertAnalytics,
  type OnboardingProgress,
  type InsertOnboardingProgress,
  users,
  agents,
  conversations,
  messages,
  analytics,
  onboardingProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";

export interface IStorage {
  // Database health
  checkDatabaseConnection(): Promise<void>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: Partial<UpsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Onboarding
  getOnboardingProgress(userId: string): Promise<OnboardingProgress | undefined>;
  upsertOnboardingProgress(progress: InsertOnboardingProgress): Promise<OnboardingProgress>;

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
  getMessagesByConversationId(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
  getMessagesByConversationIds(conversationIds: string[]): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Analytics
  getAnalyticsByAgentId(agentId: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
}

export class DbStorage implements IStorage {
  // Database health check
  async checkDatabaseConnection(): Promise<void> {
    // Simple query to check database connectivity
    await db.execute('SELECT 1');
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(tokenSelector: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetTokenSelector, tokenSelector));
    return user;
  }

  async createUser(userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db.insert(users).values(userData as any).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Onboarding
  async getOnboardingProgress(userId: string): Promise<OnboardingProgress | undefined> {
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId));
    return progress;
  }

  async upsertOnboardingProgress(progressData: InsertOnboardingProgress): Promise<OnboardingProgress> {
    const [progress] = await db
      .insert(onboardingProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: onboardingProgress.userId,
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
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
  async getMessagesByConversationId(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    let query = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    
    // Apply pagination
    if (limit > 0) {
      query = query.limit(limit);
    }
    if (offset > 0) {
      query = query.offset(offset);
    }
    
    return query;
  }

  async getMessagesByConversationIds(conversationIds: string[]): Promise<Message[]> {
    // Guard for empty input
    if (conversationIds.length === 0) {
      return [];
    }
    
    // Fetch all messages for the given conversation IDs in a single query
    return db
      .select()
      .from(messages)
      .where(inArray(messages.conversationId, conversationIds))
      .orderBy(messages.conversationId, messages.createdAt);
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
