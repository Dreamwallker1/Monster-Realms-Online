import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { playersTable, inventoryItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

const router: IRouter = Router();

// POST /auth/guest
router.post("/auth/guest", async (req, res): Promise<void> => {
  const parsed = GuestLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, avatarColor } = parsed.data;

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

  // Give starter orbs
  await db.insert(inventoryItemsTable).values([
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
  ]);

  const token = generateToken(player.id);
  res.json(
    GuestLoginResponse.parse({
      token,
      player: formatPlayer(player),
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
  const { username, password, avatarColor } = parsed.data;

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

  await db.insert(inventoryItemsTable).values([
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
  ]);

  const token = generateToken(player.id);
  res.status(201).json(
    RegisterPlayerResponse.parse({
      token,
      player: formatPlayer(player),
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
