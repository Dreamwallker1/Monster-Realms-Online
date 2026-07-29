import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { verifyToken } from "./auth.js";
import { logger } from "./logger.js";

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

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
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

    socket.on(
      "player:join",
      (data: {
        username: string;
        avatarColor: string;
        posX: number;
        posY: number;
        regionId: string;
      }) => {
        const position: PlayerPosition = {
          playerId,
          username: data.username,
          avatarColor: data.avatarColor,
          posX: data.posX,
          posY: data.posY,
          regionId: data.regionId,
          lastSeen: Date.now(),
        };
        onlinePlayers.set(playerId, position);

        // Send current players to the new player
        const others = Array.from(onlinePlayers.values()).filter(
          (p) => p.playerId !== playerId,
        );
        socket.emit("world:players", others);

        // Notify others of new player
        socket.broadcast.emit("player:joined", position);
      },
    );

    socket.on(
      "player:move",
      (data: { posX: number; posY: number; regionId: string }) => {
        const existing = onlinePlayers.get(playerId);
        if (existing) {
          existing.posX = data.posX;
          existing.posY = data.posY;
          existing.regionId = data.regionId;
          existing.lastSeen = Date.now();
          onlinePlayers.set(playerId, existing);
          // Broadcast to all others in same region
          socket.broadcast.emit("player:moved", {
            playerId,
            posX: data.posX,
            posY: data.posY,
            regionId: data.regionId,
          });
        }
      },
    );

    socket.on(
      "chat:message",
      (data: { channel: string; message: string; username: string }) => {
        gameNamespace.emit("chat:message", {
          playerId,
          username: data.username,
          channel: data.channel,
          message: data.message.substring(0, 200),
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
