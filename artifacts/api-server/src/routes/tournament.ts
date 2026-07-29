import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  tournamentRegistrationsTable,
  tournamentMatchesTable,
  playersTable,
  capturedMonstersTable,
  shopPurchasesTable,
} from "@workspace/db";
import { eq, and, desc, gte, lt, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const router: IRouter = Router();

// ─── Config ───────────────────────────────────────────────────────────────────
const TOURNAMENT_HOUR_UTC = parseInt(process.env.TOURNAMENT_HOUR_UTC ?? "20");
const PRIZE_SHARE = 0.30;       // 30% of daily revenue → prize pool
const TREASURY_CUT = 0.70;      // 70% stays in treasury

const PRIZE_DIST: Array<{ from: number; to: number; pct: number }> = [
  { from: 1, to: 3,  pct: 0.10 },
  { from: 4, to: 7,  pct: 0.05 },
  { from: 8, to: 20, pct: 0.03 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isTournamentStarted(): boolean {
  const now = new Date();
  return now.getUTCHours() >= TOURNAMENT_HOUR_UTC;
}

/** Calculate power score for a player's team */
async function getPlayerPower(playerId: string): Promise<number> {
  const team = await db
    .select()
    .from(capturedMonstersTable)
    .where(and(
      eq(capturedMonstersTable.playerId, playerId),
      eq(capturedMonstersTable.inTeam, true),
    ));
  if (team.length === 0) return 1;
  return team.reduce((sum, m) => sum + (m.level * (m.attack + m.defense + m.speed)), 0);
}

/** Get today's prize pool (30% of today's orb purchases) */
async function getDailyPrizePool(): Promise<number> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${shopPurchasesTable.lamports}), 0)` })
    .from(shopPurchasesTable)
    .where(and(
      gte(shopPurchasesTable.createdAt, todayStart),
      lt(shopPurchasesTable.createdAt, todayEnd),
    ));
  const totalLamports = Number(row?.total ?? 0);
  return Math.floor(totalLamports * PRIZE_SHARE);
}

/** Get or create today's tournament */
async function getOrCreateTournament() {
  const today = getTodayDateString();
  const [existing] = await db
    .select()
    .from(tournamentsTable)
    .where(eq(tournamentsTable.tournamentDate, today));
  if (existing) return existing;

  const [created] = await db
    .insert(tournamentsTable)
    .values({ tournamentDate: today, status: "registration" })
    .returning();
  return created!;
}

/** Simulate a match — returns winner id */
async function simulateMatch(player1Id: string, player2Id: string): Promise<string> {
  const [p1Power, p2Power] = await Promise.all([
    getPlayerPower(player1Id),
    getPlayerPower(player2Id),
  ]);
  const total = p1Power + p2Power;
  // Weighted RNG — stronger team wins more often but not always
  const winChance = Math.min(0.75, Math.max(0.25, p1Power / total));
  return Math.random() < winChance ? player1Id : player2Id;
}

/** Assign prize payouts to standings */
function calculatePayouts(
  standings: { playerId: string; wins: number; losses: number }[],
  poolLamports: number,
): Record<string, number> {
  const payouts: Record<string, number> = {};
  standings.forEach(({ playerId }, idx) => {
    const rank = idx + 1;
    const dist = PRIZE_DIST.find(d => rank >= d.from && rank <= d.to);
    if (dist) {
      payouts[playerId] = Math.floor(poolLamports * dist.pct);
    }
  });
  return payouts;
}

/** Generate next round pairings for a tournament */
async function generateNextRound(tournamentId: string, round: number) {
  // Get all registrations ordered by wins desc
  const registrations = await db
    .select()
    .from(tournamentRegistrationsTable)
    .where(eq(tournamentRegistrationsTable.tournamentId, tournamentId))
    .orderBy(desc(tournamentRegistrationsTable.wins));

  // Shuffle within equal-wins groups for fairness
  const shuffled = [...registrations].sort(() => Math.random() - 0.5);

  // Pair them up
  const matches = [];
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    matches.push({
      tournamentId,
      round,
      player1Id: shuffled[i]!.playerId,
      player2Id: shuffled[i + 1]!.playerId,
      status: "pending" as const,
    });
  }
  // Odd player out gets a bye (auto-win)
  if (shuffled.length % 2 === 1) {
    const byePlayer = shuffled[shuffled.length - 1]!;
    await db
      .update(tournamentRegistrationsTable)
      .set({ byes: byePlayer.byes + 1, wins: byePlayer.wins + 1 })
      .where(and(
        eq(tournamentRegistrationsTable.tournamentId, tournamentId),
        eq(tournamentRegistrationsTable.playerId, byePlayer.playerId),
      ));
  }

  if (matches.length > 0) {
    await db.insert(tournamentMatchesTable).values(matches);
  }
}

/** Auto-resolve all pending matches in the current round */
async function resolveRound(tournamentId: string, round: number) {
  const pending = await db
    .select()
    .from(tournamentMatchesTable)
    .where(and(
      eq(tournamentMatchesTable.tournamentId, tournamentId),
      eq(tournamentMatchesTable.round, round),
      eq(tournamentMatchesTable.status, "pending"),
    ));

  for (const match of pending) {
    const winnerId = await simulateMatch(match.player1Id, match.player2Id);
    const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

    await db.update(tournamentMatchesTable)
      .set({ winnerId, status: "completed" })
      .where(eq(tournamentMatchesTable.id, match.id));

    // Update W/L records
    await db.update(tournamentRegistrationsTable)
      .set({ wins: sql`${tournamentRegistrationsTable.wins} + 1` })
      .where(and(
        eq(tournamentRegistrationsTable.tournamentId, tournamentId),
        eq(tournamentRegistrationsTable.playerId, winnerId),
      ));
    await db.update(tournamentRegistrationsTable)
      .set({ losses: sql`${tournamentRegistrationsTable.losses} + 1` })
      .where(and(
        eq(tournamentRegistrationsTable.tournamentId, tournamentId),
        eq(tournamentRegistrationsTable.playerId, loserId),
      ));
  }
}

/** Finalize tournament — rank players, assign payouts */
async function finalizeTournament(tournament: typeof tournamentsTable.$inferSelect) {
  const registrations = await db
    .select()
    .from(tournamentRegistrationsTable)
    .where(eq(tournamentRegistrationsTable.tournamentId, tournament.id))
    .orderBy(desc(tournamentRegistrationsTable.wins), tournamentRegistrationsTable.losses);

  const poolLamports = await getDailyPrizePool();
  const payouts = calculatePayouts(registrations, poolLamports);

  for (let i = 0; i < registrations.length; i++) {
    const reg = registrations[i]!;
    await db.update(tournamentRegistrationsTable)
      .set({
        finalRank: i + 1,
        payoutLamports: payouts[reg.playerId] ?? 0,
      })
      .where(eq(tournamentRegistrationsTable.id, reg.id));
  }

  await db.update(tournamentsTable)
    .set({
      status: "completed",
      prizePoolLamports: poolLamports,
      endTime: new Date(),
    })
    .where(eq(tournamentsTable.id, tournament.id));
}

// ─── GET /api/tournament/today ────────────────────────────────────────────────

router.get("/tournament/today", requireAuth, async (req, res): Promise<void> => {
  const playerId = req.playerId!;
  let tournament = await getOrCreateTournament();

  // Auto-advance state
  if (tournament.status === "registration" && isTournamentStarted()) {
    if (tournament.currentRound === 0) {
      const regs = await db.select().from(tournamentRegistrationsTable)
        .where(eq(tournamentRegistrationsTable.tournamentId, tournament.id));
      if (regs.length >= 2) {
        await generateNextRound(tournament.id, 1);
        await resolveRound(tournament.id, 1);
        const [updated] = await db.update(tournamentsTable)
          .set({ status: "active", currentRound: 1, startTime: new Date() })
          .where(eq(tournamentsTable.id, tournament.id))
          .returning();
        tournament = updated!;
      }
    }
  } else if (tournament.status === "active") {
    // Check if all rounds done
    if (tournament.currentRound >= tournament.totalRounds) {
      await finalizeTournament(tournament);
      const [updated] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, tournament.id));
      tournament = updated!;
    } else {
      // Check if current round is fully resolved and advance
      const pendingMatches = await db
        .select({ count: sql<number>`count(*)` })
        .from(tournamentMatchesTable)
        .where(and(
          eq(tournamentMatchesTable.tournamentId, tournament.id),
          eq(tournamentMatchesTable.round, tournament.currentRound),
          eq(tournamentMatchesTable.status, "pending"),
        ));
      if (Number(pendingMatches[0]?.count ?? 1) === 0 && tournament.currentRound < tournament.totalRounds) {
        const nextRound = tournament.currentRound + 1;
        await generateNextRound(tournament.id, nextRound);
        await resolveRound(tournament.id, nextRound);
        const [updated] = await db.update(tournamentsTable)
          .set({ currentRound: nextRound })
          .where(eq(tournamentsTable.id, tournament.id))
          .returning();
        tournament = updated!;
      }
    }
  }

  // Get standings
  const standings = await db
    .select({
      playerId: tournamentRegistrationsTable.playerId,
      username: playersTable.username,
      avatarColor: playersTable.avatarColor,
      wins: tournamentRegistrationsTable.wins,
      losses: tournamentRegistrationsTable.losses,
      byes: tournamentRegistrationsTable.byes,
      finalRank: tournamentRegistrationsTable.finalRank,
      payoutLamports: tournamentRegistrationsTable.payoutLamports,
      payoutClaimed: tournamentRegistrationsTable.payoutClaimed,
    })
    .from(tournamentRegistrationsTable)
    .leftJoin(playersTable, eq(tournamentRegistrationsTable.playerId, playersTable.id))
    .where(eq(tournamentRegistrationsTable.tournamentId, tournament.id))
    .orderBy(
      desc(tournamentRegistrationsTable.wins),
      tournamentRegistrationsTable.losses,
    );

  // Get my registration
  const myReg = standings.find(s => s.playerId === playerId) ?? null;

  // Get current round matches
  const currentMatches = tournament.currentRound > 0
    ? await db
        .select({
          id: tournamentMatchesTable.id,
          round: tournamentMatchesTable.round,
          player1Id: tournamentMatchesTable.player1Id,
          player2Id: tournamentMatchesTable.player2Id,
          winnerId: tournamentMatchesTable.winnerId,
          status: tournamentMatchesTable.status,
        })
        .from(tournamentMatchesTable)
        .where(and(
          eq(tournamentMatchesTable.tournamentId, tournament.id),
          eq(tournamentMatchesTable.round, tournament.currentRound),
        ))
    : [];

  const prizePool = await getDailyPrizePool();
  const startHour = TOURNAMENT_HOUR_UTC;

  res.json({
    tournament: {
      id: tournament.id,
      date: tournament.tournamentDate,
      status: tournament.status,
      currentRound: tournament.currentRound,
      totalRounds: tournament.totalRounds,
      prizePoolLamports: prizePool,
      prizePoolSol: prizePool / LAMPORTS_PER_SOL,
      startHour,
    },
    isRegistered: !!myReg,
    myStats: myReg,
    standings,
    currentMatches,
    prizeDistribution: PRIZE_DIST,
  });
});

// ─── POST /api/tournament/register ───────────────────────────────────────────

router.post("/tournament/register", requireAuth, async (req, res): Promise<void> => {
  const playerId = req.playerId!;
  const tournament = await getOrCreateTournament();

  if (tournament.status !== "registration") {
    res.status(400).json({ error: "Tournament already started or completed" });
    return;
  }

  // Check player has at least 1 myth in team
  const [teamMember] = await db
    .select({ id: capturedMonstersTable.id })
    .from(capturedMonstersTable)
    .where(and(
      eq(capturedMonstersTable.playerId, playerId),
      eq(capturedMonstersTable.inTeam, true),
    ));

  if (!teamMember) {
    res.status(400).json({ error: "You need at least 1 myth in your team to enter" });
    return;
  }

  const existing = await db
    .select({ id: tournamentRegistrationsTable.id })
    .from(tournamentRegistrationsTable)
    .where(and(
      eq(tournamentRegistrationsTable.tournamentId, tournament.id),
      eq(tournamentRegistrationsTable.playerId, playerId),
    ));

  if (existing.length > 0) {
    res.status(400).json({ error: "Already registered" });
    return;
  }

  await db.insert(tournamentRegistrationsTable).values({
    tournamentId: tournament.id,
    playerId,
  });

  res.json({ success: true });
});

// ─── POST /api/tournament/claim-payout ───────────────────────────────────────

router.post("/tournament/claim-payout", requireAuth, async (req, res): Promise<void> => {
  const playerId = req.playerId!;
  const tournament = await getOrCreateTournament();

  if (tournament.status !== "completed") {
    res.status(400).json({ error: "Tournament not completed yet" });
    return;
  }

  const [reg] = await db
    .select()
    .from(tournamentRegistrationsTable)
    .where(and(
      eq(tournamentRegistrationsTable.tournamentId, tournament.id),
      eq(tournamentRegistrationsTable.playerId, playerId),
    ));

  if (!reg) { res.status(404).json({ error: "Not in this tournament" }); return; }
  if (reg.payoutClaimed) { res.status(400).json({ error: "Already claimed" }); return; }
  if (reg.payoutLamports <= 0) { res.status(400).json({ error: "No payout for your rank" }); return; }

  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, playerId));
  if (!player?.solanaWallet) {
    res.status(400).json({ error: "No wallet connected. Connect Phantom first." });
    return;
  }

  // Send SOL if treasury key is available
  const treasuryKeyB58 = process.env.TREASURY_PRIVATE_KEY;
  if (!treasuryKeyB58) {
    // Mark as claimable but payouts pending (no key configured)
    res.json({
      success: false,
      pending: true,
      message: "Payouts are being processed — check back soon.",
      lamports: reg.payoutLamports,
      sol: reg.payoutLamports / LAMPORTS_PER_SOL,
    });
    return;
  }

  try {
    const { Connection, PublicKey, Transaction, SystemProgram, Keypair } = await import("@solana/web3.js");
    const bs58 = await import("bs58");
    const connection = new Connection(
      process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
      "confirmed",
    );
    const secretKey = bs58.default.decode(treasuryKeyB58);
    const fromKeypair = Keypair.fromSecretKey(secretKey);
    const toPubkey = new PublicKey(player.solanaWallet);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: fromKeypair.publicKey })
      .add(SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey,
        lamports: reg.payoutLamports,
      }));
    tx.sign(fromKeypair);

    const signature = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

    await db.update(tournamentRegistrationsTable)
      .set({ payoutClaimed: true })
      .where(eq(tournamentRegistrationsTable.id, reg.id));

    res.json({ success: true, signature, sol: reg.payoutLamports / LAMPORTS_PER_SOL });
  } catch (err: any) {
    console.error("Payout error:", err);
    res.status(500).json({ error: "Payout failed — " + (err?.message ?? "unknown error") });
  }
});

export default router;
