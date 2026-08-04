/**
 * Region info consistency tests (Myth Catalogue v3 migration, W4)
 *
 * Guards against the HUD listing myths that no longer exist: REGION_INFO
 * previously carried a third, independent set of legacy species IDs that
 * matched neither the server catalogue nor the region spawn pools.
 */

import { describe, it, expect } from 'vitest';
import { REGION_INFO, speciesIdToName } from '@/lib/region-info';

/**
 * The 25 live v3 species IDs — mirrors the canonical server catalogue
 * (artifacts/api-server/src/lib/monsterData.ts). If a myth is added or
 * renamed there, update this fixture too.
 */
const V3_SPECIES_IDS = new Set([
  // Fire
  'emberpup', 'cinderclaw', 'flamewing', 'magmahorn', 'pyredrake',
  // Water
  'bubblefin', 'wavecrest', 'tidalwing', 'deepfang', 'abyssalord',
  // Earth
  'pebbleback', 'thornbriar', 'graniteclaw', 'crystalhorn', 'terravast',
  // Storm
  'zappet', 'galecub', 'thunderwing', 'stormcrown', 'vortexwyrm',
  // Shadow
  'gloomite', 'veilpaw', 'duskfang', 'nightshade', 'voidreign',
]);

describe('REGION_INFO', () => {
  it('every region speciesIds entry is a live v3 species (no deleted legacy IDs)', () => {
    for (const [regionId, info] of Object.entries(REGION_INFO)) {
      for (const speciesId of info.speciesIds) {
        expect(
          V3_SPECIES_IDS.has(speciesId),
          `Region "${regionId}" lists unknown species "${speciesId}"`,
        ).toBe(true);
      }
    }
  });

  it('every region lists at least one species', () => {
    for (const [regionId, info] of Object.entries(REGION_INFO)) {
      expect(info.speciesIds.length, `Region "${regionId}" lists no species`).toBeGreaterThan(0);
    }
  });

  it('speciesIdToName produces readable names for all v3 IDs', () => {
    for (const id of V3_SPECIES_IDS) {
      const name = speciesIdToName(id);
      expect(name.length).toBeGreaterThan(0);
      expect(name[0]).toBe(name[0]!.toUpperCase());
    }
  });
});
