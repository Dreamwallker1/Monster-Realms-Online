export const MOVE_RECOVERY_MS = 1000;
export const MOVE_ANIMATION_MS = 460;

export type CardinalDirection = 'up' | 'down' | 'left' | 'right';

export interface MoveIntent {
  direction: CardinalDirection;
  dx: number;
  dy: number;
}

export function getMoveIntent(dx: number, dy: number): MoveIntent | null {
  if (dx === 0 && dy === -1) return { direction: 'up', dx, dy };
  if (dx === 0 && dy === 1) return { direction: 'down', dx, dy };
  if (dx === -1 && dy === 0) return { direction: 'left', dx, dy };
  if (dx === 1 && dy === 0) return { direction: 'right', dx, dy };
  return null;
}

export function getMoveProgress(readyAt: number, now: number): number {
  if (readyAt <= now) return 1;
  return Math.max(0, Math.min(1, 1 - (readyAt - now) / MOVE_RECOVERY_MS));
}
