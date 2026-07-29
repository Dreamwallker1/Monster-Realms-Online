import type { MonsterSpeciesElement } from '@workspace/api-client-react';

export const ELEMENT_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  Fire:     { primary: '#EF4444', secondary: '#F97316', glow: 'rgba(239, 68, 68, 0.4)' },
  Water:    { primary: '#3B82F6', secondary: '#0EA5E9', glow: 'rgba(59, 130, 246, 0.4)' },
  Nature:   { primary: '#22C55E', secondary: '#10B981', glow: 'rgba(34, 197, 94, 0.4)' },
  Electric: { primary: '#EAB308', secondary: '#F59E0B', glow: 'rgba(234, 179, 8, 0.4)' },
  Dark:     { primary: '#6366F1', secondary: '#4F46E5', glow: 'rgba(99, 102, 241, 0.4)' },
  // Legacy fallbacks
  Ice:      { primary: '#06B6D4', secondary: '#67E8F9', glow: 'rgba(6, 182, 212, 0.4)' },
  Earth:    { primary: '#A16207', secondary: '#CA8A04', glow: 'rgba(161, 98, 7, 0.4)' },
  Air:      { primary: '#A5F3FC', secondary: '#E0F2FE', glow: 'rgba(165, 243, 252, 0.4)' },
  Light:    { primary: '#FDE047', secondary: '#FEF08A', glow: 'rgba(253, 224, 71, 0.6)' },
  Metal:    { primary: '#71717A', secondary: '#A1A1AA', glow: 'rgba(113, 113, 122, 0.4)' },
  Crystal:  { primary: '#D946EF', secondary: '#F0ABFC', glow: 'rgba(217, 70, 239, 0.5)' },
  Void:     { primary: '#7C3AED', secondary: '#A78BFA', glow: 'rgba(124, 58, 237, 0.6)' },
};

export function getElementColors(element: string) {
  return ELEMENT_COLORS[element] ?? { primary: '#6B7280', secondary: '#9CA3AF', glow: 'rgba(107, 114, 128, 0.3)' };
}

/** Quality tier → display label */
export const QUALITY_LABEL: Record<string, string> = {
  C: 'Common',
  B: 'Uncommon',
  A: 'Rare',
  S: 'Legendary',
};

/** Quality tier → colors */
export const RARITY_COLORS: Record<string, { color: string; glow: string; label: string }> = {
  // New quality tiers
  C: { color: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.3)', label: 'Common' },
  B: { color: '#34D399', glow: 'rgba(52, 211, 153, 0.4)', label: 'Uncommon' },
  A: { color: '#818CF8', glow: 'rgba(129, 140, 248, 0.5)', label: 'Rare' },
  S: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.7)', label: 'Legendary' },
  // Legacy fallbacks
  Common:    { color: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.3)', label: 'Common' },
  Uncommon:  { color: '#34D399', glow: 'rgba(52, 211, 153, 0.3)', label: 'Uncommon' },
  Rare:      { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)', label: 'Rare' },
  Epic:      { color: '#A855F7', glow: 'rgba(168, 85, 247, 0.5)', label: 'Epic' },
  Legendary: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)', label: 'Legendary' },
  Mythic:    { color: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)', label: 'Mythic' },
  Ancient:   { color: '#7C3AED', glow: 'rgba(124, 58, 237, 0.7)', label: 'Ancient' },
  Celestial: { color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.7)', label: 'Celestial' },
  Void:      { color: '#1E1B4B', glow: 'rgba(30, 27, 75, 0.8)', label: 'Void' },
};

export function getRarityColors(rarity: string) {
  return RARITY_COLORS[rarity] ?? { color: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.3)', label: rarity };
}
