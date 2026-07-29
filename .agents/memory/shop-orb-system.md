---
name: Mythora shop & orb system
description: Phantom wallet + SOL payment shop with tiered orbs (Prism/Luna/Aether/Void)
---

## Orb Tiers
- Prism (C): 0.025 SOL, ×1.0 capture, 5 free/day
- Luna (B): 0.050 SOL, ×1.6 capture, 3 free/day
- Aether (A): 0.075 SOL, ×2.5 capture, 2 free/day
- Void (S): 0.100 SOL, ×4.0 capture, 1 free/day

Daily free pack resets every 8 hours (does NOT accumulate — overwrites to daily amounts).

## DB Changes
- `playersTable`: added `solanaWallet` (text nullable) + `lastOrbRefresh` (timestamp nullable)
- `inventoryItemsTable`: orbType values changed from "Basic/Explorer/…" to "Prism/Luna/Aether/Void"
- `shopPurchasesTable`: new table for double-spend prevention (txSignature unique)

## Backend
- `artifacts/api-server/src/routes/shop.ts` — all shop endpoints
- Routes: `GET /api/shop/status`, `POST /api/shop/claim-daily`, `POST /api/shop/wallet`, `POST /api/shop/purchase`, `POST /api/shop/deduct`
- Env vars: `TREASURY_WALLET_ADDRESS`, `SOLANA_RPC_URL`, `SOLANA_NETWORK`
- Status endpoint returns `{ orbs, canClaimFree, msUntilRefresh, treasury, network, rpcUrl }`

## Frontend
- `artifacts/monster-realms/src/lib/phantom.ts` — Phantom wallet util (no adapter library, uses window.phantom directly)
- `artifacts/monster-realms/src/pages/shop.tsx` — Mythic Bazaar shop page
- `@solana/web3.js` installed on both frontend and api-server
- `vite-plugin-node-polyfills` added to vite.config.ts for Buffer/process polyfills

## Battles
- battles.ts now deducts one orb from inventory before calculating capture chance
- Default orb in capture action changed from "Basic" to "Prism"
- auth.ts starter pack now grants Prism×5, Luna×3, Aether×2, Void×1 (+ Healing Herb×3)

**Why:** Old orb system had no economy — Basic orbs were unlimited. Tiered orbs create progression incentive and SOL revenue stream.

**How to apply:** Any new orb type must be added to both `ORB_CONFIG` in shop.ts AND `orbBonus` in gameEngine.ts calculateCaptureChance.
