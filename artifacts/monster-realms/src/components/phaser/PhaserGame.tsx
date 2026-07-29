import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import WorldScene from './WorldScene';
import type { ExploreInput } from '@workspace/api-client-react';

export interface PhaserGameHandle {
  moveInDirection: (dx: number, dy: number) => void;
}

interface PhaserGameProps {
  playerX: number;
  playerY: number;
  characterType: string;
  onMove: (input: ExploreInput) => void;
  onRadarUpdate: () => void;
  exploredTiles: Set<string>;
  otherPlayers: Map<string, { username: string; x: number; y: number; color: string; characterType: string }>;
}

const PhaserGame = forwardRef<PhaserGameHandle, PhaserGameProps>(function PhaserGame(
  { playerX, playerY, characterType, onMove, onRadarUpdate, exploredTiles, otherPlayers },
  ref,
) {
  const gameRef      = useRef<Phaser.Game | null>(null);
  const sceneRef     = useRef<WorldScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose moveInDirection to parent (D-pad)
  useImperativeHandle(ref, () => ({
    moveInDirection(dx, dy) {
      sceneRef.current?.moveInDirection(dx, dy);
    },
  }));

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

  // Sync position from server
  useEffect(() => {
    sceneRef.current?.updatePlayerPosition(playerX, playerY);
  }, [playerX, playerY]);

  // Sync character type
  useEffect(() => {
    sceneRef.current?.updateCharacterType(characterType);
  }, [characterType]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0" style={{ width: '100%', height: '100%' }} />
  );
});

export default PhaserGame;
