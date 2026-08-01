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
    vi.advanceTimersByTime(260);
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
    vi.advanceTimersByTime(410);
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
});
