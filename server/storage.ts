import { 
  type Partner, type InsertPartner, 
  type Client, type InsertClient,
  type Match, type InsertMatch,
  type User, type InsertUser,
  type Brief, type InsertBrief,
  type Message, type InsertMessage,
  type Project, type InsertProject,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;

  // Partner operations
  getAllPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  getPartnerByUserId(userId: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined>;

  // Client operations
  getClient(id: string): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;

  // Brief operations
  createBrief(brief: InsertBrief): Promise<Brief>;
  getBrief(id: string): Promise<Brief | undefined>;
  getBriefsByClient(clientId: string): Promise<Brief[]>;
  getAllBriefs(): Promise<Brief[]>;

  // Match operations
  getMatch(clientId: string, partnerId: string): Promise<Match | undefined>;
  getMatchesByClient(clientId: string): Promise<Match[]>;
  getMatchesByPartner(partnerId: string): Promise<Match[]>;
  getMatchesByBrief(briefId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByMatch(matchId: string): Promise<Message[]>;
  markMessagesAsRead(matchId: string, userId: string): Promise<void>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByPartner(partnerId: string): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;

  // Analytics
  getPartnerMetrics(partnerId: string): Promise<{
    matchesSent: number;
    matchesAccepted: number;
    conversions: number;
    totalProjectValue: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private partners: Map<string, Partner>;
  private clients: Map<string, Client>;
  private briefs: Map<string, Brief>;
  private matches: Map<string, Match>;
  private messages: Map<string, Message>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.clients = new Map();
    this.briefs = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.projects = new Map();
    
    this.seedPartners();
  }

  private seedPartners() {
    const samplePartners: InsertPartner[] = [
      {
        userId: randomUUID(),
        name: "Sarah Johnson",
        email: "sarah@techsolutions.com",
        company: "TechSolutions Pro",
        industry: "Technology",
        services: ["Implementation", "Customization", "Training", "Support"],
        description: "Leading Odoo implementation partner with 10+ years of experience in enterprise solutions.",
      },
      {
        userId: randomUUID(),
        name: "Michael Chen",
        email: "michael@cloudexperts.com",
        company: "Cloud Experts Inc",
        industry: "Technology",
        services: ["Migration", "Integration", "Consulting", "Development"],
        description: "Specialized in cloud migrations and complex integrations for mid-size businesses.",
      },
      {
        userId: randomUUID(),
        name: "Emily Rodriguez",
        email: "emily@retailtech.com",
        company: "RetailTech Partners",
        industry: "Retail",
        services: ["Implementation", "Training", "Support", "Customization"],
        description: "Retail industry specialists helping businesses optimize their operations with Odoo.",
      },
      {
        userId: randomUUID(),
        name: "David Williams",
        email: "david@financeflow.com",
        company: "FinanceFlow Solutions",
        industry: "Finance",
        services: ["Implementation", "Customization", "Consulting", "Support"],
        description: "Expert in financial management and accounting modules for Odoo.",
      },
      {
        userId: randomUUID(),
        name: "Jessica Martinez",
        email: "jessica@healthcareit.com",
        company: "HealthCare IT Group",
        industry: "Healthcare",
        services: ["Implementation", "Integration", "Training", "Consulting"],
        description: "Specialized healthcare solutions with HIPAA-compliant Odoo implementations.",
      },
      {
        userId: randomUUID(),
        name: "Robert Taylor",
        email: "robert@manuflow.com",
        company: "ManufFlow Systems",
        industry: "Manufacturing",
        services: ["Implementation", "Customization", "Development", "Support"],
        description: "Manufacturing process optimization through tailored Odoo solutions.",
      },
      {
        userId: randomUUID(),
        name: "Amanda Lee",
        email: "amanda@edutech.com",
        company: "EduTech Solutions",
        industry: "Education",
        services: ["Implementation", "Training", "Support", "Customization"],
        description: "Educational institution specialists with custom student management systems.",
      },
      {
        userId: randomUUID(),
        name: "James Anderson",
        email: "james@propconnect.com",
        company: "PropConnect Partners",
        industry: "Real Estate",
        services: ["Implementation", "Integration", "Customization", "Training"],
        description: "Real estate industry experts with property management solutions.",
      },
    ];

    samplePartners.forEach((partner, index) => {
      const id = randomUUID();
      let rating = 4;
      if (index < 2) {
        rating = 5;
      } else if (index < 5) {
        rating = 4;
      } else {
        rating = 3;
      }
      const reviewCount = 10 + Math.floor(Math.random() * 90);
      
      this.partners.set(id, {
        ...partner,
        id,
        rating,
        reviewCount,
        logo: null,
        description: partner.description || null,
        hourlyRateMin: 75,
        hourlyRateMax: 250,
        capacity: "available",
        certifications: ["Gold Partner"],
        website: null,
        verified: true,
        createdAt: new Date(),
      });
    });
  }

  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Partner operations
  async getAllPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getPartnerByUserId(userId: string): Promise<Partner | undefined> {
    return Array.from(this.partners.values()).find((p) => p.userId === userId);
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = randomUUID();
    const partner: Partner = {
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
      createdAt: new Date(),
    };
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    const updated = { ...partner, ...updates };
    this.partners.set(id, updated);
    return updated;
  }

  // Client operations
  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find((c) => c.userId === userId);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date(),
      companySize: insertClient.companySize || null,
      projectTimeline: insertClient.projectTimeline || null,
      odooModules: insertClient.odooModules || null,
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    const updated = { ...client, ...updates };
    this.clients.set(id, updated);
    return updated;
  }

  // Brief operations
  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const id = randomUUID();
    const brief: Brief = { 
      ...insertBrief, 
      id, 
      createdAt: new Date(),
      modules: insertBrief.modules || null,
      painPoints: insertBrief.painPoints || null,
      integrations: insertBrief.integrations || null,
      timelineWeeks: insertBrief.timelineWeeks || null,
      priority: insertBrief.priority || null,
      status: insertBrief.status || "active",
    };
    this.briefs.set(id, brief);
    return brief;
  }

  async getBrief(id: string): Promise<Brief | undefined> {
    return this.briefs.get(id);
  }

  async getBriefsByClient(clientId: string): Promise<Brief[]> {
    return Array.from(this.briefs.values()).filter((b) => b.clientId === clientId);
  }

  async getAllBriefs(): Promise<Brief[]> {
    return Array.from(this.briefs.values());
  }

  // Match operations
  async getMatch(clientId: string, partnerId: string): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(
      (m) => m.clientId === clientId && m.partnerId === partnerId
    );
  }

  async getMatchesByClient(clientId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter((m) => m.clientId === clientId);
  }

  async getMatchesByPartner(partnerId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter((m) => m.partnerId === partnerId);
  }

  async getMatchesByBrief(briefId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter((m) => m.briefId === briefId);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = {
      ...insertMatch,
      id,
      createdAt: new Date(),
      respondedAt: null,
      score: insertMatch.score || null,
      scoreBreakdown: insertMatch.scoreBreakdown || null,
      reasons: insertMatch.reasons || null,
      status: insertMatch.status || "suggested",
      clientLiked: insertMatch.clientLiked || null,
      partnerResponded: insertMatch.partnerResponded || false,
      partnerAccepted: insertMatch.partnerAccepted || null,
    };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    const updated = { ...match, ...updates };
    this.matches.set(id, updated);
    return updated;
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      read: insertMessage.read || false,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByMatch(matchId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.matchId === matchId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    Array.from(this.messages.values())
      .filter((m) => m.matchId === matchId && m.toUserId === userId && !m.read)
      .forEach((m) => {
        this.messages.set(m.id, { ...m, read: true });
      });
  }

  // Project operations
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date(),
      status: insertProject.status || "matched",
      contractValue: insertProject.contractValue || null,
      startDate: insertProject.startDate || null,
      endDate: insertProject.endDate || null,
      clientSatisfaction: insertProject.clientSatisfaction || null,
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByPartner(partnerId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter((p) => p.partnerId === partnerId);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  // Analytics
  async getPartnerMetrics(partnerId: string) {
    const matches = await this.getMatchesByPartner(partnerId);
    const projects = await this.getProjectsByPartner(partnerId);

    const matchesSent = matches.length;
    const matchesAccepted = matches.filter((m) => m.status === "accepted").length;
    const conversions = matches.filter((m) => m.status === "converted").length;
    const totalProjectValue = projects.reduce((sum, p) => sum + (p.contractValue || 0), 0);

    return {
      matchesSent,
      matchesAccepted,
      conversions,
      totalProjectValue,
    };
  }
}

export const storage = new MemStorage();
