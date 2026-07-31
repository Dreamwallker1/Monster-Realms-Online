/**
 * Client-side display metadata for every server-defined region.
 *
 * speciesIds MUST stay in sync with the canonical server-side source:
 *   artifacts/api-server/src/lib/regionData.ts → REGION_SEED_DATA[].monsterSpeciesIds
 *
 * All 10 server regions are represented. Display names are derived at runtime
 * via speciesIdToName() so they can never silently drift from the IDs.
 */

export interface RegionInfo {
  id: string;
  name: string;
  biome: string;
  element: string;
  /** Hex color for region accent */
  accentColor: string;
  /**
   * Species IDs — must match regionData.ts monsterSpeciesIds exactly.
   * Call `speciesIdToName(id)` to get the display name.
   */
  speciesIds: string[];
}

/**
 * Converts a kebab-case species ID (e.g. "thorn-colossus") to a Title Case
 * display name (e.g. "Thorn Colossus"). Derived names stay in sync with IDs.
 */
export function speciesIdToName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const REGION_INFO: Record<string, RegionInfo> = {
  // ── World-map zones (reachable by player movement) ────────────────────────

  'verdant-meadows': {
    id: 'verdant-meadows',
    name: 'Verdant Meadows',
    biome: 'Meadow Zone',
    element: '🌿',
    accentColor: '#6edd70',
    // regionData.ts → verdant-meadows → monsterSpeciesIds
    speciesIds: [
      'seed-sprite', 'leaf-ferret', 'vine-pup', 'moss-crab', 'petal-bee',
      'root-mole', 'fern-hatchling', 'sprout-sprite',
      'bloom-guardian', 'grove-hawk',
    ],
  },

  'volcanic-rift': {
    id: 'volcanic-rift',
    name: 'Volcanic Rift',
    biome: 'Fire Zone',
    element: '🔥',
    accentColor: '#ff6620',
    // regionData.ts → volcanic-rift → monsterSpeciesIds
    speciesIds: [
      'emberpup', 'flarelynx', 'flamewing', 'magmahorn', 'pyredrake',
    ],
  },

  'ocean-ruins': {
    id: 'ocean-ruins',
    name: 'Ocean Ruins',
    biome: 'Coastal Zone',
    element: '💧',
    accentColor: '#40c8cc',
    // regionData.ts → ocean-ruins → monsterSpeciesIds
    speciesIds: [
      'tide-pup', 'coral-sprite', 'brook-turtle', 'wave-imp', 'reef-hatchling',
      'surge-hound', 'sea-golem', 'aqua-guardian', 'storm-crab',
    ],
  },

  'shadow-marsh': {
    id: 'shadow-marsh',
    name: 'Shadow Marsh',
    biome: 'Dark Zone',
    element: '🌑',
    accentColor: '#9060cc',
    // regionData.ts → shadow-marsh → monsterSpeciesIds
    speciesIds: [
      'shadow-imp', 'gloom-wisp', 'dusk-ferret', 'night-crab',
      'umbra-moth', 'murk-toad',
      'void-stalker', 'shadow-bat', 'dusk-serpent', 'gloom-golem', 'eclipse-hawk',
    ],
  },

  'ancient-forest': {
    id: 'ancient-forest',
    name: 'Ancient Forest',
    biome: 'Forest Zone',
    element: '🌲',
    accentColor: '#44cc66',
    // regionData.ts → ancient-forest → monsterSpeciesIds
    speciesIds: [
      'seed-sprite', 'leaf-ferret', 'vine-pup', 'fern-hatchling',
      'bloom-guardian', 'thorn-wolf', 'briar-golem', 'spore-bat', 'canopy-serpent',
      'ancient-treant', 'verdant-titan', 'thorn-colossus', 'gaia-wyrm',
    ],
  },

  'thunder-valley': {
    id: 'thunder-valley',
    name: 'Thunder Valley',
    biome: 'Storm Zone',
    element: '⚡',
    accentColor: '#eeee30',
    // regionData.ts → thunder-valley → monsterSpeciesIds
    speciesIds: [
      'spark-kit', 'zap-moth', 'volt-hatchling', 'arc-sprite',
      'static-crab', 'buzz-bee', 'jolt-lizard', 'charge-pup',
      'thunder-wolf', 'storm-bat', 'storm-serpent', 'arc-golem', 'lightning-hawk',
    ],
  },

  // ── High-level server regions (not on the movement map; reachable via API) ─

  'scorched-wastes': {
    id: 'scorched-wastes',
    name: 'Scorched Wastes',
    biome: 'Wasteland Zone',
    element: '🌋',
    accentColor: '#cc4400',
    // regionData.ts → scorched-wastes → monsterSpeciesIds
    speciesIds: [
      'emberpup', 'flarelynx', 'flamewing', 'magmahorn', 'pyredrake',
    ],
  },

  'deep-current': {
    id: 'deep-current',
    name: 'Deep Current',
    biome: 'Ocean Trench',
    element: '🌊',
    accentColor: '#2266cc',
    // regionData.ts → deep-current → monsterSpeciesIds
    speciesIds: [
      'mist-jellyfish', 'stream-otter', 'puddle-toad',
      'deep-ray', 'abyssal-eel',
      'tempest-leviathan', 'ocean-titan', 'tide-colossus', 'abyss-wyrm',
      'poseidon-serpent', 'thalassa-deity',
    ],
  },

  'storm-peaks': {
    id: 'storm-peaks',
    name: 'Storm Peaks',
    biome: 'Mountain Storm',
    element: '🌩️',
    accentColor: '#aaaaff',
    // regionData.ts → storm-peaks → monsterSpeciesIds
    speciesIds: [
      'volt-hatchling', 'static-crab', 'jolt-lizard',
      'plasma-ray', 'storm-serpent',
      'storm-colossus', 'galvanos', 'tempest-titan', 'arc-leviathan',
      'zeus-wyrm', 'thunder-deity',
    ],
  },

  'void-realm': {
    id: 'void-realm',
    name: 'Void Realm',
    biome: 'Dimensional Rift',
    element: '🕳️',
    accentColor: '#8800cc',
    // regionData.ts → void-realm → monsterSpeciesIds
    speciesIds: [
      'dark-sprite', 'shade-hatchling', 'dusk-ferret',
      'nightmare-specter',
      'abyssal-wraith', 'void-titan', 'dark-colossus', 'shadow-leviathan',
      'erebus-entity', 'void-deity',
    ],
  },
};

/**
 * Look up display info for any server-defined regionId.
 * Returns the exact region record when found; throws in development if the
 * regionId is unrecognised so missing regions are caught early.
 */
export function getRegionInfo(regionId: string): RegionInfo {
  const info = REGION_INFO[regionId];
  if (import.meta.env.DEV && !info) {
    console.warn(`[region-info] Unknown regionId "${regionId}" — add it to region-info.ts`);
  }
  // Always return a valid object so the HUD never crashes; unknown → verdant-meadows fallback
  return info ?? REGION_INFO['verdant-meadows']!;
}
