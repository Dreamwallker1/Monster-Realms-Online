import { describe, expect, it } from 'vitest';
import { getMoveIntent, getMoveProgress, MOVE_RECOVERY_MS } from '@/lib/movement';

describe('turn-paced world movement', () => {
  it('maps only server-supported cardinal steps', () => {
    expect(getMoveIntent(0, -1)?.direction).toBe('up');
    expect(getMoveIntent(0, 1)?.direction).toBe('down');
    expect(getMoveIntent(-1, 0)?.direction).toBe('left');
    expect(getMoveIntent(1, 0)?.direction).toBe('right');
    expect(getMoveIntent(1, 1)).toBeNull();
    expect(getMoveIntent(0, 0)).toBeNull();
  });

  it('reports deterministic recovery progress', () => {
    const now = 10_000;
    expect(getMoveProgress(now + MOVE_RECOVERY_MS, now)).toBe(0);
    expect(getMoveProgress(now + MOVE_RECOVERY_MS / 2, now)).toBeCloseTo(0.5);
    expect(getMoveProgress(now, now)).toBe(1);
  });
});
