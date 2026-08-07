import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import PhaserGame from '@/components/phaser/PhaserGame';
import GameHUD from '@/components/game/GameHUD';
import GameSidebar from '@/components/game/GameSidebar';
import EncounterPopup from '@/components/game/EncounterPopup';
import BattleOverlay from '@/components/game/BattleOverlay';
import DPad from '@/components/game/DPad';
import RegionBanner from '@/components/game/RegionBanner';
import MinimapOverlay from '@/components/game/MinimapOverlay';
import BattleTransitionVeil from '@/components/game/BattleTransitionVeil';
import { useGameStore } from '@/store/game-store';
import {
  useGetMe,
  useExploreTile,
  getGetMeQueryKey,
  type ExploreInput,
  type Player,
} from '@workspace/api-client-react';
import { getToken } from '@/lib/auth';
import { Menu } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const ME_QUERY_KEY = ['authenticated-player'] as const;

function isHttpConflict(err: unknown): boolean {
  const status =
    (err as { status?: number; statusCode?: number; response?: { status?: number } })?.status ??
    (err as { statusCode?: number })?.statusCode ??
    (err as { response?: { status?: number } })?.response?.status;
  return status === 409;
}

export default function Game() {
  const [, setLocation] = useLocation();
  const socketRef = useRef<Socket | null>(null);
  const seededPlayerIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

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
    currentRegionId,
    setCurrentRegionId,
  } = useGameStore();

  const { data: me, isLoading, refetch: refetchMe } = useGetMe({
    query: { enabled: !!getToken(), queryKey: ME_QUERY_KEY },
  });

  const exploreTile = useExploreTile();

  useEffect(() => {
    if (!getToken()) {
      setLocation('/');
    }
  }, []);

  // Seed store from /auth/me once per mount/player — never clobber live explore updates
  useEffect(() => {
    if (!me) return;
    if (seededPlayerIdRef.current === me.id) return;
    seededPlayerIdRef.current = me.id;
    setPlayer(me);
    markTileExplored(me.posX, me.posY);
    if (me.regionId) {
      setCurrentRegionId(me.regionId);
    }
  }, [me, setPlayer, markTileExplored, setCurrentRegionId]);

  useEffect(() => {
    if (!player) return;

    const socket = io('/game', {
      path: '/api/socket.io',
      auth: { token: getToken() },
    });
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

    socket.emit('player:join', {
      username: player.username,
      avatarColor: player.avatarColor,
      posX: player.posX,
      posY: player.posY,
      regionId: player.regionId ?? 'verdant-meadows',
    });

    return () => { socket.disconnect(); };
  }, [player?.id]);

  const applyAuthoritativePlayer = useCallback((fresh: Player) => {
    setPlayer(fresh);
    markTileExplored(fresh.posX, fresh.posY);
    if (fresh.regionId) {
      setCurrentRegionId(fresh.regionId);
    }
    queryClient.setQueryData(ME_QUERY_KEY, fresh);
    queryClient.setQueryData(getGetMeQueryKey(), fresh);
  }, [setPlayer, markTileExplored, setCurrentRegionId, queryClient]);

  const resyncFromServer = useCallback(async () => {
    const result = await refetchMe();
    const fresh = result.data;
    if (!fresh) return;
    applyAuthoritativePlayer(fresh);
  }, [refetchMe, applyAuthoritativePlayer]);

  const handleMove = useCallback(async (input: ExploreInput) => {
    const livePlayer = useGameStore.getState().player;
    if (!livePlayer) return false;
    try {
      const result = await exploreTile.mutateAsync({ playerId: livePlayer.id, data: input });

      const nextPlayer: Player = {
        ...livePlayer,
        posX: result.newPosX,
        posY: result.newPosY,
        energy: result.remainingEnergy,
        regionId: input.regionId || livePlayer.regionId,
      };
      setPlayer(nextPlayer);
      queryClient.setQueryData(ME_QUERY_KEY, nextPlayer);
      queryClient.setQueryData(getGetMeQueryKey(), nextPlayer);

      if (input.regionId && input.regionId !== useGameStore.getState().currentRegionId) {
        setCurrentRegionId(input.regionId);
      }

      markTileExplored(result.newPosX, result.newPosY);

      if (result.encounterTriggered && result.encounter) {
        triggerEncounter(
          result.encounter.species,
          result.encounter.wildLevel,
          result.encounter.shinyVariant ?? null,
        );
      }

      socketRef.current?.emit('player:move', {
        posX: result.newPosX,
        posY: result.newPosY,
        regionId: input.regionId,
      });
      return true;
    } catch (err) {
      console.error('Failed to explore tile:', err);
      if (isHttpConflict(err)) {
        try {
          await resyncFromServer();
        } catch (resyncErr) {
          console.error('Failed to resync player after explore 409:', resyncErr);
        }
      }
      return false;
    }
  }, [exploreTile, setPlayer, setCurrentRegionId, markTileExplored, triggerEncounter, resyncFromServer, queryClient]);

  const worldReady = !!player && seededPlayerIdRef.current === player.id && !isLoading;

  if (!getToken()) {
    return null;
  }

  if (!worldReady || !player) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground font-semibold">Loading world…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page relative w-full h-[100dvh] overflow-hidden">
      <PhaserGame
        key={player.id}
        playerX={player.posX}
        playerY={player.posY}
        characterType={characterType}
        onMove={handleMove}
        onRadarUpdate={() => {}}
        exploredTiles={exploredTiles}
        otherPlayers={otherPlayers}
      />

      <div className="mobile-menu-toggle fixed top-4 right-4 z-30">
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

      <RegionBanner regionId={currentRegionId} isReady />
      <MinimapOverlay />
      <DPad />
      <GameHUD />
      <GameSidebar />
      <EncounterPopup />
      <BattleTransitionVeil />
      <BattleOverlay />
    </div>
  );
}
