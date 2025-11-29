import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getCurrentUserId } from "./auth";
import { 
  insertPartnerSchema, insertClientSchema, insertMatchSchema,
  insertBriefSchema, insertMessageSchema, insertProjectSchema,
  updateMatchSchema, insertSupportTicketSchema, updateSupportTicketSchema,
  insertTicketCommentSchema, insertPartnerServiceTicketSchema, 
  updatePartnerServiceTicketSchema, insertPartnerServiceTicketNoteSchema,
  insertPartnerSalesOpportunitySchema, updatePartnerSalesOpportunitySchema
} from "@shared/schema";
import { seedPartners, seedBriefsForClient } from "./seed-data";

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

  app.get("/api/clients", isAuthenticated, async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
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

  app.get("/api/clients/:clientId/briefs", isAuthenticated, async (req: any, res) => {
    try {
      let clientBriefs = await storage.getBriefsByClient(req.params.clientId);
      
      // Auto-seed sample projects for demo if client has no briefs (only in development)
      if (clientBriefs.length === 0 && process.env.NODE_ENV === "development") {
        console.log("No briefs found for client, seeding sample projects...");
        await seedBriefsForClient(req.params.clientId);
        clientBriefs = await storage.getBriefsByClient(req.params.clientId);
      }
      
      res.json(clientBriefs);
    } catch (error) {
      console.error("Failed to fetch briefs:", error);
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

      let clientBriefs = await storage.getBriefsByClient(client.id);
      
      // Auto-seed sample projects for demo if client has no briefs (only in development)
      if (clientBriefs.length === 0 && process.env.NODE_ENV === "development") {
        console.log("No briefs found for client, seeding sample projects...");
        await seedBriefsForClient(client.id);
        clientBriefs = await storage.getBriefsByClient(client.id);
      }

      res.json({ briefs: clientBriefs, hasProfile: true, clientId: client.id });
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

  // Get clients who liked this partner (for partner swiping)
  app.get("/api/clients/swipe/:partnerId", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const partnerProfile = await storage.getPartnerByUserId(userId);
      if (!partnerProfile || partnerProfile.id !== req.params.partnerId) {
        return res.status(403).json({ message: "Not authorized to view these clients" });
      }

      const clientsData = await storage.getClientsWhoLikedPartner(req.params.partnerId);
      
      // Filter to only show clients that partner hasn't responded to yet
      const unrespondedClients = clientsData.filter(({ match }) => !match.partnerResponded);
      
      // Return clients with their match and brief info
      const enrichedClients = await Promise.all(
        unrespondedClients.map(async ({ client, match }) => {
          const brief = match.briefId ? await storage.getBrief(match.briefId) : null;
          return {
            client,
            match,
            brief,
          };
        })
      );

      res.json(enrichedClients);
    } catch (error) {
      console.error("Error fetching swipe clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Partner swipe action - record partner's decision on a client
  app.post("/api/matches/partner-swipe", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { matchId, accepted } = req.body;
      
      if (!matchId || typeof accepted !== 'boolean') {
        return res.status(400).json({ message: "matchId and accepted (boolean) are required" });
      }

      // Verify the match exists and belongs to this partner
      const existingMatch = await storage.getMatchById(matchId);
      if (!existingMatch) {
        return res.status(404).json({ message: "Match not found" });
      }

      const partnerProfile = await storage.getPartnerByUserId(userId);
      if (!partnerProfile || existingMatch.partnerId !== partnerProfile.id) {
        return res.status(403).json({ message: "Not authorized to update this match" });
      }

      // Update the match with partner's response
      const updateData: any = {
        partnerResponded: true,
        partnerAccepted: accepted,
        respondedAt: new Date(),
      };

      // If both client liked AND partner accepted, it's a mutual match
      if (existingMatch.clientLiked && accepted) {
        updateData.status = "accepted";
      } else if (!accepted) {
        updateData.status = "rejected";
      }

      const updatedMatch = await storage.updateMatch(matchId, updateData);

      // Check if it's a mutual match (both parties liked each other)
      const isMutualMatch = existingMatch.clientLiked && accepted;

      res.json({
        match: updatedMatch,
        matched: isMutualMatch,
        clientId: existingMatch.clientId,
      });
    } catch (error) {
      console.error("Error processing partner swipe:", error);
      res.status(500).json({ message: "Failed to process swipe" });
    }
  });

  // Get mutual matches for a partner (where both parties liked each other)
  app.get("/api/matches/mutual/partner/:partnerId", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const partnerProfile = await storage.getPartnerByUserId(userId);
      if (!partnerProfile || partnerProfile.id !== req.params.partnerId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const allMatches = await storage.getMatchesByPartner(req.params.partnerId);
      const mutualMatches = allMatches.filter(
        m => m.clientLiked === true && m.partnerAccepted === true
      );

      const enriched = await Promise.all(
        mutualMatches.map(async (m) => ({
          ...m,
          brief: await storage.getBrief(m.briefId),
          client: await storage.getClient(m.clientId),
        }))
      );

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mutual matches" });
    }
  });

  // Get mutual matches for a client (where both parties liked each other)
  app.get("/api/matches/mutual/client/:clientId", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const clientProfile = await storage.getClientByUserId(userId);
      if (!clientProfile || clientProfile.id !== req.params.clientId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const allMatches = await storage.getMatchesByClient(req.params.clientId);
      const mutualMatches = allMatches.filter(
        m => m.clientLiked === true && m.partnerAccepted === true
      );

      const enriched = await Promise.all(
        mutualMatches.map(async (m) => ({
          ...m,
          partner: await storage.getPartner(m.partnerId),
        }))
      );

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mutual matches" });
    }
  });

  // ========== ADMIN ROUTES ==========

  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Get admin analytics
  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Exclude password hashes for security
      const safeUsers = users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all support tickets for admin
  app.get("/api/admin/tickets", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      // Sort by createdAt descending (newest first)
      tickets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Get single ticket
  app.get("/api/admin/tickets/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  // Update ticket (admin only)
  app.patch("/api/admin/tickets/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateSupportTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid ticket data", errors: result.error.flatten() });
      }

      const updates: any = { ...result.data };
      if (updates.status === "fixed") {
        updates.resolvedAt = new Date();
      }

      const ticket = await storage.updateSupportTicket(req.params.id, updates);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Get admin users for ticket assignment
  app.get("/api/admin/admins", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const admins = await storage.getAdminUsers();
      // Exclude password hashes for security
      const safeAdmins = admins.map(({ passwordHash, ...admin }) => admin);
      res.json(safeAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // Get ticket comments
  app.get("/api/admin/tickets/:id/comments", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const comments = await storage.getTicketComments(req.params.id);
      // Sort by createdAt ascending (oldest first for conversation flow)
      comments.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Add ticket comment
  app.post("/api/admin/tickets/:id/comments", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = insertTicketCommentSchema.safeParse({
        ...req.body,
        ticketId: req.params.id,
        userId: userId,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid comment data", errors: result.error.flatten() });
      }

      const comment = await storage.createTicketComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // ========== PUBLIC SUPPORT TICKET ROUTES ==========

  // Create support ticket (accessible by anyone - clients, partners, or anonymous)
  app.post("/api/tickets", async (req, res) => {
    try {
      const result = insertSupportTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid ticket data", errors: result.error.flatten() });
      }

      // Try to get user ID if authenticated
      let userId = null;
      try {
        userId = getCurrentUserId(req);
      } catch {
        // User not authenticated, that's fine for support tickets
      }

      const ticket = await storage.createSupportTicket({
        ...result.data,
        userId: userId || result.data.userId,
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  // Get all clients and partners count (for admin dashboard quick stats)
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const partners = await storage.getAllPartners();
      const briefs = await storage.getAllBriefs();
      
      res.json({
        totalClients: clients.length,
        totalPartners: partners.length,
        totalBriefs: briefs.length,
        recentClients: clients.slice(-5).reverse(),
        recentPartners: partners.slice(-5).reverse(),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ========== PARTNER SERVICE TICKET ROUTES ==========

  // Helper to verify partner ownership
  async function getPartnerFromUser(req: Request): Promise<{ partnerId: string } | null> {
    const userId = getCurrentUserId(req);
    if (!userId) return null;
    const partner = await storage.getPartnerByUserId(userId);
    return partner ? { partnerId: partner.id } : null;
  }

  // Get all service tickets for a partner
  app.get("/api/partner/service-tickets", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }
      const tickets = await storage.getPartnerServiceTickets(partnerInfo.partnerId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching service tickets:", error);
      res.status(500).json({ message: "Failed to fetch service tickets" });
    }
  });

  // Create a service ticket
  app.post("/api/partner/service-tickets", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      const result = insertPartnerServiceTicketSchema.safeParse({
        ...req.body,
        partnerId: partnerInfo.partnerId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid ticket data", errors: result.error.flatten() });
      }

      const ticket = await storage.createPartnerServiceTicket(result.data);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating service ticket:", error);
      res.status(500).json({ message: "Failed to create service ticket" });
    }
  });

  // Get a single service ticket
  app.get("/api/partner/service-tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      const ticket = await storage.getPartnerServiceTicket(req.params.id);
      if (!ticket || ticket.partnerId !== partnerInfo.partnerId) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error) {
      console.error("Error fetching service ticket:", error);
      res.status(500).json({ message: "Failed to fetch service ticket" });
    }
  });

  // Update a service ticket
  app.patch("/api/partner/service-tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      // Verify ownership
      const existingTicket = await storage.getPartnerServiceTicket(req.params.id);
      if (!existingTicket || existingTicket.partnerId !== partnerInfo.partnerId) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const result = updatePartnerServiceTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid update data", errors: result.error.flatten() });
      }

      const ticket = await storage.updatePartnerServiceTicket(req.params.id, result.data);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating service ticket:", error);
      res.status(500).json({ message: "Failed to update service ticket" });
    }
  });

  // Get service ticket notes
  app.get("/api/partner/service-tickets/:id/notes", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      // Verify ownership
      const ticket = await storage.getPartnerServiceTicket(req.params.id);
      if (!ticket || ticket.partnerId !== partnerInfo.partnerId) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const notes = await storage.getPartnerServiceTicketNotes(req.params.id);
      notes.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Add a note to a service ticket
  app.post("/api/partner/service-tickets/:id/notes", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo || !userId) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      // Verify ownership
      const ticket = await storage.getPartnerServiceTicket(req.params.id);
      if (!ticket || ticket.partnerId !== partnerInfo.partnerId) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const user = await storage.getUser(userId);
      const result = insertPartnerServiceTicketNoteSchema.safeParse({
        ...req.body,
        ticketId: req.params.id,
        userId: userId,
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown',
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid note data", errors: result.error.flatten() });
      }

      const note = await storage.createPartnerServiceTicketNote(result.data);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // ========== PARTNER SALES OPPORTUNITY ROUTES ==========

  // Get all sales opportunities for a partner
  app.get("/api/partner/sales-opportunities", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }
      const opportunities = await storage.getPartnerSalesOpportunities(partnerInfo.partnerId);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching sales opportunities:", error);
      res.status(500).json({ message: "Failed to fetch sales opportunities" });
    }
  });

  // Create a sales opportunity
  app.post("/api/partner/sales-opportunities", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      const result = insertPartnerSalesOpportunitySchema.safeParse({
        ...req.body,
        partnerId: partnerInfo.partnerId,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid opportunity data", errors: result.error.flatten() });
      }

      const opportunity = await storage.createPartnerSalesOpportunity(result.data);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Error creating sales opportunity:", error);
      res.status(500).json({ message: "Failed to create sales opportunity" });
    }
  });

  // Get a single sales opportunity
  app.get("/api/partner/sales-opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      const opportunity = await storage.getPartnerSalesOpportunity(req.params.id);
      if (!opportunity || opportunity.partnerId !== partnerInfo.partnerId) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching sales opportunity:", error);
      res.status(500).json({ message: "Failed to fetch sales opportunity" });
    }
  });

  // Update a sales opportunity
  app.patch("/api/partner/sales-opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      // Verify ownership
      const existingOpportunity = await storage.getPartnerSalesOpportunity(req.params.id);
      if (!existingOpportunity || existingOpportunity.partnerId !== partnerInfo.partnerId) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      const result = updatePartnerSalesOpportunitySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid update data", errors: result.error.flatten() });
      }

      // If moving to won/lost, set closedAt
      const updates: any = { ...result.data };
      if ((result.data.stage === 'won' || result.data.stage === 'lost') && !existingOpportunity.closedAt) {
        updates.closedAt = new Date();
      }

      const opportunity = await storage.updatePartnerSalesOpportunity(req.params.id, updates);
      res.json(opportunity);
    } catch (error) {
      console.error("Error updating sales opportunity:", error);
      res.status(500).json({ message: "Failed to update sales opportunity" });
    }
  });

  // Check/Get existing opportunity by match ID (useful to avoid duplicates)
  app.get("/api/partner/sales-opportunities/by-match/:matchId", isAuthenticated, async (req, res) => {
    try {
      const partnerInfo = await getPartnerFromUser(req);
      if (!partnerInfo) {
        return res.status(403).json({ message: "Partner profile not found" });
      }

      const opportunity = await storage.getPartnerSalesOpportunityByMatch(partnerInfo.partnerId, req.params.matchId);
      if (!opportunity) {
        return res.status(404).json({ message: "No opportunity found for this match" });
      }

      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching opportunity by match:", error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  const httpServer = createServer(app);

  seedPartners().catch(err => console.error("Failed to seed partners:", err));

  return httpServer;
}
