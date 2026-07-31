import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  monsterSpeciesTable,
  regionsTable,
  capturedMonstersTable,
  battlesTable,
  playersTable,
  tournamentsTable,
} from "@workspace/db";
import { ilike, ne, notInArray } from "drizzle-orm";
import { MONSTER_SEED_DATA } from "../lib/monsterData.js";
import { REGION_SEED_DATA } from "../lib/regionData.js";

const router: IRouter = Router();

// POST /admin/cleanup-to-gm — Dev-only, destructive one-time cleanup.
// Keeps the configured DREAMMASTER player account and the active Myth catalogue.
router.post("/admin/cleanup-to-gm", async (_req, res): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Admin cleanup is not available in production" });
    return;
  }

  const gmUsername = process.env.GM_USERNAME ?? "DREAMMASTER";
  const [gmPlayer] = await db
    .select({ id: playersTable.id, username: playersTable.username })
    .from(playersTable)
    .where(ilike(playersTable.username, gmUsername));

  if (!gmPlayer) {
    res.status(409).json({ error: `GM player ${gmUsername} was not found; nothing was deleted` });
    return;
  }

  const activeSpeciesIds = MONSTER_SEED_DATA.map((species) => species.id);

  await db.transaction(async (tx) => {
    // Tournament matches reference players without cascade, so remove tournaments first.
    await tx.delete(tournamentsTable);
    await tx.delete(battlesTable);
    await tx.delete(capturedMonstersTable);
    await tx.delete(playersTable).where(ne(playersTable.id, gmPlayer.id));
    await tx.delete(monsterSpeciesTable).where(notInArray(monsterSpeciesTable.id, activeSpeciesIds));
  });

  res.json({
    message: "Cleanup complete. Only the GM player and active Myths remain.",
    gmUsername: gmPlayer.username,
    activeMyths: activeSpeciesIds,
  });
});

// POST /seed — Dev-only endpoint to populate game data
router.post("/seed", async (_req, res): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Seed not available in production" });
    return;
  }

  // Wipe player data that references species IDs (captured monsters & battles)
  // so we can safely replace all species without FK violations
  await db.delete(battlesTable);
  await db.delete(capturedMonstersTable);
  await db.delete(monsterSpeciesTable);

  // Insert all monster species fresh
  for (const monster of MONSTER_SEED_DATA) {
    await db
      .insert(monsterSpeciesTable)
      .values(monster)
      .onConflictDoUpdate({
        target: monsterSpeciesTable.id,
        set: {
          name: monster.name,
          element: monster.element,
          rarity: monster.rarity,
          baseHp: monster.baseHp,
          baseAttack: monster.baseAttack,
          baseDefense: monster.baseDefense,
          baseSpeed: monster.baseSpeed,
          description: monster.description,
          lore: monster.lore,
          captureRate: monster.captureRate,
          skills: monster.skills,
          regionIds: monster.regionIds,
        },
      });
  }

  // Upsert regions
  for (const region of REGION_SEED_DATA) {
    await db
      .insert(regionsTable)
      .values(region)
      .onConflictDoUpdate({
        target: regionsTable.id,
        set: {
          name: region.name,
          biome: region.biome,
          description: region.description,
          monsterSpeciesIds: region.monsterSpeciesIds,
        },
      });
  }

  res.json({
    message: "Seed complete",
    monsters: MONSTER_SEED_DATA.length,
    regions: REGION_SEED_DATA.length,
  });
});

export default router;
