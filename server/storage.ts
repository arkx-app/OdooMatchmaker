import { 
  users, partners, clients, briefs, matches, messages, projects,
  type Partner, type InsertPartner, 
  type Client, type InsertClient,
  type Match, type InsertMatch,
  type User, type UpsertUser,
  type Brief, type InsertBrief,
  type Message, type InsertMessage,
  type Project, type InsertProject,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  getAllPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  getPartnerByUserId(userId: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined>;

  getClient(id: string): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;

  createBrief(brief: InsertBrief): Promise<Brief>;
  getBrief(id: string): Promise<Brief | undefined>;
  getBriefsByClient(clientId: string): Promise<Brief[]>;
  getAllBriefs(): Promise<Brief[]>;

  getMatch(clientId: string, partnerId: string): Promise<Match | undefined>;
  getMatchById(id: string): Promise<Match | undefined>;
  getMatchesByClient(clientId: string): Promise<Match[]>;
  getMatchesByPartner(partnerId: string): Promise<Match[]>;
  getMatchesByBrief(briefId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;

  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByMatch(matchId: string): Promise<Message[]>;
  markMessagesAsRead(matchId: string, userId: string): Promise<void>;

  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByPartner(partnerId: string): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;

  getPartnerMetrics(partnerId: string): Promise<{
    matchesSent: number;
    matchesAccepted: number;
    conversions: number;
    totalProjectValue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        authProvider: "local",
        emailVerified: false,
      })
      .returning();
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

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async getPartnerByUserId(userId: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.userId, userId));
    return partner;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = randomUUID();
    const [partner] = await db
      .insert(partners)
      .values({
        ...insertPartner,
        id,
        rating: insertPartner.rating ?? 5,
        reviewCount: insertPartner.reviewCount ?? 0,
        logo: insertPartner.logo ?? null,
        description: insertPartner.description ?? null,
        hourlyRateMin: insertPartner.hourlyRateMin ?? 75,
        hourlyRateMax: insertPartner.hourlyRateMax ?? 250,
        capacity: insertPartner.capacity ?? "available",
        certifications: insertPartner.certifications ?? [],
        website: insertPartner.website ?? null,
        verified: insertPartner.verified ?? false,
      })
      .returning();
    return partner;
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined> {
    const [partner] = await db
      .update(partners)
      .set(updates)
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const [client] = await db
      .insert(clients)
      .values({
        ...insertClient,
        id,
        companySize: insertClient.companySize || null,
        projectTimeline: insertClient.projectTimeline || null,
        odooModules: insertClient.odooModules || null,
      })
      .returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const id = randomUUID();
    const [brief] = await db
      .insert(briefs)
      .values({
        ...insertBrief,
        id,
        modules: insertBrief.modules || null,
        painPoints: insertBrief.painPoints || null,
        integrations: insertBrief.integrations || null,
        timelineWeeks: insertBrief.timelineWeeks || null,
        priority: insertBrief.priority || null,
        status: insertBrief.status || "active",
      })
      .returning();
    return brief;
  }

  async getBrief(id: string): Promise<Brief | undefined> {
    const [brief] = await db.select().from(briefs).where(eq(briefs.id, id));
    return brief;
  }

  async getBriefsByClient(clientId: string): Promise<Brief[]> {
    return await db.select().from(briefs).where(eq(briefs.clientId, clientId));
  }

  async getAllBriefs(): Promise<Brief[]> {
    return await db.select().from(briefs);
  }

  async getMatch(clientId: string, partnerId: string): Promise<Match | undefined> {
    const result = await db
      .select()
      .from(matches)
      .where(eq(matches.clientId, clientId));
    return result.find(m => m.partnerId === partnerId);
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getMatchesByClient(clientId: string): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.clientId, clientId));
  }

  async getMatchesByPartner(partnerId: string): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.partnerId, partnerId));
  }

  async getMatchesByBrief(briefId: string): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.briefId, briefId));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const [match] = await db
      .insert(matches)
      .values({
        ...insertMatch,
        id,
        score: insertMatch.score || null,
        scoreBreakdown: insertMatch.scoreBreakdown || null,
        reasons: insertMatch.reasons || null,
        status: insertMatch.status || "suggested",
        clientLiked: insertMatch.clientLiked || null,
        partnerResponded: insertMatch.partnerResponded || false,
        partnerAccepted: insertMatch.partnerAccepted || null,
      })
      .returning();
    return match;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        id,
        read: insertMessage.read || false,
      })
      .returning();
    return message;
  }

  async getMessagesByMatch(matchId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId));
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.matchId, matchId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const [project] = await db
      .insert(projects)
      .values({
        ...insertProject,
        id,
        status: insertProject.status || "matched",
        contractValue: insertProject.contractValue || null,
        startDate: insertProject.startDate || null,
        endDate: insertProject.endDate || null,
        clientSatisfaction: insertProject.clientSatisfaction || null,
      })
      .returning();
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByPartner(partnerId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.partnerId, partnerId));
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async getPartnerMetrics(partnerId: string) {
    const partnerMatches = await this.getMatchesByPartner(partnerId);
    const partnerProjects = await this.getProjectsByPartner(partnerId);

    const matchesSent = partnerMatches.length;
    const matchesAccepted = partnerMatches.filter((m) => m.status === "accepted").length;
    const conversions = partnerMatches.filter((m) => m.status === "converted").length;
    const totalProjectValue = partnerProjects.reduce((sum, p) => sum + (p.contractValue || 0), 0);

    return {
      matchesSent,
      matchesAccepted,
      conversions,
      totalProjectValue,
    };
  }
}

export const storage = new DatabaseStorage();
