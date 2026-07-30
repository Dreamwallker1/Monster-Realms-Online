---
name: Myth Catalogue v3
description: 25-myth replacement catalogue details and what changed from the previous 100-myth catalogue
---

# Myth Catalogue v3

## What changed
- Deleted all 100 old myths; replaced with 25 new ones (5 elements × 5 each: 2C/1B/1A/1S)
- Elements: Fire · Water · Earth · Storm · Shadow (no Nature/Electric/Dark in new catalogue)
- Region IDs used: volcanic-rift/scorched-wastes (Fire), ocean-ruins/deep-current (Water), ancient-forest/verdant-meadows (Earth), thunder-valley/storm-peaks (Storm), shadow-marsh/void-realm (Shadow)

## Seed trigger
`seedOnStartup` uses a species-count fingerprint: `dbSpecies !== expectedSpecies` → upserts all. Confirmed working at restart (100 → 25 detected, upserted cleanly).

## Skills per myth
Exactly 3: type `"normal"` (basic), `"skill1"` (power), `"ultimate"` (big)

## Rarity capture rates
- C: ~85–90 · B: 55–60 · A: 28–35 · S: 8–12

**Why:** Old 100 myths had overlapping IDs and no element=Storm/Shadow entries, causing team builder and type-chart gaps.

**How to apply:** Any future myth additions must also add entries to `monster-emoji.ts` (getMonsterEmoji) and `element-colors.ts` (ELEMENT_COLORS + ELEMENT_EMOJI) for the new elements. Re-run seed after any species ID changes.
