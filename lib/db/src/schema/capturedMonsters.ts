import {
  pgTable,
  text,
  integer,
  boolean,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { playersTable } from "./players";
import { monsterSpeciesTable } from "./monsterSpecies";

export const capturedMonstersTable = pgTable("captured_monsters", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => playersTable.id, { onDelete: "cascade" }),
  speciesId: text("species_id")
    .notNull()
    .references(() => monsterSpeciesTable.id),

  nickname: text("nickname"),
  level: integer("level").notNull().default(1),
  currentHp: integer("current_hp").notNull(),
  maxHp: integer("max_hp").notNull(),
  attack: integer("attack").notNull(),
  defense: integer("defense").notNull(),
  speed: integer("speed").notNull(),
  experience: integer("experience").notNull().default(0),

  // Shiny: Golden, Crystal, Shadow, Galaxy, Prismatic, or null
  shinyVariant: text("shiny_variant"),
  friendship: integer("friendship").notNull().default(0),
  personality: text("personality").notNull().default("Hardy"),

  // Team
  inTeam: boolean("in_team").notNull().default(false),
  teamSlot: integer("team_slot"),

  capturedAt: timestamp("captured_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCapturedMonsterSchema = createInsertSchema(
  capturedMonstersTable,
).omit({ id: true, capturedAt: true });
export type InsertCapturedMonster = z.infer<typeof insertCapturedMonsterSchema>;
export type CapturedMonster = typeof capturedMonstersTable.$inferSelect;
