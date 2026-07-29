---
name: Mythora energy regen
description: How player energy regenerates in Mythora — where it's implemented and the rate.
---

Energy regen is implemented in `GET /auth/me` (auth.ts), not in a separate cron.

**Rule:** 1 energy per 20 seconds of inactivity (idle time since `updatedAt`).

**How it works:**
- `elapsedMs = Date.now() - player.updatedAt.getTime()`
- `regenAmount = Math.floor(elapsedMs * (1 / 20000))`
- If `regenAmount > 0` AND `energy < maxEnergy`, update DB (which bumps `updatedAt` via Drizzle `$onUpdate`)
- Subsequent polls see fresh `updatedAt` → elapsed ≈ 0 → regen = 0 (no spam writes)

**Why updatedAt works:** Every explore step updates the player row (bumps `updatedAt`). While walking, elapsed per /auth/me poll is tiny → effectively 0 regen during play. When idle/logged-out, time accumulates and the next /auth/me call grants the banked energy.

**How to apply:** If energy regen rate needs changing, edit the `regenPerMs` constant in auth.ts `GET /auth/me`. If a more granular last-regen timestamp is needed in future, add a `lastEnergyRegenAt` column to players schema.

**DB reset (emergency):** `UPDATE players SET energy = max_energy;` via psql — does NOT bump updatedAt (raw SQL bypasses Drizzle hooks), so regen logic still works correctly after.
