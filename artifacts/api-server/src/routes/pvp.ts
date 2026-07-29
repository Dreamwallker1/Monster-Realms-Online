import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  capturedMonstersTable,
  monsterSpeciesTable,
  battlesTable,
} from "@workspace/db";
import { eq, ne, and, gt } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { generateToken } from "../lib/auth.js";
import { calculateWildStats } from "../lib/gameEngine.js";

const router: IRouter = Router();

// GET /api/pvp/opponents — list players who have a healthy team you can challenge
router.get("/api/pvp/opponents", requireAuth, async (req, res): Promise<void> => {
  // Get all players except self who have at least 1 healthy myth in their team
  const others = await db
    .select({
      id: playersTable.id,
      username: playersTable.username,
      avatarColor: playersTable.avatarColor,
      explorerLevel: playersTable.explorerLevel,
      explorerRank: playersTable.explorerRank,
      battlesWon: playersTable.battlesWon,
      pvpWins: playersTable.pvpWins,
    })
    .from(playersTable)
    .where(ne(playersTable.id, req.playerId!))
    .limit(50);

  // For each opponent, grab their lead myth (slot 0 or first healthy)
  const result = await Promise.all(
    others.map(async (p) => {
      const team = await db
        .select()
        .from(capturedMonstersTable)
        .where(
          and(
            eq(capturedMonstersTable.playerId, p.id),
            eq(capturedMonstersTable.inTeam, true),
            gt(capturedMonstersTable.currentHp, 0),
          ),
        )
        .limit(6);

      if (!team.length) return null;

      // Sort by teamSlot
      const sorted = [...team].sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99));
      const lead = sorted[0]!;

      const [species] = await db
        .select()
        .from(monsterSpeciesTable)
        .where(eq(monsterSpeciesTable.id, lead.speciesId));

      if (!species) return null;

      return {
        player: p,
        leadMyth: {
          id: lead.id,
          speciesId: species.id,
          speciesName: species.name,
          element: species.element,
          rarity: species.rarity,
          level: lead.level,
          currentHp: lead.currentHp,
          maxHp: lead.maxHp,
          attack: lead.attack,
          defense: lead.defense,
          speed: lead.speed,
          skills: species.skills as object[],
        },
        teamSize: team.length,
      };
    }),
  );

  res.json(result.filter(Boolean));
});

// POST /api/pvp/challenge/:opponentId — start a PvP battle vs opponent's lead myth
router.post("/api/pvp/challenge/:opponentId", requireAuth, async (req, res): Promise<void> => {
  const { opponentId } = req.params;

  if (opponentId === req.playerId) {
    res.status(400).json({ error: "Cannot challenge yourself" });
    return;
  }

  // Get challenger's lead healthy myth
  const challengerTeam = await db
    .select()
    .from(capturedMonstersTable)
    .where(
      and(
        eq(capturedMonstersTable.playerId, req.playerId!),
        eq(capturedMonstersTable.inTeam, true),
        gt(capturedMonstersTable.currentHp, 0),
      ),
    )
    .limit(6);

  const sorted = [...challengerTeam].sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99));
  const activeMon = sorted[0];
  if (!activeMon) {
    res.status(400).json({ error: "No healthy myths in your team" });
    return;
  }

  // Get opponent's lead healthy myth
  const opponentTeam = await db
    .select()
    .from(capturedMonstersTable)
    .where(
      and(
        eq(capturedMonstersTable.playerId, opponentId),
        eq(capturedMonstersTable.inTeam, true),
        gt(capturedMonstersTable.currentHp, 0),
      ),
    )
    .limit(6);

  const oppSorted = [...opponentTeam].sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99));
  const oppLead = oppSorted[0];
  if (!oppLead) {
    res.status(400).json({ error: "Opponent has no healthy myths" });
    return;
  }

  // Get species for both
  const [[playerSpecies], [oppSpecies]] = await Promise.all([
    db.select().from(monsterSpeciesTable).where(eq(monsterSpeciesTable.id, activeMon.speciesId)),
    db.select().from(monsterSpeciesTable).where(eq(monsterSpeciesTable.id, oppLead.speciesId)),
  ]);

  if (!playerSpecies || !oppSpecies) {
    res.status(500).json({ error: "Species data missing" });
    return;
  }

  // Get opponent player info for display
  const [oppPlayer] = await db
    .select({ username: playersTable.username })
    .from(playersTable)
    .where(eq(playersTable.id, opponentId));

  // Create a battle treating opponent's myth as the "wild" opponent
  // We store the opponent's actual stats (not recalculated) for fairness
  const [battle] = await db
    .insert(battlesTable)
    .values({
      playerId: req.playerId!,
      status: "active",
      turn: 1,
      wildSpeciesId: oppSpecies.id,
      wildLevel: oppLead.level,
      wildCurrentHp: oppLead.currentHp,
      wildMaxHp: oppLead.maxHp,
      wildAttack: oppLead.attack,
      wildDefense: oppLead.defense,
      wildSpeed: oppLead.speed,
      wildShinyVariant: oppLead.shinyVariant ?? null,
      playerCapturedId: activeMon.id,
      playerCurrentHp: activeMon.currentHp,
      regionId: "pvp-arena",
      log: [{
        turn: 0,
        actor: "system",
        action: "start",
        description: `PvP Battle! You challenged ${oppPlayer?.username ?? "opponent"}'s ${oppSpecies.name} (Lv.${oppLead.level})!`,
        damageDealt: null,
        critical: false,
      }],
    })
    .returning();

  res.status(201).json({
    battleId: battle!.id,
    opponentName: oppPlayer?.username ?? "Opponent",
    opponentMyth: {
      name: oppSpecies.name,
      element: oppSpecies.element,
      rarity: oppSpecies.rarity,
      level: oppLead.level,
    },
  });
});

export default router;
