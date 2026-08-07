/**
 * Logical Flarelynx animation IDs → Rive timeline names on the active Artboard.
 * Missing mappings stay null so callers can safely request future clips
 * without interrupting the current idle loop.
 */

export type FlarelynxLogicalAnim =
  | 'idle'
  | 'walk'
  | 'attack1'
  | 'attack2'
  | 'attack3'
  | 'hit'
  | 'faint'
  /** @deprecated use attack1–attack3 */
  | 'attack';

/**
 * Preferred artboard name. Battle loader tries this first, then the file default.
 * Current Flarelynx.riv export still stores its sole artboard under the legacy
 * string FLARELYNX_BEFORE_AUTORIG_BACKUP (rename-in-binary breaks the file);
 * the asset fill was patched to transparent alpha so no dark rectangle remains.
 */
export const FLARELYNX_ARTBOARD = 'Artboard';

/** Legacy name still present as the file-default artboard string in the export. */
export const FLARELYNX_BACKUP_ARTBOARD = 'FLARELYNX_BEFORE_AUTORIG_BACKUP';

/**
 * Battle idle. "Excited Breathing with Tail Wag" was removed from the .riv
 * during hand-animation work; "Agitated Angry Tail" is the current loop.
 */
export const FLARELYNX_IDLE_RIVE_NAME = 'Agitated Angry Tail';

/** Hand-animated pounce (authored in-editor as "SIÇRAMA 2"). */
export const FLARELYNX_ATTACK_MAGMA_POUNCE = 'SIÇRAMA 2';
export const FLARELYNX_ATTACK_TAIL_FIRE = 'Attack_TailFire';

/**
 * Flarelynx skill names (monsterData) → Rive clips.
 * Note: "Searing Peck / Ashen Gust / Last Spark" are Ashquill skills — not used here.
 *   Twinflare Claw (normal)  → Attack_TailFire (ranged; Attack_DoubleClaw was
 *                              deliberately removed from the .riv)
 *   Magma Pounce (skill1)    → SIÇRAMA 2 (hand-animated)
 *   Blazing Tailspin (ult)   → Attack_TailFire
 */
export const FLARELYNX_ANIM_MAP: Record<FlarelynxLogicalAnim, string | null> = {
  idle: FLARELYNX_IDLE_RIVE_NAME,
  walk: null,
  attack1: FLARELYNX_ATTACK_TAIL_FIRE,
  attack2: FLARELYNX_ATTACK_MAGMA_POUNCE,
  attack3: FLARELYNX_ATTACK_TAIL_FIRE,
  attack: FLARELYNX_ATTACK_TAIL_FIRE,
  hit: null,
  faint: null,
};

/** Clip durations (ms) — keep in sync with Rive timeline lengths. */
export const FLARELYNX_ATTACK_DURATION_MS: Record<string, number> = {
  [FLARELYNX_ATTACK_MAGMA_POUNCE]: 2000,
  [FLARELYNX_ATTACK_TAIL_FIRE]: 1400,
};

/**
 * Damage timing from attack start (ms).
 * Magma Pounce (SIÇRAMA 2) → body strike during the leap (~frame 75/120).
 * TailFire (basic + ultimate) → projectile reaches enemy (release ~800ms + flight ~420ms).
 */
export const FLARELYNX_IMPACT_DELAY_MS: Record<string, number> = {
  [FLARELYNX_ATTACK_MAGMA_POUNCE]: 1250,
  [FLARELYNX_ATTACK_TAIL_FIRE]: 1220,
};

/** Arena approach / return for melee (CSS transform on the stable wrapper). */
export const FLARELYNX_MELEE_APPROACH_MS = 1100;
export const FLARELYNX_MELEE_POUNCE_APPROACH_MS = 1300;

/** Tail-fire projectile launch from attack start (tail whip release). */
export const FLARELYNX_TAIL_FIRE_LAUNCH_MS = 800;
export const FLARELYNX_TAIL_FIRE_FLIGHT_MS = 420;

const SKILL_NAME_TO_CLIP: Record<string, string> = {
  // User-facing aliases
  'searing peak': FLARELYNX_ATTACK_TAIL_FIRE,
  'searing peck': FLARELYNX_ATTACK_TAIL_FIRE,
  'ashen gust': FLARELYNX_ATTACK_MAGMA_POUNCE,
  'last spark': FLARELYNX_ATTACK_TAIL_FIRE,
  // Flarelynx monsterData names
  'twinflare claw': FLARELYNX_ATTACK_TAIL_FIRE,
  'magma pounce': FLARELYNX_ATTACK_MAGMA_POUNCE,
  'blazing tailspin': FLARELYNX_ATTACK_TAIL_FIRE,
};

export function resolveFlarelynxAnim(logical: FlarelynxLogicalAnim): string | null {
  return FLARELYNX_ANIM_MAP[logical];
}

/** Map battle skillType and/or skill name → Flarelynx Rive attack clip. */
export function flarelynxAttackClipForSkill(skillType?: string, skillName?: string): string | null {
  if (skillName) {
    const byName = SKILL_NAME_TO_CLIP[skillName.trim().toLowerCase()];
    if (byName) return byName;
  }
  if (skillType === 'skill1') return FLARELYNX_ANIM_MAP.attack2;
  if (skillType === 'skill2' || skillType === 'ultimate') return FLARELYNX_ANIM_MAP.attack3;
  if (!skillType || skillType === 'normal' || skillType === 'attack') {
    return FLARELYNX_ANIM_MAP.attack1;
  }
  return FLARELYNX_ANIM_MAP.attack1;
}

export function flarelynxImpactDelayMs(skillType?: string, skillName?: string): number {
  const clip = flarelynxAttackClipForSkill(skillType, skillName);
  if (clip && FLARELYNX_IMPACT_DELAY_MS[clip] != null) {
    return FLARELYNX_IMPACT_DELAY_MS[clip];
  }
  return 980;
}

export function flarelynxIsRangedClip(clip: string | null | undefined): boolean {
  return clip === FLARELYNX_ATTACK_TAIL_FIRE;
}

export function flarelynxApproachDurationMs(clip: string | null | undefined): number {
  if (clip === FLARELYNX_ATTACK_MAGMA_POUNCE) return FLARELYNX_MELEE_POUNCE_APPROACH_MS;
  if (flarelynxIsRangedClip(clip)) return FLARELYNX_ATTACK_DURATION_MS[FLARELYNX_ATTACK_TAIL_FIRE] ?? 1400;
  return FLARELYNX_ATTACK_DURATION_MS[clip ?? ''] ?? FLARELYNX_MELEE_APPROACH_MS;
}

export function flarelynxRivUrl(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  // Cache-bust when replacing public/rive/Flarelynx.riv after export.
  return `${normalized}rive/Flarelynx.riv?v=sicrama-tailfire-1`;
}
