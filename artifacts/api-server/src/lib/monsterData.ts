import type { InsertMonsterSpecies } from "@workspace/db";

// Active Litardia catalogue. New Myths are added here one at a time.
export const MONSTER_SEED_DATA: InsertMonsterSpecies[] = [
  {
    id: "ashquill", name: "Ashquill", element: "Fire", rarity: "C",
    baseHp: 44, baseAttack: 43, baseDefense: 32, baseSpeed: 53,
    description: "A lean ash-born raptor whose ragged feathers ignite when it spreads its wings.",
    lore: "Ashquills hatch inside cooling volcanic craters. They cannot yet rise from death like the legendary firebirds of old, but every wound hardens their feathers into darker, sharper armor.",
    personality: "Defiant", weight: 5.6, height: 0.68, captureRate: 88,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Searing Peck", type: "normal", element: "Fire", power: 42, accuracy: 97, description: "Darts forward and drives its heated obsidian beak into the target." },
      { name: "Ashen Gust", type: "skill1", element: "Fire", power: 62, accuracy: 90, description: "Beats its ragged wings to launch a cutting cloud of hot ash and ember shards." },
      { name: "Last Spark", type: "ultimate", element: "Fire", power: 125, accuracy: 75, description: "Consumes the fire in its tail to become a black-red comet for one desperate strike." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },
  {
    id: "flarelynx", name: "Flarelynx", element: "Fire", rarity: "C",
    baseHp: 46, baseAttack: 48, baseDefense: 38, baseSpeed: 52,
    description: "A young volcanic lynx whose magma-cracked paws ignite the instant it senses danger.",
    lore: "A Flarelynx bonds with only one hunter. It waits in disciplined silence beside its chosen partner, but the stone mantle along its back glows red whenever a threat draws near.",
    personality: "Loyal", weight: 9.4, height: 0.62, captureRate: 85,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Twinflare Claw", type: "normal", element: "Fire", power: 44, accuracy: 96, description: "Slashes left then right, launching two claw-shaped waves of fire that briefly ignite the target." },
      { name: "Magma Pounce", type: "skill1", element: "Fire", power: 64, accuracy: 89, description: "Launches from a low stance and crashes into the target with magma-lit paws." },
      { name: "Blazing Tailspin", type: "ultimate", element: "Fire", power: 128, accuracy: 73, description: "Whips its furnace tail into a controlled firestorm of flame and volcanic shards." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },
];
