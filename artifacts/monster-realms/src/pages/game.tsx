import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import PhaserGame, { type PhaserGameHandle } from '@/components/phaser/PhaserGame';
import GameHUD from '@/components/game/GameHUD';
import GameSidebar from '@/components/game/GameSidebar';
import EncounterPopup from '@/components/game/EncounterPopup';
import BattleOverlay from '@/components/game/BattleOverlay';
import DPad from '@/components/game/DPad';
import { useGameStore } from '@/store/game-store';
import { useGetMe, useExploreTile, type ExploreInput } from '@workspace/api-client-react';
import { getToken } from '@/lib/auth';
import { Menu } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function Game() {
  const [, setLocation] = useLocation();
  const socketRef = useRef<Socket | null>(null);
  const gameRef   = useRef<PhaserGameHandle | null>(null);

  const {
    player,
    setPlayer,
    characterType,
    setSidebarOpen,
    exploredTiles,
    markTileExplored,
    triggerEncounter,
    otherPlayers,
    setOtherPlayers,
  } = useGameStore();

  const { data: me, isLoading } = useGetMe({
    query: { enabled: !!getToken() },
  });

  const exploreTile = useExploreTile();

  // Redirect if no token
  useEffect(() => {
    if (!getToken()) {
      setLocation('/');
    }
  }, []);

  // Sync latest server state into store
  useEffect(() => {
    if (me) {
      setPlayer(me);
      markTileExplored(me.posX, me.posY);
    }
  }, [me]);

  // Socket.io multiplayer
  useEffect(() => {
    if (!player) return;

    const socket = io('/game', { auth: { token: getToken() } });
    socketRef.current = socket;

    socket.on(
      'world:players',
      (players: Array<{ id: string; username: string; posX: number; posY: number; avatarColor: string; characterType?: string }>) => {
        const map = new Map(
          players
            .filter((p) => p.id !== player.id)
            .map((p) => [
              p.id,
              {
                username: p.username,
                x: p.posX,
                y: p.posY,
                color: p.avatarColor,
                characterType: p.characterType ?? 'kai',
              },
            ]),
        );
        setOtherPlayers(map);
      },
    );

    // Announce ourselves
    socket.emit('player:join', {
      username: player.username,
      avatarColor: player.avatarColor,
      posX: player.posX,
      posY: player.posY,
      regionId: player.regionId ?? 'verdant-meadows',
    });

    return () => { socket.disconnect(); };
  }, [player?.id]);

  const handleMove = async (input: ExploreInput) => {
    try {
      const result = await exploreTile.mutateAsync({ data: input });

      if (player) {
        setPlayer({ ...player, posX: result.newPosX, posY: result.newPosY, energy: result.remainingEnergy });
      }

      markTileExplored(result.newPosX, result.newPosY);

      if (result.encounterTriggered && result.encounter) {
        triggerEncounter(
          result.encounter.species,
          result.encounter.wildLevel,
          result.encounter.shinyVariant,
        );
      }

      socketRef.current?.emit('player:move', {
        posX: result.newPosX,
        posY: result.newPosY,
        regionId: input.regionId,
      });
    } catch (err) {
      console.error('Failed to explore tile:', err);
    }
  };

  // Show spinner only when we have no player at all yet (e.g. hard refresh)
  if (!player && isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground font-semibold">Loading world…</p>
        </div>
      </div>
    );
  }

  // No token and no cached player → send to landing (must happen outside render)
  if (!player) {
    return null;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <PhaserGame
        ref={gameRef}
        playerX={player.posX}
        playerY={player.posY}
        characterType={characterType}
        onMove={handleMove}
        onRadarUpdate={() => {}}
        exploredTiles={exploredTiles}
        otherPlayers={otherPlayers}
      />

      {/* Menu toggle */}
      <div className="fixed top-4 right-4 z-30">
        <Button
          variant="default"
          size="icon"
          className="rounded-full w-14 h-14 glow-cyan"
          onClick={() => setSidebarOpen(true)}
          data-testid="button-open-sidebar"
        >
          <Menu size={24} />
        </Button>
      </div>

      <DPad gameRef={gameRef} />
      <GameHUD />
      <GameSidebar />
      <EncounterPopup />
      <BattleOverlay />
    </div>
  );
}
