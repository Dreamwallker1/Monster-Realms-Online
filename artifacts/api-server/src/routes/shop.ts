import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  inventoryItemsTable,
  shopPurchasesTable,
} from "@workspace/db";
import { eq, and, sql, gt } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const router: IRouter = Router();

// ─── Orb Config ───────────────────────────────────────────────────────────────

export const ORB_CONFIG = {
  Prism:  { tier: 'C', name: 'Prism Orb',  solPrice: 0.025, dailyFree: 5,  description: 'A shimmering orb that captures Common myths.' },
  Luna:   { tier: 'B', name: 'Luna Orb',   solPrice: 0.050, dailyFree: 3,  description: 'Moonlit energy for Uncommon myth capture.' },
  Aether: { tier: 'A', name: 'Aether Orb', solPrice: 0.075, dailyFree: 2,  description: 'Rare elemental orb that bends reality.' },
  Void:   { tier: 'S', name: 'Void Orb',   solPrice: 0.100, dailyFree: 1,  description: 'A legendary orb that can capture any myth.' },
} as const;

export type OrbType = keyof typeof ORB_CONFIG;
const VALID_ORBS = Object.keys(ORB_CONFIG) as OrbType[];

const FREE_REFRESH_MS = 8 * 60 * 60 * 1000; // 8 hours

