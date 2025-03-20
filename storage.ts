import { User, InsertUser, Game, Bet } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User>;

  createBet(bet: Omit<Bet, "id" | "createdAt" | "status"> & { status: string }): Promise<Bet>;
  getBetsByUser(userId: number): Promise<Bet[]>;

  getGames(type: string): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  updateGameStatus(id: string, status: string): Promise<Game>;

  sessionStore: ReturnType<typeof createMemoryStore>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bets: Map<number, Bet>;
  private games: Map<string, Game>;
  private currentUserId: number;
  private currentBetId: number;
  sessionStore: ReturnType<typeof createMemoryStore>;

  constructor() {
    this.users = new Map();
    this.bets = new Map();
    this.games = new Map();
    this.currentUserId = 1;
    this.currentBetId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize some mock games
    this.initializeGames();
  }

  private initializeGames() {
    const now = new Date();
    const later = new Date(now.getTime() + 90 * 60000);

    const sportsGames = [
      {
        id: randomUUID(),
        name: "Manchester United vs Liverpool",
        type: "sports",
        odds: "2.5",
        status: "upcoming",
        startTime: now,
        endTime: later
      },
      {
        id: randomUUID(),
        name: "Real Madrid vs Barcelona",
        type: "sports",
        odds: "1.8",
        status: "upcoming",
        startTime: now,
        endTime: later
      }
    ];

    const casinoGames = [
      {
        id: randomUUID(),
        name: "Roulette",
        type: "casino",
        odds: "1.5",
        status: "active",
        startTime: now,
        endTime: null
      },
      {
        id: randomUUID(),
        name: "Blackjack",
        type: "casino",
        odds: "1.2",
        status: "active",
        startTime: now,
        endTime: null
      }
    ];

    [...sportsGames, ...casinoGames].forEach(game => {
      this.games.set(game.id, game as Game);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      balance: "0",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newBalance = parseFloat(user.balance) + amount;
    if (newBalance < 0) throw new Error("Insufficient balance");

    const updatedUser = { ...user, balance: newBalance.toString() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createBet(bet: Omit<Bet, "id" | "createdAt" | "status"> & { status: string }): Promise<Bet> {
    const id = this.currentBetId++;
    const newBet: Bet = {
      ...bet,
      id,
      createdAt: new Date()
    };
    this.bets.set(id, newBet);
    return newBet;
  }

  async getBetsByUser(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.userId === userId);
  }

  async getGames(type: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.type === type);
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGameStatus(id: string, status: string): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) throw new Error("Game not found");

    const updatedGame = { ...game, status };
    this.games.set(id, updatedGame);
    return updatedGame;
  }
}

export const storage = new MemStorage();