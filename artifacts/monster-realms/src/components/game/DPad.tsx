import { useCallback } from 'react';
import type { PhaserGameHandle } from '@/components/phaser/PhaserGame';

interface DPadProps {
  gameRef: React.RefObject<PhaserGameHandle | null>;
}

// 8 directions: [label, dx, dy, grid position col/row]
const DIRS = [
  { label: '↖', dx: -1, dy: -1, col: 0, row: 0 },
  { label: '↑',  dx:  0, dy: -1, col: 1, row: 0 },
  { label: '↗', dx:  1, dy: -1, col: 2, row: 0 },
  { label: '←',  dx: -1, dy:  0, col: 0, row: 1 },
  // center cell (col 1, row 1) intentionally empty
  { label: '→',  dx:  1, dy:  0, col: 2, row: 1 },
  { label: '↙', dx: -1, dy:  1, col: 0, row: 2 },
  { label: '↓',  dx:  0, dy:  1, col: 1, row: 2 },
  { label: '↘', dx:  1, dy:  1, col: 2, row: 2 },
] as const;

export default function DPad({ gameRef }: DPadProps) {
  const move = useCallback(
    (dx: number, dy: number, e: React.PointerEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      gameRef.current?.moveInDirection(dx, dy);
    },
    [gameRef],
  );

  return (
    <div
      className="fixed bottom-6 left-6 z-30 select-none touch-none"
      style={{ width: 132, height: 132 }}
    >
      {/* 3×3 grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 4,
          width: '100%',
          height: '100%',
        }}
      >
        {DIRS.map(({ label, dx, dy, col, row }) => (
          <button
            key={label}
            onPointerDown={(e) => move(dx, dy, e)}
            style={{ gridColumn: col + 1, gridRow: row + 1 }}
            className={`
              flex items-center justify-center rounded-xl
              text-xl font-bold leading-none
              transition-all duration-75
              active:scale-90 active:brightness-125
              ${isDiagonal(dx, dy)
                ? 'bg-white/8 border border-white/12 text-white/50 hover:bg-white/14 hover:text-white/80'
                : 'bg-white/15 border border-white/20 text-white/90 hover:bg-primary/40 hover:border-primary/60 hover:text-white shadow-md'}
            `}
          >
            {label}
          </button>
        ))}

        {/* Centre dot — cosmetic only */}
        <div
          style={{ gridColumn: 2, gridRow: 2 }}
          className="flex items-center justify-center"
        >
          <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
        </div>
      </div>
    </div>
  );
}

function isDiagonal(dx: number, dy: number) {
  return dx !== 0 && dy !== 0;
}