// Solana connection
const SOLANA_NETWORK = process.env.SOLANA_NETWORK ?? "mainnet-beta";
const SOLANA_RPC = process.env.SOLANA_RPC_URL
  ?? (SOLANA_NETWORK === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com");
const TREASURY   = process.env.TREASURY_WALLET_ADDRESS ?? "";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ShopExecutor = Pick<typeof db, "select" | "insert" | "update">;

async function ensureOrbRows(playerId: string, executor: ShopExecutor = db) {
  const existing = await executor
    .select({ orbType: inventoryItemsTable.orbType, quantity: inventoryItemsTable.quantity })
    .from(inventoryItemsTable)
    .where(and(eq(inventoryItemsTable.playerId, playerId), eq(inventoryItemsTable.type, 'orb')));

  const existingTypes = new Set(existing.map(r => r.orbType));
  const toInsert = VALID_ORBS.filter(o => !existingTypes.has(o));
  if (toInsert.length > 0) {
    await executor.insert(inventoryItemsTable).values(
      toInsert.map(orbType => ({
        playerId,
        name: ORB_CONFIG[orbType].name,
        type: 'orb',
        quantity: 0,
        description: ORB_CONFIG[orbType].description,
        orbType,
      }))
    );
  }
}

async function getOrbRow(playerId: string, orbType: OrbType, executor: ShopExecutor = db) {
  const [row] = await executor
    .select()
    .from(inventoryItemsTable)
    .where(and(
      eq(inventoryItemsTable.playerId, playerId),
      eq(inventoryItemsTable.type, 'orb'),
      eq(inventoryItemsTable.orbType, orbType),
    ));
  return row ?? null;
}

async function grantOrbs(playerId: string, grants: Partial<Record<OrbType, number>>, executor: ShopExecutor = db) {
  await ensureOrbRows(playerId, executor);
  for (const [orbType, qty] of Object.entries(grants) as [OrbType, number][]) {
    if (!qty) continue;
    const row = await getOrbRow(playerId, orbType, executor);
    if (row) {
      await executor.update(inventoryItemsTable)
        .set({ quantity: sql`${inventoryItemsTable.quantity} + ${qty}` })
        .where(eq(inventoryItemsTable.id, row.id));
    }
  }
}

// ─── GET /api/shop/status ─────────────────────────────────────────────────────

router.get("/shop/status", requireAuth, async (req, res): Promise<void> => {
  const playerId = req.playerId!;
  await ensureOrbRows(playerId);

  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
  if (!player) { res.status(404).json({ error: "Player not found" }); return; }

  const orbs = await db
    .select()
    .from(inventoryItemsTable)
    .where(and(eq(inventoryItemsTable.playerId, playerId), eq(inventoryItemsTable.type, 'orb')));

  const orbMap: Record<string, number> = {};
  for (const row of orbs) {
    if (row.orbType) orbMap[row.orbType] = row.quantity;
  }

  const now = Date.now();
  const lastRefresh = player.lastOrbRefresh ? player.lastOrbRefresh.getTime() : 0;
  const nextRefresh = lastRefresh + FREE_REFRESH_MS;
  const canClaim = now >= nextRefresh;
  const msUntilRefresh = canClaim ? 0 : nextRefresh - now;

  res.json({
    orbs: {
      Prism:  orbMap['Prism']  ?? 0,
      Luna:   orbMap['Luna']   ?? 0,
      Aether: orbMap['Aether'] ?? 0,
      Void:   orbMap['Void']   ?? 0,
    },
    canClaimFree: canClaim,
    msUntilRefresh,
    solanaWallet: player.solanaWallet ?? null,
    treasury: TREASURY || null,
    network: SOLANA_NETWORK,
    rpcUrl: SOLANA_RPC,
    orbConfig: ORB_CONFIG,
  });
});

// ─── POST /api/shop/claim-daily ───────────────────────────────────────────────

router.post("/shop/claim-daily", requireAuth, async (req, res): Promise<void> => {
  const playerId = req.playerId!;
  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
  if (!player) { res.status(404).json({ error: "Player not found" }); return; }

  const now = Date.now();
  const lastRefresh = player.lastOrbRefresh ? player.lastOrbRefresh.getTime() : 0;
  if (now < lastRefresh + FREE_REFRESH_MS) {
    const msLeft = lastRefresh + FREE_REFRESH_MS - now;
    res.status(429).json({ error: "Not ready yet", msUntilRefresh: msLeft });
    return;
  }

  // Overwrite (not add) — doesn't accumulate
  await ensureOrbRows(playerId);
  for (const [orbType, cfg] of Object.entries(ORB_CONFIG) as [OrbType, typeof ORB_CONFIG[OrbType]][]) {
    const row = await getOrbRow(playerId, orbType);
    if (row) {
      await db.update(inventoryItemsTable)
        .set({ quantity: cfg.dailyFree })
        .where(eq(inventoryItemsTable.id, row.id));
    }
  }

  await db.update(playersTable)
    .set({ lastOrbRefresh: new Date() })
    .where(eq(playersTable.id, playerId));

  res.json({
    success: true,
    granted: { Prism: 5, Luna: 3, Aether: 2, Void: 1 },
  });
});

// ─── POST /api/shop/wallet ────────────────────────────────────────────────────

router.post("/shop/wallet", requireAuth, async (req, res): Promise<void> => {
  const { walletAddress } = req.body as { walletAddress?: string };
  if (!walletAddress) { res.status(400).json({ error: "walletAddress required" }); return; }
  try { new PublicKey(walletAddress); } catch {
    res.status(400).json({ error: "Invalid Solana address" }); return;
  }
  await db.update(playersTable)
    .set({ solanaWallet: walletAddress })
    .where(eq(playersTable.id, req.playerId!));
  res.json({ success: true });
});

// ─── POST /api/shop/purchase ──────────────────────────────────────────────────

router.post("/shop/purchase", requireAuth, async (req, res): Promise<void> => {
  const { txSignature, orbType, quantity = 1, buyerWallet } = req.body as {
    txSignature?: string;
    orbType?: string;
    quantity?: number;
    buyerWallet?: string;
  };

  if (!txSignature || !orbType || !buyerWallet) {
    res.status(400).json({ error: "txSignature, orbType, buyerWallet required" });
    return;
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) {
    res.status(400).json({ error: "quantity must be an integer between 1 and 100" });
    return;
  }
  if (!VALID_ORBS.includes(orbType as OrbType)) {
    res.status(400).json({ error: "Invalid orbType" });
    return;
  }
  if (!TREASURY) {
    res.status(503).json({ error: "Shop not configured — TREASURY_WALLET_ADDRESS not set" });
    return;
  }

  const [player] = await db
    .select({ solanaWallet: playersTable.solanaWallet })
    .from(playersTable)
    .where(eq(playersTable.id, req.playerId!));
  if (!player?.solanaWallet || player.solanaWallet !== buyerWallet) {
    res.status(403).json({ error: "Payment wallet does not match the connected player wallet" });
    return;
  }
  try { new PublicKey(buyerWallet); } catch {
    res.status(400).json({ error: "Invalid buyer wallet" });
    return;
  }

  const orbCfg = ORB_CONFIG[orbType as OrbType];
  const expectedLamports = Math.round(orbCfg.solPrice * quantity * LAMPORTS_PER_SOL);

  // Check for duplicate tx
  const [existingPurchase] = await db
    .select({ id: shopPurchasesTable.id })
    .from(shopPurchasesTable)
    .where(eq(shopPurchasesTable.txSignature, txSignature));
  if (existingPurchase) {
    res.status(409).json({ error: "Transaction already processed" });
    return;
  }

  // Verify on-chain
  try {
    const connection = new Connection(SOLANA_RPC, "confirmed");
    const tx = await connection.getTransaction(txSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
      res.status(400).json({ error: "Transaction not found or not confirmed" });
      return;
    }
    if (tx.meta?.err) {
      res.status(400).json({ error: "Transaction failed on-chain" });
      return;
    }

    // Find the SOL transfer to treasury
    const accountKeys = tx.transaction.message.staticAccountKeys ?? (tx.transaction.message as any).accountKeys;
    const treasuryIndex = accountKeys?.findIndex((k: PublicKey) => k.toString() === TREASURY);
    const buyerIndex = accountKeys?.findIndex((k: PublicKey) => k.toString() === buyerWallet);

    if (treasuryIndex === -1 || buyerIndex === -1) {
      res.status(400).json({ error: "Transaction does not involve expected wallets" });
      return;
    }

    const preBalances  = tx.meta?.preBalances  ?? [];
    const postBalances = tx.meta?.postBalances ?? [];
    const treasuryReceived = (postBalances[treasuryIndex] ?? 0) - (preBalances[treasuryIndex] ?? 0);

    if (treasuryReceived < expectedLamports * 0.99) { // 1% tolerance for rounding
      res.status(400).json({
        error: `Payment mismatch — expected ${expectedLamports} lamports, got ${treasuryReceived}`,
      });
      return;
    }
  } catch (err) {
    console.error("Solana tx verification failed:", err);
    res.status(400).json({ error: "Could not verify transaction" });
    return;
  }

  // The unique signature record and the inventory grant commit together. A
  // database failure can therefore never charge a player without granting orbs.
  try {
    await db.transaction(async (tx) => {
      await tx.insert(shopPurchasesTable).values({
        playerId: req.playerId!,
        txSignature,
        orbType,
        quantity,
        lamports: expectedLamports,
      });
      await grantOrbs(req.playerId!, { [orbType as OrbType]: quantity }, tx);
    });
  } catch (error) {
    console.error("Purchase fulfillment failed:", error);
    res.status(409).json({ error: "Transaction was already processed or fulfillment failed" });
    return;
  }

  res.json({ success: true, granted: { [orbType]: quantity } });
});

// ─── POST /api/shop/deduct ────────────────────────────────────────────────────
// Called internally by battles.ts — deducts one orb of given type

router.post("/shop/deduct", requireAuth, async (req, res): Promise<void> => {
  const { orbType } = req.body as { orbType?: string };
  if (!orbType || !VALID_ORBS.includes(orbType as OrbType)) {
    res.status(400).json({ error: "Invalid orbType" }); return;
  }
  await ensureOrbRows(req.playerId!);
  const row = await getOrbRow(req.playerId!, orbType as OrbType);
  if (!row || row.quantity <= 0) {
    res.status(400).json({ error: "No orbs of this type remaining" }); return;
  }
  const [updated] = await db.update(inventoryItemsTable)
    .set({ quantity: sql`${inventoryItemsTable.quantity} - 1` })
    .where(and(eq(inventoryItemsTable.id, row.id), gt(inventoryItemsTable.quantity, 0)))
    .returning({ quantity: inventoryItemsTable.quantity });
  if (!updated) {
    res.status(409).json({ error: "Orb was already consumed" });
    return;
  }
  res.json({ success: true, remaining: updated.quantity });
});

export default router;
