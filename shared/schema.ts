import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role"), // 'partner' or 'client'
  authProvider: text("auth_provider").default("local"), // 'local' or 'oauth'
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  odooModules: text("odoo_modules").array(), // Multiple modules as array
  website: text("website"), // Company website
  odooExperience: text("odoo_experience"), // 'none', 'beginner', 'intermediate', 'advanced'
  urgency: text("urgency"), // 'asap', 'soon', 'flexible', 'exploratory'
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
  clientSaved: boolean("client_saved").default(false), // For "Saved Partners" feature
  partnerResponded: boolean("partner_responded").default(false),
  partnerAccepted: boolean("partner_accepted"),
  meetingUrl: text("meeting_url"), // For booking intro calls
  // Partner-specific tracking fields
  expectedClosingDate: timestamp("expected_closing_date"),
  partnerNotes: text("partner_notes"),
  expectedRevenue: integer("expected_revenue"),
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

// Support tickets for helpdesk - Kanban pipeline phases
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Can be null for anonymous submissions
  userType: text("user_type").notNull(), // 'client', 'partner', 'anonymous'
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category").default("general"), // 'general', 'technical', 'billing', 'feedback'
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("incoming"), // Pipeline phases: 'incoming', 'assigned', 'fixed', 'issue'
  assignedTo: varchar("assigned_to"), // Admin user ID
  assignedToName: text("assigned_to_name"), // Admin name for display
  adminNotes: text("admin_notes"),
  resolution: text("resolution"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Ticket comments for internal notes and updates
export const ticketComments = pgTable("ticket_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").default("user"), // 'admin', 'client', 'partner'
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(true), // Internal notes only visible to admins
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner Service Tickets - for managing service-related issues tied to matches/projects
export const partnerServiceTickets = pgTable("partner_service_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(),
  matchId: varchar("match_id"), // Optional - link to a match
  projectId: varchar("project_id"), // Optional - link to a project
  clientName: text("client_name"), // Cached for display
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").default("general"), // 'general', 'technical', 'billing', 'customization'
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("incoming"), // 'incoming', 'assigned', 'in_progress', 'resolved', 'issue'
  assignedTo: text("assigned_to"), // Team member name
  attachmentUrl: text("attachment_url"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Partner Service Ticket Notes - for internal notes on service tickets
export const partnerServiceTicketNotes = pgTable("partner_service_ticket_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner Sales Opportunities - for tracking sales pipeline from matches
export const partnerSalesOpportunities = pgTable("partner_sales_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull(),
  matchId: varchar("match_id").notNull(), // Always linked to a match
  clientName: text("client_name"), // Cached for display
  projectTitle: text("project_title"), // From brief
  stage: text("stage").default("new_match"), // 'new_match', 'negotiation', 'closing', 'won', 'lost'
  expectedRevenue: integer("expected_revenue"),
  probability: integer("probability").default(0), // 0-100% chance of closing
  expectedCloseDate: timestamp("expected_close_date"),
  notes: text("notes"),
  lostReason: text("lost_reason"), // If stage is 'lost'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  passwordHash: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  authProvider: z.string().optional().default("local"),
  emailVerified: z.boolean().optional().default(false),
});

// Registration schema for signup form
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  hourlyRateMin: z.number().optional().nullable(),
  hourlyRateMax: z.number().optional().nullable(),
  capacity: z.string().optional().nullable(),
  certifications: z.array(z.string()).optional().nullable(),
  website: z.string().optional().nullable(),
  verified: z.boolean().optional(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
}).extend({
  projectTimeline: z.string().optional().nullable(),
  odooModules: z.array(z.string()).optional().nullable(),
  companySize: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  odooExperience: z.string().optional().nullable(),
  urgency: z.string().optional().nullable(),
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
  clientSaved: z.boolean().optional(),
  meetingUrl: z.string().optional(),
});

// Schema for updating matches (partial updates)
export const updateMatchSchema = z.object({
  clientLiked: z.boolean().optional(),
  clientSaved: z.boolean().optional(),
  status: z.enum(["suggested", "sent", "accepted", "rejected", "converted"]).optional(),
  meetingUrl: z.string().optional(),
  partnerAccepted: z.boolean().optional(),
  partnerResponded: z.boolean().optional(),
  expectedClosingDate: z.coerce.date().optional().nullable(),
  partnerNotes: z.string().optional().nullable(),
  expectedRevenue: z.coerce.number().optional().nullable(),
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

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
}).extend({
  userId: z.string().optional().nullable(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
});

export const updateSupportTicketSchema = z.object({
  status: z.enum(["incoming", "assigned", "fixed", "issue"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional().nullable(),
  assignedToName: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
}).extend({
  isInternal: z.boolean().optional(),
  userRole: z.string().optional(),
});

// Partner Service Ticket schemas
export const insertPartnerServiceTicketSchema = createInsertSchema(partnerServiceTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
}).extend({
  matchId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
});

export const updatePartnerServiceTicketSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["general", "technical", "billing", "customization"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["incoming", "assigned", "in_progress", "resolved", "issue"]).optional(),
  assignedTo: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
});

export const insertPartnerServiceTicketNoteSchema = createInsertSchema(partnerServiceTicketNotes).omit({
  id: true,
  createdAt: true,
});

// Partner Sales Opportunity schemas
export const insertPartnerSalesOpportunitySchema = createInsertSchema(partnerSalesOpportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
}).extend({
  clientName: z.string().optional().nullable(),
  projectTitle: z.string().optional().nullable(),
  stage: z.string().optional(),
  expectedRevenue: z.number().optional().nullable(),
  probability: z.number().optional(),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  lostReason: z.string().optional().nullable(),
});

export const updatePartnerSalesOpportunitySchema = z.object({
  stage: z.enum(["new_match", "negotiation", "closing", "won", "lost"]).optional(),
  expectedRevenue: z.coerce.number().optional().nullable(),
  probability: z.coerce.number().optional().nullable(),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  lostReason: z.string().optional().nullable(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

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

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

export type PartnerServiceTicket = typeof partnerServiceTickets.$inferSelect;
export type InsertPartnerServiceTicket = z.infer<typeof insertPartnerServiceTicketSchema>;

export type PartnerServiceTicketNote = typeof partnerServiceTicketNotes.$inferSelect;
export type InsertPartnerServiceTicketNote = z.infer<typeof insertPartnerServiceTicketNoteSchema>;

export type PartnerSalesOpportunity = typeof partnerSalesOpportunities.$inferSelect;
export type InsertPartnerSalesOpportunity = z.infer<typeof insertPartnerSalesOpportunitySchema>;
