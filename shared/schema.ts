import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  services: text("services").array().notNull(),
  rating: integer("rating").default(5),
  reviewCount: integer("review_count").default(0),
  logo: text("logo"),
  description: text("description"),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  budget: text("budget").notNull(),
  projectTimeline: text("project_timeline"),
  odooModules: text("odoo_modules"),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  liked: boolean("liked").notNull(),
  matched: boolean("matched").default(false),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
}).extend({
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
}).extend({
  projectTimeline: z.string().optional(),
  odooModules: z.string().optional(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
