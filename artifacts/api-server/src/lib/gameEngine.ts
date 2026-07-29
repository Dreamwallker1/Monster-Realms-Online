import type { MonsterSpecies } from "@workspace/db";

// Element effectiveness chart: attacker -> defender -> multiplier
const ELEMENT_CHART: Record<string, Record<string, number>> = {
  Fire: { Nature: 2, Ice: 2, Metal: 1.5, Water: 0.5, Earth: 0.5, Fire: 0.5 },
  Water: { Fire: 2, Earth: 2, Dark: 1.5, Nature: 0.5, Water: 0.5, Electric: 0.5 },
  Nature: { Water: 2, Earth: 2, Dark: 1.5, Fire: 0.5, Nature: 0.5, Ice: 0.5 },
  Electric: { Water: 2, Air: 2, Metal: 1.5, Earth: 0.5, Electric: 0.5 },
  Ice: { Nature: 2, Air: 2, Crystal: 1.5, Fire: 0.5, Water: 0.5, Ice: 0.5 },
  Earth: { Fire: 2, Electric: 2, Metal: 1.5, Nature: 0.5, Earth: 0.5 },
  Air: { Nature: 2, Dark: 2, Earth: 1.5, Electric: 0.5, Air: 0.5 },
  Light: { Dark: 2.5, Void: 2, Air: 1.5, Light: 0 },
  Dark: { Light: 2.5, Crystal: 2, Water: 1.5, Dark: 0 },
  Metal: { Ice: 2, Crystal: 2, Air: 1.5, Fire: 0.5, Metal: 0.5 },
  Crystal: { Light: 2, Earth: 2, Metal: 1.5, Dark: 0.5, Crystal: 0.5 },
  Void: { Light: 2, Crystal: 2, Nature: 1.5, Void: 0 },
};

export function getElementMultiplier(
  attackerElement: string,
  defenderElement: string,
): number {
  return ELEMENT_CHART[attackerElement]?.[defenderElement] ?? 1;
}

export function calculateDamage(
  attackPower: number,
  defense: number,
  skillPower: number,
  elementMultiplier: number,
  isCritical: boolean,
): number {
  const base = ((attackPower * skillPower) / (defense + 50)) * 10;
  const randomFactor = 0.85 + Math.random() * 0.3;
  const critical = isCritical ? 1.5 : 1;
  return Math.max(1, Math.round(base * elementMultiplier * randomFactor * critical));
}

export function rollCritical(): boolean {
  return Math.random() < 0.1; // 10% crit chance
}

export function rollEncounter(tileType: number): boolean {
  // Tile types match terrain.ts: 0=Grass, 1=Path, 2=Tree, 3=Pond, 4=Flower, 5=Building
  const rates: Record<number, number> = {
    0: 0.30,  // Grass — main monster zone (1 in 3 steps)
    1: 0.12,  // Path — occasional encounters
    2: 0,     // Tree — impassable
    3: 0,     // Pond — impassable
    4: 0.40,  // Flower — flower beds attract rare monsters (2 in 5 steps)
    5: 0,     // Building — impassable
  };
  return Math.random() < (rates[tileType] ?? 0.20);
}

export function selectWildMonster(
  regionMonsterIds: string[],
  allSpecies: MonsterSpecies[],
): MonsterSpecies | null {
  if (!regionMonsterIds.length) return null;
  const speciesMap = new Map(allSpecies.map((s) => [s.id, s]));

  // Weight by rarity (common spawns more)
  const rarityWeight: Record<string, number> = {
    Common: 40,
    Uncommon: 25,
    Rare: 15,
    Epic: 8,
    Legendary: 5,
    Mythic: 3,
    Ancient: 2,
    Celestial: 1.5,
    Void: 0.5,
  };

  const candidates = regionMonsterIds
    .map((id) => speciesMap.get(id))
    .filter(Boolean) as MonsterSpecies[];

  const totalWeight = candidates.reduce(
    (sum, s) => sum + (rarityWeight[s.rarity] ?? 5),
    0,
  );

  let roll = Math.random() * totalWeight;
  for (const species of candidates) {
    roll -= rarityWeight[species.rarity] ?? 5;
    if (roll <= 0) return species;
  }
  return candidates[0] ?? null;
}

export function rollShinyVariant(): string | null {
  const roll = Math.random();
  if (roll < 0.001) return "Prismatic";
  if (roll < 0.003) return "Galaxy";
  if (roll < 0.006) return "Shadow";
  if (roll < 0.01) return "Crystal";
  if (roll < 0.02) return "Golden";
  return null;
}

export function calculateWildStats(
  species: MonsterSpecies,
  level: number,
): { hp: number; attack: number; defense: number; speed: number } {
  const scale = 1 + (level - 1) * 0.1;
  return {
    hp: Math.round(species.baseHp * scale),
    attack: Math.round(species.baseAttack * scale),
    defense: Math.round(species.baseDefense * scale),
    speed: Math.round(species.baseSpeed * scale),
  };
}

export function calculateCaptureChance(
  orbType: string,
  currentHp: number,
  maxHp: number,
  captureRate: number,
  shinyVariant: string | null,
): boolean {
  const orbBonus: Record<string, number> = {
    Basic: 1,
    Explorer: 1.3,
    Hunter: 1.7,
    Elite: 2.2,
    Master: 3,
    Celestial: 4,
    Infinity: 6,
  };
  const hpFactor = (maxHp - currentHp * 0.5) / maxHp; // lower HP → easier capture
  const baseChance = (captureRate / 100) * (orbBonus[orbType] ?? 1) * hpFactor;
  const shinyPenalty = shinyVariant ? 0.5 : 1;
  return Math.random() < baseChance * shinyPenalty;
}

export function getExplorerRankForLevel(level: number): string {
  if (level >= 50) return "Legend Explorer";
  if (level >= 30) return "Master Explorer";
  if (level >= 20) return "Veteran";
  if (level >= 10) return "Hunter";
  if (level >= 5) return "Explorer";
  if (level >= 3) return "Scout";
  return "Novice";
}

export function xpForNextLevel(level: number): number {
  return level * 100;
}

export function wildMonsterLevel(
  requiredExplorerLevel: number,
  playerLevel: number,
): number {
  const base = Math.max(1, Math.floor(requiredExplorerLevel * 0.8));
  const variance = Math.floor(Math.random() * 6) - 2;
  return Math.max(1, Math.min(base + variance, playerLevel + 5));
}
