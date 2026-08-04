import { db } from "@workspace/db";
import {
  monsterSpeciesTable,
  regionsTable,
} from "@workspace/db";
import { MONSTER_SEED_DATA } from "./monsterData.js";
import { REGION_SEED_DATA } from "./regionData.js";
import { logger } from "./logger.js";

/**
 * Called once at server startup.
 *
 * Compares the DB species and region ID-sets against the catalogue constants.
 * Uses a deterministic content fingerprint (sorted ID list) — not just row
 * counts — so it detects catalogue swaps where totals are equal but species
 * differ.
 *
 * Regions are additionally fingerprinted by the *contents* of their
 * monsterSpeciesIds pools, so editing a spawn pool in regionData.ts (without
 * changing any region ID) still triggers a re-seed on existing databases.
 *
 * When a mismatch is found the function upserts all species and regions.
 * It NEVER deletes battles, captured_monsters, or any player-progress tables;
 * player collections are always preserved.
 *
 * Stale species rows (IDs no longer in the catalogue) are left in the DB as
 * inert data.  They will not appear in any region's spawn pool because they
 * are absent from every region's monsterSpeciesIds list.
 */

function catalogueFingerprint(ids: string[]): string {
  return [...ids].sort().join(",");
}

/**
 * Deterministic fingerprint of regions including their spawn-pool contents.
 * Sorted at both levels so row/array ordering never causes a spurious
 * mismatch (which would re-run the upsert on every boot).
 *
 * Exported for regression tests only.
 */
export function regionFingerprint(
  rows: Array<{ id: string; monsterSpeciesIds: string[] }>,
): string {
  return rows
    .map(r => `${r.id}:${[...r.monsterSpeciesIds].sort().join("|")}`)
    .sort()
    .join(",");
}

export async function seedOnStartup(): Promise<void> {
  try {
    const [regionRows, speciesRows] = await Promise.all([
      db
        .select({ id: regionsTable.id, monsterSpeciesIds: regionsTable.monsterSpeciesIds })
        .from(regionsTable),
      db.select({ id: monsterSpeciesTable.id }).from(monsterSpeciesTable),
    ]);

    const dbSpeciesFingerprint  = catalogueFingerprint(speciesRows.map(r => r.id));
    const dbRegionsFingerprint  = regionFingerprint(regionRows);
    const catSpeciesFingerprint = catalogueFingerprint(MONSTER_SEED_DATA.map(m => m.id as string));
    const catRegionsFingerprint = regionFingerprint(
      REGION_SEED_DATA.map(r => ({ id: r.id, monsterSpeciesIds: r.monsterSpeciesIds })),
    );

    const speciesMismatch = dbSpeciesFingerprint !== catSpeciesFingerprint;
    const regionsMismatch = dbRegionsFingerprint !== catRegionsFingerprint;

    if (!speciesMismatch && !regionsMismatch) {
      logger.info(
        { regions: regionRows.length, species: speciesRows.length },
        "Startup seed check passed — tables already populated",
      );
      return;
    }

    // Log what triggered the upsert
    if (speciesMismatch) {
      logger.warn(
        { dbSpecies: speciesRows.length, expectedSpecies: MONSTER_SEED_DATA.length },
        "⚠️  Species catalogue mismatch — upserting catalogue data now…",
      );
    }
    if (regionsMismatch) {
      logger.warn(
        { dbRegions: regionRows.length, expectedRegions: REGION_SEED_DATA.length },
        "⚠️  Region catalogue mismatch — upserting catalogue data now…",
      );
    }

    // Non-destructive upsert: update species and regions in place.
    // Player progress tables (battles, captured_monsters) are NEVER touched.
    await db.transaction(async (tx) => {
      // Upsert all species
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

      // Upsert all regions
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
      `Catalogue upsert complete — ${MONSTER_SEED_DATA.length} species and ${REGION_SEED_DATA.length} regions are up to date`,
    );
  } catch (err) {
    logger.warn(
      { err },
      "⚠️  Startup seed check failed — encounters may not work until the database is seeded manually via POST /api/seed",
    );
  }
}
