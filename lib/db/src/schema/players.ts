import {
  pgTable,
  text,
  boolean,
  integer,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isGuest: boolean("is_guest").notNull().default(false),
  avatarColor: text("avatar_color").notNull().default("#6c63ff"),

  // Explorer progression
  explorerRank: text("explorer_rank").notNull().default("Novice"),
  explorerXp: integer("explorer_xp").notNull().default(0),
  explorerLevel: integer("explorer_level").notNull().default(1),
  tilesExplored: integer("tiles_explored").notNull().default(0),

  // Resources
  energy: integer("energy").notNull().default(300),
  maxEnergy: integer("max_energy").notNull().default(300),
  coins: integer("coins").notNull().default(100),

  // Stats
  monstersDiscovered: integer("monsters_discovered").notNull().default(0),
  monstersCaptured: integer("monsters_captured").notNull().default(0),
  pvpWins: integer("pvp_wins").notNull().default(0),
  pvpLosses: integer("pvp_losses").notNull().default(0),
  battlesWon: integer("battles_won").notNull().default(0),
  battlesLost: integer("battles_lost").notNull().default(0),
  secretsFound: integer("secrets_found").notNull().default(0),
  firstDiscoveries: integer("first_discoveries").notNull().default(0),
  totalPlayTime: integer("total_play_time").notNull().default(0),

  // World position
  posX: integer("pos_x").notNull().default(25),
  posY: integer("pos_y").notNull().default(4),
  regionId: text("region_id").default("verdant-meadows"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
