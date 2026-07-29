import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { regionsTable, monsterSpeciesTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import {
  GetRegionParams,
  GetRegionResponse,
  ListRegionsResponse,
} from "@workspace/api-zod";
import { formatSpecies } from "./monsters.js";

const router: IRouter = Router();

async function formatRegion(r: typeof regionsTable.$inferSelect) {
  const monsterIds = r.monsterSpeciesIds as string[];
  const monsters =
    monsterIds.length > 0
      ? await db
          .select()
          .from(monsterSpeciesTable)
          .where(inArray(monsterSpeciesTable.id, monsterIds))
      : [];
  return {
    id: r.id,
    name: r.name,
    biome: r.biome,
    description: r.description,
    requiredExplorerLevel: r.requiredExplorerLevel,
    monsterCount: monsterIds.length,
    width: r.width,
    height: r.height,
    monsters: monsters.map(formatSpecies),
  };
}

// GET /regions
router.get("/regions", async (_req, res): Promise<void> => {
  const regions = await db.select().from(regionsTable);
  const formatted = await Promise.all(regions.map(formatRegion));
  res.json(ListRegionsResponse.parse(formatted));
});

// GET /regions/:regionId
router.get("/regions/:regionId", async (req, res): Promise<void> => {
  const params = GetRegionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [region] = await db
    .select()
    .from(regionsTable)
    .where(eq(regionsTable.id, params.data.regionId));
  if (!region) {
    res.status(404).json({ error: "Region not found" });
    return;
  }
  res.json(GetRegionResponse.parse(await formatRegion(region)));
});

export default router;
