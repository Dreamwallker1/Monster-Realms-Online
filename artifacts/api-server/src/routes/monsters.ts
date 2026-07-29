import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { monsterSpeciesTable } from "@workspace/db";
import { eq, like, and, inArray, SQL } from "drizzle-orm";
import {
  GetMonsterSpeciesParams,
  GetMonsterSpeciesResponse,
  ListMonsterSpeciesQueryParams,
  ListMonsterSpeciesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatSpecies(s: typeof monsterSpeciesTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    element: s.element,
    rarity: s.rarity,
    baseHp: s.baseHp,
    baseAttack: s.baseAttack,
    baseDefense: s.baseDefense,
    baseSpeed: s.baseSpeed,
    description: s.description,
    lore: s.lore,
    captureRate: s.captureRate,
    weight: s.weight,
    height: s.height,
    personality: s.personality,
    evolutionFromId: s.evolutionFromId ?? null,
    evolutionToId: s.evolutionToId ?? null,
    evolutionLevel: s.evolutionLevel ?? null,
    skills: s.skills as object[],
    regionIds: s.regionIds as string[],
  };
}

export { formatSpecies };

// GET /monsters
router.get("/monsters", async (req, res): Promise<void> => {
  const queryParams = ListMonsterSpeciesQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (queryParams.data.element) {
    conditions.push(eq(monsterSpeciesTable.element, queryParams.data.element));
  }
  if (queryParams.data.rarity) {
    conditions.push(eq(monsterSpeciesTable.rarity, queryParams.data.rarity));
  }
  if (queryParams.data.search) {
    conditions.push(like(monsterSpeciesTable.name, `%${queryParams.data.search}%`));
  }

  const species =
    conditions.length > 0
      ? await db.select().from(monsterSpeciesTable).where(and(...conditions))
      : await db.select().from(monsterSpeciesTable);

  res.json(ListMonsterSpeciesResponse.parse(species.map(formatSpecies)));
});

// GET /monsters/:speciesId
router.get("/monsters/:speciesId", async (req, res): Promise<void> => {
  const params = GetMonsterSpeciesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [species] = await db
    .select()
    .from(monsterSpeciesTable)
    .where(eq(monsterSpeciesTable.id, params.data.speciesId));

  if (!species) {
    res.status(404).json({ error: "Monster species not found" });
    return;
  }

  res.json(GetMonsterSpeciesResponse.parse(formatSpecies(species)));
});

export default router;
