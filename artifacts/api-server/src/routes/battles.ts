import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  battlesTable,
  capturedMonstersTable,
  monsterSpeciesTable,
  playersTable,
  inventoryItemsTable,
  regionsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { formatSpecies } from "./monsters.js";
import { formatCapturedMonster } from "./collection.js";
import {
  StartBattleBody,
  StartBattleResponse,
  GetBattleParams,
  GetBattleResponse,
  PerformBattleActionParams,
  PerformBattleActionBody,
  PerformBattleActionResponse,
} from "@workspace/api-zod";
import {
  calculateDamage,
  calculateCaptureChance,
  getCaptureOdds,
  getElementMultiplier,
  rollCritical,
  calculateWildStats,
  xpForNextLevel,
  getExplorerRankForLevel,
} from "../lib/gameEngine.js";
import {
  applyBattleLost,
  applyBattleWon,
  deductOrb,
  applySuccessfulCapture,
  type StatUpdateDb,
} from "../lib/battleService.js";
import type { BattleLogEntry } from "@workspace/db";
import { consumeEncounter } from "../lib/encounterStore.js";

/**
 * Adapts the Drizzle `db` instance to the minimal `StatUpdateDb` interface
 * expected by the battle service functions. Keeping the adapter thin means
 * the service functions themselves contain the real business logic under test.
 */
type DrizzleExecutor = Pick<typeof db, "select" | "update" | "insert">;

function makeStatDb(drizzle: DrizzleExecutor): StatUpdateDb {
  return {
    async fetchPlayerStats(playerId) {
      const [row] = await drizzle
        .select({
          battlesLost: playersTable.battlesLost,
          battlesWon: playersTable.battlesWon,
          monstersCaptured: playersTable.monstersCaptured,
          coins: playersTable.coins,
        })
        .from(playersTable)
        .where(eq(playersTable.id, playerId));
      return row;
    },
    async writePlayerStats(playerId, stats) {
      await drizzle
        .update(playersTable)
        .set(stats)
        .where(eq(playersTable.id, playerId));
    },
    async fetchOrb(playerId, orbType) {
      const [row] = await drizzle
        .select()
        .from(inventoryItemsTable)
        .where(
          and(
            eq(inventoryItemsTable.playerId, playerId),
            eq(inventoryItemsTable.type, "orb"),
            eq(inventoryItemsTable.orbType, orbType),
          ),
        );
      return row ? { id: row.id, quantity: row.quantity } : undefined;
    },
    async writeOrbQuantity(orbRowId, quantity) {
      await drizzle
        .update(inventoryItemsTable)
        .set({ quantity })
        .where(eq(inventoryItemsTable.id, orbRowId));
    },
    async insertCapturedMonster(data) {
      const [captured] = await drizzle
        .insert(capturedMonstersTable)
        .values(data)
        .returning();
      return { id: captured!.id };
    },
  };
}

const router: IRouter = Router();
const battleActionsInFlight = new Set<string>();
const battleStartsInFlight = new Set<string>();
function lockBattleAction(req: Request, res: Response, next: NextFunction): void {
  const rawId = req.params?.battleId;
  const battleId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!battleId) {
    res.status(400).json({ error: "Invalid battle id" });
    return;
  }
  if (battleActionsInFlight.has(battleId)) {
    res.status(409).json({ error: "A battle action is already being processed" });
    return;
  }
  battleActionsInFlight.add(battleId);
  const release = () => battleActionsInFlight.delete(battleId);
  res.once("finish", release);
  res.once("close", release);
  next();
}

