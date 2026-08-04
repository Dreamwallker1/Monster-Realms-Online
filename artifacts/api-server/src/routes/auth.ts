import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { playersTable, inventoryItemsTable, capturedMonstersTable, monsterSpeciesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { generateToken, hashPassword, verifyPassword } from "../lib/auth.js";
import {
  GuestLoginBody,
  GuestLoginResponse,
  RegisterPlayerBody,
  RegisterPlayerResponse,
  LoginPlayerBody,
  LoginPlayerResponse,
  GetMeResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth.js";
import { rarityHpMult } from "../lib/gameEngine.js";

// ─── Starter pack helper ────────────────────────────────────────────────────

type StarterMythResult = {
  capturedId: string;
  speciesId: string;
  speciesName: string;
  element: string;
  rarity: string;
  level: number;
};

function calcStats(species: typeof monsterSpeciesTable.$inferSelect, level: number) {
  const hpMult = rarityHpMult(species.rarity);
  const scale  = 1 + (level - 1) * 0.1;
  return {
    hp:      Math.round(species.baseHp * hpMult * scale),
    attack:  Math.round(species.baseAttack  * scale),
    defense: Math.round(species.baseDefense * scale),
    speed:   Math.round(species.baseSpeed   * scale),
  };
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Weighted rarity roll for starter pack slots.
 *
 * Slot 0 (featured):  3% S, 17% A, 35% B, 45% C
 * Slot 1:             0% S, 15% A, 45% B, 40% C
 * Slot 2 & 3:         0% S,  0% A, 35% B, 65% C
 *
 * S tier used to be guaranteed for every new player — now it is a rare prize
 * (~3 in 100 players) that requires real dedication to obtain in normal play.
 */
function rollStarterRarity(slot: number): 'C' | 'B' | 'A' | 'S' {
  const r = Math.random();
  if (slot === 0) {
    if (r < 0.03)  return 'S';
    if (r < 0.20)  return 'A';
    if (r < 0.55)  return 'B';
    return 'C';
  }
  if (slot === 1) {
    if (r < 0.15)  return 'A';
    if (r < 0.60)  return 'B';
    return 'C';
  }
  // slots 2 & 3
  return r < 0.35 ? 'B' : 'C';
}

/**
 * Elements a new player may choose a starter from. Must match the live v3
 * catalogue (monsterData.ts) or the element query below returns zero species
 * and the player receives an empty starter pack. Exported for regression tests.
 */
export const STARTER_ELEMENTS = ['Fire', 'Water', 'Earth', 'Storm', 'Shadow'] as const;

async function grantStarterPack(playerId: string, element: string): Promise<StarterMythResult[]> {
  const chosenElement = (STARTER_ELEMENTS as readonly string[]).includes(element) ? element : 'Fire';

  // Fetch all species for the chosen element (one query instead of four)
  const allByElement = await db.select().from(monsterSpeciesTable)
    .where(eq(monsterSpeciesTable.element, chosenElement));

  // Also grab C-tier from all elements for slot 3 filler
  const allC = await db.select().from(monsterSpeciesTable)
    .where(eq(monsterSpeciesTable.rarity, 'C'));

  const STARTER_LEVELS: Record<string, number> = { S: 5, A: 3, B: 2, C: 1 };

  const picks: { species: typeof monsterSpeciesTable.$inferSelect; level: number; slot: number }[] = [];

  for (let slot = 0; slot < 4; slot++) {
    const rarity = rollStarterRarity(slot);
    // Prefer same-element pool; fall back to any-element for C on slot 3
    const pool = allByElement.filter(s => s.rarity === rarity);
    const fallback = allC.filter(s => s.element !== chosenElement); // off-element C for slot 3
    const source = pool.length ? pool : (slot === 3 ? fallback : allByElement);
    const species = pickRandom(source);
    if (species) {
      picks.push({ species, level: STARTER_LEVELS[rarity] ?? 1, slot });
    }
  }

  const results: StarterMythResult[] = [];
  for (const { species, level, slot } of picks) {
    const stats = calcStats(species, level);
    const [captured] = await db.insert(capturedMonstersTable).values({
      playerId,
      speciesId: species.id,
      level,
      currentHp: stats.hp,
      maxHp:     stats.hp,
      attack:    stats.attack,
      defense:   stats.defense,
      speed:     stats.speed,
      inTeam: true,
      teamSlot: slot,
    }).returning();
    if (captured) {
      results.push({
        capturedId: captured.id,
        speciesId:  species.id,
        speciesName: species.name,
        element:    species.element,
        rarity:     species.rarity,
        level,
      });
    }
  }

  return results;
}

const router: IRouter = Router();

// POST /auth/guest
router.post("/auth/guest", async (req, res): Promise<void> => {
  const parsed = GuestLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, avatarColor, starterElement } = parsed.data;

  // Check if username taken
  const existing = await db
    .select({ id: playersTable.id })
    .from(playersTable)
    .where(eq(playersTable.username, username));
  if (existing.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await hashPassword(`guest_${Date.now()}`);
  const [player] = await db
    .insert(playersTable)
    .values({
      username,
      passwordHash,
      isGuest: true,
      avatarColor: avatarColor ?? "#6c63ff",
    })
    .returning();

  // Give starter orbs + starter pack myths
  const [starterPack] = await Promise.all([
    starterElement ? grantStarterPack(player.id, starterElement) : Promise.resolve([]),
    db.insert(inventoryItemsTable).values([
      { playerId: player.id, name: "Prism Orb",  type: "orb", quantity: 5, description: "A shimmering orb that captures Common myths.",      orbType: "Prism"  },
      { playerId: player.id, name: "Luna Orb",   type: "orb", quantity: 3, description: "Moonlit energy for Uncommon myth capture.",           orbType: "Luna"   },
      { playerId: player.id, name: "Aether Orb", type: "orb", quantity: 2, description: "Rare elemental orb that bends reality.",              orbType: "Aether" },
      { playerId: player.id, name: "Void Orb",   type: "orb", quantity: 1, description: "A legendary orb that can capture any myth.",          orbType: "Void"   },
      { playerId: player.id, name: "Healing Herb", type: "heal", quantity: 3, description: "Restores 30 HP to one monster.", orbType: null },
    ]),
  ]);

  const token = generateToken(player.id);
  res.json(
    GuestLoginResponse.parse({
      token,
      player: formatPlayer(player),
      starterPack: starterPack ?? [],
    }),
  );
});

// POST /auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterPlayerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password, avatarColor, starterElement } = parsed.data;

  const existing = await db
    .select({ id: playersTable.id })
    .from(playersTable)
    .where(eq(playersTable.username, username));
  if (existing.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [player] = await db
    .insert(playersTable)
    .values({
      username,
      passwordHash,
      isGuest: false,
      avatarColor: avatarColor ?? "#6c63ff",
    })
    .returning();

  const [starterPack] = await Promise.all([
    starterElement ? grantStarterPack(player.id, starterElement) : Promise.resolve([]),
    db.insert(inventoryItemsTable).values([
      { playerId: player.id, name: "Prism Orb",  type: "orb", quantity: 5, description: "A shimmering orb that captures Common myths.",   orbType: "Prism"  },
      { playerId: player.id, name: "Luna Orb",   type: "orb", quantity: 3, description: "Moonlit energy for Uncommon myth capture.",        orbType: "Luna"   },
      { playerId: player.id, name: "Aether Orb", type: "orb", quantity: 2, description: "Rare elemental orb that bends reality.",           orbType: "Aether" },
      { playerId: player.id, name: "Void Orb",   type: "orb", quantity: 1, description: "A legendary orb that can capture any myth.",       orbType: "Void"   },
      { playerId: player.id, name: "Healing Herb", type: "heal", quantity: 3, description: "Restores 30 HP to one monster.", orbType: null },
    ]),
  ]);

  const token = generateToken(player.id);
  res.status(201).json(
    RegisterPlayerResponse.parse({
      token,
      player: formatPlayer(player),
      starterPack: starterPack ?? [],
    }),
  );
});

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginPlayerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.username, username));

  if (!player) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (player.isGuest) {
    res.status(401).json({ error: "Guest accounts cannot log in with password" });
    return;
  }

  const valid = await verifyPassword(password, player.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(player.id);
  res.json(
    LoginPlayerResponse.parse({
      token,
      player: formatPlayer(player),
    }),
  );
});

