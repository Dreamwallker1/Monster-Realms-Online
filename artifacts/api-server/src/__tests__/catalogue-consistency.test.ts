/**
 * Myth Catalogue v3 consistency tests (migration W1/W3/W4)
 *
 * Guards against the catalogue fragmentation bugs fixed in the v3 migration:
 * - Region spawn pools referencing deleted legacy species IDs (empty pools)
 * - Zod response schemas rejecting live elements (Storm/Shadow → 500s)
 * - Starter elements offering choices with zero live species (empty packs)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ListMonsterSpeciesResponseItem } from "@workspace/api-zod";
import { MONSTER_SEED_DATA } from "../lib/monsterData.js";
import { REGION_SEED_DATA } from "../lib/regionData.js";

// @workspace/db throws at import time without DATABASE_URL; the pg Pool is
// lazy so a placeholder is safe. Required before importing routes/auth.js.
process.env.DATABASE_URL ??= "postgresql://unused:unused@127.0.0.1:5432/unused";

const { STARTER_ELEMENTS } = await import("../routes/auth.js");

const LIVE_ELEMENTS = ["Fire", "Water", "Earth", "Storm", "Shadow"];
const speciesIds = new Set(MONSTER_SEED_DATA.map(m => m.id as string));
const regionIds = new Set(REGION_SEED_DATA.map(r => r.id));

describe("region spawn pools", () => {
  it("every pool entry exists in the v3 catalogue (no deleted legacy IDs)", () => {
    for (const region of REGION_SEED_DATA) {
      for (const id of region.monsterSpeciesIds) {
        assert.ok(
          speciesIds.has(id),
          `Region "${region.id}" references unknown species "${id}"`,
        );
      }
    }
  });

  it("every species regionIds entry is a real region", () => {
    for (const species of MONSTER_SEED_DATA) {
      for (const rid of species.regionIds ?? []) {
        assert.ok(
          regionIds.has(rid),
          `Species "${species.id}" references unknown region "${rid}"`,
        );
      }
    }
  });

  it("no region has an empty spawn pool", () => {
    for (const region of REGION_SEED_DATA) {
      assert.ok(
        region.monsterSpeciesIds.length > 0,
        `Region "${region.id}" has an empty spawn pool`,
      );
    }
  });
});

describe("elements", () => {
  it("the catalogue uses exactly the five live elements", () => {
    const catalogueElements = [...new Set(MONSTER_SEED_DATA.map(m => m.element))].sort();
    assert.deepEqual(catalogueElements, [...LIVE_ELEMENTS].sort());
  });

  it("starter elements match the live catalogue", () => {
    assert.deepEqual([...STARTER_ELEMENTS].sort(), [...LIVE_ELEMENTS].sort());
  });

  it("every starter element can fill a starter pack (C/B/A/S species exist)", () => {
    for (const element of STARTER_ELEMENTS) {
      const pool = MONSTER_SEED_DATA.filter(m => m.element === element);
      assert.ok(pool.length >= 4, `Element "${element}" has only ${pool.length} species`);
      for (const rarity of ["C", "B", "A", "S"]) {
        assert.ok(
          pool.some(m => m.rarity === rarity),
          `Element "${element}" has no ${rarity}-rarity species`,
        );
      }
    }
  });
});

describe("API schemas (Zod)", () => {
  it("every live v3 species parses through the species response schema", () => {
    for (const species of MONSTER_SEED_DATA) {
      const result = ListMonsterSpeciesResponseItem.safeParse(species);
      assert.ok(
        result.success,
        `Species "${species.id}" (${species.element}) rejected by schema: ${
          result.success ? "" : result.error.message
        }`,
      );
    }
  });

  it("legacy elements still parse (save compatibility for pre-v3 captures)", () => {
    const base = MONSTER_SEED_DATA[0]!;
    for (const legacyElement of ["Nature", "Electric", "Dark"]) {
      const legacySpecies = { ...base, id: `legacy-${legacyElement.toLowerCase()}`, element: legacyElement };
      const result = ListMonsterSpeciesResponseItem.safeParse(legacySpecies);
      assert.ok(
        result.success,
        `Legacy element "${legacyElement}" rejected by schema — breaks old saves`,
      );
    }
  });
});
