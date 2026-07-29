import {
  pgTable,
  text,
  integer,
  boolean,
  uuid,
  timestamp,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { playersTable } from "./players";

// ── Daily tournament ──────────────────────────────────────────────────────────
export const tournamentsTable = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentDate: date("tournament_date").notNull().unique(),
  status: text("status").notNull().default("registration"), // registration | active | completed
  currentRound: integer("current_round").notNull().default(0),
  totalRounds: integer("total_rounds").notNull().default(5),
  prizePoolLamports: integer("prize_pool_lamports").notNull().default(0),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Tournament registrations ──────────────────────────────────────────────────
export const tournamentRegistrationsTable = pgTable("tournament_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournamentsTable.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => playersTable.id, { onDelete: "cascade" }),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  byes: integer("byes").notNull().default(0),   // rounds without opponent
  finalRank: integer("final_rank"),
  payoutLamports: integer("payout_lamports").notNull().default(0),
  payoutClaimed: boolean("payout_claimed").notNull().default(false),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.tournamentId, t.playerId),
]);

// ── Tournament matches ─────────────────────────────────────────────────────────
export const tournamentMatchesTable = pgTable("tournament_matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").notNull().references(() => tournamentsTable.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  player1Id: uuid("player1_id").notNull().references(() => playersTable.id),
  player2Id: uuid("player2_id").notNull().references(() => playersTable.id),
  winnerId: uuid("winner_id").references(() => playersTable.id),
  battleId: uuid("battle_id"),
  status: text("status").notNull().default("pending"), // pending | active | completed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Tournament = typeof tournamentsTable.$inferSelect;
export type TournamentRegistration = typeof tournamentRegistrationsTable.$inferSelect;
export type TournamentMatch = typeof tournamentMatchesTable.$inferSelect;