// GET /auth/me — also ticks energy regen (1 energy per 20 seconds of inactivity)
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, req.playerId!));

  if (!player) {
    res.status(401).json({ error: "Player not found" });
    return;
  }

  // Regen energy based on elapsed time since last update
  const elapsedMs = Date.now() - player.updatedAt.getTime();
  const regenPerMs = 1 / (20 * 1000); // 1 energy per 20 seconds
  const regenAmount = Math.floor(elapsedMs * regenPerMs);

  let updatedPlayer = player;
  if (regenAmount > 0 && player.energy < player.maxEnergy) {
    const newEnergy = Math.min(player.maxEnergy, player.energy + regenAmount);
    const [p] = await db
      .update(playersTable)
      .set({ energy: newEnergy })
      .where(eq(playersTable.id, player.id))
      .returning();
    if (p) updatedPlayer = p;
  }

  res.json(GetMeResponse.parse(formatPlayer(updatedPlayer)));
});

function formatPlayer(p: typeof playersTable.$inferSelect) {
  return {
    id: p.id,
    username: p.username,
    avatarColor: p.avatarColor,
    isGuest: p.isGuest,
    explorerRank: p.explorerRank,
    explorerXp: p.explorerXp,
    explorerLevel: p.explorerLevel,
    tilesExplored: p.tilesExplored,
    energy: p.energy,
    maxEnergy: p.maxEnergy,
    coins: p.coins,
    monstersDiscovered: p.monstersDiscovered,
    monstersCaptured: p.monstersCaptured,
    posX: p.posX,
    posY: p.posY,
    regionId: p.regionId ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

// POST /auth/gm-login — instant Game Master account (max level, max everything)
router.post("/auth/gm-login", async (_req, res): Promise<void> => {
  const GM_USERNAME = "GameMaster";
  const GM_COLOR   = "#ffd700"; // gold

  // ── 1. Upsert the GM player with maxed stats ─────────────────────────────
  let [player] = await db.select().from(playersTable).where(eq(playersTable.username, GM_USERNAME));

  const maxStats = {
    explorerLevel:      50,
    explorerXp:         999999,
    explorerRank:       "Mythic Master",
    tilesExplored:      9999,
    energy:             999,
    maxEnergy:          999,
    coins:              1000000,
    monstersDiscovered: 100,
    monstersCaptured:   100,
    pvpWins:            999,
    battlesWon:         999,
    secretsFound:       99,
    firstDiscoveries:   50,
  };

  if (player) {
    const [updated] = await db
      .update(playersTable)
      .set(maxStats)
      .where(eq(playersTable.id, player.id))
      .returning();
    if (updated) player = updated;
  } else {
    const passwordHash = await hashPassword("gm_master_secret_" + Date.now());
    const [inserted] = await db
      .insert(playersTable)
      .values({ username: GM_USERNAME, passwordHash, isGuest: false, avatarColor: GM_COLOR, ...maxStats })
      .returning();
    if (!inserted) { res.status(500).json({ error: "Failed to create GM player" }); return; }
    player = inserted;
  }

  // ── 2. Reset inventory — 999 of everything ───────────────────────────────
  await db.delete(inventoryItemsTable).where(eq(inventoryItemsTable.playerId, player.id));
  await db.insert(inventoryItemsTable).values([
    { playerId: player.id, name: "Void Orb",      type: "orb",  quantity: 999, description: "A legendary orb that can capture any myth.",     orbType: "Void"   },
    { playerId: player.id, name: "Aether Orb",    type: "orb",  quantity: 999, description: "Rare elemental orb that bends reality.",          orbType: "Aether" },
    { playerId: player.id, name: "Luna Orb",       type: "orb",  quantity: 999, description: "Moonlit energy for Uncommon myth capture.",       orbType: "Luna"   },
    { playerId: player.id, name: "Prism Orb",      type: "orb",  quantity: 999, description: "A shimmering orb that captures Common myths.",    orbType: "Prism"  },
    { playerId: player.id, name: "Healing Herb",   type: "heal", quantity: 999, description: "Restores 30 HP to one monster.",                  orbType: null     },
  ]);

  // ── 3. Build GM collection — all 100 myths, best S-tier in active team ──
  await db.delete(capturedMonstersTable).where(eq(capturedMonstersTable.playerId, player.id));

  const allSpecies = await db.select().from(monsterSpeciesTable);

  const ELEMENTS = STARTER_ELEMENTS;
  const sTierSpecies = allSpecies.filter(s => s.rarity === "S");

  // Pick one S-tier per element for the active team (slots 0-5)
  const teamPicks: typeof allSpecies = [];
  for (const el of ELEMENTS) {
    const match = sTierSpecies.find(s => s.element === el);
    if (match) teamPicks.push(match);
    if (teamPicks.length >= 6) break;
  }
  let fillIdx = 0;
  while (teamPicks.length < 6 && sTierSpecies.length > 0) {
    teamPicks.push(sTierSpecies[fillIdx % sTierSpecies.length]!);
    fillIdx++;
  }
  const teamSpeciesIds = new Set(teamPicks.map(s => s.id));

  const GM_LEVEL = 50;

  // All species not in the active team go into the collection (inTeam: false)
  const collectionSpecies = allSpecies.filter(s => !teamSpeciesIds.has(s.id));

  const allInserts = [
    ...teamPicks.slice(0, 6).map((species, slot) => {
      const stats = calcStats(species, GM_LEVEL);
      return {
        playerId:  player.id,
        speciesId: species.id,
        level:     GM_LEVEL,
        currentHp: stats.hp,
        maxHp:     stats.hp,
        attack:    stats.attack,
        defense:   stats.defense,
        speed:     stats.speed,
        inTeam:    true,
        teamSlot:  slot,
      };
    }),
    ...collectionSpecies.map((species) => {
      const stats = calcStats(species, GM_LEVEL);
      return {
        playerId:  player.id,
        speciesId: species.id,
        level:     GM_LEVEL,
        currentHp: stats.hp,
        maxHp:     stats.hp,
        attack:    stats.attack,
        defense:   stats.defense,
        speed:     stats.speed,
        inTeam:    false,
        teamSlot:  null as number | null,
      };
    }),
  ];

  if (allInserts.length > 0) await db.insert(capturedMonstersTable).values(allInserts);

  // ── 4. Return token + player ─────────────────────────────────────────────
  const token = generateToken(player.id);
  res.json({ token, player: formatPlayer(player) });
});

export { formatPlayer };
export default router;
