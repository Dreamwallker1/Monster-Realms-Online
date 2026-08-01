/**
 * Battle stat-update service
 *
 * Pure async functions that encode the stat-increment rules for battles.
 * Each function accepts a `StatUpdateDb` interface, making them fully
 * testable with a simple mock — no live database required.
 *
 * The route handler (`routes/battles.ts`) passes an adapter that wraps
 * the real Drizzle calls.
 */

// ---------------------------------------------------------------------------
// Database interface (minimal surface needed for stat updates)
// ---------------------------------------------------------------------------

export interface PlayerStatRow {
  battlesLost?: number | null;
  battlesWon?: number | null;
  monstersCaptured?: number | null;
  coins?: number | null;
}

export type PlayerStatUpdate = Partial<Record<keyof PlayerStatRow, number>>;

export interface OrbRow {
  id: string;
  quantity: number;
}

export interface CapturedMonsterInsert {
  playerId: string;
  speciesId: string;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  shinyVariant: string | null;
  personality: string;
  inTeam: boolean;
}

export interface StatUpdateDb {
  fetchPlayerStats(playerId: string): Promise<PlayerStatRow | undefined>;
  writePlayerStats(playerId: string, stats: PlayerStatUpdate): Promise<void>;
  fetchOrb(playerId: string, orbType: string): Promise<OrbRow | undefined>;
  writeOrbQuantity(orbRowId: string, quantity: number): Promise<void>;
  insertCapturedMonster(data: CapturedMonsterInsert): Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Exported service functions — the real production logic under test
// ---------------------------------------------------------------------------

/**
 * Increment battlesLost for a player.
 * Called when the player's active myth faints (attack path or switch-faint).
 */
export async function applyBattleLost(
  db: StatUpdateDb,
  playerId: string,
): Promise<void> {
  const p = await db.fetchPlayerStats(playerId);
  await db.writePlayerStats(playerId, {
    battlesLost: (p?.battlesLost ?? 0) + 1,
  });
}

/**
 * Increment battlesWon and award coins after defeating a wild myth.
 */
export async function applyBattleWon(
  db: StatUpdateDb,
  playerId: string,
  coinReward: number,
): Promise<void> {
  const p = await db.fetchPlayerStats(playerId);
  await db.writePlayerStats(playerId, {
    battlesWon: (p?.battlesWon ?? 0) + 1,
    coins: (p?.coins ?? 0) + coinReward,
  });
}

/**
 * Deduct one orb from the player's inventory.
 * Returns the original orb row if deduction succeeded, or null if the
 * player has no orbs of that type (caller should reject the action).
 * The orb is deducted whether or not the capture succeeds.
 */
export async function deductOrb(
  db: StatUpdateDb,
  playerId: string,
  orbType: string,
): Promise<OrbRow | null> {
  const orbRow = await db.fetchOrb(playerId, orbType);
  if (!orbRow || orbRow.quantity <= 0) return null;
  await db.writeOrbQuantity(orbRow.id, orbRow.quantity - 1);
  return orbRow;
}

/**
 * Persist a newly captured myth and increment the player's monstersCaptured counter.
 * Only called when the capture roll succeeds.
 */
export async function applySuccessfulCapture(
  db: StatUpdateDb,
  playerId: string,
  monsterData: CapturedMonsterInsert,
): Promise<{ id: string }> {
  const captured = await db.insertCapturedMonster(monsterData);
  const p = await db.fetchPlayerStats(playerId);
  await db.writePlayerStats(playerId, {
    monstersCaptured: (p?.monstersCaptured ?? 0) + 1,
  });
  return captured;
}
