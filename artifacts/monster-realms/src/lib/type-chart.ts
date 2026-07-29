// ─── 5-Element Type Chart ────────────────────────────────────────────────────
// Ring cycle: Fire → Nature → Electric → Water → Fire
// Dark: disrupts fire+nature, but is vulnerable to water+electric
//
//           Fire
//          ↑    ↓
//  Dark ←──    ──→ Nature
//  │                  │
//  Water ←── Electric ←┘
//

export const TYPE_CHART: Record<string, Record<string, number>> = {
  //          vs Fire  vs Water  vs Nature  vs Electric  vs Dark
  Fire:     { Fire: 0.5, Water: 0.5, Nature: 2.0, Electric: 1.0, Dark: 0.5 },
  Water:    { Fire: 2.0, Water: 0.5, Nature: 0.5, Electric: 0.5, Dark: 1.5 },
  Nature:   { Fire: 0.5, Water: 1.0, Nature: 0.5, Electric: 2.0, Dark: 0.5 },
  Electric: { Fire: 0.5, Water: 2.0, Nature: 0.5, Electric: 0.5, Dark: 1.5 },
  Dark:     { Fire: 1.5, Water: 0.5, Nature: 1.5, Electric: 0.5, Dark: 0.0 },
};

/** attacker's element dealing damage to defenderElement */
export function getTypeMultiplier(attackerElement: string, defenderElement: string): number {
  return TYPE_CHART[attackerElement]?.[defenderElement] ?? 1.0;
}

/** What elements deal super-effective damage against this element */
export function getWeaknesses(element: string): string[] {
  return ELEMENTS.filter((atk) => (TYPE_CHART[atk]?.[element] ?? 1) > 1);
}

/** What elements deal reduced damage against this element */
export function getResistances(element: string): string[] {
  return ELEMENTS.filter(
    (atk) => (TYPE_CHART[atk]?.[element] ?? 1) < 1 && (TYPE_CHART[atk]?.[element] ?? 1) > 0,
  );
}

/** What this element is strong against (offensive) */
export function getStrengths(element: string): string[] {
  const row = TYPE_CHART[element];
  if (!row) return [];
  return ELEMENTS.filter((def) => (row[def] ?? 1) > 1);
}

/** What this element is resisted by (offensive penalty) */
export function getNotVery(element: string): string[] {
  const row = TYPE_CHART[element];
  if (!row) return [];
  return ELEMENTS.filter((def) => (row[def] ?? 1) < 1 && (row[def] ?? 1) > 0);
}

export function getMatchupText(mult: number): string {
  if (mult >= 2.0) return 'Super Effective!';
  if (mult >= 1.5) return 'Effective!';
  if (mult === 0.0) return 'No Effect';
  if (mult <= 0.5) return 'Not Very Effective';
  return '';
}

export const ELEMENTS = ['Fire', 'Water', 'Nature', 'Electric', 'Dark'] as const;
export type ElementName = typeof ELEMENTS[number];

export const ELEMENT_ICON: Record<string, string> = {
  Fire:     '🔥',
  Water:    '💧',
  Nature:   '🌿',
  Electric: '⚡',
  Dark:     '🌑',
};

export const ELEMENT_COLOR: Record<string, string> = {
  Fire:     '#EF4444',
  Water:    '#38BDF8',
  Nature:   '#22C55E',
  Electric: '#EAB308',
  Dark:     '#A855F7',
};
