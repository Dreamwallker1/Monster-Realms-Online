export interface CharacterConfig {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  style?: 'teen' | 'adult';
  // Phaser hex colors for map sprite
  skinColor:   number;
  hairColor:   number;
  outfitColor: number;
  pantsColor:  number;
  // CSS hex for landing SVG
  skinHex:    string;
  hairHex:    string;
  outfitHex:  string;
  pantsHex:   string;
  // Avatar color sent to the API
  avatarColor: string;
}

export const CHARACTERS: CharacterConfig[] = [
  // ── Males ──────────────────────────────────────────────────────────────────
  {
    id: 'kai',
    name: 'Kai',
    description: 'Chill explorer',
    gender: 'male',
    skinColor:   0xd4956a, skinHex:   '#d4956a',
    hairColor:   0x1a1a1a, hairHex:   '#1a1a1a',
    outfitColor: 0x2563eb, outfitHex: '#2563eb',
    pantsColor:  0x1e293b, pantsHex:  '#1e293b',
    avatarColor: '#2563eb',
  },
  {
    id: 'alex',
    name: 'Alex',
    description: 'Classic trainer',
    gender: 'male',
    skinColor:   0xfde68a, skinHex:   '#fde68a',
    hairColor:   0xf59e0b, hairHex:   '#f59e0b',
    outfitColor: 0xdc2626, outfitHex: '#dc2626',
    pantsColor:  0x7f1d1d, pantsHex:  '#7f1d1d',
    avatarColor: '#dc2626',
  },
  {
    id: 'jay',
    name: 'Jay',
    description: 'Street style',
    gender: 'male',
    skinColor:   0x8b6347, skinHex:   '#8b6347',
    hairColor:   0x0f0f0f, hairHex:   '#0f0f0f',
    outfitColor: 0x6b7280, outfitHex: '#6b7280',
    pantsColor:  0x374151, pantsHex:  '#374151',
    avatarColor: '#6b7280',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    description: 'Speed runner',
    gender: 'male',
    skinColor:   0xfca5a5, skinHex:   '#fca5a5',
    hairColor:   0xdc2626, hairHex:   '#dc2626',
    outfitColor: 0xea580c, outfitHex: '#ea580c',
    pantsColor:  0x7c2d12, pantsHex:  '#7c2d12',
    avatarColor: '#ea580c',
  },
  // ── Females ────────────────────────────────────────────────────────────────
  {
    id: 'luna',
    name: 'Luna',
    description: 'High school explorer',
    gender: 'female',
    style: 'teen',
    // light skin, dark navy hair, indigo school uniform, dark navy shorts
    skinColor:   0xfcd5a8, skinHex:   '#fcd5a8',
    hairColor:   0x1e1b4b, hairHex:   '#1e1b4b',
    outfitColor: 0x6366f1, outfitHex: '#6366f1',
    pantsColor:  0x312e81, pantsHex:  '#312e81',
    avatarColor: '#6366f1',
  },
  {
    id: 'vera',
    name: 'Vera',
    description: 'Elite myth hunter',
    gender: 'female',
    style: 'adult',
    // warm skin, deep auburn hair, teal jacket, dark teal slacks
    skinColor:   0xe8caa0, skinHex:   '#e8caa0',
    hairColor:   0x7c1d1d, hairHex:   '#7c1d1d',
    outfitColor: 0x0f766e, outfitHex: '#0f766e',
    pantsColor:  0x134e4a, pantsHex:  '#134e4a',
    avatarColor: '#0f766e',
  },
];

export function getCharacter(id: string): CharacterConfig {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]!;
}
