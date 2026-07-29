import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { playersTable } from "./players";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => playersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // orb, energy, heal, evolution, key
  type: text("type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  description: text("description").notNull(),
  // For orbs: Basic, Explorer, Hunter, Elite, Master, Celestial, Infinity
  orbType: text("orb_type"),
});

export const insertInventoryItemSchema = createInsertSchema(
  inventoryItemsTable,
).omit({ id: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;
