import type { MonsterSpecies } from "@workspace/db";

// Element effectiveness chart: attacker -> defender -> multiplier
// Catalogue v3 keeps the original balance while renaming:
// Nature → Earth, Electric → Storm, Dark → Shadow.
// Fire → Earth → Storm → Water → Fire
// Shadow disrupts fire+earth, is weak to water+storm, and is immune to itself.
const ELEMENT_CHART: Record<string, Record<string, number>> = {
  //          vs Fire  vs Water  vs Earth  vs Storm  vs Shadow
  Fire:   { Fire: 0.5, Water: 0.5, Earth: 2.0, Storm: 1.0, Shadow: 0.5 },
  Water:  { Fire: 2.0, Water: 0.5, Earth: 0.5, Storm: 0.5, Shadow: 1.5 },
  Earth:  { Fire: 0.5, Water: 1.0, Earth: 0.5, Storm: 2.0, Shadow: 0.5 },
  Storm:  { Fire: 0.5, Water: 2.0, Earth: 0.5, Storm: 0.5, Shadow: 1.5 },
  Shadow: { Fire: 1.5, Water: 0.5, Earth: 1.5, Storm: 0.5, Shadow: 0.0 },
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
  // Multiplier reduced from 10 → 2.5 so battles last ~4× longer (5-10 rounds typical)
  const base = ((attackPower * skillPower) / (defense + 50)) * 2.5;
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
    0: 0.34,  // Grass — slightly livelier exploration, still not every step
    1: 0.12,  // Path — occasional encounters
    2: 0,     // Tree — impassable
    3: 0,     // Pond — impassable
    4: 0.44,  // Flower — a modest bonus over ordinary grass
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

  // Weight by quality tier (C spawns most, S is ultra-rare)
  const rarityWeight: Record<string, number> = {
    // New quality tiers
    C: 50,
    B: 25,
    A: 8,
    S: 2,
    // Legacy fallbacks
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

/**
 * Rarity HP multipliers.  Raw baseHp values in the catalogue are intentionally
 * small "unit" numbers; the multiplier here turns them into real battle HP so
 * battles last a satisfying number of rounds:
 *
 *   C Lv.1  ≈ 200 HP  → ~5-8 rounds per side
 *   B Lv.1  ≈ 390 HP  → ~8-12 rounds per side
 *   A Lv.1  ≈ 585 HP  → ~10-15 rounds per side
 *   S Lv.1  ≈ 1000 HP → ~15-22 rounds per side (epic battles)
 *
 * Attack / defense / speed are NOT multiplied so damage values stay readable.
 */
const RARITY_HP_MULT: Record<string, number> = {
  C: 5,
  B: 6,
  A: 7.5,
  S: 10,
};

export function calculateWildStats(
  species: MonsterSpecies,
  level: number,
): { hp: number; attack: number; defense: number; speed: number } {
  const hpMult = RARITY_HP_MULT[species.rarity] ?? 5;
  const scale  = 1 + (level - 1) * 0.1;
  return {
    hp:      Math.round(species.baseHp * hpMult * scale),
    attack:  Math.round(species.baseAttack  * scale),
    defense: Math.round(species.baseDefense * scale),
    speed:   Math.round(species.baseSpeed   * scale),
  };
}

/** Exposed so auth.ts and any future service can apply the same scaling. */
export function rarityHpMult(rarity: string): number {
  return RARITY_HP_MULT[rarity] ?? 5;
}

const ORB_BONUS: Record<string, number> = {
  Prism:    1.0,   // C tier — baseline
  Luna:     1.6,   // B tier
  Aether:   2.5,   // A tier
  Void:     4.0,   // S tier — near-guaranteed on weakened myth
  // Legacy fallbacks
  Basic:    1.0,
  Explorer: 1.3,
  Hunter:   1.7,
  Elite:    2.2,
  Master:   3.0,
};

/**
 * Compute raw capture probability (0–1) for a given orb.
 * - hpFactor: 0.15 at full HP → 1.0 at 0 HP (steep; rewards weakening)
 * - levelPenalty: each level past 1 reduces odds by ~2.5% (Lv20 = 0.67×, Lv50 = 0.44×)
 * - shinyPenalty: 0.5× if the myth has a shiny variant
 */
function captureRaw(
  orbType: string,
  currentHp: number,
  maxHp: number,
  captureRate: number,
  wildLevel: number,
  shinyVariant: string | null,
): number {
  const hpFactor = 0.15 + 0.85 * (1 - currentHp / Math.max(1, maxHp));
  const levelPenalty = 1 / (1 + (wildLevel - 1) * 0.025);
  const shinyPenalty = shinyVariant ? 0.5 : 1;
  return (captureRate / 100) * (ORB_BONUS[orbType] ?? 1) * hpFactor * levelPenalty * shinyPenalty;
}

export function calculateCaptureChance(
  orbType: string,
  currentHp: number,
  maxHp: number,
  captureRate: number,
  shinyVariant: string | null,
  wildLevel: number = 1,
): boolean {
  return Math.random() < captureRaw(orbType, currentHp, maxHp, captureRate, wildLevel, shinyVariant);
}

/**
 * Returns capture % (0-95) for each orb type — used by the battle API
 * so the frontend can show live capture odds without guessing.
 */
export function getCaptureOdds(
  currentHp: number,
  maxHp: number,
  captureRate: number,
  wildLevel: number,
  shinyVariant: string | null,
): Record<string, number> {
  const orbs = ['Prism', 'Luna', 'Aether', 'Void'];
  const result: Record<string, number> = {};
  for (const orb of orbs) {
    const raw = captureRaw(orb, currentHp, maxHp, captureRate, wildLevel, shinyVariant);
    result[orb] = Math.min(95, Math.round(raw * 100));
  }
  return result;
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
