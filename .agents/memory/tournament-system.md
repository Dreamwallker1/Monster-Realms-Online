---
name: Daily Arena tournament system
description: Daily 1v1 PvP tournament with SOL prize pool from orb revenue
---

## Architecture
- Tournament auto-creates each day when first accessed
- Status flow: `registration` → `active` (at TOURNAMENT_HOUR_UTC, default 20 UTC) → `completed` (after totalRounds=5)
- State advances lazily on `GET /api/tournament/today` — no cron job needed

## Prize Pool
- 30% of that day's `shopPurchasesTable.lamports` total
- Rank 1–3: 10% each of pool
- Rank 4–7: 5% each of pool
- Rank 8–20: 3% each of pool
- Remainder stays in treasury (intentional — sustainability)

## Battle simulation
- Power score = sum of (level × attack + defense + speed) per team myth
- Win probability = clamp(0.25–0.75, powerA / (powerA + powerB))
- Rounds generated fresh each round; odd player gets bye (counts as win)

## SOL payouts
- Requires `TREASURY_PRIVATE_KEY` env var (base58 keypair) to auto-send
- Without it: payout shown as "pending" — safe fallback
- Player must have `solanaWallet` set (via Phantom connect on shop page)

## DB tables
- `tournamentsTable`: id, tournamentDate (unique), status, currentRound, totalRounds, prizePoolLamports
- `tournamentRegistrationsTable`: tournamentId+playerId (unique), wins, losses, byes, finalRank, payoutLamports, payoutClaimed
- `tournamentMatchesTable`: round, player1Id, player2Id, winnerId, battleId, status

## Env vars
- `TOURNAMENT_HOUR_UTC` — hour to start (default 20)
- `TREASURY_PRIVATE_KEY` — base58 private key for sending payouts
- `SOLANA_RPC_URL` — RPC endpoint

**Why:** Auto-advancing state keeps the system simple (no worker/cron). Prize pool tied to real revenue prevents unsustainable fixed payouts.
**How to apply:** To add new prize tiers, edit PRIZE_DIST array in tournament.ts backend.
