import { pgTable, text, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const regionsTable = pgTable("regions", {
  id: text("id").primaryKey(), // slug, e.g. "verdant-meadows"
  name: text("name").notNull(),
  biome: text("biome").notNull(),
  description: text("description").notNull(),
  requiredExplorerLevel: integer("required_explorer_level").notNull().default(1),
  width: integer("width").notNull().default(50),
  height: integer("height").notNull().default(50),
  // JSON array of monster species IDs that appear in this region
  monsterSpeciesIds: json("monster_species_ids").notNull().$type<string[]>(),
});

export const insertRegionSchema = createInsertSchema(regionsTable).omit({});
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regionsTable.$inferSelect;
