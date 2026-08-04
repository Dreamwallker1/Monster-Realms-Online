import type { InsertRegion } from "@workspace/db";
import { MONSTER_SEED_DATA } from "./monsterData.js";

/**
 * Spawn pool for a region, derived from the canonical v3 catalogue
 * (MONSTER_SEED_DATA[].regionIds). Single source of truth: adding or moving
 * a myth in monsterData.ts automatically updates the region pools, so the
 * two files can never drift apart again.
 */
function poolFor(regionId: string): string[] {
  return MONSTER_SEED_DATA
    .filter(m => (m.regionIds ?? []).includes(regionId))
    .map(m => m.id as string);
}

export const REGION_SEED_DATA: InsertRegion[] = [
  {
    id: "verdant-meadows",
    name: "Verdant Meadows",
    biome: "Meadow",
    description: "A lush park surrounded by ancient trees. The main gathering ground for new myth hunters.",
    requiredExplorerLevel: 1,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("verdant-meadows"),
  },
  {
    id: "volcanic-rift",
    name: "Volcanic Rift",
    biome: "Volcano",
    description: "Scorched rock, lava vents, and eternal heat. Fire myths thrive here.",
    requiredExplorerLevel: 5,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("volcanic-rift"),
  },
  {
    id: "scorched-wastes",
    name: "Scorched Wastes",
    biome: "Wasteland",
    description: "Ancient lava fields cooled to obsidian flatlands. Rare fire myths roam here.",
    requiredExplorerLevel: 10,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("scorched-wastes"),
  },
  {
    id: "ocean-ruins",
    name: "Ocean Ruins",
    biome: "Coastal",
    description: "A sunken ancient city at the ocean's edge. Tides wash over crumbling monuments.",
    requiredExplorerLevel: 5,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("ocean-ruins"),
  },
  {
    id: "deep-current",
    name: "Deep Current",
    biome: "Ocean Trench",
    description: "The deep ocean floor where sunlight never reaches. Ancient water myths dwell here.",
    requiredExplorerLevel: 15,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("deep-current"),
  },
  {
    id: "ancient-forest",
    name: "Ancient Forest",
    biome: "Forest",
    description: "A forest where every tree is older than recorded civilization. Something watches.",
    requiredExplorerLevel: 10,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("ancient-forest"),
  },
  {
    id: "thunder-valley",
    name: "Thunder Valley",
    biome: "Storm Plains",
    description: "Lightning strikes the earth thousands of times per day. Electric myths evolved here.",
    requiredExplorerLevel: 8,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("thunder-valley"),
  },
  {
    id: "storm-peaks",
    name: "Storm Peaks",
    biome: "Mountain Storm",
    description: "Mountain peaks permanently wrapped in electrical storms. The most powerful electric myths dwell at the summit.",
    requiredExplorerLevel: 18,
    width: 45,
    height: 45,
    monsterSpeciesIds: poolFor("storm-peaks"),
  },
  {
    id: "shadow-marsh",
    name: "Shadow Marsh",
    biome: "Dark Marsh",
    description: "Sunlight has never reached the marsh floor. Dark myths hunt in the permanent twilight.",
    requiredExplorerLevel: 8,
    width: 50,
    height: 50,
    monsterSpeciesIds: poolFor("shadow-marsh"),
  },
  {
    id: "void-realm",
    name: "Void Realm",
    biome: "Dimensional Rift",
    description: "A breach between dimensions where the most powerful dark myths phase in and out of existence.",
    requiredExplorerLevel: 20,
    width: 40,
    height: 40,
    monsterSpeciesIds: poolFor("void-realm"),
  },
];
