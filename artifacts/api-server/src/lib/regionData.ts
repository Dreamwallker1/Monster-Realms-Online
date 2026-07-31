import type { InsertRegion } from "@workspace/db";

const FIRE_MYTHS = ["ashquill", "flarelynx"];

export const REGION_SEED_DATA: InsertRegion[] = [
  { id: "verdant-meadows", name: "Verdant Meadows", biome: "Meadow", description: "A lush park surrounded by ancient trees.", requiredExplorerLevel: 1, width: 50, height: 50, monsterSpeciesIds: [] },
  { id: "volcanic-rift", name: "Volcanic Rift", biome: "Volcano", description: "Scorched rock, lava vents, and eternal heat. Fire myths thrive here.", requiredExplorerLevel: 5, width: 50, height: 50, monsterSpeciesIds: FIRE_MYTHS },
  { id: "scorched-wastes", name: "Scorched Wastes", biome: "Wasteland", description: "Ancient lava fields cooled to obsidian flatlands.", requiredExplorerLevel: 10, width: 50, height: 50, monsterSpeciesIds: FIRE_MYTHS },
  { id: "ocean-ruins", name: "Ocean Ruins", biome: "Coastal", description: "A sunken ancient city at the ocean's edge.", requiredExplorerLevel: 5, width: 50, height: 50, monsterSpeciesIds: [] },
  { id: "deep-current", name: "Deep Current", biome: "Ocean Trench", description: "The deep ocean floor where sunlight never reaches.", requiredExplorerLevel: 15, width: 50, height: 50, monsterSpeciesIds: [] },
  { id: "ancient-forest", name: "Ancient Forest", biome: "Forest", description: "A forest where every tree is older than recorded civilization.", requiredExplorerLevel: 10, width: 50, height: 50, monsterSpeciesIds: [] },
  { id: "thunder-valley", name: "Thunder Valley", biome: "Storm Plains", description: "Lightning strikes the earth thousands of times per day.", requiredExplorerLevel: 8, width: 50, height: 50, monsterSpeciesIds: [] },
  { id: "storm-peaks", name: "Storm Peaks", biome: "Mountain Storm", description: "Mountain peaks permanently wrapped in electrical storms.", requiredExplorerLevel: 18, width: 45, height: 45, monsterSpeciesIds: [] },
  { id: "shadow-marsh", name: "Shadow Marsh", biome: "Dark Marsh", description: "Sunlight has never reached the marsh floor.", requiredExplorerLevel: 8, width: 50, height: 50, monsterSpeciesIds: [] },
  { id: "void-realm", name: "Void Realm", biome: "Dimensional Rift", description: "A breach between dimensions.", requiredExplorerLevel: 20, width: 40, height: 40, monsterSpeciesIds: [] },
];
