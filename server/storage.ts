import { type Partner, type InsertPartner, type Client, type InsertClient, type Match, type InsertMatch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Partner operations
  getAllPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  
  // Client operations
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Match operations
  getMatch(clientId: string, partnerId: string): Promise<Match | undefined>;
  getMatchesByClient(clientId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;
}

export class MemStorage implements IStorage {
  private partners: Map<string, Partner>;
  private clients: Map<string, Client>;
  private matches: Map<string, Match>;

  constructor() {
    this.partners = new Map();
    this.clients = new Map();
    this.matches = new Map();
    
    this.seedPartners();
  }

  private seedPartners() {
    const samplePartners: InsertPartner[] = [
      {
        name: "Sarah Johnson",
        email: "sarah@techsolutions.com",
        company: "TechSolutions Pro",
        industry: "Technology",
        services: ["Implementation", "Customization", "Training", "Support"],
        description: "Leading Odoo implementation partner with 10+ years of experience in enterprise solutions.",
      },
      {
        name: "Michael Chen",
        email: "michael@cloudexperts.com",
        company: "Cloud Experts Inc",
        industry: "Technology",
        services: ["Migration", "Integration", "Consulting", "Development"],
        description: "Specialized in cloud migrations and complex integrations for mid-size businesses.",
      },
      {
        name: "Emily Rodriguez",
        email: "emily@retailtech.com",
        company: "RetailTech Partners",
        industry: "Retail",
        services: ["Implementation", "Training", "Support", "Customization"],
        description: "Retail industry specialists helping businesses optimize their operations with Odoo.",
      },
      {
        name: "David Williams",
        email: "david@financeflow.com",
        company: "FinanceFlow Solutions",
        industry: "Finance",
        services: ["Implementation", "Customization", "Consulting", "Support"],
        description: "Expert in financial management and accounting modules for Odoo.",
      },
      {
        name: "Jessica Martinez",
        email: "jessica@healthcareit.com",
        company: "HealthCare IT Group",
        industry: "Healthcare",
        services: ["Implementation", "Integration", "Training", "Consulting"],
        description: "Specialized healthcare solutions with HIPAA-compliant Odoo implementations.",
      },
      {
        name: "Robert Taylor",
        email: "robert@manuflow.com",
        company: "ManufFlow Systems",
        industry: "Manufacturing",
        services: ["Implementation", "Customization", "Development", "Support"],
        description: "Manufacturing process optimization through tailored Odoo solutions.",
      },
      {
        name: "Amanda Lee",
        email: "amanda@edutech.com",
        company: "EduTech Solutions",
        industry: "Education",
        services: ["Implementation", "Training", "Support", "Customization"],
        description: "Educational institution specialists with custom student management systems.",
      },
      {
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
      // Mix of ratings: 5-star (selective), 4-star (moderate), 3-star (welcoming)
      // First 2 partners: 5-star (20% match threshold)
      // Next 3 partners: 4-star (40% match threshold)
      // Last 3 partners: 3-star (60% match threshold)
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
      });
    });
  }

  async getAllPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    return this.partners.get(id);
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
    };
    this.partners.set(id, partner);
    return partner;
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = { ...insertClient, id };
    this.clients.set(id, client);
    return client;
  }

  async getMatch(clientId: string, partnerId: string): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(
      (match) => match.clientId === clientId && match.partnerId === partnerId
    );
  }

  async getMatchesByClient(clientId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.clientId === clientId
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = { 
      ...insertMatch, 
      id, 
      matched: insertMatch.matched || false 
    };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }
}

export const storage = new MemStorage();
