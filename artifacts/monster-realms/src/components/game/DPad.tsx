import { useEffect, useState } from 'react';
import { dispatchMove, MRO_MOVE_STATE_EVENT, type MoveStateDetail } from '@/lib/dpad-events';
import { getMoveProgress, MOVE_RECOVERY_MS } from '@/lib/movement';

const DIRS = [
  { label: '↑', key: 'W', dx: 0, dy: -1, col: 2, row: 1 },
  { label: '←', key: 'A', dx: -1, dy: 0, col: 1, row: 2 },
  { label: '→', key: 'D', dx: 1, dy: 0, col: 3, row: 2 },
  { label: '↓', key: 'S', dx: 0, dy: 1, col: 2, row: 3 },
] as const;

export default function DPad() {
  const [movement, setMovement] = useState<MoveStateDetail>({ locked: false, readyAt: 0 });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const onState = (event: Event) => setMovement((event as CustomEvent<MoveStateDetail>).detail);
    window.addEventListener(MRO_MOVE_STATE_EVENT, onState);
    return () => window.removeEventListener(MRO_MOVE_STATE_EVENT, onState);
  }, []);

  useEffect(() => {
    if (!movement.locked) return;
    const timer = window.setInterval(() => setNow(Date.now()), 50);
    return () => window.clearInterval(timer);
  }, [movement.locked]);

  const progress = movement.locked ? getMoveProgress(movement.readyAt, now) : 1;
  const remaining = movement.locked ? Math.max(0, movement.readyAt - now) : 0;

  return (
    <div className="fixed left-5 z-30 select-none" style={{ bottom: 112, width: 126 }}>
      <div className="mb-2 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
          <span className={movement.locked ? 'text-amber-300' : 'text-emerald-300'}>
            {movement.locked ? 'Recovering' : 'Ready'}
          </span>
          <span className="text-white/45">{movement.locked ? `${(remaining / 1000).toFixed(1)}s` : `${(MOVE_RECOVERY_MS / 1000).toFixed(1)}s/step`}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-75" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid aspect-square grid-cols-3 grid-rows-3 gap-1.5">
        {DIRS.map(({ label, key, dx, dy, col, row }) => (
          <button
            key={label}
            type="button"
            disabled={movement.locked}
            onClick={() => dispatchMove(dx, dy)}
            style={{ gridColumn: col, gridRow: row }}
            className="relative flex items-center justify-center rounded-xl border border-white/20 bg-slate-950/80 text-xl font-bold text-white shadow-lg backdrop-blur-md transition-all active:scale-90 disabled:cursor-wait disabled:opacity-35"
            aria-label={`Move ${key}`}
          >
            {label}
            <span className="absolute bottom-1 right-1.5 text-[7px] font-mono text-white/30">{key}</span>
          </button>
        ))}
        <div style={{ gridColumn: 2, gridRow: 2 }} className="flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-300/70 shadow-[0_0_10px_rgba(103,232,249,.8)]" />
        </div>
      </div>
    </div>
  );
}
