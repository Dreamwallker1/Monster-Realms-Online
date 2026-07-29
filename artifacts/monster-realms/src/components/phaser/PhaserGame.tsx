import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import WorldScene from './WorldScene';
import type { ExploreInput } from '@workspace/api-client-react';

interface PhaserGameProps {
  playerX: number;
  playerY: number;
  playerColor: string;
  onMove: (input: ExploreInput) => void;
  onRadarUpdate: () => void;
  exploredTiles: Set<string>;
  otherPlayers: Map<string, { username: string; x: number; y: number; color: string }>;
}

export default function PhaserGame({
  playerX,
  playerY,
  playerColor,
  onMove,
  onRadarUpdate,
  exploredTiles,
  otherPlayers,
}: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<WorldScene | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerRef.current,
      backgroundColor: '#0a0a0a',
      scene: WorldScene,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
    };
    
    gameRef.current = new Phaser.Game(config);
    
    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current?.scene.getScene('WorldScene') as WorldScene;
      sceneRef.current = scene;
      scene.scene.restart({
        playerX,
        playerY,
        playerColor,
        onMove,
        onRadarUpdate,
        exploredTiles,
      });
    });
    
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);
  
  // Update other players when they change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateOtherPlayers(otherPlayers);
    }
  }, [otherPlayers]);
  
  // Update player position when it changes from server
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updatePlayerPosition(playerX, playerY);
    }
  }, [playerX, playerY]);
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
