import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import WorldScene from './WorldScene';
import type { ExploreInput } from '@workspace/api-client-react';

interface PhaserGameProps {
  playerX: number;
  playerY: number;
  characterType: string;
  onMove: (input: ExploreInput) => void;
  onRadarUpdate: () => void;
  exploredTiles: Set<string>;
  otherPlayers: Map<string, { username: string; x: number; y: number; color: string; characterType: string }>;
}

export default function PhaserGame({
  playerX,
  playerY,
  characterType,
  onMove,
  onRadarUpdate,
  exploredTiles,
  otherPlayers,
}: PhaserGameProps) {
  const gameRef   = useRef<Phaser.Game | null>(null);
  const sceneRef  = useRef<WorldScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Boot game once
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerRef.current,
      backgroundColor: '#0a0e1a',
      scene: WorldScene,
      physics: { default: 'arcade', arcade: { debug: false } },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // When Phaser is ready, restart the scene with real player data
    game.events.once('ready', () => {
      const scene = game.scene.getScene('WorldScene') as WorldScene;
      sceneRef.current = scene;
      scene.scene.restart({
        playerX,
        playerY,
        characterType,
        onMove,
        onRadarUpdate,
        exploredTiles,
      });
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync other players
  useEffect(() => {
    sceneRef.current?.updateOtherPlayers(otherPlayers);
  }, [otherPlayers]);

  // Sync position from server (e.g. after explore API response)
  useEffect(() => {
    sceneRef.current?.updatePlayerPosition(playerX, playerY);
  }, [playerX, playerY]);

  // Sync character type if it changes
  useEffect(() => {
    sceneRef.current?.updateCharacterType(characterType);
  }, [characterType]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
