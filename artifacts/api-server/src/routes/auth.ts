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
  const scale = 1 + (level - 1) * 0.1;
  return {
    hp: Math.round(species.baseHp * scale),
    attack: Math.round(species.baseAttack * scale),
    defense: Math.round(species.baseDefense * scale),
    speed: Math.round(species.baseSpeed * scale),
  };
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

async function grantStarterPack(playerId: string, element: string): Promise<StarterMythResult[]> {
  const VALID_ELEMENTS = ['Fire', 'Water', 'Nature', 'Electric', 'Dark'];
  const chosenElement = VALID_ELEMENTS.includes(element) ? element : 'Nature';

  // Fetch candidate myths
  const [aTier, bTier, cTierAll, sTier] = await Promise.all([
    db.select().from(monsterSpeciesTable).where(and(eq(monsterSpeciesTable.element, chosenElement), eq(monsterSpeciesTable.rarity, 'A'))),
    db.select().from(monsterSpeciesTable).where(and(eq(monsterSpeciesTable.element, chosenElement), eq(monsterSpeciesTable.rarity, 'B'))),
    db.select().from(monsterSpeciesTable).where(eq(monsterSpeciesTable.rarity, 'C')),
    db.select().from(monsterSpeciesTable).where(and(eq(monsterSpeciesTable.element, chosenElement), eq(monsterSpeciesTable.rarity, 'S'))),
  ]);

  const picks: { species: typeof monsterSpeciesTable.$inferSelect; level: number; slot: number }[] = [];

  const specA = pickRandom(aTier);
  if (specA) picks.push({ species: specA, level: 5, slot: 0 });

  const specB = pickRandom(bTier);
  if (specB) picks.push({ species: specB, level: 3, slot: 1 });

  const specC = pickRandom(cTierAll);
  if (specC) picks.push({ species: specC, level: 1, slot: 2 });

  // 1% S-tier surprise
  const gotS = Math.random() < 0.01;
  if (gotS) {
    const specS = pickRandom(sTier);
    if (specS) picks.push({ species: specS, level: 1, slot: 3 });
  }

  const results: StarterMythResult[] = [];
  for (const { species, level, slot } of picks) {
    const stats = calcStats(species, level);
    const [captured] = await db.insert(capturedMonstersTable).values({
      playerId,
      speciesId: species.id,
      level,
      currentHp: stats.hp,
      maxHp: stats.hp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      inTeam: true,
      teamSlot: slot,
    }).returning();
    if (captured) {
      results.push({
        capturedId: captured.id,
        speciesId: species.id,
        speciesName: species.name,
        element: species.element,
        rarity: species.rarity,
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
      {
        playerId: player.id,
        name: "Basic Orb",
        type: "orb",
        quantity: 10,
        description: "A basic capture orb. Works best on Common monsters.",
        orbType: "Basic",
      },
      {
        playerId: player.id,
        name: "Healing Herb",
        type: "heal",
        quantity: 3,
        description: "Restores 30 HP to one monster.",
        orbType: null,
      },
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
      {
        playerId: player.id,
        name: "Basic Orb",
        type: "orb",
        quantity: 10,
        description: "A basic capture orb.",
        orbType: "Basic",
      },
      {
        playerId: player.id,
        name: "Healing Herb",
        type: "heal",
        quantity: 3,
        description: "Restores 30 HP to one monster.",
        orbType: null,
      },
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

export { formatPlayer };
export default router;
