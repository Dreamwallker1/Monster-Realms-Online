---
name: Phaser 4 compatibility notes
description: Breaking differences vs Phaser 3 found in Monster Realms (Phaser v4.2.1)
---

## Key Phaser 4 differences

**`Graphics.setTint()` does not exist.**
Use a separate full-world overlay `Graphics` object with `fillStyle(color, alpha)` + `fillRect(...)` instead. Call `clear()` each frame in `update()`.

**`scene.events.once('ready', ...)` still works** for post-boot initialization.

**`scene.scene.restart(data)` still works** but Phaser calls `init({})` on first boot before data arrives.
- Guard every `init()` assignment with `??` so class defaults are preserved on the empty-data first run.
- Pattern: `this.field = data?.field ?? this.field ?? defaultValue`

**Single Graphics for all tiles is required.**
Creating one `Graphics` per tile (2500 objects for 50×50 map) causes severe performance problems.
Use a single `terrainGraphics` object with `setDepth()` layering instead.

**Why:** Phaser 4 removed/renamed several Phaser 3 APIs. `Graphics` no longer inherits from `GameObject` in the same way and lost the tint pipeline.
