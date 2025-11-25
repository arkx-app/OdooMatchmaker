import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'partner' or 'client'
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner profiles
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  services: text("services").array().notNull(),
  rating: integer("rating").default(5),
  reviewCount: integer("review_count").default(0),
  logo: text("logo"),
  description: text("description"),
  hourlyRateMin: integer("hourly_rate_min"),
  hourlyRateMax: integer("hourly_rate_max"),
  capacity: text("capacity"), // 'available', 'limited', 'full'
  certifications: text("certifications").array(),
  website: text("website"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client profiles
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  companySize: text("company_size"), // 'startup', 'smb', 'enterprise'
  budget: text("budget").notNull(),
  projectTimeline: text("project_timeline"),
  odooModules: text("odoo_modules"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client briefs (detailed project requirements)
export const briefs = pgTable("briefs", {
  id: varchar("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  modules: text("modules").array(),
  budget: text("budget").notNull(),
  timelineWeeks: integer("timeline_weeks"),
  painPoints: text("pain_points").array(),
  integrations: text("integrations").array(),
  priority: text("priority"), // 'low', 'medium', 'high'
  status: text("status").default("active"), // 'active', 'archived'
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches with scoring
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey(),
  briefId: varchar("brief_id").notNull(),
  clientId: varchar("client_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  score: integer("score"), // 0-100 composite score
  scoreBreakdown: jsonb("score_breakdown"), // { moduleFit, industryExp, budgetFit, etc }
  reasons: text("reasons").array(), // explanations for the match
  status: text("status").default("suggested"), // 'suggested', 'sent', 'accepted', 'rejected', 'converted'
  clientLiked: boolean("client_liked"),
  partnerResponded: boolean("partner_responded").default(false),
  partnerAccepted: boolean("partner_accepted"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Messages between matched users
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  matchId: varchar("match_id").notNull(),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects (when match converts to project)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey(),
  matchId: varchar("match_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  clientId: varchar("client_id").notNull(),
  contractValue: integer("contract_value"),
  status: text("status").default("matched"), // 'matched', 'engaged', 'contracted', 'in_progress', 'completed'
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  clientSatisfaction: integer("client_satisfaction"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  hourlyRateMin: z.number().optional(),
  hourlyRateMax: z.number().optional(),
  capacity: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  website: z.string().optional(),
  verified: z.boolean().optional(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
}).extend({
  projectTimeline: z.string().optional(),
  odooModules: z.string().optional(),
  companySize: z.string().optional(),
});

export const insertBriefSchema = createInsertSchema(briefs).omit({
  id: true,
  createdAt: true,
}).extend({
  modules: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  timelineWeeks: z.number().optional(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
}).extend({
  scoreBreakdown: z.record(z.number()).optional(),
  reasons: z.array(z.string()).optional(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
}).extend({
  contractValue: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  clientSatisfaction: z.number().optional(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = z.infer<typeof insertBriefSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
