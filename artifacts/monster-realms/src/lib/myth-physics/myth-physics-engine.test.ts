import { afterEach, describe, expect, it, vi } from 'vitest';
import { MythPhysicsEngine } from './myth-physics-engine';

afterEach(() => vi.useRealTimers());

describe('MythPhysicsEngine', () => {
  it('applies hit state only to the target entity', () => {
    vi.useFakeTimers();
    const engine = new MythPhysicsEngine();
    engine.add('player', 'flarelynx', 'player');
    engine.add('wild', 'ashquill', 'wild');
    engine.attack('player', 'wild', 20);
    vi.advanceTimersByTime(530);
    const poses = engine.tick(1000);
    expect(poses.find((pose) => pose.entityId === 'wild')?.state).toBe('hit');
    expect(poses.find((pose) => pose.entityId === 'player')?.state).not.toBe('hit');
    engine.destroy();
  });

  it('rejects self-hits and missing targets', () => {
    const engine = new MythPhysicsEngine();
    engine.add('player', 'flarelynx', 'player');
    expect(engine.attack('player', 'player', 20)).toBe(false);
    expect(engine.attack('player', 'missing', 20)).toBe(false);
    expect(engine.tick(100)[0]?.state).toBe('idle');
    engine.destroy();
  });

  it('keeps fixed-step simulation finite after a long frame', () => {
    const engine = new MythPhysicsEngine('low');
    engine.add('player', 'flarelynx', 'player');
    engine.tick(10);
    const pose = engine.tick(5000)[0]!;
    expect(Number.isFinite(pose.root.x)).toBe(true);
    expect(Number.isFinite(pose.root.rotation)).toBe(true);
    engine.destroy();
  });

  it('gives Flarelynx two target impacts without damaging the attacker', () => {
    vi.useFakeTimers();
    const engine = new MythPhysicsEngine();
    const impacts: string[] = [];
    engine.onImpact = (event) => impacts.push(event.targetId);
    engine.add('player', 'flarelynx', 'player');
    engine.add('wild', 'ashquill', 'wild');
    engine.attack('player', 'wild', 20);
    vi.advanceTimersByTime(790);
    expect(impacts).toEqual(['wild', 'wild']);
    engine.destroy();
  });

  it('does not carry a delayed impact onto a switched Myth', () => {
    vi.useFakeTimers();
    const engine = new MythPhysicsEngine();
    const impacts: string[] = [];
    engine.onImpact = (event) => impacts.push(event.targetId);
    engine.add('player', 'flarelynx', 'player');
    engine.add('wild', 'ashquill', 'wild');
    engine.attack('player', 'wild', 20);
    engine.remove('wild');
    engine.add('wild', 'flarelynx', 'wild');
    vi.advanceTimersByTime(500);
    expect(impacts).toEqual([]);
    expect(engine.tick(1000).find((pose) => pose.entityId === 'wild')?.state).toBe('idle');
    engine.destroy();
  });

  it('uses separate physical choreography for combo, leap and burst skills', () => {
    vi.useFakeTimers();
    const directions: Array<{ x: number; y: number; force: number }> = [];
    const run = (style: 'combo' | 'leap' | 'burst', wait: number) => {
      const engine = new MythPhysicsEngine();
      engine.add('player', 'flarelynx', 'player');
      engine.add('wild', 'ashquill', 'wild');
      engine.onImpact = (event) => directions.push({ ...event.direction, force: event.force });
      engine.attack('player', 'wild', 20, 310, style);
      vi.advanceTimersByTime(wait);
      engine.destroy();
    };
    run('combo', 530);
    run('leap', 950);
    run('burst', 800);
    expect(directions).toHaveLength(3);
    expect(directions[0]?.y).toBeLessThan(0);
    expect(directions[1]?.y).toBeGreaterThan(0);
    expect(directions[1]!.force).toBeGreaterThan(directions[0]!.force);
    expect(Math.abs(directions[2]!.y)).toBeLessThan(Math.abs(directions[0]!.y));
  });
});
