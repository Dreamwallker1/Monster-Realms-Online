import type { MonsterSpeciesElement } from '@workspace/api-client-react';

export const ELEMENT_COLORS: Record<MonsterSpeciesElement, { primary: string; secondary: string; glow: string }> = {
  Fire: {
    primary: '#EF4444',
    secondary: '#F97316',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  Water: {
    primary: '#3B82F6',
    secondary: '#0EA5E9',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  Nature: {
    primary: '#22C55E',
    secondary: '#10B981',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  Electric: {
    primary: '#EAB308',
    secondary: '#F59E0B',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  Ice: {
    primary: '#06B6D4',
    secondary: '#67E8F9',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  Earth: {
    primary: '#A16207',
    secondary: '#CA8A04',
    glow: 'rgba(161, 98, 7, 0.4)',
  },
  Air: {
    primary: '#A5F3FC',
    secondary: '#E0F2FE',
    glow: 'rgba(165, 243, 252, 0.4)',
  },
  Light: {
    primary: '#FDE047',
    secondary: '#FEF08A',
    glow: 'rgba(253, 224, 71, 0.6)',
  },
  Dark: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  Metal: {
    primary: '#71717A',
    secondary: '#A1A1AA',
    glow: 'rgba(113, 113, 122, 0.4)',
  },
  Crystal: {
    primary: '#D946EF',
    secondary: '#F0ABFC',
    glow: 'rgba(217, 70, 239, 0.5)',
  },
  Void: {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    glow: 'rgba(124, 58, 237, 0.6)',
  },
};

export const RARITY_COLORS: Record<string, { color: string; glow: string }> = {
  Common: { color: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.3)' },
  Uncommon: { color: '#34D399', glow: 'rgba(52, 211, 153, 0.3)' },
  Rare: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
  Epic: { color: '#A855F7', glow: 'rgba(168, 85, 247, 0.5)' },
  Legendary: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' },
  Mythic: { color: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)' },
  Ancient: { color: '#7C3AED', glow: 'rgba(124, 58, 237, 0.7)' },
  Celestial: { color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.7)' },
  Void: { color: '#1E1B4B', glow: 'rgba(30, 27, 75, 0.8)' },
};
