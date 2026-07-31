// Client-side catalogue mirrors the active server catalogue.
export interface MythEntry {
  id: string;
  name: string;
  element: 'Fire' | 'Water' | 'Nature' | 'Electric' | 'Dark';
  rarity: 'C' | 'B' | 'A' | 'S';
  description: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
}

export const ALL_MYTHS: MythEntry[] = [
  {
    id: 'ashquill', name: 'Ashquill', element: 'Fire', rarity: 'C',
    description: 'A lean ash-born raptor whose ragged feathers ignite when it spreads its wings.',
    baseHp: 44, baseAttack: 43, baseDefense: 32, baseSpeed: 53,
  },
  {
    id: 'flarelynx', name: 'Flarelynx', element: 'Fire', rarity: 'C',
    description: 'A young volcanic lynx whose magma-cracked paws ignite the instant it senses danger.',
    baseHp: 46, baseAttack: 48, baseDefense: 38, baseSpeed: 52,
  },
];

export const MYTH_BY_ID: Record<string, MythEntry> = Object.fromEntries(
  ALL_MYTHS.map((myth) => [myth.id, myth]),
);
