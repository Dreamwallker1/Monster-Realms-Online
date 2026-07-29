import { pgTable, text, integer, uuid, timestamp } from "drizzle-orm/pg-core";
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
  // For orbs: Prism (C), Luna (B), Aether (A), Void (S)
  orbType: text("orb_type"),
});

// Tracks processed Solana tx signatures — prevents double-spend
export const shopPurchasesTable = pgTable("shop_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => playersTable.id, { onDelete: "cascade" }),
  txSignature: text("tx_signature").notNull().unique(),
  orbType: text("orb_type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  lamports: integer("lamports").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(
  inventoryItemsTable,
).omit({ id: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;
