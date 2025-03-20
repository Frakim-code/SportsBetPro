import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { log } from "./vite";

interface GameUpdate {
  type: "UPDATE_GAME";
  gameId: string;
  status: string;
  odds?: string;
}

interface BetUpdate {
  type: "UPDATE_BET";
  betId: number;
  status: string;
}

type WSMessage = GameUpdate | BetUpdate;

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  log("WebSocket server initialized", "websocket");

  const broadcast = (data: WSMessage) => {
    log(`Broadcasting message: ${JSON.stringify(data)}`, "websocket");
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Simulate game updates
  setInterval(async () => {
    const games = await storage.getGames("sports");
    for (const game of games) {
      if (game.status === "upcoming" && new Date() >= game.startTime) {
        const updatedGame = await storage.updateGameStatus(game.id, "in_progress");
        broadcast({
          type: "UPDATE_GAME",
          gameId: game.id,
          status: updatedGame.status
        });
      }
    }
  }, 10000);

  wss.on("connection", (ws, req) => {
    log(`New WebSocket connection from ${req.socket.remoteAddress}`, "websocket");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(`Received message: ${JSON.stringify(message)}`, "websocket");
      } catch (err) {
        log(`Invalid message format: ${err}`, "websocket");
      }
    });

    ws.on("error", (error) => {
      log(`WebSocket error: ${error.message}`, "websocket");
    });

    ws.on("close", () => {
      log("WebSocket connection closed", "websocket");
    });
  });

  return wss;
}