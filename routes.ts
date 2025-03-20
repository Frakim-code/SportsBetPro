import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./games";
import { insertBetSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Games routes
  app.get("/api/games/:type", async (req, res) => {
    const { type } = req.params;
    if (!["sports", "casino"].includes(type)) {
      return res.status(400).json({ message: "Invalid game type" });
    }
    const games = await storage.getGames(type);
    res.json(games);
  });

  // Betting routes
  app.post("/api/bets", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const betData = insertBetSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const game = await storage.getGame(betData.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      if (game.status !== "upcoming" && game.status !== "active") {
        return res.status(400).json({ message: "Game is not available for betting" });
      }

      // Check balance
      const betAmount = parseFloat(betData.amount);
      if (parseFloat(req.user.balance) < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create bet and update balance
      const bet = await storage.createBet({
        ...betData,
        status: "pending" // Add status field
      });
      await storage.updateUserBalance(req.user.id, -betAmount);

      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/bets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const bets = await storage.getBetsByUser(req.user.id);
    res.json(bets);
  });

  // Balance management routes
  app.post("/api/balance/deposit", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const amount = parseFloat(req.body.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.updateUserBalance(req.user.id, amount);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}