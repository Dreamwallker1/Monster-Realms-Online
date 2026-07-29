# Monster Realms Online

A browser-based monster-collecting RPG combining classic pixel-art overworld exploration with premium cinematic UI.

## Design System

**Aesthetic**: Dark Cinematic Premium
- Deep navy/indigo backgrounds
- Glowing cyan/violet accents  
- Glassmorphism panels with blur and glow
- Gold glow for legendary/rare content
- Animated gradients and particle effects

**Typography**:
- Display: Syne (bold, geometric)
- Monospace: Space Mono (stats, numbers)

**Color Palette**:
- Primary: #22D3EE (cyan)
- Secondary: #A78BFA (violet)  
- Gold: #FBBF24 (legendary items)
- Background: Deep indigo-navy

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Game Engine**: Phaser 3 (pixel-art overworld)
- **State**: Zustand (global game state)
- **Routing**: Wouter
- **Styling**: Tailwind CSS + custom glassmorphism
- **API**: TanStack Query + Orval-generated hooks
- **Realtime**: Socket.io (multiplayer positions)

## Features

### Core Gameplay
- **Tile-based exploration**: 50×50 procedurally generated world with varied terrain
- **Fog of war**: Tiles revealed as you explore
- **Random encounters**: Every step could trigger a rare monster
- **Turn-based battles**: Strategic combat with skills and capture mechanics
- **Team building**: Collect and build a team of up to 6 monsters
- **Multiplayer**: See other players moving in real-time

### Pages
- `/` - Landing page with character creation (guest or account)
- `/game` - Main game view with Phaser canvas and React UI overlays
- `/collection` - Grid of all captured monsters with filters
- `/encyclopedia` - All monster species with detailed stats and lore
- `/profile` - Player stats, team, achievements, and progress
- `/leaderboard` - Rankings across Explorer, Collection, PvP, and Tiles

### UI Components
- **Game HUD**: Bottom bar with team preview, energy, coins, radar
- **Encounter Popup**: Slides up when a wild monster appears
- **Battle Overlay**: Full-screen turn-based combat interface
- **Sidebar Menu**: Navigation to all pages
- **Monster Portraits**: Unique SVG artwork per element type

## Running the App

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @workspace/monster-realms dev

# Build for production
pnpm --filter @workspace/monster-realms build
```

## Architecture Notes

- **Phaser ↔ React bridge**: WorldScene communicates via callbacks passed through PhaserGame component
- **Zustand store**: Manages player state, encounters, battles, fog of war, other players
- **Auth**: JWT stored in localStorage, configured via setAuthTokenGetter
- **Socket.io**: Connects to `/game` namespace for real-time multiplayer
- **Orval hooks**: All API calls use generated React Query hooks

## Element Types

Fire, Water, Nature, Electric, Ice, Earth, Air, Light, Dark, Metal, Crystal, Void

Each element has unique SVG portrait artwork and color theming.

## Rarity Tiers

Common, Uncommon, Rare, Epic, Legendary, Mythic, Ancient, Celestial, Void

Higher rarities glow more intensely and have better stats.
