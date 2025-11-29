import { 
  users, partners, clients, briefs, matches, messages, projects, supportTickets, ticketComments,
  partnerServiceTickets, partnerServiceTicketNotes, partnerSalesOpportunities,
  type Partner, type InsertPartner, 
  type Client, type InsertClient,
  type Match, type InsertMatch,
  type User, type UpsertUser,
  type Brief, type InsertBrief,
  type Message, type InsertMessage,
  type Project, type InsertProject,
  type SupportTicket, type InsertSupportTicket,
  type TicketComment, type InsertTicketComment,
  type PartnerServiceTicket, type InsertPartnerServiceTicket,
  type PartnerServiceTicketNote, type InsertPartnerServiceTicketNote,
  type PartnerSalesOpportunity, type InsertPartnerSalesOpportunity,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// Comprehensive Admin Analytics Types
export interface AdminAnalytics {
  // Core totals
  totals: {
    clients: number;
    partners: number;
    matches: number;
    mutualMatches: number;
    messages: number;
    activeUsers: number;
  };
  // Conversion metrics
  conversion: {
    matchConversionRate: number;
    responseRate: number;
    clientResponseRate: number;
    partnerResponseRate: number;
  };
  // Growth metrics
  growth: {
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    newMatchesThisWeek: number;
    newMatchesThisMonth: number;
    userGrowthPercent: number;
    matchGrowthPercent: number;
  };
  // Revenue insights from sales opportunities
  revenue: {
    totalPipelineValue: number;
    closedDealsValue: number;
    lostDealsValue: number;
    averageDealSize: number;
    dealsInProgress: number;
  };
  // Top performers
  leaderboards: {
    topPartnersByMatches: Array<{ id: string; name: string; company: string; matchCount: number }>;
    topPartnersByConversion: Array<{ id: string; name: string; company: string; conversionRate: number; matchCount: number }>;
  };
  // Industry distribution
  distribution: {
    partnersByIndustry: Array<{ industry: string; count: number }>;
    clientsByIndustry: Array<{ industry: string; count: number }>;
  };
  // Support health
  support: {
    openTickets: number;
    ticketsByCategory: Array<{ category: string; count: number }>;
    ticketsByPriority: Array<{ priority: string; count: number }>;
    averageResolutionHours: number | null;
    resolvedThisWeek: number;
  };
  // Recent activity
  activity: {
    recentMatches: Array<{ id: string; clientName: string; partnerName: string; createdAt: string }>;
    recentSignups: Array<{ id: string; email: string; role: string; createdAt: string }>;
  };
  // Timestamp
  lastUpdated: string;
}

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
  getAllClients(): Promise<Client[]>;
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
  getClientsWhoLikedPartner(partnerId: string): Promise<{ client: Client; match: Match }[]>;
  getPartnersNotSwipedByPartner(partnerId: string): Promise<Client[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;
  findMatchByClientAndPartner(clientId: string, partnerId: string): Promise<Match | undefined>;

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

  // Support Tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketsByUser(userId: string): Promise<SupportTicket[]>;
  updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Ticket Comments (Messages)
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  getTicketComments(ticketId: string): Promise<TicketComment[]>;
  getPublicTicketComments(ticketId: string): Promise<TicketComment[]>;
  getTicketsWithNewReplies(userId: string): Promise<{ ticketId: string; hasNewReply: boolean }[]>;
  
  // Admin Users (for assignment)
  getAdminUsers(): Promise<User[]>;

  // Admin Analytics - Comprehensive metrics
  getAdminAnalytics(): Promise<AdminAnalytics>;

  // User Management
  getAllUsers(): Promise<User[]>;

  // Partner Service Tickets
  createPartnerServiceTicket(ticket: InsertPartnerServiceTicket): Promise<PartnerServiceTicket>;
  getPartnerServiceTicket(id: string): Promise<PartnerServiceTicket | undefined>;
  getPartnerServiceTickets(partnerId: string): Promise<PartnerServiceTicket[]>;
  updatePartnerServiceTicket(id: string, updates: Partial<PartnerServiceTicket>): Promise<PartnerServiceTicket | undefined>;
  
  // Partner Service Ticket Notes
  createPartnerServiceTicketNote(note: InsertPartnerServiceTicketNote): Promise<PartnerServiceTicketNote>;
  getPartnerServiceTicketNotes(ticketId: string): Promise<PartnerServiceTicketNote[]>;
  
  // Partner Sales Opportunities
  createPartnerSalesOpportunity(opportunity: InsertPartnerSalesOpportunity): Promise<PartnerSalesOpportunity>;
  getPartnerSalesOpportunity(id: string): Promise<PartnerSalesOpportunity | undefined>;
  getPartnerSalesOpportunities(partnerId: string): Promise<PartnerSalesOpportunity[]>;
  getPartnerSalesOpportunityByMatch(partnerId: string, matchId: string): Promise<PartnerSalesOpportunity | undefined>;
  updatePartnerSalesOpportunity(id: string, updates: Partial<PartnerSalesOpportunity>): Promise<PartnerSalesOpportunity | undefined>;
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

  async getAllClients(): Promise<Client[]> {
    return db.select().from(clients);
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

  async getClientsWhoLikedPartner(partnerId: string): Promise<{ client: Client; match: Match }[]> {
    const partnerMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.partnerId, partnerId));
    
    const likedMatches = partnerMatches.filter(m => m.clientLiked === true);
    
    const results: { client: Client; match: Match }[] = [];
    for (const match of likedMatches) {
      const client = await this.getClient(match.clientId);
      if (client) {
        results.push({ client, match });
      }
    }
    return results;
  }

  async getPartnersNotSwipedByPartner(partnerId: string): Promise<Client[]> {
    const partnerMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.partnerId, partnerId));
    
    const notRespondedMatches = partnerMatches.filter(
      m => m.clientLiked === true && m.partnerResponded !== true
    );
    
    const clientList: Client[] = [];
    for (const match of notRespondedMatches) {
      const client = await this.getClient(match.clientId);
      if (client) {
        clientList.push(client);
      }
    }
    return clientList;
  }

  async findMatchByClientAndPartner(clientId: string, partnerId: string): Promise<Match | undefined> {
    const result = await db
      .select()
      .from(matches)
      .where(eq(matches.clientId, clientId));
    return result.find(m => m.partnerId === partnerId);
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

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values({
        ...insertTicket,
        userId: insertTicket.userId || null,
        category: insertTicket.category || "general",
        priority: insertTicket.priority || "medium",
        status: insertTicket.status || "open",
        assignedTo: insertTicket.assignedTo || null,
        adminNotes: insertTicket.adminNotes || null,
        resolution: insertTicket.resolution || null,
        attachmentUrl: insertTicket.attachmentUrl || null,
      })
      .returning();
    return ticket;
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets);
  }

  async getSupportTicketsByUser(userId: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .update(supportTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const [comment] = await db
      .insert(ticketComments)
      .values({
        ...insertComment,
        isInternal: insertComment.isInternal ?? true,
      })
      .returning();
    return comment;
  }

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return await db.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId));
  }

  async getPublicTicketComments(ticketId: string): Promise<TicketComment[]> {
    return await db.select().from(ticketComments)
      .where(and(
        eq(ticketComments.ticketId, ticketId),
        eq(ticketComments.isInternal, false)
      ));
  }

  async getTicketsWithNewReplies(userId: string): Promise<{ ticketId: string; hasNewReply: boolean }[]> {
    const userTickets = await this.getSupportTicketsByUser(userId);
    const result: { ticketId: string; hasNewReply: boolean }[] = [];
    
    for (const ticket of userTickets) {
      const comments = await this.getPublicTicketComments(ticket.id);
      const hasAdminReply = comments.some(c => c.userRole === 'admin' && c.userId !== userId);
      result.push({ ticketId: ticket.id, hasNewReply: hasAdminReply });
    }
    
    return result;
  }

  async getAdminUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers.filter(u => u.role === 'admin');
  }

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const allClients = await db.select().from(clients);
    const allPartners = await db.select().from(partners);
    const allMatches = await db.select().from(matches);
    const allMessages = await db.select().from(messages);
    const allTickets = await db.select().from(supportTickets);
    const allUsers = await db.select().from(users);
    const allSalesOpportunities = await db.select().from(partnerSalesOpportunities);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Core totals
    const mutualMatchCount = allMatches.filter(
      m => m.clientLiked === true && m.partnerAccepted === true
    ).length;

    const activeUsers = allUsers.filter(u => {
      if (!u.updatedAt) return false;
      return new Date(u.updatedAt) > oneMonthAgo;
    }).length;

    // Conversion metrics
    const matchConversionRate = allMatches.length > 0 
      ? Math.round((mutualMatchCount / allMatches.length) * 100) 
      : 0;

    const clientResponses = allMatches.filter(m => m.clientLiked !== null).length;
    const partnerResponses = allMatches.filter(m => m.partnerAccepted !== null).length;
    const clientResponseRate = allMatches.length > 0 
      ? Math.round((clientResponses / allMatches.length) * 100) 
      : 0;
    const partnerResponseRate = allMatches.length > 0 
      ? Math.round((partnerResponses / allMatches.length) * 100) 
      : 0;
    const responseRate = Math.round((clientResponseRate + partnerResponseRate) / 2);

    // Growth metrics
    const newUsersThisWeek = allUsers.filter(u => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt) > oneWeekAgo;
    }).length;

    const newUsersThisMonth = allUsers.filter(u => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt) > oneMonthAgo;
    }).length;

    const usersLastMonth = allUsers.filter(u => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      return created > twoMonthsAgo && created <= oneMonthAgo;
    }).length;

    const newMatchesThisWeek = allMatches.filter(m => {
      if (!m.createdAt) return false;
      return new Date(m.createdAt) > oneWeekAgo;
    }).length;

    const newMatchesThisMonth = allMatches.filter(m => {
      if (!m.createdAt) return false;
      return new Date(m.createdAt) > oneMonthAgo;
    }).length;

    const matchesLastMonth = allMatches.filter(m => {
      if (!m.createdAt) return false;
      const created = new Date(m.createdAt);
      return created > twoMonthsAgo && created <= oneMonthAgo;
    }).length;

    const userGrowthPercent = usersLastMonth > 0 
      ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100) 
      : newUsersThisMonth > 0 ? 100 : 0;

    const matchGrowthPercent = matchesLastMonth > 0 
      ? Math.round(((newMatchesThisMonth - matchesLastMonth) / matchesLastMonth) * 100) 
      : newMatchesThisMonth > 0 ? 100 : 0;

    // Revenue insights
    const wonDeals = allSalesOpportunities.filter(o => o.stage === "won");
    const lostDeals = allSalesOpportunities.filter(o => o.stage === "lost");
    const inProgressDeals = allSalesOpportunities.filter(o => 
      o.stage !== "won" && o.stage !== "lost"
    );

    const totalPipelineValue = inProgressDeals.reduce((sum, o) => sum + (o.expectedRevenue || 0), 0);
    const closedDealsValue = wonDeals.reduce((sum, o) => sum + (o.expectedRevenue || 0), 0);
    const lostDealsValue = lostDeals.reduce((sum, o) => sum + (o.expectedRevenue || 0), 0);
    const averageDealSize = wonDeals.length > 0 
      ? Math.round(closedDealsValue / wonDeals.length) 
      : 0;

    // Top performers - partners by match count
    const partnerMatchCounts = new Map<string, number>();
    allMatches.forEach(m => {
      if (m.partnerId) {
        partnerMatchCounts.set(m.partnerId, (partnerMatchCounts.get(m.partnerId) || 0) + 1);
      }
    });

    const topPartnersByMatches = Array.from(partnerMatchCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([partnerId, matchCount]) => {
        const partner = allPartners.find(p => p.id === partnerId);
        return {
          id: partnerId,
          name: partner?.name || "Unknown",
          company: partner?.company || "Unknown",
          matchCount,
        };
      });

    // Top partners by conversion rate (minimum 3 matches)
    const partnerConversions = new Map<string, { mutual: number; total: number }>();
    allMatches.forEach(m => {
      if (m.partnerId) {
        const current = partnerConversions.get(m.partnerId) || { mutual: 0, total: 0 };
        current.total++;
        if (m.clientLiked && m.partnerAccepted) {
          current.mutual++;
        }
        partnerConversions.set(m.partnerId, current);
      }
    });

    const topPartnersByConversion = Array.from(partnerConversions.entries())
      .filter(([, stats]) => stats.total >= 3)
      .map(([partnerId, stats]) => {
        const partner = allPartners.find(p => p.id === partnerId);
        return {
          id: partnerId,
          name: partner?.name || "Unknown",
          company: partner?.company || "Unknown",
          conversionRate: Math.round((stats.mutual / stats.total) * 100),
          matchCount: stats.total,
        };
      })
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    // Industry distribution
    const partnerIndustryCount = new Map<string, number>();
    allPartners.forEach(p => {
      const industry = p.industry || "Other";
      partnerIndustryCount.set(industry, (partnerIndustryCount.get(industry) || 0) + 1);
    });

    const partnersByIndustry = Array.from(partnerIndustryCount.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    const clientIndustryCount = new Map<string, number>();
    allClients.forEach(c => {
      const industry = c.industry || "Other";
      clientIndustryCount.set(industry, (clientIndustryCount.get(industry) || 0) + 1);
    });

    const clientsByIndustry = Array.from(clientIndustryCount.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    // Support health
    const openTickets = allTickets.filter(
      t => t.status === "incoming" || t.status === "assigned" || t.status === "issue"
    ).length;

    const ticketCategoryCount = new Map<string, number>();
    allTickets.forEach(t => {
      const category = t.category || "general";
      ticketCategoryCount.set(category, (ticketCategoryCount.get(category) || 0) + 1);
    });

    const ticketsByCategory = Array.from(ticketCategoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const ticketPriorityCount = new Map<string, number>();
    allTickets.forEach(t => {
      const priority = t.priority || "medium";
      ticketPriorityCount.set(priority, (ticketPriorityCount.get(priority) || 0) + 1);
    });

    const ticketsByPriority = Array.from(ticketPriorityCount.entries())
      .map(([priority, count]) => ({ priority, count }))
      .sort((a, b) => {
        const order = ["urgent", "high", "medium", "low"];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      });

    // Average resolution time for fixed tickets
    const fixedTickets = allTickets.filter(t => t.status === "fixed" && t.createdAt && t.updatedAt);
    let averageResolutionHours: number | null = null;
    if (fixedTickets.length > 0) {
      const totalHours = fixedTickets.reduce((sum, t) => {
        const created = new Date(t.createdAt!).getTime();
        const resolved = new Date(t.updatedAt!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      averageResolutionHours = Math.round(totalHours / fixedTickets.length);
    }

    const resolvedThisWeek = allTickets.filter(t => {
      if (t.status !== "fixed" || !t.updatedAt) return false;
      return new Date(t.updatedAt) > oneWeekAgo;
    }).length;

    // Recent activity
    const recentMatches = allMatches
      .filter(m => m.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5)
      .map(m => {
        const client = allClients.find(c => c.id === m.clientId);
        const partner = allPartners.find(p => p.id === m.partnerId);
        return {
          id: m.id,
          clientName: client?.company || "Unknown Client",
          partnerName: partner?.company || "Unknown Partner",
          createdAt: m.createdAt?.toISOString() || new Date().toISOString(),
        };
      });

    const recentSignups = allUsers
      .filter(u => u.createdAt && u.role)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        email: u.email,
        role: u.role || "unknown",
        createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
      }));

    return {
      totals: {
        clients: allClients.length,
        partners: allPartners.length,
        matches: allMatches.length,
        mutualMatches: mutualMatchCount,
        messages: allMessages.length,
        activeUsers,
      },
      conversion: {
        matchConversionRate,
        responseRate,
        clientResponseRate,
        partnerResponseRate,
      },
      growth: {
        newUsersThisWeek,
        newUsersThisMonth,
        newMatchesThisWeek,
        newMatchesThisMonth,
        userGrowthPercent,
        matchGrowthPercent,
      },
      revenue: {
        totalPipelineValue,
        closedDealsValue,
        lostDealsValue,
        averageDealSize,
        dealsInProgress: inProgressDeals.length,
      },
      leaderboards: {
        topPartnersByMatches,
        topPartnersByConversion,
      },
      distribution: {
        partnersByIndustry,
        clientsByIndustry,
      },
      support: {
        openTickets,
        ticketsByCategory,
        ticketsByPriority,
        averageResolutionHours,
        resolvedThisWeek,
      },
      activity: {
        recentMatches,
        recentSignups,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Partner Service Tickets
  async createPartnerServiceTicket(insertTicket: InsertPartnerServiceTicket): Promise<PartnerServiceTicket> {
    const [ticket] = await db
      .insert(partnerServiceTickets)
      .values({
        ...insertTicket,
        matchId: insertTicket.matchId || null,
        projectId: insertTicket.projectId || null,
        clientName: insertTicket.clientName || null,
        category: insertTicket.category || "general",
        priority: insertTicket.priority || "medium",
        status: insertTicket.status || "incoming",
        assignedTo: insertTicket.assignedTo || null,
        attachmentUrl: insertTicket.attachmentUrl || null,
        resolution: insertTicket.resolution || null,
      })
      .returning();
    return ticket;
  }

  async getPartnerServiceTicket(id: string): Promise<PartnerServiceTicket | undefined> {
    const [ticket] = await db.select().from(partnerServiceTickets).where(eq(partnerServiceTickets.id, id));
    return ticket;
  }

  async getPartnerServiceTickets(partnerId: string): Promise<PartnerServiceTicket[]> {
    return await db.select().from(partnerServiceTickets).where(eq(partnerServiceTickets.partnerId, partnerId));
  }

  async updatePartnerServiceTicket(id: string, updates: Partial<PartnerServiceTicket>): Promise<PartnerServiceTicket | undefined> {
    const [ticket] = await db
      .update(partnerServiceTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(partnerServiceTickets.id, id))
      .returning();
    return ticket;
  }

  // Partner Service Ticket Notes
  async createPartnerServiceTicketNote(insertNote: InsertPartnerServiceTicketNote): Promise<PartnerServiceTicketNote> {
    const [note] = await db
      .insert(partnerServiceTicketNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  async getPartnerServiceTicketNotes(ticketId: string): Promise<PartnerServiceTicketNote[]> {
    return await db.select().from(partnerServiceTicketNotes).where(eq(partnerServiceTicketNotes.ticketId, ticketId));
  }

  // Partner Sales Opportunities
  async createPartnerSalesOpportunity(insertOpportunity: InsertPartnerSalesOpportunity): Promise<PartnerSalesOpportunity> {
    const [opportunity] = await db
      .insert(partnerSalesOpportunities)
      .values({
        ...insertOpportunity,
        clientName: insertOpportunity.clientName || null,
        projectTitle: insertOpportunity.projectTitle || null,
        stage: insertOpportunity.stage || "new_match",
        expectedRevenue: insertOpportunity.expectedRevenue || null,
        probability: insertOpportunity.probability || 0,
        expectedCloseDate: insertOpportunity.expectedCloseDate || null,
        notes: insertOpportunity.notes || null,
        lostReason: insertOpportunity.lostReason || null,
      })
      .returning();
    return opportunity;
  }

  async getPartnerSalesOpportunity(id: string): Promise<PartnerSalesOpportunity | undefined> {
    const [opportunity] = await db.select().from(partnerSalesOpportunities).where(eq(partnerSalesOpportunities.id, id));
    return opportunity;
  }

  async getPartnerSalesOpportunities(partnerId: string): Promise<PartnerSalesOpportunity[]> {
    return await db.select().from(partnerSalesOpportunities).where(eq(partnerSalesOpportunities.partnerId, partnerId));
  }

  async getPartnerSalesOpportunityByMatch(partnerId: string, matchId: string): Promise<PartnerSalesOpportunity | undefined> {
    const all = await db.select().from(partnerSalesOpportunities).where(eq(partnerSalesOpportunities.partnerId, partnerId));
    return all.find(o => o.matchId === matchId);
  }

  async updatePartnerSalesOpportunity(id: string, updates: Partial<PartnerSalesOpportunity>): Promise<PartnerSalesOpportunity | undefined> {
    const [opportunity] = await db
      .update(partnerSalesOpportunities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(partnerSalesOpportunities.id, id))
      .returning();
    return opportunity;
  }
}

export const storage = new DatabaseStorage();
