import { db } from "@workspace/db";
import { monsterSpeciesTable, regionsTable } from "@workspace/db";
import { MONSTER_SEED_DATA } from "./monsterData.js";
import { REGION_SEED_DATA } from "./regionData.js";
import { logger } from "./logger.js";

/**
 * Called once at server startup.
 *
 * - Counts rows in regionsTable and monsterSpeciesTable.
 * - If either table is empty, auto-seeds it and logs an info message.
 * - If both are already populated, logs a brief confirmation.
 * - Logs a WARN for any unexpected error so the process keeps running
 *   (a seed failure must not crash the server).
 */
export async function seedOnStartup(): Promise<void> {
  try {
    const [regionRows, speciesRows] = await Promise.all([
      db.select().from(regionsTable),
      db.select().from(monsterSpeciesTable),
    ]);

    const regionsEmpty = regionRows.length === 0;
    const speciesEmpty = speciesRows.length === 0;

    if (!regionsEmpty && !speciesEmpty) {
      logger.info(
        { regions: regionRows.length, species: speciesRows.length },
        "Startup seed check passed — tables already populated",
      );
      return;
    }

    if (regionsEmpty) {
      logger.warn(
        "⚠️  regionsTable is empty — encounters will fall back to static data until seeded. Auto-seeding now…",
      );
    }
    if (speciesEmpty) {
      logger.warn(
        "⚠️  monsterSpeciesTable is empty — encounters cannot trigger until seeded. Auto-seeding now…",
      );
    }

    // Seed species
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

    // Seed regions
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

    logger.info(
      { regions: REGION_SEED_DATA.length, species: MONSTER_SEED_DATA.length },
      "Auto-seed complete — game data is ready",
    );
  } catch (err) {
    logger.warn(
      { err },
      "⚠️  Startup seed check failed — encounters may not work until the database is seeded manually via POST /api/seed",
    );
  }
}
