import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  inventoryItemsTable,
  capturedMonstersTable,
  playersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  GetPlayerInventoryParams,
  GetPlayerInventoryResponse,
  UseItemParams,
  UseItemBody,
  UseItemResponse,
} from "@workspace/api-zod";
import { formatCapturedMonster } from "./collection.js";
import { monsterSpeciesTable } from "@workspace/db";

const router: IRouter = Router();

// GET /players/:playerId/inventory
router.get(
  "/players/:playerId/inventory",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetPlayerInventoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const items = await db
      .select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.playerId, params.data.playerId));

    const [player] = await db
      .select({ coins: playersTable.coins })
      .from(playersTable)
      .where(eq(playersTable.id, params.data.playerId));

    const totalOrbs = items
      .filter((i) => i.type === "orb")
      .reduce((sum, i) => sum + i.quantity, 0);

    res.json(
      GetPlayerInventoryResponse.parse({
        playerId: params.data.playerId,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          quantity: i.quantity,
          description: i.description,
          orbType: i.orbType ?? null,
        })),
        coins: player?.coins ?? 0,
        totalOrbs,
      }),
    );
  },
);

// POST /players/:playerId/inventory/use
router.post(
  "/players/:playerId/inventory/use",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UseItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (req.playerId !== params.data.playerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const body = UseItemBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [item] = await db
      .select()
      .from(inventoryItemsTable)
      .where(
        and(
          eq(inventoryItemsTable.id, body.data.itemId),
          eq(inventoryItemsTable.playerId, params.data.playerId),
        ),
      );

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    if (item.quantity <= 0) {
      res.status(400).json({ error: "No items remaining" });
      return;
    }

    // Reduce quantity
    await db
      .update(inventoryItemsTable)
      .set({ quantity: item.quantity - 1 })
      .where(eq(inventoryItemsTable.id, item.id));

    if (item.type === "energy") {
      const [player] = await db
        .select({ energy: playersTable.energy, maxEnergy: playersTable.maxEnergy })
        .from(playersTable)
        .where(eq(playersTable.id, params.data.playerId));
      const energyRestored = Math.min(200, (player?.maxEnergy ?? 300) - (player?.energy ?? 0));
      await db
        .update(playersTable)
        .set({ energy: (player?.energy ?? 0) + energyRestored })
        .where(eq(playersTable.id, params.data.playerId));
      res.json(
        UseItemResponse.parse({
          success: true,
          message: `Restored ${energyRestored} energy!`,
          updatedMonster: null,
          energyRestored,
        }),
      );
      return;
    }

    if (item.type === "heal" && body.data.targetCapturedMonsterId) {
      const [row] = await db
        .select()
        .from(capturedMonstersTable)
        .leftJoin(
          monsterSpeciesTable,
          eq(capturedMonstersTable.speciesId, monsterSpeciesTable.id),
        )
        .where(
          and(
            eq(capturedMonstersTable.id, body.data.targetCapturedMonsterId),
            eq(capturedMonstersTable.playerId, params.data.playerId),
          ),
        );
      if (!row || !row.monster_species) {
        res.status(404).json({ error: "Target monster not found" });
        return;
      }
      const healAmount = 30;
      const newHp = Math.min(
        row.captured_monsters.maxHp,
        row.captured_monsters.currentHp + healAmount,
      );
      const [updated] = await db
        .update(capturedMonstersTable)
        .set({ currentHp: newHp })
        .where(eq(capturedMonstersTable.id, body.data.targetCapturedMonsterId))
        .returning();
      res.json(
        UseItemResponse.parse({
          success: true,
          message: `Healed ${row.monster_species.name} for ${healAmount} HP!`,
          updatedMonster: formatCapturedMonster(updated!, row.monster_species),
          energyRestored: null,
        }),
      );
      return;
    }

    res.json(
      UseItemResponse.parse({
        success: true,
        message: `Used ${item.name}!`,
        updatedMonster: null,
        energyRestored: null,
      }),
    );
  },
);

export default router;
