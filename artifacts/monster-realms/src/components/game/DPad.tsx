import { dispatchMove } from '@/lib/dpad-events';

const DIRS = [
  { label: '↖', dx: -1, dy: -1, col: 1, row: 1 },
  { label: '↑',  dx:  0, dy: -1, col: 2, row: 1 },
  { label: '↗', dx:  1, dy: -1, col: 3, row: 1 },
  { label: '←',  dx: -1, dy:  0, col: 1, row: 2 },
  { label: '→',  dx:  1, dy:  0, col: 3, row: 2 },
  { label: '↙', dx: -1, dy:  1, col: 1, row: 3 },
  { label: '↓',  dx:  0, dy:  1, col: 2, row: 3 },
  { label: '↘', dx:  1, dy:  1, col: 3, row: 3 },
] as const;

export default function DPad() {
  return (
    <div
      className="fixed left-5 z-30 select-none"
      style={{ bottom: 100, width: 138, height: 138 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 5,
          width: '100%',
          height: '100%',
        }}
      >
        {DIRS.map(({ label, dx, dy, col, row }) => {
          const diagonal = dx !== 0 && dy !== 0;
          return (
            <button
              key={label}
              onClick={() => dispatchMove(dx, dy)}
              style={{ gridColumn: col, gridRow: row }}
              className={[
                'flex items-center justify-center rounded-xl text-xl font-bold leading-none',
                'transition-all duration-75 active:scale-90',
                diagonal
                  ? 'bg-white/8 border border-white/12 text-white/50 hover:bg-white/15 hover:text-white/80'
                  : 'bg-white/18 border border-white/25 text-white shadow-md hover:bg-primary/40 hover:border-primary/60',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}

        {/* Centre cosmetic dot */}
        <div
          style={{ gridColumn: 2, gridRow: 2 }}
          className="flex items-center justify-center pointer-events-none"
        >
          <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
        </div>
      </div>
    </div>
  );
}
