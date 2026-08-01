import { useCallback, useEffect, useRef } from 'react';
import {
  MythPhysicsEngine,
  type PhysicsQuality,
  type RenderPose,
} from './myth-physics-engine';

export function detectPhysicsQuality(): PhysicsQuality {
  if (typeof navigator === 'undefined') return 'medium';
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 4 || memory <= 3) return 'low';
  return cores <= 8 ? 'medium' : 'high';
}

/**
 * Runs the fixed-step world outside React rendering. Canvas rigs pull their
 * latest pose from getPose(), avoiding a 60/120 render-per-second React tree.
 */
export function useMythPhysics(groundY = 0) {
  const engineRef = useRef<MythPhysicsEngine | null>(null);
  const posesRef = useRef(new Map<string, RenderPose>());
  if (!engineRef.current) engineRef.current = new MythPhysicsEngine(detectPhysicsQuality());

  useEffect(() => {
    let frameId = 0;
    let alive = true;
    const loop = (now: number) => {
      if (!alive || !engineRef.current) return;
      const poses = engineRef.current.tick(now, groundY);
      posesRef.current = new Map(poses.map((pose) => [pose.entityId, pose]));
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      engineRef.current?.destroy();
      posesRef.current.clear();
    };
  }, [groundY]);

  const getPose = useCallback((entityId: string) => posesRef.current.get(entityId), []);
  return { engine: engineRef.current, getPose };
}
