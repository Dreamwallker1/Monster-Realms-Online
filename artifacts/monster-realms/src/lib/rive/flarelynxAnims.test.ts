import { describe, expect, it } from 'vitest';
import {
  FLARELYNX_ARTBOARD,
  FLARELYNX_IDLE_RIVE_NAME,
  flarelynxAttackClipForSkill,
  flarelynxIsRangedClip,
  resolveFlarelynxAnim,
} from './flarelynxAnims';

describe('flarelynxAnims', () => {
  it('uses the active Artboard name only', () => {
    expect(FLARELYNX_ARTBOARD).toBe('Artboard');
    expect(FLARELYNX_ARTBOARD).not.toContain('BACKUP');
  });

  it('aliases idle to Agitated Angry Tail', () => {
    expect(resolveFlarelynxAnim('idle')).toBe(FLARELYNX_IDLE_RIVE_NAME);
    expect(FLARELYNX_IDLE_RIVE_NAME).toBe('Agitated Angry Tail');
  });

  it('maps attack slots to the current Rive asset timelines', () => {
    expect(resolveFlarelynxAnim('attack1')).toBe('Attack_TailFire');
    expect(resolveFlarelynxAnim('attack2')).toBe('SIÇRAMA 2');
    expect(resolveFlarelynxAnim('attack3')).toBe('Attack_TailFire');
  });

  it('resolves skillType and skillName helpers used by BattleOverlay', () => {
    expect(flarelynxAttackClipForSkill('normal')).toBe('Attack_TailFire');
    expect(flarelynxAttackClipForSkill('skill1')).toBe('SIÇRAMA 2');
    expect(flarelynxAttackClipForSkill('ultimate')).toBe('Attack_TailFire');
    expect(flarelynxAttackClipForSkill(undefined, 'Magma Pounce')).toBe('SIÇRAMA 2');
    expect(flarelynxIsRangedClip('Attack_TailFire')).toBe(true);
    expect(flarelynxIsRangedClip('SIÇRAMA 2')).toBe(false);
  });

  it('returns null for missing future clips without throwing', () => {
    expect(resolveFlarelynxAnim('walk')).toBeNull();
    expect(resolveFlarelynxAnim('hit')).toBeNull();
    expect(resolveFlarelynxAnim('faint')).toBeNull();
  });
});
