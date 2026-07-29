---
name: Monster Realms movement & spawn
description: Why movement was broken and how it was fixed — pond spawn, random terrain, Phaser event capture, D-pad wiring
---

# Monster Realms — Movement & Spawn Bugs

## The problems

### 1. Player spawned inside the pond (impassable)
DB schema defaulted `posX=25, posY=25`. The park terrain places the pond at `paintCircle(terrain, 25, 25, 4, Pond)`. Radius=4 means all tiles within 4 steps are impassable — no direction produced a passable target tile. Movement was silently blocked by `isPassable()` check.

**Fix:** Changed DB default to `posX=25, posY=4` (entrance path). Pond moved to `(midCol, midRow-6)` = row 19, well away from the spawn. Added BFS `nearestPassable()` safety net in `WorldScene.create()`.

**Why:** `posX=25, posY=25` was the exact center of the map, which I then set as the pond center. Both numbers were independently reasonable but lethal together.

**How to apply:** Any time you place an impassable feature, verify the DB default spawn is not within its radius. Use `nearestPassable()` as a fallback in scene init.

### 2. Terrain regenerated randomly on every scene restart
`generateTerrain()` used `Math.random()` internally. On every Phaser scene restart the map changed, so a player's DB-stored position could land on a Tree or Pond in the new layout.

**Fix:** Added seeded PRNG (`mulberry32`, `MAP_SEED = 0xdeadbeef`) to `terrain.ts`. Map is now identical every session. Changing `MAP_SEED` regenerates the whole map.

**Why:** Deterministic terrain is required whenever player positions are persisted server-side.

### 3. Phaser captures pointer events before DOM buttons receive them
`onPointerDown` on React buttons was intercepted by Phaser's capture-phase input listener on `document`. The D-pad buttons appeared functional but never fired.

**Fix:** D-pad dispatches `window.dispatchEvent(new CustomEvent('mro:move', { detail: { dx, dy } }))`. WorldScene listens with `window.addEventListener('mro:move', handler)` in `create()` and removes it on `'shutdown'`.

**Why:** `window` CustomEvent bypasses Phaser's input system entirely. Non-component utility (`dispatchMove`) lives in `lib/dpad-events.ts` to avoid Vite Fast Refresh warnings.

### 4. `Phaser.Core.Events.DESTROY` doesn't exist in Phaser 4
Using this constant caused a runtime error that prevented the `window.addEventListener` from ever being registered — listener never added, D-pad silently dead.

**Fix:** Use the string `'shutdown'` instead. Scene fires `'shutdown'` when restarted or stopped.

### 5. `exploreTile.mutateAsync` was missing `playerId`
Call was `mutateAsync({ data: input })` but the hook requires `{ playerId, data }`. API returned 400, catch block swallowed it, encounters never triggered (though visual movement still worked because the tween fires before the API call).

**Fix:** `mutateAsync({ playerId: player.id, data: input })`.
