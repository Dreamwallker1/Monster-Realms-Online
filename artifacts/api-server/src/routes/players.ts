import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  capturedMonstersTable,
  monsterSpeciesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { formatPlayer } from "./auth.js";
import {
  GetPlayerParams,
  GetPlayerResponse,
  UpdatePlayerParams,
  UpdatePlayerBody,
  UpdatePlayerResponse,
  GetPlayerStatsParams,
  GetPlayerStatsResponse,
  GetPlayerTeamParams,
  GetPlayerTeamResponse,
  UpdatePlayerTeamParams,
  UpdatePlayerTeamBody,
  UpdatePlayerTeamResponse,
  GetPlayerRadarParams,
  GetPlayerRadarResponse,
} from "@workspace/api-zod";
import { formatCapturedMonster } from "./collection.js";

const router: IRouter = Router();

// GET /players/:playerId
router.get("/players/:playerId", async (req, res): Promise<void> => {
  const params = GetPlayerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, params.data.playerId));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(GetPlayerResponse.parse(formatPlayer(player)));
});

// PATCH /players/:playerId
router.patch(
  "/players/:playerId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdatePlayerParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Cannot update another player" });
      return;
    }
    const body = UpdatePlayerBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const [player] = await db
      .update(playersTable)
      .set(body.data)
      .where(eq(playersTable.id, params.data.playerId))
      .returning();
    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    res.json(UpdatePlayerResponse.parse(formatPlayer(player)));
  },
);

// GET /players/:playerId/stats
router.get("/players/:playerId/stats", async (req, res): Promise<void> => {
  const params = GetPlayerStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, params.data.playerId));
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(
    GetPlayerStatsResponse.parse({
      playerId: player.id,
      pvpWins: player.pvpWins,
      pvpLosses: player.pvpLosses,
      monstersCaptured: player.monstersCaptured,
      monstersDiscovered: player.monstersDiscovered,
      tilesExplored: player.tilesExplored,
      secretsFound: player.secretsFound,
      battlesWon: player.battlesWon,
      battlesLost: player.battlesLost,
      totalPlayTime: player.totalPlayTime,
      firstDiscoveries: player.firstDiscoveries,
    }),
  );
});

// GET /players/:playerId/team
router.get(
  "/players/:playerId/team",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetPlayerTeamParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const teamMembers = await db
      .select()
      .from(capturedMonstersTable)
      .leftJoin(
        monsterSpeciesTable,
        eq(capturedMonstersTable.speciesId, monsterSpeciesTable.id),
      )
      .where(
        and(
          eq(capturedMonstersTable.playerId, params.data.playerId),
          eq(capturedMonstersTable.inTeam, true),
        ),
      );

    const formatted = teamMembers
      .filter((r) => r.monster_species)
      .map((r) => formatCapturedMonster(r.captured_monsters, r.monster_species!))
      .sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99));

    res.json(GetPlayerTeamResponse.parse(formatted));
  },
);

// PUT /players/:playerId/team
router.put(
  "/players/:playerId/team",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdatePlayerTeamParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Cannot update another player's team" });
      return;
    }
    const body = UpdatePlayerTeamBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    // Clear existing team
    await db
      .update(capturedMonstersTable)
      .set({ inTeam: false, teamSlot: null })
      .where(eq(capturedMonstersTable.playerId, params.data.playerId));

    // Set new team
    for (let i = 0; i < body.data.capturedMonsterIds.length; i++) {
      await db
        .update(capturedMonstersTable)
        .set({ inTeam: true, teamSlot: i })
        .where(
          and(
            eq(capturedMonstersTable.id, body.data.capturedMonsterIds[i]!),
            eq(capturedMonstersTable.playerId, params.data.playerId),
          ),
        );
    }

    const teamMembers = await db
      .select()
      .from(capturedMonstersTable)
      .leftJoin(
        monsterSpeciesTable,
        eq(capturedMonstersTable.speciesId, monsterSpeciesTable.id),
      )
      .where(
        and(
          eq(capturedMonstersTable.playerId, params.data.playerId),
          eq(capturedMonstersTable.inTeam, true),
        ),
      );

    const formatted = teamMembers
      .filter((r) => r.monster_species)
      .map((r) => formatCapturedMonster(r.captured_monsters, r.monster_species!))
      .sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99));

    res.json(UpdatePlayerTeamResponse.parse(formatted));
  },
);

// GET /players/:playerId/radar
router.get(
  "/players/:playerId/radar",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetPlayerRadarParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    // Simple radar: randomly indicate monsters nearby
    const monstersNearby = Math.random() < 0.6;
    const directions = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"] as const;
    const direction = monstersNearby
      ? directions[Math.floor(Math.random() * directions.length)]
      : null;

    res.json(
      GetPlayerRadarResponse.parse({
        monstersNearby,
        direction: direction ?? null,
        element: monstersNearby ? ["Fire", "Water", "Nature", "Electric", "Ice"][Math.floor(Math.random() * 5)] : null,
        distance: monstersNearby ? Math.floor(Math.random() * 8) + 1 : null,
      }),
    );
  },
);

export default router;
