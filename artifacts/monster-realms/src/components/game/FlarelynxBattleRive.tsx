import { useEffect, useRef, useState } from 'react';
import { Rive, Layout, Fit, Alignment, EventType } from '@/lib/rive/riveApi';
import {
  FLARELYNX_ARTBOARD,
  FLARELYNX_IDLE_RIVE_NAME,
  FLARELYNX_ATTACK_DURATION_MS,
  flarelynxRivUrl,
} from '@/lib/rive/flarelynxAnims';
import { ensureRiveRuntimeConfigured } from '@/lib/rive/setupRiveRuntime';

type Props = {
  size: number;
  facing?: 'left' | 'right';
  /** Rive timeline name to play once; null/undefined keeps idle. */
  attackAnim?: string | null;
  /** Bumps when a new attack should start (same clip can replay). */
  attackKey?: number;
  /** Called once if Rive cannot load. Parent must NOT spawn a second renderer. */
  onFailed: () => void;
};

/**
 * Sole Flarelynx battle renderer. Must never be remounted by parent attack keys.
 * Parent must keep a stable React tree around this component for the whole battle.
 */
export default function FlarelynxBattleRive({
  size,
  facing = 'right',
  attackAnim = null,
  attackKey = 0,
  onFailed,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const riveRef = useRef<InstanceType<typeof Rive> | null>(null);
  const onFailedRef = useRef(onFailed);
  onFailedRef.current = onFailed;
  const [ready, setReady] = useState(false);
  const idleResumeTimerRef = useRef<number | null>(null);
  const playingAttackRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  const clearIdleResume = () => {
    if (idleResumeTimerRef.current != null) {
      window.clearTimeout(idleResumeTimerRef.current);
      idleResumeTimerRef.current = null;
    }
  };

  const destroyInstance = (inst: InstanceType<typeof Rive> | null) => {
    if (!inst) return;
    try {
      inst.stop();
    } catch {
      // ignore
    }
    try {
      inst.cleanup();
    } catch {
      // ignore
    }
  };

  const resumeIdle = (inst: InstanceType<typeof Rive>) => {
    const finished = playingAttackRef.current;
    playingAttackRef.current = null;
    try {
      if (finished) inst.stop(finished);
      else inst.stop();
    } catch {
      try {
        inst.stop();
      } catch {
        // ignore
      }
    }
    try {
      inst.play(FLARELYNX_IDLE_RIVE_NAME);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    cancelledRef.current = false;
    let reportedFail = false;

    canvas.getContext('2d', { alpha: true });

    const fail = (reason: unknown) => {
      if (cancelledRef.current || reportedFail) return;
      reportedFail = true;
      console.warn('[Flarelynx] Battle Rive failed (no PNG fallback)', reason);
      destroyInstance(riveRef.current);
      riveRef.current = null;
      setReady(false);
      onFailedRef.current();
    };

    ensureRiveRuntimeConfigured();
    const src = flarelynxRivUrl();

    const mount = (artboardName: string | undefined) => {
      // Critical: never stack two Rive instances on the same canvas (ghost renderer).
      destroyInstance(riveRef.current);
      riveRef.current = null;

      try {
        const instance = new Rive({
          src,
          canvas,
          ...(artboardName ? { artboard: artboardName } : {}),
          animations: FLARELYNX_IDLE_RIVE_NAME,
          autoplay: true,
          shouldDisableRiveListeners: true,
          layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.BottomCenter,
          }),
          onLoad: () => {
            if (cancelledRef.current) {
              destroyInstance(instance);
              return;
            }

            const anims: string[] = instance.animationNames ?? [];
            if (!anims.includes(FLARELYNX_IDLE_RIVE_NAME)) {
              fail(
                `Idle "${FLARELYNX_IDLE_RIVE_NAME}" missing (artboard="${instance.activeArtboard}", anims=${JSON.stringify(anims)})`,
              );
              destroyInstance(instance);
              return;
            }

            try {
              instance.resizeDrawingSurfaceToCanvas();
              instance.play(FLARELYNX_IDLE_RIVE_NAME);
            } catch {
              // non-fatal
            }

            instance.on(EventType.Stop, (event) => {
              const stopped = Array.isArray(event.data)
                ? event.data
                : typeof event.data === 'string'
                  ? [event.data]
                  : [];
              const attack = playingAttackRef.current;
              if (!attack) return;
              if (stopped.includes(attack) || stopped.length === 0) {
                clearIdleResume();
                if (riveRef.current === instance) {
                  resumeIdle(instance);
                }
              }
            });

            riveRef.current = instance;
            setReady(true);
            console.info('[Flarelynx] Rive ready', {
              artboard: instance.activeArtboard,
              anims,
            });
          },
          onLoadError: () => {
            if (cancelledRef.current) return;
            if (artboardName) {
              mount(undefined);
              return;
            }
            fail(`Rive failed to load ${src}`);
          },
        });
        riveRef.current = instance;
      } catch (err) {
        fail(err);
      }
    };

    mount(FLARELYNX_ARTBOARD);

    return () => {
      cancelledRef.current = true;
      clearIdleResume();
      setReady(false);
      const inst = riveRef.current;
      riveRef.current = null;
      destroyInstance(inst);
    };
  }, []);

  useEffect(() => {
    const inst = riveRef.current;
    if (!inst || !ready) return;
    try {
      inst.resizeDrawingSurfaceToCanvas();
    } catch {
      // ignore
    }
  }, [size, ready]);

  useEffect(() => {
    const inst = riveRef.current;
    if (!inst || !ready || attackKey <= 0 || !attackAnim) return;

    const available: string[] = inst.animationNames ?? [];
    if (!available.includes(attackAnim)) {
      console.warn(
        `[Flarelynx] Attack clip missing in runtime .riv: ${attackAnim}. Export Attack_* timelines from Rive editor.`,
        available,
      );
      return;
    }

    clearIdleResume();
    playingAttackRef.current = attackAnim;

    try {
      inst.pause(FLARELYNX_IDLE_RIVE_NAME);
    } catch {
      // ignore
    }
    try {
      inst.stop(FLARELYNX_IDLE_RIVE_NAME);
    } catch {
      try {
        inst.stop();
      } catch {
        // ignore
      }
    }
    try {
      inst.play(attackAnim);
    } catch (err) {
      console.warn('[Flarelynx] Failed to play attack', attackAnim, err);
      resumeIdle(inst);
      return;
    }

    const duration = FLARELYNX_ATTACK_DURATION_MS[attackAnim] ?? 1100;
    idleResumeTimerRef.current = window.setTimeout(() => {
      if (playingAttackRef.current === attackAnim && riveRef.current === inst) {
        resumeIdle(inst);
      }
    }, duration + 60);

    return () => {
      clearIdleResume();
    };
  }, [attackKey, attackAnim, ready]);

  const pixelSize = Math.max(160, Math.round(size * 2));
  const faceOpponent = facing === 'right';

  return (
    <canvas
      ref={canvasRef}
      width={pixelSize}
      height={pixelSize}
      className="flarelynx-battle-rive block"
      data-testid="flarelynx-battle-rive"
      data-rive-ready={ready ? '1' : '0'}
      data-rive-attack={attackAnim ?? ''}
      style={{
        width: size,
        height: size,
        background: 'transparent',
        transform: `${faceOpponent ? 'scaleX(-1) ' : ''}translateY(-2.8%)`,
        transformOrigin: '50% 100%',
        opacity: ready ? 1 : 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      aria-hidden="true"
    />
  );
}
