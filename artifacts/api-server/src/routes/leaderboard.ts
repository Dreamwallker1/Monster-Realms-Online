import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { playersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /leaderboard
router.get("/leaderboard", async (req, res): Promise<void> => {
  const query = GetLeaderboardQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const type = query.data.type ?? "explorer";
  const limit = query.data.limit ?? 50;

  let players: (typeof playersTable.$inferSelect)[];

  if (type === "explorer") {
    players = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.explorerLevel), desc(playersTable.explorerXp))
      .limit(limit);
  } else if (type === "collection") {
    players = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.monstersCaptured))
      .limit(limit);
  } else if (type === "pvp") {
    players = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.pvpWins))
      .limit(limit);
  } else if (type === "tiles") {
    players = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.tilesExplored))
      .limit(limit);
  } else {
    players = await db
      .select()
      .from(playersTable)
      .orderBy(desc(playersTable.explorerLevel))
      .limit(limit);
  }

  const entries = players.map((p, i) => {
    const score =
      type === "explorer"
        ? p.explorerLevel * 1000 + p.explorerXp
        : type === "collection"
        ? p.monstersCaptured
        : type === "pvp"
        ? p.pvpWins
        : p.tilesExplored;

    return {
      rank: i + 1,
      playerId: p.id,
      username: p.username,
      avatarColor: p.avatarColor,
      score,
      explorerLevel: p.explorerLevel,
      monstersCaptured: p.monstersCaptured,
      tilesExplored: p.tilesExplored,
      pvpWins: p.pvpWins,
    };
  });

  res.json(
    GetLeaderboardResponse.parse({
      type,
      entries,
      updatedAt: new Date().toISOString(),
    }),
  );
});

export default router;
