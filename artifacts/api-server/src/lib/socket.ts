import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { verifyToken } from "./auth.js";
import { logger } from "./logger.js";
import { db, playersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

interface PlayerPosition {
  playerId: string;
  username: string;
  avatarColor: string;
  posX: number;
  posY: number;
  regionId: string;
  lastSeen: number;
}

const onlinePlayers = new Map<string, PlayerPosition>();
const socketOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function publicPosition(position: PlayerPosition) {
  return {
    id: position.playerId,
    playerId: position.playerId,
    username: position.username,
    avatarColor: position.avatarColor,
    posX: position.posX,
    posY: position.posY,
    regionId: position.regionId,
  };
}

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: socketOrigins.length > 0 ? socketOrigins : true,
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  const gameNamespace = io.of("/game");

  gameNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const playerId = verifyToken(token);
    if (!playerId) {
      return next(new Error("Invalid token"));
    }
    socket.data.playerId = playerId;
    next();
  });

  gameNamespace.on("connection", (socket) => {
    const playerId: string = socket.data.playerId;
    logger.info({ playerId }, "Player connected to game socket");

    socket.on("player:join", async () => {
      try {
        const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
        if (!player) {
          socket.disconnect(true);
          return;
        }
        const position: PlayerPosition = {
          playerId,
          username: player.username,
          avatarColor: player.avatarColor,
          posX: player.posX,
          posY: player.posY,
          regionId: player.regionId ?? "verdant-meadows",
          lastSeen: Date.now(),
        };
        onlinePlayers.set(playerId, position);

        // Send current players to the new player
        const others = Array.from(onlinePlayers.values()).filter(
          (p) => p.playerId !== playerId,
        );
        socket.emit("world:players", others.map(publicPosition));

        // Notify others of new player
        socket.broadcast.emit("player:joined", publicPosition(position));
      } catch (err) {
        logger.warn({ err, playerId }, "Failed to join game socket");
        socket.emit("world:error", { message: "Unable to join world" });
      }
    });

    socket.on(
      "player:move",
      async () => {
        const existing = onlinePlayers.get(playerId);
        if (existing) {
          try {
            // Movement is persisted by the authenticated REST endpoint first;
            // never rebroadcast coordinates supplied directly by a socket client.
            const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
            if (!player) return;
            existing.posX = player.posX;
            existing.posY = player.posY;
            existing.regionId = player.regionId ?? "verdant-meadows";
            existing.lastSeen = Date.now();
            onlinePlayers.set(playerId, existing);
            socket.broadcast.emit("player:moved", publicPosition(existing));
          } catch (err) {
            logger.warn({ err, playerId }, "Failed to synchronize socket movement");
          }
        }
      },
    );

    socket.on(
      "chat:message",
      (data: { channel?: unknown; message?: unknown }) => {
        const sender = onlinePlayers.get(playerId);
        if (!sender || typeof data?.message !== "string") return;
        const message = data.message.trim().slice(0, 200);
        if (!message) return;
        const channel = typeof data.channel === "string"
          ? data.channel.trim().slice(0, 32)
          : "world";
        gameNamespace.emit("chat:message", {
          playerId,
          username: sender.username,
          channel,
          message,
          timestamp: Date.now(),
        });
      },
    );

    socket.on("disconnect", () => {
      onlinePlayers.delete(playerId);
      socket.broadcast.emit("player:left", { playerId });
      logger.info({ playerId }, "Player disconnected from game socket");
    });
  });

  // Clean up stale connections every 30 seconds
  setInterval(() => {
    const staleThreshold = Date.now() - 60_000;
    for (const [id, player] of onlinePlayers.entries()) {
      if (player.lastSeen < staleThreshold) {
        onlinePlayers.delete(id);
      }
    }
  }, 30_000);

  return io;
}
