import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - email/password authentication
export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").notNull().unique(), // unique constraint automatically creates an index
    password: varchar("password").notNull(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    businessName: varchar("business_name"),
    industry: varchar("industry"),
    goal: text("goal"),
    emailNotifications: integer("email_notifications").notNull().default(1),
    weeklyReports: integer("weekly_reports").notNull().default(0),
    resetToken: varchar("reset_token"),
    resetTokenSelector: varchar("reset_token_selector"),
    resetTokenExpiry: timestamp("reset_token_expiry"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
  // Note: email already has a unique constraint which automatically creates an index
);

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Onboarding progress tracking
export const onboardingProgress = pgTable("onboarding_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  currentStep: integer("current_step").notNull().default(1),
  completedAt: timestamp("completed_at"),
  wizardData: jsonb("wizard_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOnboardingProgressSchema = createInsertSchema(onboardingProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOnboardingProgress = z.infer<typeof insertOnboardingProgressSchema>;
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;

// Onboarding progress update schema for API validation
export const onboardingProgressUpdateSchema = z.object({
  currentStep: z.number().int().min(1).max(3).optional(),
  wizardData: z.object({
    selectedGoal: z.string().trim().optional(),
    businessName: z.string().trim().min(2).optional(),
    industry: z.string().trim().optional(),
    goal: z.string().trim().min(2).refine(val => !val || /[a-zA-Z0-9]/.test(val), {
      message: "Goal must contain at least one alphanumeric character"
    }).optional(),
  }).strict().optional(),
  businessName: z.string().trim().min(2).optional(),
  industry: z.string().trim().optional(),
  goal: z.string().trim().min(2).refine(val => !val || /[a-zA-Z0-9]/.test(val), {
    message: "Goal must contain at least one alphanumeric character"
  }).optional(),
});

// User profile update schema for Settings page
export const userProfileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").optional(),
  lastName: z.string().trim().min(1, "Last name is required").optional(),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").optional(),
  industry: z.string().trim().optional(),
});

// User notification preferences update schema
export const userNotificationsUpdateSchema = z.object({
  emailNotifications: z.boolean(),
  weeklyReports: z.boolean(),
});

// Authentication schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().trim().min(1, "First name is required").optional(),
  lastName: z.string().trim().min(1, "Last name is required").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const agents = pgTable(
  "agents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    description: text("description").notNull(),
    template: text("template").notNull(),
    systemPrompt: text("system_prompt").notNull(),
    status: text("status").notNull().default("active"),
    icon: text("icon"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_agents_userId").on(table.userId), // Index for faster user agent lookups
  ]
);

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    agentId: varchar("agent_id").notNull().references(() => agents.id),
    userId: varchar("user_id").notNull().references(() => users.id),
    title: text("title"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_conversations_userId").on(table.userId), // Index for user conversation lookups
    index("idx_conversations_agentId").on(table.agentId), // Index for agent conversation lookups
  ]
);

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable(
  "messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_messages_conversationId").on(table.conversationId), // Index for conversation message lookups
  ]
);

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id),
  date: timestamp("date").notNull().defaultNow(),
  messageCount: integer("message_count").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
