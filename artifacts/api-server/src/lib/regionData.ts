import type { InsertRegion } from "@workspace/db";

export const REGION_SEED_DATA: InsertRegion[] = [
  {
    id: "verdant-meadows",
    name: "Verdant Meadows",
    biome: "Meadow",
    description: "A lush park surrounded by ancient trees. The main gathering ground for new myth hunters.",
    requiredExplorerLevel: 1,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Nature C
      "leaflet", "sprouti", "brambix", "cloverit", "fernkit",
      // Nature B
      "bloombo", "fernix", "grasspin",
      // Nature A
      "leafenix", "wildbud",
      // Nature S
      "verdantis",
    ],
  },
  {
    id: "volcanic-rift",
    name: "Volcanic Rift",
    biome: "Volcano",
    description: "Scorched rock, lava vents, and eternal heat. Fire myths thrive here.",
    requiredExplorerLevel: 5,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Fire C
      "ashquill", "flarelynx",
      // Fire B / A / S
      "flamewing", "magmahorn", "pyredrake",
    ],
  },
  {
    id: "scorched-wastes",
    name: "Scorched Wastes",
    biome: "Wasteland",
    description: "Ancient lava fields cooled to obsidian flatlands. Rare fire myths roam here.",
    requiredExplorerLevel: 10,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Fire C
      "ashquill", "flarelynx",
      // Fire B / A / S
      "flamewing", "magmahorn", "pyredrake",
    ],
  },
  {
    id: "ocean-ruins",
    name: "Ocean Ruins",
    biome: "Coastal",
    description: "A sunken ancient city at the ocean's edge. Tides wash over crumbling monuments.",
    requiredExplorerLevel: 5,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Water C
      "puddleo", "droppi", "fintee", "splashy", "ripplowl", "tinwave",
      // Water B
      "shellion", "wavenix", "bubblio",
      // Water A
      "coralux", "tidalor",
      // Water S
      "aquarion",
    ],
  },
  {
    id: "deep-current",
    name: "Deep Current",
    biome: "Ocean Trench",
    description: "The deep ocean floor where sunlight never reaches. Ancient water myths dwell here.",
    requiredExplorerLevel: 15,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Water C
      "puddleo", "fintee", "octazur", "tinwave", "driplet",
      // Water B
      "wavenix", "nereel", "glaciero", "kelpheon",
      // Water A
      "marinel", "hydralisk",
      // Water S
      "leviaqua",
    ],
  },
  {
    id: "ancient-forest",
    name: "Ancient Forest",
    biome: "Forest",
    description: "A forest where every tree is older than recorded civilization. Something watches.",
    requiredExplorerLevel: 10,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Nature C
      "leaflet", "buddle", "mossy", "twiglet",
      // Nature B
      "vinegor", "thornbel", "seedleaf",
      // Nature A
      "mossfern", "rootora", "wildbud",
      // Nature S
      "florazar",
    ],
  },
  {
    id: "thunder-valley",
    name: "Thunder Valley",
    biome: "Storm Plains",
    description: "Lightning strikes the earth thousands of times per day. Electric myths evolved here.",
    requiredExplorerLevel: 8,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Electric C
      "zaplet", "zipbee", "boltin", "sparkit", "charglet", "voltspark",
      // Electric B
      "shockip", "elekio", "statichu",
      // Electric A
      "thundkit",
      // Electric S
      "voltiger",
    ],
  },
  {
    id: "storm-peaks",
    name: "Storm Peaks",
    biome: "Mountain Storm",
    description: "Mountain peaks permanently wrapped in electrical storms. The most powerful electric myths dwell at the summit.",
    requiredExplorerLevel: 18,
    width: 45,
    height: 45,
    monsterSpeciesIds: [
      // Electric C
      "zaplet", "electrix", "wattspy",
      // Electric B
      "voltyk", "amphare", "joltoll", "statichu",
      // Electric A
      "sparko", "lumirae", "chargeon",
      // Electric S
      "zapdrix", "voltiger",
    ],
  },
  {
    id: "shadow-marsh",
    name: "Shadow Marsh",
    biome: "Dark Marsh",
    description: "Sunlight has never reached the marsh floor. Dark myths hunt in the permanent twilight.",
    requiredExplorerLevel: 8,
    width: 50,
    height: 50,
    monsterSpeciesIds: [
      // Dark C
      "darkit", "inko", "shadeek", "nyxie", "scuppi", "shadowpup",
      // Dark B
      "grimclaw", "spectrix", "eclipseer", "murkrowl",
      // Dark A
      "shadowlurk", "duskhowl", "voidraven",
      // Dark S
      "umbraeon",
    ],
  },
  {
    id: "void-realm",
    name: "Void Realm",
    biome: "Dimensional Rift",
    description: "A breach between dimensions where the most powerful dark myths phase in and out of existence.",
    requiredExplorerLevel: 20,
    width: 40,
    height: 40,
    monsterSpeciesIds: [
      // Dark C
      "darkit", "gloombat", "wispurr",
      // Dark B
      "nightfang", "dreadimp", "eclipseer",
      // Dark A
      "maligno", "voidraven",
      // Dark S
      "noctiris",
    ],
  },
];
