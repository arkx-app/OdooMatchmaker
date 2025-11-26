import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getCurrentUserId } from "./auth";
import { 
  insertPartnerSchema, insertClientSchema, insertMatchSchema,
  insertBriefSchema, insertMessageSchema, insertProjectSchema,
  updateMatchSchema
} from "@shared/schema";
import { seedPartners } from "./seed-data";

function calculateMatchScore(brief: any, partner: any): { score: number; breakdown: any; reasons: string[] } {
  const breakdown: any = {};
  const reasons: string[] = [];
  let score = 0;

  const briefModules = (brief.modules || []).map((m: string) => m.toLowerCase());
  const partnerServices = (partner.services || []).map((s: string) => s.toLowerCase());
  const moduleMatches = briefModules.filter((m: string) => 
    partnerServices.some((s: string) => s.includes(m) || m.includes(s))
  ).length;
  const moduleFit = briefModules.length > 0 ? (moduleMatches / briefModules.length) * 100 : 50;
  breakdown.moduleFit = Math.round(moduleFit);
  score += moduleFit * 0.3;

  const industryMatch = partner.industry.toLowerCase() === brief.clientId ? 50 : 
                       partner.industry.toLowerCase().includes(brief.clientId?.substring(0, 3)) ? 70 : 40;
  breakdown.industryMatch = industryMatch;
  score += industryMatch * 0.25;

  const partnerAvgRate = (partner.hourlyRateMin + partner.hourlyRateMax) / 2 / 100;
  const budgetFit = Math.min(100, 50 + (50 - Math.abs(50 - partnerAvgRate)) * 0.5);
  breakdown.budgetFit = Math.round(budgetFit);
  score += budgetFit * 0.2;

  const capacityScore = partner.capacity === "available" ? 100 : partner.capacity === "limited" ? 60 : 30;
  breakdown.capacity = capacityScore;
  score += capacityScore * 0.1;

  const ratingScore = (partner.rating || 3) * 20;
  breakdown.rating = ratingScore;
  score += ratingScore * 0.15;

  if (breakdown.moduleFit > 70) reasons.push(`Strong module match (${moduleMatches}/${briefModules.length})`);
  if (breakdown.industryMatch > 60) reasons.push(`Experience in ${partner.industry}`);
  if (breakdown.budgetFit > 70) reasons.push(`Budget-aligned rates`);
  if (breakdown.capacity === 100) reasons.push(`Available to start immediately`);
  if (breakdown.rating >= 80) reasons.push(`${partner.rating}-star rated partner`);

  return {
    score: Math.round(score),
    breakdown,
    reasons: reasons.length > 0 ? reasons : ["Good overall match"],
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profile = null;
      if (user.role === "partner") {
        profile = await storage.getPartnerByUserId(userId);
      } else if (user.role === "client") {
        profile = await storage.getClientByUserId(userId);
      }

      res.json({ 
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile 
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/complete-signup', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { 
        role, 
        company, 
        industry, 
        services, 
        budget,
        projectTimeline,
        odooModules,
        odooExperience,
        urgency,
        hourlyRateMin,
        hourlyRateMax,
        capacity,
        description,
        certifications,
        website
      } = req.body;

      if (!role || !['partner', 'client'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'partner' or 'client'" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      const userEmail = user.email || '';

      await storage.updateUserRole(userId, role);

      if (role === "partner") {
        const existingPartner = await storage.getPartnerByUserId(userId);
        if (!existingPartner) {
          const partnerData = {
            userId,
            name: userName,
            email: userEmail,
            company: company || "",
            industry: industry || "",
            services: Array.isArray(services) ? services : [],
            description: description || null,
            hourlyRateMin: hourlyRateMin || 75,
            hourlyRateMax: hourlyRateMax || 250,
            capacity: capacity || "available",
            certifications: Array.isArray(certifications) ? certifications : [],
            website: website || null,
          };
          const validatedPartnerData = insertPartnerSchema.parse(partnerData);
          const partner = await storage.createPartner(validatedPartnerData);
          return res.status(201).json({ user: { ...user, role }, profile: partner });
        }
        return res.json({ user: { ...user, role }, profile: existingPartner });
      } else {
        const existingClient = await storage.getClientByUserId(userId);
        if (!existingClient) {
          const clientData = {
            userId,
            name: userName,
            email: userEmail,
            company: company || "",
            industry: industry || "",
            budget: budget || "not-specified",
            projectTimeline: projectTimeline || null,
            odooModules: Array.isArray(odooModules) ? odooModules : [],
            website: website || null,
            odooExperience: odooExperience || null,
            urgency: urgency || null,
          };
          const validatedClientData = insertClientSchema.parse(clientData);
          const client = await storage.createClient(validatedClientData);
          return res.status(201).json({ user: { ...user, role }, profile: client });
        }
        return res.json({ user: { ...user, role }, profile: existingClient });
      }
    } catch (error) {
      console.error("Signup completion error:", error);
      res.status(400).json({ message: "Failed to complete signup", error });
    }
  });

  app.get("/api/partners", async (_req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.get("/api/partners/:id", async (req, res) => {
    try {
      const partner = await storage.getPartner(req.params.id);
      if (!partner) return res.status(404).json({ message: "Partner not found" });
      res.json(partner);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partner" });
    }
  });

  app.post("/api/partners", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dataWithUserId = {
        ...req.body,
        userId,
      };
      const validatedData = insertPartnerSchema.parse(dataWithUserId);
      const partner = await storage.createPartner(validatedData);
      res.status(201).json(partner);
    } catch (error) {
      console.error("Partner creation error:", error);
      res.status(400).json({ message: "Invalid partner data", error });
    }
  });

  app.patch("/api/partners/:id", isAuthenticated, async (req, res) => {
    try {
      const partner = await storage.updatePartner(req.params.id, req.body);
      if (!partner) return res.status(404).json({ message: "Partner not found" });
      res.json(partner);
    } catch (error) {
      res.status(400).json({ message: "Failed to update partner", error });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dataWithUserId = {
        ...req.body,
        userId,
      };
      const validatedData = insertClientSchema.parse(dataWithUserId);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Client creation error:", error);
      res.status(400).json({ message: "Invalid client data", error });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/briefs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBriefSchema.parse(req.body);
      const brief = await storage.createBrief(validatedData);
      
      const partners = await storage.getAllPartners();
      const matches = partners
        .map(partner => {
          const { score, breakdown, reasons } = calculateMatchScore(validatedData, partner);
          return {
            briefId: brief.id,
            clientId: validatedData.clientId,
            partnerId: partner.id,
            score,
            scoreBreakdown: breakdown,
            reasons,
            status: "suggested" as const,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      for (const matchData of matches) {
        await storage.createMatch(matchData);
      }

      res.status(201).json({ brief, matches });
    } catch (error) {
      res.status(400).json({ message: "Invalid brief data", error });
    }
  });

  app.get("/api/briefs/:id", async (req, res) => {
    try {
      const brief = await storage.getBrief(req.params.id);
      if (!brief) return res.status(404).json({ message: "Brief not found" });
      res.json(brief);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brief" });
    }
  });

  app.get("/api/briefs/:id/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByBrief(req.params.id);
      const enriched = await Promise.all(
        matches.map(async (m) => ({
          ...m,
          partner: await storage.getPartner(m.partnerId),
        }))
      );
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get("/api/clients/:clientId/briefs", async (req, res) => {
    try {
      const briefs = await storage.getBriefsByClient(req.params.clientId);
      res.json(briefs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch briefs" });
    }
  });

  app.get("/api/my/briefs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const client = await storage.getClientByUserId(userId);
      if (!client) {
        return res.json({ briefs: [], hasProfile: false });
      }

      const briefs = await storage.getBriefsByClient(client.id);
      res.json({ briefs, hasProfile: true, clientId: client.id });
    } catch (error) {
      console.error("Error fetching user briefs:", error);
      res.status(500).json({ message: "Failed to fetch briefs" });
    }
  });

  app.get("/api/matches/partner/:partnerId", async (req, res) => {
    try {
      const matches = await storage.getMatchesByPartner(req.params.partnerId);
      const enriched = await Promise.all(
        matches.map(async (m) => ({
          ...m,
          brief: await storage.getBrief(m.briefId),
          client: await storage.getClient(m.clientId),
        }))
      );
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/client/:clientId", async (req, res) => {
    try {
      const matches = await storage.getMatchesByClient(req.params.clientId);
      const enriched = await Promise.all(
        matches.map(async (m) => ({
          ...m,
          partner: await storage.getPartner(m.partnerId),
        }))
      );
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/matches", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      res.status(201).json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data", error });
    }
  });

  app.patch("/api/matches/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get existing match to verify ownership
      const existingMatch = await storage.getMatchById(req.params.id);
      if (!existingMatch) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Get user's client/partner profile to verify ownership
      const clientProfile = await storage.getClientByUserId(userId);
      const partnerProfile = await storage.getPartnerByUserId(userId);

      const isClient = clientProfile && existingMatch.clientId === clientProfile.id;
      const isPartner = partnerProfile && existingMatch.partnerId === partnerProfile.id;

      if (!isClient && !isPartner) {
        return res.status(403).json({ message: "Not authorized to update this match" });
      }

      // Validate the update data
      const validatedData = updateMatchSchema.parse(req.body);
      
      const match = await storage.updateMatch(req.params.id, {
        ...validatedData,
        respondedAt: validatedData.status || validatedData.partnerAccepted !== undefined ? new Date() : undefined,
      });
      
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Failed to update match", error });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", error });
    }
  });

  app.get("/api/messages/match/:matchId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByMatch(req.params.matchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/match/:matchId/read", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.markMessagesAsRead(req.params.matchId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark messages as read", error });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      if (validatedData.matchId) {
        await storage.updateMatch(validatedData.matchId, { status: "converted" });
      }
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  app.get("/api/projects/partner/:partnerId", async (req, res) => {
    try {
      const projects = await storage.getProjectsByPartner(req.params.partnerId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to update project", error });
    }
  });

  app.get("/api/analytics/partner/:partnerId", async (req, res) => {
    try {
      const metrics = await storage.getPartnerMetrics(req.params.partnerId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  seedPartners().catch(err => console.error("Failed to seed partners:", err));

  return httpServer;
}
