import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/game-store';
import {
  getRegionIdForPosition,
  REGION_PALETTE,
  WORLD_W,
  WORLD_H,
} from '@/lib/terrain';
import { Map } from 'lucide-react';

/** Tile size in canvas pixels — 3 gives a 150×150 minimap for a 50×50 world */
const TILE_PX = 3;
/** Match WorldScene's fog-of-war reveal radius */
const REVEAL_RADIUS = 6;

/** Region zone definitions for border drawing and labels */
const REGION_ZONES = [
  { id: 'verdant-meadows', label: 'Verdant Meadows', cx: 25, cy: 10 },
  { id: 'ocean-ruins',     label: 'Ocean Ruins',     cx: 12, cy: 27 },
  { id: 'volcanic-rift',   label: 'Volcanic Rift',   cx: 37, cy: 27 },
  { id: 'shadow-marsh',    label: 'Shadow Marsh',    cx:  8, cy: 42 },
  { id: 'ancient-forest',  label: 'Ancient Forest',  cx: 25, cy: 42 },
  { id: 'thunder-valley',  label: 'Thunder Valley',  cx: 41, cy: 42 },
] as const;

function numToHex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

/**
 * Expand each visited tile outward by REVEAL_RADIUS to replicate the
 * fog-of-war circle WorldScene draws in Phaser.
 */
function buildRevealedSet(exploredTiles: Set<string>): Set<string> {
  const revealed = new Set<string>();
  exploredTiles.forEach((key) => {
    const [sx, sy] = key.split(',').map(Number) as [number, number];
    for (let dy = -REVEAL_RADIUS; dy <= REVEAL_RADIUS; dy++) {
      for (let dx = -REVEAL_RADIUS; dx <= REVEAL_RADIUS; dx++) {
        if (dx * dx + dy * dy <= REVEAL_RADIUS * REVEAL_RADIUS) {
          const nx = sx + dx;
          const ny = sy + dy;
          if (nx >= 0 && nx < WORLD_W && ny >= 0 && ny < WORLD_H) {
            revealed.add(`${nx},${ny}`);
          }
        }
      }
    }
  });
  return revealed;
}

export default function MinimapOverlay() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { player, exploredTiles } = useGameStore();
  const playerX = player?.posX ?? 25;
  const playerY = player?.posY ?? 4;

  // Re-render canvas whenever the minimap is open or the player moves / reveals tiles
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = WORLD_W * TILE_PX;
    const H = WORLD_H * TILE_PX;
    canvas.width = W;
    canvas.height = H;

    const revealed = buildRevealedSet(exploredTiles);

    // ── 1. Draw tiles ──────────────────────────────────────────────────────
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        if (revealed.has(`${x},${y}`)) {
          const regionId = getRegionIdForPosition(x, y);
          const palette = REGION_PALETTE[regionId] ?? REGION_PALETTE['verdant-meadows']!;
          ctx.fillStyle = numToHex(palette.grass[0]);
        } else {
          ctx.fillStyle = '#08090f';
        }
        ctx.fillRect(x * TILE_PX, y * TILE_PX, TILE_PX, TILE_PX);
      }
    }

    // ── 2. Region boundary lines ───────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 0.75;

    // Y = 20  (verdant-meadows → ocean-ruins / volcanic-rift)
    ctx.beginPath();
    ctx.moveTo(0, 20 * TILE_PX);
    ctx.lineTo(W, 20 * TILE_PX);
    ctx.stroke();

    // Y = 35  (middle band → bottom band)
    ctx.beginPath();
    ctx.moveTo(0, 35 * TILE_PX);
    ctx.lineTo(W, 35 * TILE_PX);
    ctx.stroke();

    // X = 25  (ocean-ruins | volcanic-rift, rows 20-34)
    ctx.beginPath();
    ctx.moveTo(25 * TILE_PX, 20 * TILE_PX);
    ctx.lineTo(25 * TILE_PX, 35 * TILE_PX);
    ctx.stroke();

    // X = 17  (shadow-marsh | ancient-forest, rows 35-49)
    ctx.beginPath();
    ctx.moveTo(17 * TILE_PX, 35 * TILE_PX);
    ctx.lineTo(17 * TILE_PX, H);
    ctx.stroke();

    // X = 34  (ancient-forest | thunder-valley, rows 35-49)
    ctx.beginPath();
    ctx.moveTo(34 * TILE_PX, 35 * TILE_PX);
    ctx.lineTo(34 * TILE_PX, H);
    ctx.stroke();

    // ── 3. Region labels ──────────────────────────────────────────────────
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    REGION_ZONES.forEach(({ id, label, cx, cy }) => {
      const palette = REGION_PALETTE[id] ?? REGION_PALETTE['verdant-meadows']!;
      const color = numToHex(palette.borderTint);
      const words = label.split(' ');

      // Faint backdrop for legibility
      ctx.font = 'bold 6.5px monospace';
      words.forEach((word, i) => {
        const tx = cx * TILE_PX;
        const ty = cy * TILE_PX + (i - (words.length - 1) / 2) * 9;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillText(word, tx + 0.5, ty + 0.5);
        ctx.fillStyle = color + 'cc';
        ctx.fillText(word, tx, ty);
      });
    });

    // ── 4. Player marker ──────────────────────────────────────────────────
    const px = playerX * TILE_PX + TILE_PX / 2;
    const py = playerY * TILE_PX + TILE_PX / 2;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,255,255,0.2)';
    ctx.fill();

    // White dot
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Cyan outline
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [open, exploredTiles, playerX, playerY]);

  const currentRegionId = player
    ? getRegionIdForPosition(playerX, playerY)
    : 'verdant-meadows';
  const currentPalette =
    REGION_PALETTE[currentRegionId] ?? REGION_PALETTE['verdant-meadows']!;
  const accentHex = numToHex(currentPalette.borderTint);

  return (
    <div className="fixed top-20 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-sm transition-all duration-200"
        style={{
          background: 'rgba(10,14,26,0.88)',
          borderColor: open ? accentHex + '88' : '#ffffff22',
          boxShadow: open ? `0 0 14px ${accentHex}44` : 'none',
        }}
        title={open ? 'Close minimap' : 'Open minimap (M)'}
        data-testid="minimap-toggle"
      >
        <Map
          size={16}
          style={{ color: open ? accentHex : '#6b7280' }}
        />
      </button>

      {/* Minimap panel */}
      {open && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: 'rgba(8,9,15,0.95)',
            borderColor: accentHex + '44',
            boxShadow: `0 0 24px rgba(0,0,0,0.6), 0 0 16px ${accentHex}18`,
          }}
          data-testid="minimap-panel"
        >
          {/* Header */}
          <div
            className="px-3 py-1.5 flex items-center justify-between border-b"
            style={{ borderColor: accentHex + '22' }}
          >
            <span
              className="text-[9px] font-mono uppercase tracking-widest"
              style={{ color: accentHex }}
            >
              World Map
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">
              {REGION_ZONES.find((z) => z.id === currentRegionId)?.label ?? ''}
            </span>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              imageRendering: 'pixelated',
            }}
          />

          {/* Legend */}
          <div
            className="px-3 py-1.5 flex items-center gap-3 border-t flex-wrap"
            style={{ borderColor: accentHex + '22' }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border flex-shrink-0"
                style={{ background: '#ffffff', borderColor: '#00ffff' }}
              />
              <span className="text-[9px] font-mono text-muted-foreground">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ background: '#08090f', border: '1px solid #ffffff22' }}
              />
              <span className="text-[9px] font-mono text-muted-foreground">Unexplored</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
