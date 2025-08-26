import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const createDepositSchema = z.object({
  tokenNumber: z.number(),
  sangatPhoto: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
  })),
  others: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get token stats
  app.get("/api/tokens/stats", async (req, res) => {
    try {
      const stats = await storage.getTokenStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get token stats" });
    }
  });

  // Validate token with detailed validation
  app.get("/api/tokens/:tokenNumber/validate", async (req, res) => {
    try {
      const tokenNumber = parseInt(req.params.tokenNumber);
      
      // First validate token exists in system
      const isValidToken = await storage.validateToken(tokenNumber);
      if (!isValidToken) {
        return res.status(404).json({ error: "Token not found in system" });
      }
      
      const token = await storage.getToken(tokenNumber);
      if (!token) {
        return res.status(404).json({ error: "Token not found in system" });
      }

      if (token.isInUse) {
        return res.status(409).json({ error: "Token is already in use" });
      }

      res.json({ valid: true, token });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate token" });
    }
  });

  // Get token with deposit info (for return flow)
  app.get("/api/tokens/:tokenNumber", async (req, res) => {
    try {
      const tokenNumber = parseInt(req.params.tokenNumber);
      const token = await storage.getToken(tokenNumber);
      
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }

      if (!token.isInUse) {
        return res.status(404).json({ error: "Token is not currently in use" });
      }

      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to get token" });
    }
  });

  // Create deposit
  app.post("/api/deposits", async (req, res) => {
    try {
      const data = createDepositSchema.parse(req.body);
      
      // Validate photo data
      if (!data.sangatPhoto || !data.sangatPhoto.startsWith('data:image/')) {
        return res.status(400).json({ error: "Invalid photo data" });
      }
      
      const depositRecord = {
        sangatPhoto: data.sangatPhoto,
        items: data.items,
        others: data.others,
        timestamp: Date.now(),
      };

      await storage.createDeposit(data.tokenNumber, depositRecord);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Deposit creation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to create deposit";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Delete deposit (return items)
  app.delete("/api/deposits/:tokenNumber", async (req, res) => {
    try {
      const tokenNumber = parseInt(req.params.tokenNumber);
      
      if (isNaN(tokenNumber)) {
        return res.status(400).json({ error: "Invalid token number" });
      }
      
      await storage.deleteDeposit(tokenNumber);
      res.json({ success: true });
    } catch (error) {
      console.error("Return error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to return items";
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
