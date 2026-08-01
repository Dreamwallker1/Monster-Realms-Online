import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  capturedMonstersTable,
  monsterSpeciesTable,
} from "@workspace/db";
import type {
  CapturedMonster,
  MonsterSpecies,
} from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { formatSpecies } from "./monsters.js";
import {
  GetPlayerCollectionParams,
  GetPlayerCollectionQueryParams,
  GetPlayerCollectionResponse,
  CaptureMonsterParams,
  GetCapturedMonsterParams,
  GetCapturedMonsterResponse,
  UpdateCapturedMonsterParams,
  UpdateCapturedMonsterBody,
  UpdateCapturedMonsterResponse,
} from "@workspace/api-zod";
import { MONSTER_SEED_DATA } from "../lib/monsterData.js";

const router: IRouter = Router();
const ACTIVE_SPECIES_IDS = new Set(MONSTER_SEED_DATA.map((species) => species.id));

export function formatCapturedMonster(
  c: CapturedMonster,
  species: MonsterSpecies,
) {
  return {
    id: c.id,
    playerId: c.playerId,
    speciesId: c.speciesId,
    species: formatSpecies(species),
    nickname: c.nickname ?? null,
    level: c.level,
    currentHp: c.currentHp,
    maxHp: c.maxHp,
    attack: c.attack,
    defense: c.defense,
    speed: c.speed,
    experience: c.experience,
    shinyVariant: c.shinyVariant ?? null,
    friendship: c.friendship,
    personality: c.personality,
    inTeam: c.inTeam,
    teamSlot: c.teamSlot ?? null,
    capturedAt: c.capturedAt.toISOString(),
  };
}

// GET /players/:playerId/collection
router.get(
  "/players/:playerId/collection",
  async (req, res): Promise<void> => {
    const params = GetPlayerCollectionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const query = GetPlayerCollectionQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }

    const rows = await db
      .select()
      .from(capturedMonstersTable)
      .leftJoin(
        monsterSpeciesTable,
        eq(capturedMonstersTable.speciesId, monsterSpeciesTable.id),
      )
      .where(eq(capturedMonstersTable.playerId, params.data.playerId));

    let results = rows.filter(
      (r) => r.monster_species && ACTIVE_SPECIES_IDS.has(r.captured_monsters.speciesId),
    );

    if (query.data.element) {
      results = results.filter(
        (r) => r.monster_species?.element === query.data.element,
      );
    }
    if (query.data.rarity) {
      results = results.filter(
        (r) => r.monster_species?.rarity === query.data.rarity,
      );
    }

    res.json(
      GetPlayerCollectionResponse.parse(
        results.map((r) =>
          formatCapturedMonster(r.captured_monsters, r.monster_species!),
        ),
      ),
    );
  },
);

// POST /players/:playerId/collection (capture)
router.post(
  "/players/:playerId/collection",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = CaptureMonsterParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Cannot capture for another player" });
      return;
    }
    // Captures are authoritative battle rewards. Keeping a public creation
    // endpoint enabled would let a modified client mint arbitrary high-level myths.
    res.status(403).json({ error: "Myths can only be captured through an active battle" });
    return;
  },
);

// GET /players/:playerId/collection/:capturedId
router.get(
  "/players/:playerId/collection/:capturedId",
  async (req, res): Promise<void> => {
    const params = GetCapturedMonsterParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [row] = await db
      .select()
      .from(capturedMonstersTable)
      .leftJoin(
        monsterSpeciesTable,
        eq(capturedMonstersTable.speciesId, monsterSpeciesTable.id),
      )
      .where(
        and(
          eq(capturedMonstersTable.id, params.data.capturedId),
          eq(capturedMonstersTable.playerId, params.data.playerId),
        ),
      );
    if (!row || !row.monster_species || !ACTIVE_SPECIES_IDS.has(row.captured_monsters.speciesId)) {
      res.status(404).json({ error: "Monster not found" });
      return;
    }
    res.json(
      GetCapturedMonsterResponse.parse(
        formatCapturedMonster(row.captured_monsters, row.monster_species),
      ),
    );
  },
);

// PATCH /players/:playerId/collection/:capturedId
router.patch(
  "/players/:playerId/collection/:capturedId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateCapturedMonsterParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const body = UpdateCapturedMonsterBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const [updated] = await db
      .update(capturedMonstersTable)
      .set(body.data)
      .where(
        and(
          eq(capturedMonstersTable.id, params.data.capturedId),
          eq(capturedMonstersTable.playerId, params.data.playerId),
        ),
      )
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Monster not found" });
      return;
    }
    const [species] = await db
      .select()
      .from(monsterSpeciesTable)
      .where(eq(monsterSpeciesTable.id, updated.speciesId));
    res.json(
      UpdateCapturedMonsterResponse.parse(formatCapturedMonster(updated, species!)),
    );
  },
);

export default router;
