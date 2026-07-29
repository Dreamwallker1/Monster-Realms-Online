import { pgTable, text, integer, real, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const monsterSpeciesTable = pgTable("monster_species", {
  id: text("id").primaryKey(), // slug-based, e.g. "ember-drake"
  name: text("name").notNull(),
  element: text("element").notNull(), // Fire, Water, Nature, etc.
  rarity: text("rarity").notNull(), // Common, Uncommon, Rare, Epic, Legendary, Mythic, Ancient, Celestial, Void

  // Base stats (scale with level)
  baseHp: integer("base_hp").notNull(),
  baseAttack: integer("base_attack").notNull(),
  baseDefense: integer("base_defense").notNull(),
  baseSpeed: integer("base_speed").notNull(),

  // Flavour
  description: text("description").notNull(),
  lore: text("lore").notNull(),
  personality: text("personality").notNull(),
  weight: real("weight").notNull(), // kg
  height: real("height").notNull(), // m

  // Capture
  captureRate: integer("capture_rate").notNull(), // 0-100 base chance %

  // Evolution
  evolutionFromId: text("evolution_from_id"),
  evolutionToId: text("evolution_to_id"),
  evolutionLevel: integer("evolution_level"),

  // Skills stored as JSON array: { name, type, element, power, accuracy, description }[]
  skills: json("skills").notNull().$type<SkillData[]>(),

  // Regions this monster appears in (JSON string array)
  regionIds: json("region_ids").notNull().$type<string[]>(),
});

export interface SkillData {
  name: string;
  type: "normal" | "skill1" | "skill2" | "ultimate" | "passive";
  element: string;
  power: number;
  accuracy: number;
  description: string;
}

export const insertMonsterSpeciesSchema = createInsertSchema(
  monsterSpeciesTable,
).omit({});
export type InsertMonsterSpecies = z.infer<typeof insertMonsterSpeciesSchema>;
export type MonsterSpecies = typeof monsterSpeciesTable.$inferSelect;
