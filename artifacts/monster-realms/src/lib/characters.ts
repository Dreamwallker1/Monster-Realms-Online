export interface CharacterConfig {
  id: string;
  name: string;
  description: string;
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
  {
    id: 'kai',
    name: 'Kai',
    description: 'Chill explorer',
    skinColor:   0xd4956a, skinHex:   '#d4956a',
    hairColor:   0x1a1a1a, hairHex:   '#1a1a1a',
    outfitColor: 0x2563eb, outfitHex: '#2563eb',
    pantsColor:  0x1e293b, pantsHex:  '#1e293b',
    avatarColor: '#2563eb',
  },
  {
    id: 'maya',
    name: 'Maya',
    description: 'Nature ranger',
    skinColor:   0xfdbcb4, skinHex:   '#fdbcb4',
    hairColor:   0x7c2d12, hairHex:   '#7c2d12',
    outfitColor: 0x16a34a, outfitHex: '#16a34a',
    pantsColor:  0x14532d, pantsHex:  '#14532d',
    avatarColor: '#16a34a',
  },
  {
    id: 'alex',
    name: 'Alex',
    description: 'Classic trainer',
    skinColor:   0xfde68a, skinHex:   '#fde68a',
    hairColor:   0xf59e0b, hairHex:   '#f59e0b',
    outfitColor: 0xdc2626, outfitHex: '#dc2626',
    pantsColor:  0x7f1d1d, pantsHex:  '#7f1d1d',
    avatarColor: '#dc2626',
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Mystic seeker',
    skinColor:   0xe8d5c4, skinHex:   '#e8d5c4',
    hairColor:   0xe5e7eb, hairHex:   '#e5e7eb',
    outfitColor: 0x7c3aed, outfitHex: '#7c3aed',
    pantsColor:  0x4c1d95, pantsHex:  '#4c1d95',
    avatarColor: '#7c3aed',
  },
  {
    id: 'jay',
    name: 'Jay',
    description: 'Street style',
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
    skinColor:   0xfca5a5, skinHex:   '#fca5a5',
    hairColor:   0xdc2626, hairHex:   '#dc2626',
    outfitColor: 0xea580c, outfitHex: '#ea580c',
    pantsColor:  0x7c2d12, pantsHex:  '#7c2d12',
    avatarColor: '#ea580c',
  },
];

export function getCharacter(id: string): CharacterConfig {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]!;
}
