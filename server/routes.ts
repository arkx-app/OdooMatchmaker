import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPartnerSchema, insertClientSchema, insertMatchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all partners for swiping
  app.get("/api/partners", async (_req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  // Create a new client profile
  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data", error });
    }
  });

  // Create a new partner profile
  app.post("/api/partners", async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(validatedData);
      res.status(201).json(partner);
    } catch (error) {
      res.status(400).json({ message: "Invalid partner data", error });
    }
  });

  // Record a match/like and detect mutual matches
  app.post("/api/matches", async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const { clientId, partnerId, liked } = validatedData;
      
      // Check if this exact match already exists
      const existingMatch = await storage.getMatch(clientId, partnerId);
      if (existingMatch) {
        return res.json(existingMatch);
      }
      
      // Create the match record
      const match = await storage.createMatch(validatedData);
      
      // If the client liked the partner, determine if partner likes back
      // In a full implementation, partners would also swipe/like clients
      // For this MVP demo, we use a deterministic algorithm based on partner rating
      if (liked) {
        const partner = await storage.getPartner(partnerId);
        
        if (partner) {
          // Deterministic match algorithm based on partner rating and IDs
          // Create a deterministic hash from clientId + partnerId
          const hashInput = `${clientId}-${partnerId}`;
          let hash = 0;
          for (let i = 0; i < hashInput.length; i++) {
            hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
          }
          const normalizedHash = Math.abs(hash % 100); // 0-99
          
          // Partner rating determines selectivity threshold
          // 5-star partners: only match if hash < 20 (20% of clients)
          // 4-star partners: match if hash < 40 (40% of clients)
          // 3-star or lower (including null/undefined): match if hash < 60 (60% of clients)
          let threshold = 60; // default for 3-star or lower
          
          if (partner.rating === 5) {
            threshold = 20;
          } else if (partner.rating === 4) {
            threshold = 40;
          } // All other cases (3, 2, 1, 0, null, undefined) use default 60
          
          // Deterministic match: same client + partner always produces same result
          const partnerLikesBack = normalizedHash < threshold;
          
          if (partnerLikesBack) {
            // Update match to indicate mutual match
            const updatedMatch = await storage.updateMatch(match.id, { matched: true });
            return res.status(201).json(updatedMatch);
          }
        }
      }
      
      res.status(201).json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data", error });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
