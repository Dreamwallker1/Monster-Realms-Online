import { db } from "@workspace/db";
import {
  monsterSpeciesTable,
  regionsTable,
  capturedMonstersTable,
  battlesTable,
} from "@workspace/db";
import { MONSTER_SEED_DATA } from "./monsterData.js";
import { REGION_SEED_DATA } from "./regionData.js";
import { logger } from "./logger.js";

/**
 * Called once at server startup.
 *
 * Compares the DB species and region counts against the catalogue constants.
 * - Counts match → log confirmation and return (nothing to do).
 * - Counts differ → inside a single transaction:
 *     1. Delete battles, captured_monsters, species, regions (FK order).
 *     2. Re-insert all species and regions fresh.
 *   This guarantees one restart fully resolves stale data so subsequent
 *   restarts see matching counts and skip the reseed entirely.
 *
 * Logs a WARN for any unexpected error so the process keeps running
 * (a seed failure must not crash the server).
 */
export async function seedOnStartup(): Promise<void> {
  try {
    const [regionRows, speciesRows] = await Promise.all([
      db.select().from(regionsTable),
      db.select().from(monsterSpeciesTable),
    ]);

    const expectedSpecies = MONSTER_SEED_DATA.length;
    const expectedRegions = REGION_SEED_DATA.length;
    const actualSpecies   = speciesRows.length;
    const actualRegions   = regionRows.length;

    const speciesMismatch = actualSpecies !== expectedSpecies;
    const regionsMismatch = actualRegions !== expectedRegions;

    if (!speciesMismatch && !regionsMismatch) {
      logger.info(
        { regions: actualRegions, species: actualSpecies },
        "Startup seed check passed — tables already populated",
      );
      return;
    }

    // Log what triggered the re-seed
    if (speciesMismatch) {
      logger.warn(
        { dbSpecies: actualSpecies, expectedSpecies },
        "⚠️  Species count mismatch — catalogue has changed. Auto-reseeding now…",
      );
    }
    if (regionsMismatch) {
      logger.warn(
        { dbRegions: actualRegions, expectedRegions },
        "⚠️  Region count mismatch — auto-reseeding now…",
      );
    }

    // Run the full wipe + re-insert inside a single transaction so a partial
    // failure cannot leave the DB in a mixed state, and so subsequent restarts
    // see consistent counts and skip this block entirely.
    await db.transaction(async (tx) => {
      // Delete in FK-safe order:
      //   battles → captured_monsters → monster_species → regions
      await tx.delete(battlesTable);
      await tx.delete(capturedMonstersTable);
      await tx.delete(monsterSpeciesTable);
      await tx.delete(regionsTable); // must come after species (regions are standalone but clear stale rows)

      // Insert all species fresh
      for (const monster of MONSTER_SEED_DATA) {
        await tx
          .insert(monsterSpeciesTable)
          .values(monster)
          .onConflictDoUpdate({
            target: monsterSpeciesTable.id,
            set: {
              name:        monster.name,
              element:     monster.element,
              rarity:      monster.rarity,
              baseHp:      monster.baseHp,
              baseAttack:  monster.baseAttack,
              baseDefense: monster.baseDefense,
              baseSpeed:   monster.baseSpeed,
              description: monster.description,
              lore:        monster.lore,
              captureRate: monster.captureRate,
              skills:      monster.skills,
              regionIds:   monster.regionIds,
            },
          });
      }

      // Insert all regions fresh
      for (const region of REGION_SEED_DATA) {
        await tx
          .insert(regionsTable)
          .values(region)
          .onConflictDoUpdate({
            target: regionsTable.id,
            set: {
              name:              region.name,
              biome:             region.biome,
              description:       region.description,
              monsterSpeciesIds: region.monsterSpeciesIds,
            },
          });
      }
    });

    logger.info(
      { regions: REGION_SEED_DATA.length, species: MONSTER_SEED_DATA.length },
      `Auto-reseeded ${MONSTER_SEED_DATA.length} species and ${REGION_SEED_DATA.length} regions — game data is ready`,
    );
  } catch (err) {
    logger.warn(
      { err },
      "⚠️  Startup seed check failed — encounters may not work until the database is seeded manually via POST /api/seed",
    );
  }
}
