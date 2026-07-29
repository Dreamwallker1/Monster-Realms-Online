import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { monsterSpeciesTable, regionsTable } from "@workspace/db";
import { MONSTER_SEED_DATA } from "../lib/monsterData.js";
import { REGION_SEED_DATA } from "../lib/regionData.js";

const router: IRouter = Router();

// POST /seed — Dev-only endpoint to populate game data
router.post("/seed", async (_req, res): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Seed not available in production" });
    return;
  }

  // Upsert monster species
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
