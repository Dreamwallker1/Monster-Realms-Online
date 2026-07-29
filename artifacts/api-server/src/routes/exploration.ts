import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  monsterSpeciesTable,
  regionsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  ExploreTileParams,
  ExploreTileBody,
  ExploreTileResponse,
} from "@workspace/api-zod";
import {
  rollEncounter,
  selectWildMonster,
  rollShinyVariant,
  getExplorerRankForLevel,
  xpForNextLevel,
  wildMonsterLevel,
} from "../lib/gameEngine.js";
import { formatSpecies } from "./monsters.js";
import { MONSTER_SEED_DATA } from "../lib/monsterData.js";

const router: IRouter = Router();

// POST /players/:playerId/explore
router.post(
  "/players/:playerId/explore",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = ExploreTileParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const body = ExploreTileBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [player] = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.id, params.data.playerId));
    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const energyCost = 1;
    if (player.energy < energyCost) {
      res.status(400).json({ error: "Not enough energy" });
      return;
    }

    // Calculate new position
    const dirDeltas: Record<string, [number, number]> = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [dx, dy] = dirDeltas[body.data.direction] ?? [0, 0];

    const [region] = await db
      .select()
      .from(regionsTable)
      .where(eq(regionsTable.id, body.data.regionId));

    const maxX = (region?.width ?? 50) - 1;
    const maxY = (region?.height ?? 50) - 1;
    const newX = Math.max(0, Math.min(maxX, body.data.posX + dx));
    const newY = Math.max(0, Math.min(maxY, body.data.posY + dy));
    const newTile = true; // simplified: always award xp for movement

    // Explorer XP + coins
    const xpGain = 5;
    const coinGain = Math.floor(Math.random() * 3) + 1;

    let newXp = player.explorerXp + xpGain;
    let newLevel = player.explorerLevel;
    while (newXp >= xpForNextLevel(newLevel)) {
      newXp -= xpForNextLevel(newLevel);
      newLevel++;
    }
    const newRank = getExplorerRankForLevel(newLevel);

    // Check encounter (tile type 0 = grass by default)
    const tileType = 0;
    const triggered = rollEncounter(tileType);
    let encounter = null;
    let encounterSpecies = null;

    if (triggered) {
      const allSpecies = await db.select().from(monsterSpeciesTable);

      // Determine which monster ID pool to use for this region.
      // Only species that actually exist in monsterSpeciesTable are eligible
      // so that any returned encounter is guaranteed to be battle-able.
      //
      // Priority:
      //   1. Region row exists in DB → use its monsterSpeciesIds list.
      //   2. Region row missing → derive pool from static monsterData
      //      intersected with DB species (guarantees battle-ability).
      //   3. If intersection is empty → no encounter (explicit, not silent).
      let regionMonsterIds: string[];
      let requiredLevel = 1;

      if (region) {
        regionMonsterIds = region.monsterSpeciesIds as string[];
        requiredLevel = region.requiredExplorerLevel;
      } else {
        // Build the static ID set for this region from seed data
        const targetRegionId = body.data.regionId;
        const staticIdsForRegion = new Set(
          MONSTER_SEED_DATA
            .filter((m) =>
              Array.isArray(m.regionIds) &&
              (m.regionIds as string[]).includes(targetRegionId),
            )
            .map((m) => m.id as string),
        );

        // Keep only IDs that are actually present in the DB so battles won't 404
        regionMonsterIds = allSpecies
          .filter((s) => staticIdsForRegion.has(s.id))
          .map((s) => s.id);
      }

      // Select a wild myth from the region pool (only DB-backed species)
      if (regionMonsterIds.length > 0) {
        const wild = selectWildMonster(regionMonsterIds, allSpecies);
        if (wild) {
          const shiny = rollShinyVariant();
          const wildLevel = wildMonsterLevel(requiredLevel, player.explorerLevel);
          encounterSpecies = wild;
          encounter = {
            species: formatSpecies(wild),
            wildLevel,
            shinyVariant: shiny,
          };
        }
      }
      // Empty regionMonsterIds → no encounter; client receives encounterTriggered: false
    }

    // Update player
    await db
      .update(playersTable)
      .set({
        posX: newX,
        posY: newY,
        regionId: body.data.regionId,
        energy: player.energy - energyCost,
        explorerXp: newXp,
        explorerLevel: newLevel,
        explorerRank: newRank,
        tilesExplored: player.tilesExplored + 1,
        coins: player.coins + coinGain,
        monstersDiscovered: encounterSpecies
          ? player.monstersDiscovered + 1
          : player.monstersDiscovered,
      })
      .where(eq(playersTable.id, params.data.playerId));

    // Random secret event
    const secretEvents = [
      "You found a Treasure Chest! +50 coins",
      "An Ancient Shrine glows softly...",
      "A Hidden Merchant appears briefly!",
      "You discovered a Mystery Egg!",
      "A shooting star streaks overhead!",
    ];
    const secretEvent =
      Math.random() < 0.02
        ? secretEvents[Math.floor(Math.random() * secretEvents.length)]
        : null;

    res.json(
      ExploreTileResponse.parse({
        newPosX: newX,
        newPosY: newY,
        newTile,
        encounterTriggered: triggered && encounter !== null,
        encounter: encounter ?? null,
        explorerXpGained: xpGain,
        coinsGained: coinGain,
        energyCost,
        remainingEnergy: player.energy - energyCost,
        secretEvent: secretEvent ?? null,
      }),
    );
  },
);

export default router;