function lockBattleStart(req: Request, res: Response, next: NextFunction): void {
  const playerId = req.playerId;
  if (!playerId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (battleStartsInFlight.has(playerId)) {
    res.status(409).json({ error: "A battle is already being started" });
    return;
  }
  battleStartsInFlight.add(playerId);
  const release = () => battleStartsInFlight.delete(playerId);
  res.once("finish", release);
  res.once("close", release);
  next();
}

function formatBattle(
  b: typeof battlesTable.$inferSelect,
  species: typeof monsterSpeciesTable.$inferSelect,
  playerMonsterRow: {
    captured: typeof capturedMonstersTable.$inferSelect;
    species: typeof monsterSpeciesTable.$inferSelect;
  } | null,
) {
  return {
    id: b.id,
    playerId: b.playerId,
    status: b.status,
    turn: b.turn,
    wildMonster: {
      speciesId: b.wildSpeciesId,
      capturedId: null,
      species: formatSpecies(species),
      level: b.wildLevel,
      currentHp: b.wildCurrentHp,
      maxHp: b.wildMaxHp,
      attack: b.wildAttack,
      defense: b.wildDefense,
      speed: b.wildSpeed,
      shinyVariant: b.wildShinyVariant ?? null,
      statusEffect: b.wildStatusEffect ?? null,
    },
    playerMonster: playerMonsterRow
      ? {
          speciesId: playerMonsterRow.captured.speciesId,
          capturedId: playerMonsterRow.captured.id,
          species: formatSpecies(playerMonsterRow.species),
          level: playerMonsterRow.captured.level,
          currentHp: b.playerCurrentHp,
          maxHp: playerMonsterRow.captured.maxHp,
          attack: playerMonsterRow.captured.attack,
          defense: playerMonsterRow.captured.defense,
          speed: playerMonsterRow.captured.speed,
          shinyVariant: playerMonsterRow.captured.shinyVariant ?? null,
          statusEffect: b.playerStatusEffect ?? null,
        }
      : null,
    log: b.log as BattleLogEntry[],
    expReward: b.expReward ?? null,
    coinReward: b.coinReward ?? null,
    capturedMonsterId: b.capturedMonsterId ?? null,
    regionId: b.regionId,
    round: b.turn,
    captureOdds: getCaptureOdds(
      b.wildCurrentHp,
      b.wildMaxHp,
      species.captureRate,
      b.wildLevel,
      b.wildShinyVariant ?? null,
    ),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

// POST /battles
router.post("/battles", requireAuth, lockBattleStart, async (req, res): Promise<void> => {
  const body = StartBattleBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  if (req.playerId !== body.data.playerId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [species] = await db
    .select()
    .from(monsterSpeciesTable)
    .where(eq(monsterSpeciesTable.id, body.data.speciesId));
  if (!species) {
    res.status(404).json({ error: "Monster species not found" });
    return;
  }

  const [region] = await db
    .select()
    .from(regionsTable)
    .where(eq(regionsTable.id, body.data.regionId));
  if (!region || !(region.monsterSpeciesIds as string[]).includes(species.id)) {
    res.status(400).json({ error: "This myth cannot be encountered in that region" });
    return;
  }

  const [activeBattle] = await db
    .select({ id: battlesTable.id })
    .from(battlesTable)
    .where(and(
      eq(battlesTable.playerId, body.data.playerId),
      eq(battlesTable.status, "active"),
    ));
  if (activeBattle) {
    res.status(409).json({ error: "Finish the active battle before starting another" });
    return;
  }

  const [playerCaptured] = await db
    .select()
    .from(capturedMonstersTable)
    .where(
      and(
        eq(capturedMonstersTable.id, body.data.activeMonsterCapturedId),
        eq(capturedMonstersTable.playerId, body.data.playerId),
      ),
    );
  if (!playerCaptured) {
    res.status(404).json({ error: "Player monster not found" });
    return;
  }
  if (playerCaptured.currentHp <= 0) {
    res.status(400).json({ error: "A fainted myth cannot start a battle" });
    return;
  }

  const pendingEncounter = consumeEncounter(body.data.playerId, {
    speciesId: species.id,
    regionId: body.data.regionId,
  });
  if (!pendingEncounter) {
    res.status(409).json({ error: "This encounter expired or was not found. Explore to find the myth again." });
    return;
  }

  const wildStats = calculateWildStats(species, pendingEncounter.wildLevel);

  const [battle] = await db
    .insert(battlesTable)
    .values({
      playerId: body.data.playerId,
      status: "active",
      turn: 1,
      wildSpeciesId: species.id,
      wildLevel: pendingEncounter.wildLevel,
      wildCurrentHp: wildStats.hp,
      wildMaxHp: wildStats.hp,
      wildAttack: wildStats.attack,
      wildDefense: wildStats.defense,
      wildSpeed: wildStats.speed,
      wildShinyVariant: pendingEncounter.shinyVariant,
      playerCapturedId: playerCaptured.id,
      playerCurrentHp: playerCaptured.currentHp,
      regionId: body.data.regionId,
      log: [],
    })
    .returning();

  const [playerSpecies] = await db
    .select()
    .from(monsterSpeciesTable)
    .where(eq(monsterSpeciesTable.id, playerCaptured.speciesId));

  res.status(201).json(
    StartBattleResponse.parse(
      formatBattle(battle!, species, playerSpecies ? { captured: playerCaptured, species: playerSpecies } : null),
    ),
  );
});

// GET /battles/:battleId
router.get(
  "/battles/:battleId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetBattleParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [battle] = await db
      .select()
      .from(battlesTable)
      .where(eq(battlesTable.id, params.data.battleId));
    if (!battle || battle.playerId !== req.playerId) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }

    const [species] = await db
      .select()
      .from(monsterSpeciesTable)
      .where(eq(monsterSpeciesTable.id, battle.wildSpeciesId));
    const [playerCaptured] = await db
      .select()
      .from(capturedMonstersTable)
      .where(eq(capturedMonstersTable.id, battle.playerCapturedId));
    const [playerSpecies] = playerCaptured
      ? await db
          .select()
          .from(monsterSpeciesTable)
          .where(eq(monsterSpeciesTable.id, playerCaptured.speciesId))
      : [];

    res.json(
      GetBattleResponse.parse(
        formatBattle(
          battle,
          species!,
          playerCaptured && playerSpecies
            ? { captured: playerCaptured, species: playerSpecies }
            : null,
        ),
      ),
    );
  },
);

// POST /battles/:battleId/action
router.post(
  "/battles/:battleId/action",
  requireAuth,
  lockBattleAction,
  async (req, res): Promise<void> => {
    const params = PerformBattleActionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = PerformBattleActionBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [battle] = await db
      .select()
      .from(battlesTable)
      .where(eq(battlesTable.id, params.data.battleId));
    if (!battle || battle.playerId !== req.playerId) {
      res.status(404).json({ error: "Battle not found" });
      return;
    }
    if (battle.status !== "active") {
      res.status(400).json({ error: "Battle is already over" });
      return;
    }

    const [wildSpecies] = await db
      .select()
      .from(monsterSpeciesTable)
      .where(eq(monsterSpeciesTable.id, battle.wildSpeciesId));
    const [playerCaptured] = await db
      .select()
      .from(capturedMonstersTable)
      .where(eq(capturedMonstersTable.id, battle.playerCapturedId));
    const [playerSpecies] = playerCaptured
      ? await db
          .select()
          .from(monsterSpeciesTable)
          .where(eq(monsterSpeciesTable.id, playerCaptured.speciesId))
      : [];

    if (!wildSpecies || !playerCaptured || !playerSpecies) {
      res.status(500).json({ error: "Battle data corrupted" });
      return;
    }

    const log = (battle.log as BattleLogEntry[]) ?? [];
    let wildHp = battle.wildCurrentHp;
    let playerHp = battle.playerCurrentHp;
    let newStatus = "active";
    let capturedMonsterId: string | null = null;

    const action = body.data.action;
    const skills = (wildSpecies.skills as { name: string; type: string; element: string; power: number; accuracy: number }[]);
    const playerSkills = (playerSpecies.skills as typeof skills);

    if (["skill1", "skill2", "ultimate"].includes(action)) {
      const requestedSkill = playerSkills.find((skill) => skill.type === action);
      if (!requestedSkill) {
        res.status(400).json({ error: "That skill is not available to this myth" });
        return;
      }
    }

    if (action === "switch") {
      const switchToId = body.data.switchToMonsterId;
      if (!switchToId) {
        res.status(400).json({ error: "switchToMonsterId is required for switch action" });
        return;
      }
      const [switchTarget] = await db
        .select()
        .from(capturedMonstersTable)
        .where(
          and(
            eq(capturedMonstersTable.id, switchToId),
            eq(capturedMonstersTable.playerId, battle.playerId),
          ),
        );
      if (!switchTarget) {
        res.status(404).json({ error: "Switch target not found" });
        return;
      }
      if (switchTarget.currentHp <= 0) {
        res.status(400).json({ error: "That myth has fainted and cannot battle" });
        return;
      }
      if (switchTarget.id === battle.playerCapturedId) {
        res.status(400).json({ error: "That myth is already in battle" });
        return;
      }

      // Save current player monster's HP before switching
      await db
        .update(capturedMonstersTable)
        .set({ currentHp: playerHp })
        .where(eq(capturedMonstersTable.id, playerCaptured.id));

      log.push({
        turn: battle.turn,
        actor: "player",
        action: "switch",
        description: `Come back, ${playerCaptured.nickname ?? playerSpecies.name}! Go, ${switchTarget.nickname ?? (await db.select().from(monsterSpeciesTable).where(eq(monsterSpeciesTable.id, switchTarget.speciesId)).then(([s]) => s?.name ?? 'Unknown'))}!`,
        damageDealt: null,
        critical: false,
      });

      // Wild monster attacks the incoming myth
      const wildNormalSkill = skills.find((s) => s.type === "normal");
      const wildSkillPower = wildNormalSkill?.power ?? 40;
      const wildSkillName = wildNormalSkill?.name ?? "Attack";
      const wildSkillElement = wildNormalSkill?.element ?? wildSpecies.element;

      const [switchTargetSpecies] = await db
        .select()
        .from(monsterSpeciesTable)
        .where(eq(monsterSpeciesTable.id, switchTarget.speciesId));

      if (!switchTargetSpecies) {
        res.status(500).json({ error: "Switch target species not found" });
        return;
      }

      const wCrit = rollCritical();
      const wMult = getElementMultiplier(wildSkillElement, switchTargetSpecies.element);
      const wDmg = calculateDamage(
        battle.wildAttack,
        switchTarget.defense,
        wildSkillPower,
        wMult,
        wCrit,
      );
      const newSwitchHp = Math.max(0, switchTarget.currentHp - wDmg);

      log.push({
        turn: battle.turn,
        actor: "wild",
        action: wildSkillName,
        description: `Wild ${wildSpecies.name} used ${wildSkillName} on ${switchTarget.nickname ?? switchTargetSpecies.name} dealing ${wDmg} damage!`,
        damageDealt: wDmg,
        critical: wCrit,
      });

      if (newSwitchHp <= 0) {
        newStatus = "lost";
        await applyBattleLost(makeStatDb(db), battle.playerId);
      }

      // Persist new monster's HP
      await db
        .update(capturedMonstersTable)
        .set({ currentHp: newSwitchHp })
        .where(eq(capturedMonstersTable.id, switchTarget.id));

      const [updatedBattle] = await db
        .update(battlesTable)
        .set({
          status: newStatus,
          turn: battle.turn + 1,
          playerCapturedId: switchTarget.id,
          playerCurrentHp: newSwitchHp,
          log,
        })
        .where(eq(battlesTable.id, battle.id))
        .returning();

      res.json(
        PerformBattleActionResponse.parse(
          formatBattle(
            updatedBattle!,
            wildSpecies,
            { captured: switchTarget, species: switchTargetSpecies },
          ),
        ),
      );
      return;
    } else if (action === "flee") {
      const fleeChance = playerCaptured.speed > battle.wildSpeed ? 0.9 : 0.5;
      if (Math.random() < fleeChance) {
        newStatus = "fled";
        log.push({
          turn: battle.turn,
          actor: "player",
          action: "flee",
          description: "You successfully fled from battle!",
          damageDealt: null,
          critical: false,
        });
      } else {
        log.push({
          turn: battle.turn,
          actor: "player",
          action: "flee",
          description: "Couldn't escape!",
          damageDealt: null,
          critical: false,
        });
      }
    } else if (action === "capture") {
      const orbType = body.data.orbType ?? "Prism";

      // Run the orb deduction and the captured-monster insert inside a single
      // DB transaction.  If either write fails (e.g. a mid-request disconnect
      // or a DB error on the insert), the entire transaction is rolled back so
      // the player never loses an orb without receiving the captured myth.
      let orbMissing = false;
      await db.transaction(async (tx) => {
        const txDb = makeStatDb(tx);
        // Deduct one orb from inventory (always, regardless of capture outcome)
        const deductedOrb = await deductOrb(txDb, battle.playerId, orbType);
        if (!deductedOrb) {
          // No orb available — mark the flag and return without any writes.
          // The transaction commits as a no-op; we return 400 below.
          orbMissing = true;
          return;
        }

        const success = calculateCaptureChance(
          orbType,
          wildHp,
          battle.wildMaxHp,
          wildSpecies.captureRate,
          battle.wildShinyVariant,
          battle.wildLevel,
        );
        if (success) {
          const personalities = ["Hardy", "Brave", "Calm", "Gentle", "Lax", "Bold", "Jolly", "Quirky", "Sassy", "Timid"];
          const personality = personalities[Math.floor(Math.random() * personalities.length)]!;
          const wildStats = calculateWildStats(wildSpecies, battle.wildLevel);
          // applySuccessfulCapture runs inside the same transaction: if the
          // insert throws, the orb decrement above is rolled back automatically.
          const captured = await applySuccessfulCapture(txDb, battle.playerId, {
            playerId: battle.playerId,
            speciesId: wildSpecies.id,
            level: battle.wildLevel,
            currentHp: wildStats.hp,
            maxHp: wildStats.hp,
            attack: wildStats.attack,
            defense: wildStats.defense,
            speed: wildStats.speed,
            shinyVariant: battle.wildShinyVariant ?? null,
            personality,
            inTeam: false,
          });
          capturedMonsterId = captured.id;
          newStatus = "captured";
          log.push({
            turn: battle.turn,
            actor: "player",
            action: "capture",
            description: `You captured ${wildSpecies.name}!`,
            damageDealt: null,
            critical: false,
          });
        } else {
          log.push({
            turn: battle.turn,
            actor: "player",
            action: "capture",
            description: `${wildSpecies.name} broke free!`,
            damageDealt: null,
            critical: false,
          });
        }
      });

      if (orbMissing) {
        res.status(400).json({ error: `No ${orbType} Orbs remaining` });
        return;
      }
    } else {
      // Attack or skill
      let skillPower = 40;
      let skillName = "Attack";
      let skillElement = playerSpecies.element;

      if (action === "attack") {
        const normalSkill = playerSkills.find((s) => s.type === "normal");
        if (normalSkill) {
          skillPower = normalSkill.power;
          skillName = normalSkill.name;
          skillElement = normalSkill.element;
        }
      } else if (action === "skill1") {
        const skill = playerSkills.find((s) => s.type === "skill1");
        if (skill) {
          skillPower = skill.power;
          skillName = skill.name;
          skillElement = skill.element;
        }
      } else if (action === "skill2") {
        const skill = playerSkills.find((s) => s.type === "skill2");
        if (skill) {
          skillPower = skill.power;
          skillName = skill.name;
          skillElement = skill.element;
        }
      } else if (action === "ultimate") {
        const skill = playerSkills.find((s) => s.type === "ultimate");
        if (skill) {
          skillPower = skill.power;
          skillName = skill.name;
          skillElement = skill.element;
        }
      }

      const critP = rollCritical();
      const multiplier = getElementMultiplier(skillElement, wildSpecies.element);
      const dmg = calculateDamage(
        playerCaptured.attack,
        battle.wildDefense,
        skillPower,
        multiplier,
        critP,
      );
      wildHp = Math.max(0, wildHp - dmg);

      let desc = `${playerCaptured.nickname ?? playerSpecies.name} used ${skillName} dealing ${dmg} damage!`;
      if (multiplier > 1) desc += " It's super effective!";
      if (multiplier < 1) desc += " It's not very effective...";
      if (critP) desc += " Critical hit!";

      log.push({
        turn: battle.turn,
        actor: "player",
        action,
        description: desc,
        damageDealt: dmg,
        critical: critP,
      });

      if (wildHp <= 0) {
        newStatus = "won";
        const expReward = Math.round(wildSpecies.baseHp * battle.wildLevel * 0.5);
        const coinReward = Math.round(10 + battle.wildLevel * 2);

        // Apply EXP to player monster and persist current HP
        const newExp = playerCaptured.experience + expReward;
        const newLevel = playerCaptured.level + Math.floor(newExp / xpForNextLevel(playerCaptured.level));
        await db
          .update(capturedMonstersTable)
          .set({
            currentHp: playerHp,
            experience: newExp % xpForNextLevel(playerCaptured.level),
            level: Math.min(100, newLevel),
          })
          .where(eq(capturedMonstersTable.id, playerCaptured.id));

        // Apply coins and battlesWon
        await applyBattleWon(makeStatDb(db), battle.playerId, coinReward);

        log.push({
          turn: battle.turn,
          actor: "player",
          action: "win",
          description: `You defeated ${wildSpecies.name}! +${expReward} EXP, +${coinReward} coins`,
          damageDealt: null,
          critical: false,
        });

        const [updatedBattle] = await db
          .update(battlesTable)
          .set({
            status: "won",
            wildCurrentHp: 0,
            log,
            expReward,
            coinReward,
          })
          .where(eq(battlesTable.id, battle.id))
          .returning();

        res.json(
          PerformBattleActionResponse.parse(
            formatBattle(
              updatedBattle!,
              wildSpecies,
              { captured: playerCaptured, species: playerSpecies },
            ),
          ),
        );
        return;
      }
    }

    // Wild monster attacks back if battle still active
    if (newStatus === "active") {
      // The opponent builds combat momentum instead of repeating its basic
      // attack forever. Stronger techniques enter the rotation on later turns,
      // while a missing catalogue slot safely falls back to the normal skill.
      const preferredWildType = battle.turn % 6 === 0
        ? "ultimate"
        : battle.turn % 3 === 0
          ? "skill2"
          : battle.turn % 2 === 0
            ? "skill1"
            : "normal";
      const wildSkill = skills.find((s) => s.type === preferredWildType)
        ?? skills.find((s) => s.type === "normal");
      const wildSkillPower = wildSkill?.power ?? 40;
      const wildSkillName = wildSkill?.name ?? "Attack";
      const wildSkillElement = wildSkill?.element ?? wildSpecies.element;

      const wCrit = rollCritical();
      const wMult = getElementMultiplier(wildSkillElement, playerSpecies.element);
      const wDmg = calculateDamage(
        battle.wildAttack,
        playerCaptured.defense,
        wildSkillPower,
        wMult,
        wCrit,
      );
      playerHp = Math.max(0, playerHp - wDmg);

      log.push({
        turn: battle.turn,
        actor: "wild",
        action: wildSkillName,
        description: `Wild ${wildSpecies.name} used ${wildSkillName} dealing ${wDmg} damage!`,
        damageDealt: wDmg,
        critical: wCrit,
      });

      if (playerHp <= 0) {
        newStatus = "lost";
        await applyBattleLost(makeStatDb(db), battle.playerId);
      }
    }

    const [updatedBattle] = await db
      .update(battlesTable)
      .set({
        status: newStatus,
        turn: battle.turn + 1,
        wildCurrentHp: wildHp,
        playerCurrentHp: playerHp,
        log,
        capturedMonsterId: capturedMonsterId ?? null,
      })
      .where(eq(battlesTable.id, battle.id))
      .returning();

    // Persist player monster HP change
    await db
      .update(capturedMonstersTable)
      .set({ currentHp: playerHp })
      .where(eq(capturedMonstersTable.id, playerCaptured.id));

    res.json(
      PerformBattleActionResponse.parse(
        formatBattle(
          updatedBattle!,
          wildSpecies,
          { captured: playerCaptured, species: playerSpecies },
        ),
      ),
    );
  },
);

export default router;
