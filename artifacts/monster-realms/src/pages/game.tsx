import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import PhaserGame from '@/components/phaser/PhaserGame';
import GameHUD from '@/components/game/GameHUD';
import GameSidebar from '@/components/game/GameSidebar';
import EncounterPopup from '@/components/game/EncounterPopup';
import BattleOverlay from '@/components/game/BattleOverlay';
import { useGameStore } from '@/store/game-store';
import { useGetMe, useExploreTile, type ExploreInput } from '@workspace/api-client-react';
import { getToken } from '@/lib/auth';
import { Menu } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

export default function Game() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  
  const {
    player,
    setPlayer,
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
  
  useEffect(() => {
    if (!getToken()) {
      setLocation('/');
      return;
    }
    
    if (me) {
      setPlayer(me);
      markTileExplored(me.posX, me.posY);
    }
  }, [me]);
  
  // Socket.io connection for multiplayer
  useEffect(() => {
    if (!player) return;
    
    const socket = io('/game', {
      auth: { token: getToken() },
    });
    
    socketRef.current = socket;
    
    socket.on('world:players', (players: Array<{ id: string; username: string; posX: number; posY: number; avatarColor: string }>) => {
      const playersMap = new Map(
        players
          .filter((p) => p.id !== player.id)
          .map((p) => [p.id, { username: p.username, x: p.posX, y: p.posY, color: p.avatarColor }])
      );
      setOtherPlayers(playersMap);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [player]);
  
  const handleMove = async (input: ExploreInput) => {
    try {
      const result = await exploreTile.mutateAsync({ data: input });
      
      // Update player position
      if (me) {
        setPlayer({ ...me, posX: result.newPosX, posY: result.newPosY, energy: result.remainingEnergy });
      }
      
      // Mark tile as explored
      if (result.newTile) {
        markTileExplored(result.newPosX, result.newPosY);
      }
      
      // Trigger encounter if present
      if (result.encounterTriggered && result.encounter) {
        triggerEncounter(result.encounter.species, result.encounter.wildLevel, result.encounter.shinyVariant);
      }
      
      // Emit move to socket
      if (socketRef.current) {
        socketRef.current.emit('player:move', {
          posX: result.newPosX,
          posY: result.newPosY,
        });
      }
    } catch (error) {
      console.error('Failed to explore tile:', error);
    }
  };
  
  const handleRadarUpdate = () => {
    // Radar updates can be polled here
  };
  
  // Show loading only when there is no player yet (e.g. hard-refresh on /game).
  // If the store already has a player (coming from the landing page), show the
  // game immediately and let useGetMe refresh in the background.
  if (!player && isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Loading world...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Phaser Game Canvas */}
      <PhaserGame
        playerX={player.posX}
        playerY={player.posY}
        playerColor={player.avatarColor}
        onMove={handleMove}
        onRadarUpdate={handleRadarUpdate}
        exploredTiles={exploredTiles}
        otherPlayers={otherPlayers}
      />
      
      {/* Menu Toggle */}
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
      
      {/* HUD */}
      <GameHUD />
      
      {/* Sidebar */}
      <GameSidebar />
      
      {/* Encounter Popup */}
      <EncounterPopup />
      
      {/* Battle Overlay */}
      <BattleOverlay />
    </div>
  );
}
