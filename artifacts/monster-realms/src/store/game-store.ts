import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, MonsterSpecies, CapturedMonster, Battle } from '@workspace/api-client-react';

interface EncounterState {
  triggered: boolean;
  species: MonsterSpecies | null;
  wildLevel: number;
  shinyVariant: string | null;
}

interface BattleState {
  active: boolean;
  battleId: string | null;
  battle: Battle | null;
}

interface GameState {
  // Player state
  player: Player | null;
  setPlayer: (player: Player | null) => void;

  // Character type (persisted locally — not stored server-side)
  characterType: string;
  setCharacterType: (type: string) => void;

  // Encounter state
  encounter: EncounterState;
  triggerEncounter: (species: MonsterSpecies, wildLevel: number, shinyVariant: string | null) => void;
  clearEncounter: () => void;

  // Battle state
  battle: BattleState;
  startBattle: (battleId: string, battle: Battle) => void;
  updateBattle: (battle: Battle) => void;
  endBattle: () => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Fog of war (explored tiles)
  exploredTiles: Set<string>;
  markTileExplored: (x: number, y: number) => void;
  resetExplored: () => void;

  // Current region the player is standing in
  currentRegionId: string;
  setCurrentRegionId: (regionId: string) => void;

  // Other players positions (from socket)
  otherPlayers: Map<string, { username: string; x: number; y: number; color: string; characterType: string }>;
  setOtherPlayers: (players: Map<string, { username: string; x: number; y: number; color: string; characterType: string }>) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      player: null,
      setPlayer: (player) => set({ player }),

      characterType: 'kai',
      setCharacterType: (type) => set({ characterType: type }),

      encounter: {
        triggered: false,
        species: null,
        wildLevel: 0,
        shinyVariant: null,
      },
      triggerEncounter: (species, wildLevel, shinyVariant) =>
        set({ encounter: { triggered: true, species, wildLevel, shinyVariant } }),
      clearEncounter: () =>
        set({ encounter: { triggered: false, species: null, wildLevel: 0, shinyVariant: null } }),

      battle: {
        active: false,
        battleId: null,
        battle: null,
      },
      startBattle: (battleId, battle) =>
        set({ battle: { active: true, battleId, battle } }),
      updateBattle: (battle) =>
        set((state) => ({ battle: { ...state.battle, battle } })),
      endBattle: () =>
        set({ battle: { active: false, battleId: null, battle: null } }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      exploredTiles: new Set<string>(),
      markTileExplored: (x, y) =>
        set((state) => {
          const next = new Set(state.exploredTiles);
          next.add(`${x},${y}`);
          return { exploredTiles: next };
        }),
      resetExplored: () => set({ exploredTiles: new Set() }),

      currentRegionId: 'verdant-meadows',
      setCurrentRegionId: (regionId) => set({ currentRegionId: regionId }),

      otherPlayers: new Map(),
      setOtherPlayers: (players) => set({ otherPlayers: players }),
    }),
    {
      name: 'mro-game-store',
      // Only persist the character type — avoid persisting large Sets/Maps
      partialize: (state) => ({
        characterType: state.characterType,
      }),
    },
  ),
);
