import {
  pgTable,
  text,
  integer,
  json,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { playersTable } from "./players";

export interface BattleLogEntry {
  turn: number;
  actor: "player" | "wild";
  action: string;
  description: string;
  damageDealt: number | null;
  critical: boolean;
}

export const battlesTable = pgTable("battles", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => playersTable.id, { onDelete: "cascade" }),

  // Status: active, won, lost, fled, captured
  status: text("status").notNull().default("active"),
  turn: integer("turn").notNull().default(1),

  // Wild monster state
  wildSpeciesId: text("wild_species_id").notNull(),
  wildLevel: integer("wild_level").notNull(),
  wildCurrentHp: integer("wild_current_hp").notNull(),
  wildMaxHp: integer("wild_max_hp").notNull(),
  wildAttack: integer("wild_attack").notNull(),
  wildDefense: integer("wild_defense").notNull(),
  wildSpeed: integer("wild_speed").notNull(),
  wildShinyVariant: text("wild_shiny_variant"),
  wildStatusEffect: text("wild_status_effect"),

  // Player monster (capturedId)
  playerCapturedId: uuid("player_captured_id").notNull(),
  playerCurrentHp: integer("player_current_hp").notNull(),
  playerStatusEffect: text("player_status_effect"),

  // Battle log
  log: json("log").notNull().$type<BattleLogEntry[]>().default([]),

  // Rewards
  expReward: integer("exp_reward"),
  coinReward: integer("coin_reward"),
  capturedMonsterId: uuid("captured_monster_id"),

  regionId: text("region_id").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertBattleSchema = createInsertSchema(battlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBattle = z.infer<typeof insertBattleSchema>;
export type Battle = typeof battlesTable.$inferSelect;
