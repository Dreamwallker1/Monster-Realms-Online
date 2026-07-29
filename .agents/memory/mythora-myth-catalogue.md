---
name: Mythora myth catalogue
description: Structure of the 100-myth catalogue, quality tiers, and how to seed/update them.
---

**100 myths total:** 5 elements × 20 myths each.
Elements: Fire, Water, Nature, Electric, Dark.

**Quality tiers per element:** C×8, B×6, A×4, S×2.
- C and B have evolution chains (C→B→A). S myths are standalone legendaries.
- The `rarity` DB column stores the quality tier string: `"C"` / `"B"` / `"A"` / `"S"`.

**Key files:**
- `artifacts/api-server/src/lib/monsterData.ts` — all 100 myth definitions (exported as `MONSTER_SEED_DATA`)
- `artifacts/api-server/src/lib/regionData.ts` — 10 regions mapped to myth IDs
- `artifacts/monster-realms/src/lib/monster-emoji.ts` — emoji per myth ID (all 100 mapped)

**Seeding:** `POST /api/seed` (dev only) — upserts all 100 myths and 10 regions. Re-run after any monsterData.ts change and API server restart.

**Regions (10):** verdant-meadows, volcanic-rift, scorched-wastes, ocean-ruins, deep-current, ancient-forest, thunder-valley, storm-peaks, shadow-marsh, void-realm.

**Why:** Previous 28-myth catalogue used old element set (Fire/Water/Nature/Electric/Ice/Earth/Air/Light/Dark/Metal/Crystal). New catalogue uses 5 elements only, matching the game's UI element filter options.
