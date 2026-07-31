import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/game-store';
import { useGetBattle, usePerformBattleAction, getGetBattleQueryKey, useGetPlayerCollection, useGetPlayerInventory, getGetPlayerInventoryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getElementColors, QUALITY_LABEL } from '@/lib/element-colors';
import { getCharacter } from '@/lib/characters';
import type { CharacterConfig } from '@/lib/characters';
import { MythSvgIcon, MYTH_ARCHETYPE } from '@/lib/myth-svgs';
import { getTypeMultiplier, getMatchupText, ELEMENT_ICON } from '@/lib/type-chart';
import { Package, Wind, RefreshCw, X, ChevronRight } from 'lucide-react';
import SkillCinematic from '@/components/battle/SkillCinematic';
import OrbCinematic from '@/components/battle/OrbCinematic';
import MythEntranceCinematic, { ARCHETYPE_STRIKE, getStrike } from '@/components/battle/MythEntranceCinematic';
import MythFaintCinematic from '@/components/battle/MythFaintCinematic';
import BattleEndCinematic from '@/components/battle/BattleEndCinematic';

// ─── Skill types ─────────────────────────────────────────────────────────────

interface SkillData {
  name: string;
  type: 'normal' | 'skill1' | 'skill2' | 'ultimate' | 'passive';
  element: string;
  power: number;
  accuracy: number;
  description: string;
}

type ActionType = 'attack' | 'skill1' | 'skill2' | 'ultimate' | 'capture' | 'flee' | 'switch';

const ACTION_TO_SKILL_TYPE: Record<string, SkillData['type']> = {
  attack: 'normal',
  skill1: 'skill1',
  skill2: 'skill2',
  ultimate: 'ultimate',
};

function getSkillForAction(action: string, skills: SkillData[]): SkillData {
  const type = ACTION_TO_SKILL_TYPE[action];
  if (type) {
    const found = skills.find(s => s.type === type);
    if (found) return found;
  }
  return { name: 'Attack', type: 'normal', element: 'Fire', power: 40, accuracy: 100, description: 'A basic attack.' };
}

function getDisplaySkills(species: { skills?: unknown }): SkillData[] {
  const raw = (species?.skills ?? []) as SkillData[];
  return raw.filter(s => s.type !== 'passive');
}

// ─── Skill button config ──────────────────────────────────────────────────────

const SKILL_STYLE: Record<string, { grad: string; border: string; glow: string; textColor: string }> = {
  normal:   { grad: 'linear-gradient(135deg,#0E7490,#0891B2)', border: '#22D3EE55', glow: 'rgba(34,211,238,0.35)', textColor: '#22D3EE' },
  skill1:   { grad: 'linear-gradient(135deg,#6D28D9,#7C3AED)', border: '#A78BFA55', glow: 'rgba(167,139,250,0.35)', textColor: '#A78BFA' },
  skill2:   { grad: 'linear-gradient(135deg,#065F46,#047857)', border: '#34D39955', glow: 'rgba(52,211,153,0.3)',  textColor: '#34D399' },
  ultimate: { grad: 'linear-gradient(135deg,#92400E,#B45309)', border: '#F59E0B55', glow: 'rgba(245,158,11,0.4)', textColor: '#FDE68A' },
};

// ─── Region Environment Themes ─────────────────────────────────────────────────

type RegionTheme = {
  skyGrad: string;       // full sky gradient
  groundGrad: string;    // ground gradient
  groundLine: string;    // solid color at the horizon cut
  hasTrees: boolean;
  treeColor: string;
  hasRocks: boolean;
  rockColor: string;
  ambientColor: string;  // HP plate border tint
};

const REGION_THEMES: Record<string, RegionTheme> = {
  // ── Starter zone ─────────────────────────────────────────────────────────
  'verdant-meadows': {
    skyGrad:    'linear-gradient(180deg, #1565C0 0%, #1E88E5 25%, #64B5F6 55%, #B3E5FC 80%, #C8E6C9 100%)',
    groundGrad: 'linear-gradient(180deg, #8BC34A 0%, #558B2F 55%, #33691E 100%)',
    groundLine: '#8BC34A',
    hasTrees:   true,  treeColor: '#1B5E20',
    hasRocks:   false, rockColor: '#388E3C',
    ambientColor: '#22C55E',
  },
  // ── Fire zones ────────────────────────────────────────────────────────────
  'volcanic-rift': {
    skyGrad:    'linear-gradient(180deg, #000000 0%, #1A0000 40%, #3E0000 70%, #6D2200 100%)',
    groundGrad: 'linear-gradient(180deg, #D84315 0%, #A00000 55%, #700000 100%)',
    groundLine: '#D84315',
    hasTrees:   false, treeColor: '#4E342E',
    hasRocks:   true,  rockColor: '#5D4037',
    ambientColor: '#EF4444',
  },
  'scorched-wastes': {
    skyGrad:    'linear-gradient(180deg, #1A0800 0%, #3D1200 40%, #6B2200 70%, #8B3A00 100%)',
    groundGrad: 'linear-gradient(180deg, #BF360C 0%, #7B1F00 55%, #4A1500 100%)',
    groundLine: '#BF360C',
    hasTrees:   false, treeColor: '#3E2723',
    hasRocks:   true,  rockColor: '#4E342E',
    ambientColor: '#FB923C',
  },
  // ── Water zones ───────────────────────────────────────────────────────────
  'ocean-ruins': {
    skyGrad:    'linear-gradient(180deg, #0277BD 0%, #0288D1 35%, #03A9F4 65%, #B3E5FC 100%)',
    groundGrad: 'linear-gradient(180deg, #006994 0%, #01579B 55%, #0D47A1 100%)',
    groundLine: '#006994',
    hasTrees:   false, treeColor: '#0277BD',
    hasRocks:   true,  rockColor: '#01579B',
    ambientColor: '#38BDF8',
  },
  'deep-current': {
    skyGrad:    'linear-gradient(180deg, #000D1A 0%, #001F3D 40%, #003366 70%, #004080 100%)',
    groundGrad: 'linear-gradient(180deg, #004D6E 0%, #003355 55%, #001A33 100%)',
    groundLine: '#004D6E',
    hasTrees:   false, treeColor: '#003355',
    hasRocks:   true,  rockColor: '#005577',
    ambientColor: '#0EA5E9',
  },
  // ── Nature zones ──────────────────────────────────────────────────────────
  'ancient-forest': {
    skyGrad:    'linear-gradient(180deg, #051505 0%, #0D2A0D 35%, #1B3A1B 70%, #2D4A2D 100%)',
    groundGrad: 'linear-gradient(180deg, #388E3C 0%, #1B5E20 55%, #0A3D0A 100%)',
    groundLine: '#388E3C',
    hasTrees:   true,  treeColor: '#051505',
    hasRocks:   false, rockColor: '#1B5E20',
    ambientColor: '#4ADE80',
  },
  // ── Electric zones ────────────────────────────────────────────────────────
  'thunder-valley': {
    skyGrad:    'linear-gradient(180deg, #0A0A1A 0%, #12124A 35%, #1A1A7A 65%, #2A2A6A 100%)',
    groundGrad: 'linear-gradient(180deg, #4A4A00 0%, #333300 55%, #1A1A00 100%)',
    groundLine: '#4A4A00',
    hasTrees:   false, treeColor: '#333300',
    hasRocks:   true,  rockColor: '#555500',
    ambientColor: '#FACC15',
  },
  'storm-peaks': {
    skyGrad:    'linear-gradient(180deg, #050510 0%, #0D0D2B 35%, #151545 65%, #1E1E5E 100%)',
    groundGrad: 'linear-gradient(180deg, #3A3A00 0%, #282800 55%, #151500 100%)',
    groundLine: '#3A3A00',
    hasTrees:   false, treeColor: '#282800',
    hasRocks:   true,  rockColor: '#4A4A00',
    ambientColor: '#FDE047',
  },
  // ── Dark zones ────────────────────────────────────────────────────────────
  'shadow-marsh': {
    skyGrad:    'linear-gradient(180deg, #0D0D2B 0%, #1A237E 45%, #283593 75%, #3949AB 100%)',
    groundGrad: 'linear-gradient(180deg, #1A0033 0%, #120022 55%, #0A0014 100%)',
    groundLine: '#1A0033',
    hasTrees:   true,  treeColor: '#0D001A',
    hasRocks:   false, rockColor: '#1A0033',
    ambientColor: '#A78BFA',
  },
  'void-realm': {
    skyGrad:    'linear-gradient(180deg, #000000 0%, #050008 35%, #0A000F 65%, #0F0015 100%)',
    groundGrad: 'linear-gradient(180deg, #150020 0%, #0D0015 55%, #06000A 100%)',
    groundLine: '#150020',
    hasTrees:   false, treeColor: '#0A0014',
    hasRocks:   true,  rockColor: '#200030',
    ambientColor: '#C084FC',
  },
};

function getTheme(regionId: string | null | undefined): RegionTheme {
  if (!regionId) return REGION_THEMES['verdant-meadows']!;
  return REGION_THEMES[regionId] ?? REGION_THEMES['verdant-meadows']!;
}

// ─── Horizon silhouettes ────────────────────────────────────────────────────────

function ForestSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 90" className="absolute bottom-0 left-0 w-full" style={{ height: 90 }} preserveAspectRatio="none">
      {/* Background tree layer */}
      {[20,70,130,210,290,370,440,510,580,650,720,780].map((x, i) => (
        <polygon key={`b${i}`} points={`${x},90 ${x+22},${38+(i%3)*8} ${x+44},90`} fill={color} opacity="0.5" />
      ))}
      {/* Foreground tree layer */}
      {[0,55,110,180,255,330,400,470,545,615,685,750].map((x, i) => (
        <polygon key={`f${i}`} points={`${x},90 ${x+26},${20+(i%4)*10} ${x+52},90`} fill={color} />
      ))}
    </svg>
  );
}

function RockSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 60" className="absolute bottom-0 left-0 w-full" style={{ height: 60 }} preserveAspectRatio="none">
      {[0,100,200,310,420,530,640,740].map((x, i) => {
        const h = 20 + (i % 3) * 12;
        const w = 60 + (i % 4) * 20;
        return <ellipse key={i} cx={x + w/2} cy={60} rx={w/2} ry={h} fill={color} opacity="0.7" />;
      })}
    </svg>
  );
}

// ─── Character front-facing SVG ─────────────────────────────────────────────────

function CharacterFront({ char, size = 120 }: { char: CharacterConfig; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="40" cy="73" rx="14" ry="4" fill="black" opacity="0.25" />
      {/* Legs */}
      <rect x="27" y="55" width="10" height="15" rx="4" fill={char.pantsHex} />
      <rect x="43" y="55" width="10" height="15" rx="4" fill={char.pantsHex} />
      {/* Shoes */}
      <rect x="24" y="68" width="13" height="5" rx="2.5" fill="#0f172a" />
      <rect x="42" y="68" width="13" height="5" rx="2.5" fill="#0f172a" />
      {/* Body */}
      <rect x="25" y="35" width="30" height="23" rx="5" fill={char.outfitHex} />
      {/* Collar accent */}
      <path d="M33 35 L40 41 L47 35" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arms — slightly raised battle pose */}
      <rect x="11" y="34" width="14" height="18" rx="5" fill={char.outfitHex} />
      <rect x="55" y="34" width="14" height="18" rx="5" fill={char.outfitHex} />
      {/* Hands */}
      <circle cx="18" cy="53" r="5.5" fill={char.skinHex} />
      <circle cx="62" cy="53" r="5.5" fill={char.skinHex} />
      {/* Neck */}
      <rect x="36" y="28" width="8" height="10" fill={char.skinHex} />
      {/* Head */}
      <circle cx="40" cy="21" r="17" fill={char.skinHex} />
      {/* Hair body */}
      <ellipse cx="40" cy="8" rx="17" ry="9" fill={char.hairHex} />
      <rect x="22" y="8" width="36" height="11" fill={char.hairHex} />
      <circle cx="24" cy="15" r="7" fill={char.hairHex} />
      <circle cx="56" cy="15" r="7" fill={char.hairHex} />
      {/* Eyes */}
      <circle cx="33" cy="21" r="4" fill="white" />
      <circle cx="47" cy="21" r="4" fill="white" />
      <circle cx="34" cy="22" r="2.3" fill="#0f172a" />
      <circle cx="48" cy="22" r="2.3" fill="#0f172a" />
      <circle cx="35" cy="21" r="0.9" fill="white" />
      <circle cx="49" cy="21" r="0.9" fill="white" />
      {/* Eyebrows — determined look */}
      <rect x="29" y="14" width="8" height="2.5" rx="1.2" fill={char.hairHex} transform="rotate(-8 33 15)" />
      <rect x="43" y="14" width="8" height="2.5" rx="1.2" fill={char.hairHex} transform="rotate(8 47 15)" />
      {/* Mouth — confident */}
      <path d="M35 29 Q40 32 45 29" stroke="#b06060" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Hit-reaction overlay ──────────────────────────────────────────────────────
// Plays a ≤300ms archetype-specific burst at the myth's position on every hit.

const EL_HIT: Record<string, { color: string; glow: string }> = {
  Fire:     { color: '#FF6B35', glow: 'rgba(255,107,53,0.7)' },
  Water:    { color: '#38BDF8', glow: 'rgba(56,189,248,0.7)' },
  Earth:    { color: '#CA8A04', glow: 'rgba(202,138,4,0.7)' },
  Storm:    { color: '#A855F7', glow: 'rgba(168,85,247,0.8)' },
  Shadow:   { color: '#6366F1', glow: 'rgba(99,102,241,0.7)' },
  // Legacy collection fallbacks
  Nature:   { color: '#4ADE80', glow: 'rgba(74,222,128,0.7)' },
  Electric: { color: '#FDE047', glow: 'rgba(253,224,71,0.8)' },
  Dark:     { color: '#C084FC', glow: 'rgba(192,132,252,0.7)' },
};
const getElHit = (e: string) => EL_HIT[e] ?? { color: '#94A3B8', glow: 'rgba(148,163,184,0.5)' };

// Slash marks — 3 diagonal lines bursting outward (CLAW_SLASH, SHADOW_CLAW)
function HitSlash({ color, glow }: { color: string; glow: string }) {
  const slashes = [
    { x1: 30, y1: 30, x2: 55, y2: 55 },
    { x1: 50, y1: 20, x2: 75, y2: 45 },
    { x1: 20, y1: 50, x2: 45, y2: 75 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
      {slashes.map((s, i) => (
        <motion.line
          key={i}
          x1={`${s.x1}%`} y1={`${s.y1}%`} x2={`${s.x2}%`} y2={`${s.y2}%`}
          stroke={color} strokeWidth={3} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 0.9, 0] }}
          transition={{ duration: 0.26, delay: i * 0.03, ease: 'easeOut' }}
        />
      ))}
      {/* central impact flash */}
      <motion.circle cx="50%" cy="50%" r="22"
        fill="none" stroke={color} strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        initial={{ r: 8, opacity: 0.9 }}
        animate={{ r: [8, 28, 36], opacity: [0.9, 0.5, 0] }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
    </svg>
  );
}

// Fang marks — two vertical bars + flash (BITE_LUNGE)
function HitFang({ color, glow }: { color: string; glow: string }) {
  return (
    <>
      {[-14, 14].map((dx, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: `calc(50% + ${dx}px)`, top: '28%',
            width: 5, height: 26,
            background: color,
            boxShadow: `0 0 8px ${glow}`,
            transformOrigin: 'top center',
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 0.8, 0] }}
          transition={{ duration: 0.24, delay: i * 0.03 }}
        />
      ))}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}55 0%, transparent 65%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}

// Particle burst — sparks radiate out (FLAME_BURST, VINE_WHIP, SPORE_BOMB)
function HitBurst({ color, glow, count = 7 }: { color: string; glow: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = 38 + (i % 3) * 10;
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: '50%', top: '50%',
              width: 5 + (i % 3) * 2, height: 5 + (i % 3) * 2,
              background: color,
              boxShadow: `0 0 5px ${glow}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * dist,
              y: Math.sin((angle * Math.PI) / 180) * dist,
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{ duration: 0.26, delay: i * 0.015, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// Concentric ring(s) (ROCK_SMASH, TIDAL_SLAM, THUNDER_STOMP, BUBBLE_SHOT)
function HitRing({ color, glow, rings = 2, squash = false }: {
  color: string; glow: string; rings?: number; squash?: boolean;
}) {
  return (
    <>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full border-2"
          style={{
            left: '50%', top: squash ? '72%' : '50%',
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 8px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{
            width:  [0, (70 + i * 36)],
            height: squash ? [0, (28 + i * 14)] : [0, (70 + i * 36)],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.26, delay: i * 0.06, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// Electric flash — center burst + 2 spark streaks (LIGHTNING_BOLT, SPARK_DASH)
function HitElectric({ color, glow }: { color: string; glow: string }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(circle at 50% 45%, ${color}88 0%, transparent 65%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.18 }}
      />
      {[[-20, -15], [20, -10]].map(([dx, dy], i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `calc(50% + ${dx}px)`, top: `calc(45% + ${dy}px)`,
            width: 4, height: 4,
            background: '#FFF',
            boxShadow: `0 0 6px ${glow}`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 2.5, 0],
            x: [0, dx * 2],
            y: [0, dy * 2],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 0.22, delay: i * 0.04 }}
        />
      ))}
    </>
  );
}

// Void pull — inward implosion pulse (VOID_PULL)
function HitVoid({ color, glow }: { color: string; glow: string }) {
  return (
    <>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full border-2"
          style={{
            left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 8px ${glow}`,
          }}
          initial={{ width: 70 + i * 30, height: 70 + i * 30, opacity: 0.8 }}
          animate={{ width: [70 + i * 30, 12, 0], height: [70 + i * 30, 12, 0], opacity: [0.8, 0.5, 0] }}
          transition={{ duration: 0.28, delay: i * 0.05, ease: 'easeIn' }}
        />
      ))}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(circle, ${color}44 0%, transparent 70%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.28 }}
      />
    </>
  );
}

// Eclipse beam flash (ECLIPSE_BEAM)
function HitEclipse({ color, glow }: { color: string; glow: string }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 40%, white 0%, ${color}88 30%, transparent 70%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.24 }}
      />
      <motion.div
        className="absolute pointer-events-none rounded-full border"
        style={{
          left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          borderColor: '#FFF',
          boxShadow: `0 0 12px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: [0, 90], height: [0, 90], opacity: [1, 0] }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />
    </>
  );
}

type StrikeType =
  | 'CLAW_SLASH' | 'BITE_LUNGE' | 'FLAME_BURST' | 'ROCK_SMASH'
  | 'TIDAL_SLAM' | 'BUBBLE_SHOT' | 'VINE_WHIP'   | 'SPORE_BOMB'
  | 'LIGHTNING_BOLT' | 'SPARK_DASH' | 'THUNDER_STOMP'
  | 'SHADOW_CLAW' | 'VOID_PULL' | 'ECLIPSE_BEAM';

function HitReactionOverlay({ speciesId, element, animKey }: {
  speciesId: string; element: string; animKey: number;
}) {
  if (animKey === 0) return null;
  const strikeType: StrikeType = getStrike(speciesId);
  const { color, glow } = getElHit(element);

  let effect: React.ReactNode;
  switch (strikeType) {
    case 'CLAW_SLASH':
    case 'SHADOW_CLAW':
      effect = <HitSlash color={color} glow={glow} />;
      break;
    case 'BITE_LUNGE':
      effect = <HitFang color={color} glow={glow} />;
      break;
    case 'FLAME_BURST':
    case 'VINE_WHIP':
    case 'SPORE_BOMB':
      effect = <HitBurst color={color} glow={glow} />;
      break;
    case 'ROCK_SMASH':
      effect = <HitRing color={color} glow={glow} rings={2} squash />;
      break;
    case 'TIDAL_SLAM':
      effect = <HitRing color={color} glow={glow} rings={2} />;
      break;
    case 'BUBBLE_SHOT':
      effect = <HitRing color={color} glow={glow} rings={1} />;
      break;
    case 'THUNDER_STOMP':
      effect = <HitRing color={color} glow={glow} rings={2} squash />;
      break;
    case 'LIGHTNING_BOLT':
    case 'SPARK_DASH':
      effect = <HitElectric color={color} glow={glow} />;
      break;
    case 'VOID_PULL':
      effect = <HitVoid color={color} glow={glow} />;
      break;
    case 'ECLIPSE_BEAM':
      effect = <HitEclipse color={color} glow={glow} />;
      break;
    default:
      effect = <HitBurst color={color} glow={glow} />;
  }

  return (
    <div
      key={animKey}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {effect}
    </div>
  );
}

// ─── Myth combatant sprite ───────────────────────────────────────────────────────

function MythSprite({
  speciesId, element, rarity = 'C', size = 110, shakeKey, isFainting = false,
}: {
  speciesId: string; element: string; rarity?: string;
  size?: number; shakeKey: number; isFainting?: boolean;
}) {
  const colors   = getElementColors(element);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (shakeKey > 0) setAnimKey((k) => k + 1);
  }, [shakeKey]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <div
          key={animKey}
          className={`battle-float ${animKey > 0 ? 'hit-flash' : ''}`}
          style={{
            filter: animKey > 0 ? `drop-shadow(0 0 16px ${colors.primary})` : undefined,
            transition: isFainting ? 'opacity 0.35s ease-in, transform 0.35s ease-in' : undefined,
            opacity: isFainting ? 0 : 1,
            transform: isFainting ? 'translateY(18px) scale(0.85)' : undefined,
          }}
        >
          <MythSvgIcon mythId={speciesId} element={element} rarity={rarity} size={size}/>
        </div>
        <HitReactionOverlay speciesId={speciesId} element={element} animKey={animKey} />
      </div>
      {/* Ground shadow */}
      <div style={{
        width: size * 0.65, height: 12, borderRadius: '50%', marginTop: 4,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 80%)',
        transition: isFainting ? 'opacity 0.35s ease-in' : undefined,
        opacity: isFainting ? 0 : 1,
      }} />
    </div>
  );
}

// ─── HP Plate ───────────────────────────────────────────────────────────────────

function HpPlate({
  name, level, element, rarity, currentHp, maxHp, align,
}: {
  name: string; level: number; element: string; rarity: string;
  currentHp: number; maxHp: number; align: 'left' | 'right';
}) {
  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const elColors = getElementColors(element);
  const barColor = pct > 50 ? '#22C55E' : pct > 20 ? '#EAB308' : '#EF4444';
  const qualLabel = QUALITY_LABEL[rarity] ?? rarity;

  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        minWidth: 158, maxWidth: 204,
        background: 'linear-gradient(135deg, rgba(8,8,22,0.92), rgba(4,4,14,0.96))',
        border: `1.5px solid ${elColors.primary}44`,
        backdropFilter: 'blur(14px)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.75), 0 0 10px ${elColors.glow}55`,
      }}
    >
      {/* Name + level */}
      <div className={`flex items-baseline gap-1.5 mb-1.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="font-bold text-sm text-white truncate" style={{ maxWidth: 102 }}>{name}</span>
        <span className="text-[10px] text-white/40 font-mono shrink-0">Lv.{level}</span>
      </div>
      {/* Element + quality badges */}
      <div className={`flex gap-1 mb-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <Badge
          className="text-[9px] h-4 px-1.5"
          style={{ background: elColors.primary + '38', color: elColors.primary, border: `1px solid ${elColors.primary}55`, boxShadow: 'none' }}
        >
          {element}
        </Badge>
        <Badge
          className="text-[9px] h-4 px-1.5"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }}
        >
          {qualLabel}
        </Badge>
      </div>
      {/* HP bar — numbers live inside the bar */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: 20, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full hp-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor}dd)`,
            boxShadow: `0 0 6px ${barColor}66`,
          }}
        />
        {/* HP text overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-[10px] font-mono font-bold leading-none"
            style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.98)' }}
          >
            {currentHp}<span style={{ opacity: 0.5 }}>/{maxHp}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Battle text box (Pokémon-style) ────────────────────────────────────────────

function BattleTextBox({ text, actor }: { text: string; actor: 'player' | 'wild' | 'system' }) {
  const [displayed, setDisplayed] = useState('');
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    setTextKey((k) => k + 1);
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div
      key={textKey}
      className="flex items-center gap-3 px-5 py-3 h-full"
      style={{ background: 'linear-gradient(135deg, rgba(5,5,18,0.97), rgba(8,8,25,0.99))' }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0 animate-pulse"
        style={{ background: actor === 'player' ? '#22D3EE' : actor === 'wild' ? '#A78BFA' : '#94A3B8' }}
      />
      <p className="text-sm font-mono text-white/90 leading-relaxed">{displayed}<span className="animate-pulse">▌</span></p>
    </div>
  );
}

// ─── Orb config ───────────────────────────────────────────────────────────────

const ORB_CONFIG = [
  { type: 'Prism',  emoji: '🔵', color: '#22D3EE', glow: 'rgba(34,211,238,0.35)',  border: '#22D3EE55', grad: 'linear-gradient(135deg,#0E7490,#0891B2)', bonusLabel: '1×'   },
  { type: 'Luna',   emoji: '🟣', color: '#A78BFA', glow: 'rgba(167,139,250,0.35)', border: '#A78BFA55', grad: 'linear-gradient(135deg,#5B21B6,#7C3AED)', bonusLabel: '1.6×' },
  { type: 'Aether', emoji: '🟢', color: '#34D399', glow: 'rgba(52,211,153,0.35)',  border: '#34D39955', grad: 'linear-gradient(135deg,#065F46,#059669)', bonusLabel: '2.5×' },
  { type: 'Void',   emoji: '🟡', color: '#C084FC', glow: 'rgba(192,132,252,0.4)',  border: '#C084FC55', grad: 'linear-gradient(135deg,#581C87,#7E22CE)', bonusLabel: '4×'   },
] as const;

// ─── Action Panel (skill buttons + utility row) ──────────────────────────────

function ActionPanel({
  playerMonster,
  wildElement,
  cinematic,
  isPending,
  opponentTurnActive,
  wildHpPct,
  orbCounts,
  handleSkillAction,
  handleAction,
  setShowSwitchPanel,
  setShowOrbPicker,
}: {
  playerMonster: { species?: { skills?: unknown; element?: string } } | null;
  wildElement: string;
  cinematic: unknown;
  isPending: boolean;
  opponentTurnActive: boolean;
  wildHpPct: number;
  orbCounts: Record<string, number>;
  handleSkillAction: (a: ActionType) => void;
  handleAction: (a: 'capture' | 'flee') => void;
  setShowSwitchPanel: (v: boolean) => void;
  setShowOrbPicker: (v: boolean) => void;
}) {
  const playerSkills = getDisplaySkills(playerMonster?.species ?? {});
  const skillDefs: { action: ActionType; type: SkillData['type'] }[] = [
    { action: 'attack',   type: 'normal'   },
    { action: 'skill1',   type: 'skill1'   },
    { action: 'skill2',   type: 'skill2'   },
    { action: 'ultimate', type: 'ultimate' },
  ];
  const available = skillDefs
    .map(sa => {
      const skill = playerSkills.find(s => s.type === sa.type);
      return skill ? { ...sa, skill } : null;
    })
    .filter((x): x is { action: ActionType; type: SkillData['type']; skill: SkillData } => x !== null);

  const isBlocked = !!cinematic || isPending || opponentTurnActive;

  return (
    <div className="flex flex-col gap-2">
      {/* Opponent-turn indicator */}
      {opponentTurnActive && (
        <div
          className="flex items-center justify-center gap-1.5"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'rgba(252,165,165,0.75)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'rgba(239,68,68,0.7)', boxShadow: '0 0 6px rgba(239,68,68,0.6)', animation: 'pulse 1.2s ease-in-out infinite' }} />
          Opponent&apos;s turn…
        </div>
      )}

      {/* Buttons wrapper — dimmed and non-interactive during opponent turn */}
      <div
        style={{
          opacity: opponentTurnActive ? 0.45 : 1,
          pointerEvents: opponentTurnActive ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
        }}
        className="flex flex-col gap-2"
      >
      {/* Skill buttons — 2×2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {available.length > 0 ? available.map(({ action, type, skill }) => {
          const style = SKILL_STYLE[type] ?? SKILL_STYLE['normal']!;
          const elColors = getElementColors(skill.element);
          const mult = getTypeMultiplier(skill.element, wildElement);
          const matchupText = getMatchupText(mult);
          const matchupColor =
            mult >= 2.0 ? '#4ADE80' :
            mult >= 1.5 ? '#86EFAC' :
            mult === 0   ? '#94A3B8' :
            mult <= 0.5  ? '#FCA5A5' : null;
          return (
            <button
              key={action}
              onClick={() => handleSkillAction(action)}
              disabled={isBlocked}
              className="relative flex flex-col items-start rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
              style={{ background: style.grad, border: `1.5px solid ${matchupColor ? matchupColor + '55' : style.border}`, boxShadow: `0 0 16px ${matchupColor ? matchupColor + '44' : style.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`, minHeight: 52, padding: '8px 10px' }}
              data-testid={`button-${action}`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-base leading-none">{ELEMENT_ICON[skill.element] ?? '✦'}</span>
                <span className="text-[12px] font-black text-white truncate flex-1">{skill.name}</span>
                <span className="text-[9px] font-mono shrink-0" style={{ color: style.textColor }}>PWR {skill.power}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: elColors.primary + '30', color: elColors.primary, border: `1px solid ${elColors.primary}44` }}>
                  {skill.element}
                </span>
                <span className="text-[8px] text-white/30 uppercase font-mono">
                  {type === 'normal' ? 'normal' : type === 'skill1' ? 'special' : type === 'skill2' ? 'power' : '★ ult'}
                </span>
                {matchupText && matchupColor && (
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{ background: matchupColor + '22', color: matchupColor, border: `1px solid ${matchupColor}55` }}
                  >
                    {mult >= 1.5 ? '⚡ ' : mult === 0 ? '✕ ' : '↓ '}{matchupText}
                  </span>
                )}
              </div>
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: skill.accuracy >= 90 ? '#22C55E' : skill.accuracy >= 75 ? '#EAB308' : '#EF4444' }} />
            </button>
          );
        }) : (
          <button
            onClick={() => handleSkillAction('attack')}
            disabled={isBlocked}
            className="col-span-2 relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#0E7490,#0891B2)', border: '1.5px solid #22D3EE55', boxShadow: '0 0 18px rgba(34,211,238,0.35)', color: 'white', minHeight: 48 }}
            data-testid="button-attack"
          >
            ⚔ Attack
          </button>
        )}
      </div>

      {/* Bottom row: Throw Orb + Switch + Flee */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowOrbPicker(true)}
          disabled={isPending}
          className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,rgba(20,20,40,0.9),rgba(30,15,60,0.95))', border: '1.5px solid rgba(245,158,11,0.35)', boxShadow: '0 0 12px rgba(245,158,11,0.2)', color: '#FDE68A', minHeight: 42, padding: '4px 6px' }}
          data-testid="button-capture-battle"
        >
          <div className="flex items-center gap-1">
            <Package size={12} />
            <span>Throw Orb</span>
            <ChevronRight size={10} className="opacity-60" />
          </div>
          <div className="flex gap-1 items-center">
            {ORB_CONFIG.map(o => {
              const count = orbCounts[o.type] ?? 0;
              return (
                <span key={o.type} className="text-[8px] font-mono" style={{ color: count > 0 ? o.color : 'rgba(255,255,255,0.2)' }}>
                  {count}
                </span>
              );
            })}
          </div>
          {wildHpPct < 30 && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        <button
          onClick={() => setShowSwitchPanel(true)}
          disabled={isPending}
          className="relative flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,rgba(10,35,30,0.9),rgba(5,25,20,0.95))', border: '1.5px solid rgba(52,211,153,0.3)', color: '#6EE7B7', minHeight: 42 }}
          data-testid="button-switch-myth"
        >
          <RefreshCw size={13} />
          <span>Switch</span>
        </button>

        <button
          onClick={() => handleAction('flee')}
          disabled={isPending}
          className="relative flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,rgba(25,25,50,0.9),rgba(15,15,35,0.95))', border: '1.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', minHeight: 42 }}
          data-testid="button-flee"
        >
          <Wind size={14} />
          <span>Flee</span>
        </button>
      </div>
      </div>{/* end dimming wrapper */}
    </div>
  );
}

// ─── Main Battle Overlay ─────────────────────────────────────────────────────────

export default function BattleOverlay() {
  const { battle, endBattle, updateBattle, characterType, player } = useGameStore();
  const queryClient = useQueryClient();

  const [wildShake, setWildShake]         = useState(0);
  const [playerShake, setPlayerShake]     = useState(0);
  const [captureMsg, setCaptureMsg]       = useState<string | null>(null);
  const [showSwitchPanel, setShowSwitchPanel] = useState(false);
  const [showOrbPicker, setShowOrbPicker] = useState(false);
  const [switchAnimKey, setSwitchAnimKey] = useState(0);
  const [orbCinematic, setOrbCinematic]   = useState<{ orbType: string; targetRarity: string } | null>(null);

  // ── Battle atmosphere & timing state ─────────────────────────────────────
  const [roundTimer, setRoundTimer]       = useState(10);
  const [playerLungeKey, setPlayerLungeKey] = useState(0);
  const [wildLungeKey, setWildLungeKey]     = useState(0);
  const [damageFloats, setDamageFloats]   = useState<Array<{
    id: number; dmg: number; side: 'wild' | 'player'; crit: boolean;
  }>>([]);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [displayedRound, setDisplayedRound]   = useState(1);
  const prevRoundRef     = useRef<number>(1);
  const pendingRoundRef  = useRef<number>(0); // new round waiting to be announced
  const floatIdRef       = useRef(0);

  // ── Hit-feel: camera shake + sprite flash ─────────────────────────────
  const [arenaShakeId, setArenaShakeId]     = useState(0);
  const [arenaShakeCrit, setArenaShakeCrit] = useState(false);
  const [hitFlashWild, setHitFlashWild]     = useState(0);
  const [hitFlashPlayer, setHitFlashPlayer] = useState(0);

  // ── PvP arena intro + opponent turn state ─────────────────────────────
  const [showBattleIntro, setShowBattleIntro]     = useState(false);
  const [opponentTurnActive, setOpponentTurnActive] = useState(false);
  const [opponentTimer, setOpponentTimer]           = useState(10);
  const opponentCinematicFiredRef = useRef(false);
  const opponentFireAtRef         = useRef(7); // randomised per turn (timer value at which wild fires)

  // ── Entrance animation state ──────────────────────────────────────────────
  const [showPlayerEntrance, setShowPlayerEntrance] = useState(false);
  const [showWildEntrance, setShowWildEntrance]     = useState(false);
  const seenBattleId = useRef<string | null>(null);
  const prevSwitchAnimKey = useRef(0);

  // ── Faint cinematic state ─────────────────────────────────────────────────
  const [faintCinematic, setFaintCinematic] = useState<{
    side: 'player' | 'wild';
    mythId: string;
    element: string;
    rarity: string;
  } | null>(null);

  // ── Two-flag capture coordination ─────────────────────────────────────────
  // Result is applied only when BOTH animation AND API call are settled,
  // so slow requests (> 1800 ms) are never silently dropped.
  const captureAnimDone    = useRef(false);
  const captureReqDone     = useRef(false);
  const pendingCaptureResult = useRef<Parameters<typeof updateBattle>[0] | null>(null);
  const pendingCaptureError  = useRef<string | null>(null);
  // Stable ref so both code paths always call the latest version.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalizeCaptureRef = useRef<() => void>(() => {});

  // ── Cinematic state ──────────────────────────────────────────────────────
  const [cinematic, setCinematic] = useState<{
    skillName: string; element: string; power: number;
    attackerSide: 'player' | 'wild'; isCritical?: boolean; description?: string;
    phase: 'player' | 'wild';
    attackerMythId?: string; attackerRarity?: string; skillType?: string;
  } | null>(null);
  const pendingBattleResult = useRef<Parameters<typeof updateBattle>[0] | null>(null);
  const pendingWildCinematic = useRef<{
    skillName: string; element: string; power: number; isCritical?: boolean;
    attackerMythId?: string; attackerRarity?: string;
  } | null>(null);

  const prevWildHp      = useRef<number | null>(null);
  const prevPlayerHp    = useRef<number | null>(null);
  const prevCapturedId  = useRef<string | null>(null);

  const { data: battleData } = useGetBattle(battle.battleId || '', {
    query: {
      enabled: !!battle.battleId && battle.active,
      queryKey: getGetBattleQueryKey(battle.battleId || ''),
      refetchInterval: battle.active ? 1200 : false,
    },
  });

  const { data: teamCollection } = useGetPlayerCollection(player?.id ?? '', undefined, {
    query: { enabled: !!player?.id && battle.active },
  });

  const { data: inventory } = useGetPlayerInventory(player?.id ?? '', {
    query: {
      queryKey: getGetPlayerInventoryQueryKey(player?.id ?? ''),
      enabled: !!player?.id && battle.active,
    },
  });

  const orbCounts: Record<string, number> = {};
  for (const item of inventory?.items ?? []) {
    if (item.type === 'orb' && item.orbType) {
      orbCounts[item.orbType] = (orbCounts[item.orbType] ?? 0) + (item.quantity ?? 1);
    }
  }

  const performAction = usePerformBattleAction();

  useEffect(() => {
    if (!battleData || !battle.active) return;

    // Detect HP changes for shake animation
    const wd = battleData.wildMonster;
    const pd = battleData.playerMonster;

    if (prevWildHp.current !== null && wd.currentHp < prevWildHp.current) {
      setWildShake((k) => k + 1);
      // Floating damage number on the wild myth
      const wildDmg = prevWildHp.current - wd.currentHp;
      const wildCrit = (battleData.log ?? []).slice(-3).some(
        (e: { actor: string; critical: boolean }) => e.actor === 'player' && e.critical,
      );
      const wfid = ++floatIdRef.current;
      setDamageFloats(f => [...f, { id: wfid, dmg: wildDmg, side: 'wild', crit: wildCrit }]);
      setTimeout(() => setDamageFloats(f => f.filter(x => x.id !== wfid)), 1600);
      // Camera shake + sprite flash
      setHitFlashWild(k => k + 1);
      setArenaShakeCrit(wildCrit);
      setArenaShakeId(k => k + 1);
      if (wd.currentHp === 0 && prevWildHp.current > 0) {
        setFaintCinematic({
          side: 'wild',
          mythId: wd.species?.id ?? '',
          element: wd.species?.element ?? 'Fire',
          rarity: wd.species?.rarity ?? 'C',
        });
      }
    }
    if (prevPlayerHp.current !== null && pd.currentHp < prevPlayerHp.current) {
      setPlayerShake((k) => k + 1);
      // Floating damage number on the player myth
      const playerDmg = prevPlayerHp.current - pd.currentHp;
      const playerCrit = (battleData.log ?? []).slice(-3).some(
        (e: { actor: string; critical: boolean }) => e.actor === 'wild' && e.critical,
      );
      const pfid = ++floatIdRef.current;
      setDamageFloats(f => [...f, { id: pfid, dmg: playerDmg, side: 'player', crit: playerCrit }]);
      setTimeout(() => setDamageFloats(f => f.filter(x => x.id !== pfid)), 1600);
      // Camera shake + sprite flash
      setHitFlashPlayer(k => k + 1);
      setArenaShakeCrit(playerCrit);
      setArenaShakeId(k => k + 1);
      if (pd.currentHp === 0 && prevPlayerHp.current > 0) {
        setFaintCinematic({
          side: 'player',
          mythId: pd.species?.id ?? '',
          element: pd.species?.element ?? 'Fire',
          rarity: pd.species?.rarity ?? 'C',
        });
      }
    }

    // Detect myth switch for entrance animation
    if (prevCapturedId.current !== null && pd.capturedId !== prevCapturedId.current) {
      setSwitchAnimKey((k) => k + 1);
    }

    prevWildHp.current     = wd.currentHp;
    prevPlayerHp.current   = pd.currentHp;
    prevCapturedId.current = pd.capturedId ?? null;

    updateBattle(battleData);
    if (battleData.status !== 'active') {
      // PvP battles have a manual Continue button — no auto-dismiss
      const isPvpBattle = battleData.regionId === 'pvp-arena';
      if (!isPvpBattle) {
        setTimeout(() => { endBattle(); setCaptureMsg(null); }, 4000);
      }
    }
  }, [battleData]);

  // Trigger entrances + PvP intro cinematic when a fresh battle starts
  useEffect(() => {
    if (battle.battleId && battle.battleId !== seenBattleId.current) {
      seenBattleId.current = battle.battleId;
      setShowBattleIntro(true);
      setShowPlayerEntrance(true);
      setShowWildEntrance(true);
      const t = setTimeout(() => setShowBattleIntro(false), 2800);
      return () => clearTimeout(t);
    }
  }, [battle.battleId]);

  // Trigger player entrance on myth switch
  useEffect(() => {
    if (switchAnimKey > 0 && switchAnimKey !== prevSwitchAnimKey.current) {
      prevSwitchAnimKey.current = switchAnimKey;
      setShowPlayerEntrance(true);
    }
  }, [switchAnimKey]);

  // Clear any in-progress entrance animations when the battle is over so they
  // don't overlay the result screen or outlive the component.
  const isOver = (battle.battle?.status ?? 'active') !== 'active';
  useEffect(() => {
    if (isOver) {
      setShowPlayerEntrance(false);
      setShowWildEntrance(false);
      // Do NOT clear faintCinematic here — the faint animation (≤ 480ms) needs
      // to play to completion before the result screen appears (endBattle fires
      // after 4000ms). onFaintComplete clears it once the animation finishes.
    }
  }, [isOver]);

  // ── Lunge: increment the lunge key for the attacker on each new cinematic ─
  useEffect(() => {
    if (!cinematic) return;
    if (cinematic.attackerSide === 'player') {
      setPlayerLungeKey(k => k + 1);
    } else {
      setWildLungeKey(k => k + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cinematic]);

  // ── Round tracking — banner fires AFTER opponent's turn ends ────────────
  // When the API returns a new round number we don't immediately show the banner
  // because the opponent hasn't acted yet. We park it in pendingRoundRef and
  // onCinematicComplete (wild phase) picks it up after the opponent cinematic.
  useEffect(() => {
    const currentRound = battle.battle?.round ?? 1;
    if (currentRound === prevRoundRef.current) return;
    prevRoundRef.current = currentRound;
    setRoundTimer(10);
    if (currentRound > 1) {
      pendingRoundRef.current = currentRound; // deferred — announced after both turns
    } else {
      setDisplayedRound(1); // battle start
    }
  }, [battle.battle?.round]);

  // ── Countdown tick while player has their turn ────────────────────────────
  useEffect(() => {
    if (isOver || cinematic !== null || performAction.isPending || showOrbPicker || showSwitchPanel || opponentTurnActive) return;
    const id = setInterval(() => {
      setRoundTimer(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isOver, cinematic, performAction.isPending, showOrbPicker, showSwitchPanel, opponentTurnActive]);

  // ── Opponent turn: countdown then fire wild cinematic ─────────────────────
  useEffect(() => {
    if (!opponentTurnActive) {
      // When opponent turn ends, reset player timer to 10
      setRoundTimer(10);
      return;
    }
    opponentCinematicFiredRef.current = false;
    setOpponentTimer(10);
    // Randomise when the opponent "decides" (4–7 remaining = 3–6 s into the turn)
    opponentFireAtRef.current = 4 + Math.floor(Math.random() * 4);
    const interval = setInterval(() => {
      setOpponentTimer(prev => {
        const next = Math.max(0, prev - 1);
        if (next <= opponentFireAtRef.current && !opponentCinematicFiredRef.current) {
          opponentCinematicFiredRef.current = true;
          clearInterval(interval);
          const wild = pendingWildCinematic.current;
          if (wild) {
            pendingWildCinematic.current = null;
            setCinematic({
              skillName: wild.skillName,
              element: wild.element,
              power: wild.power,
              isCritical: wild.isCritical,
              attackerSide: 'wild',
              phase: 'wild',
              attackerMythId: wild.attackerMythId,
              attackerRarity: wild.attackerRarity,
              skillType: 'normal',
            });
          }
          setOpponentTurnActive(false);
        }
        return next;
      });
    }, 1000);

    // Safety-net: if opponentTurnActive somehow stays true for 12 s (e.g. the
    // interval was GC'd or pendingWildCinematic was cleared before the countdown
    // fired), force-clear it so the battle doesn't freeze permanently.
    const safetyTimeout = setTimeout(() => {
      if (!opponentCinematicFiredRef.current) {
        console.warn('[BattleOverlay] opponent-turn safety-net fired — force-clearing opponentTurnActive after 12 s');
        opponentCinematicFiredRef.current = true;
        pendingWildCinematic.current = null;
        setOpponentTurnActive(false);
      }
    }, 12_000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opponentTurnActive]);

  // Stable callbacks for entrance cinematics — avoids restarting the timeout
  // inside MythEntranceCinematic on every parent re-render.
  const onPlayerEntranceComplete = useCallback(() => setShowPlayerEntrance(false), []);
  const onWildEntranceComplete   = useCallback(() => setShowWildEntrance(false), []);

  // Stable callback for faint cinematic
  const onFaintComplete = useCallback(() => setFaintCinematic(null), []);

  // Derive battle data with safe defaults (must happen before early return so hooks below are always called)
  const wildMonster  = battle.battle?.wildMonster ?? null;
  const playerMonster = battle.battle?.playerMonster ?? null;
  const log          = battle.battle?.log ?? [];
  const status       = battle.battle?.status ?? 'active';
  const isPending    = performAction.isPending;
  // isOver is declared above (near the isOver effect) so we don't redeclare it here

  // ── Cinematic complete handler ────────────────────────────────────────────
  const onCinematicComplete = useCallback(() => {
    const result = pendingBattleResult.current;
    const wild = pendingWildCinematic.current;

    if (cinematic?.phase === 'player') {
      // Apply result, then maybe show wild cinematic
      if (result) {
        updateBattle(result);
        if (battle.battleId) {
          queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });
        }
        pendingBattleResult.current = null;
      }
      if (wild && result?.status === 'active') {
        // Hand off to opponent turn phase — the countdown will fire the wild cinematic
        // (pendingWildCinematic.current still holds `wild`; opponent effect consumes it)
        setOpponentTurnActive(true);
      } else {
        pendingWildCinematic.current = null;
        setCinematic(null);
      }
    } else {
      // Wild cinematic done — clear, then announce new round if pending
      setCinematic(null);
      if (pendingRoundRef.current > 0) {
        const nextRound = pendingRoundRef.current;
        pendingRoundRef.current = 0;
        setDisplayedRound(nextRound);
        setShowRoundBanner(true);
        setTimeout(() => setShowRoundBanner(false), 2500);
      }
    }
  }, [cinematic, battle.battleId, updateBattle, queryClient]);

  // ── Skill / attack action ─────────────────────────────────────────────────
  const handleSkillAction = useCallback(async (action: ActionType) => {
    if (!battle.battleId || isPending || isOver || cinematic) return;

    const playerSkills = getDisplaySkills(playerMonster?.species ?? {});
    const skill = getSkillForAction(action, playerSkills);
    const skillElement = skill.element ?? playerMonster?.species?.element ?? 'Fire';

    // Show player cinematic immediately (optimistic)
    setCinematic({
      skillName: skill.name,
      element: skillElement,
      power: skill.power,
      description: skill.description,
      attackerSide: 'player',
      phase: 'player',
      attackerMythId: playerMonster?.species?.id,
      attackerRarity:  playerMonster?.species?.rarity ?? 'C',
      skillType: skill.type,
    });

    try {
      const updated = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action: action as 'attack' | 'skill1' | 'skill2' | 'ultimate', orbType: undefined },
      });

      // Detect wild counterattack from log
      const logEntries = (updated.log ?? []) as { actor: string; action: string; damageDealt: number | null; critical: boolean }[];
      const wildEntry = logEntries.slice(-3).reverse().find(e => e.actor === 'wild');
      if (wildEntry) {
        const wildElement = updated.wildMonster?.species?.element ?? 'Fire';
        pendingWildCinematic.current = {
          skillName: wildEntry.action,
          element: wildElement,
          power: wildEntry.damageDealt ?? 40,
          isCritical: wildEntry.critical,
          attackerMythId: updated.wildMonster?.species?.id,
          attackerRarity:  updated.wildMonster?.species?.rarity ?? 'C',
        };
      }
      pendingBattleResult.current = updated;
    } catch (err) {
      console.error('Battle action failed:', err);
      pendingBattleResult.current = null;
      pendingWildCinematic.current = null;
    }
  }, [battle.battleId, isPending, isOver, cinematic, playerMonster, performAction]);

  // Keep finalizeCaptureRef.current up-to-date on every render so both
  // the animation callback and the API promise always call the latest version.
  finalizeCaptureRef.current = () => {
    if (!captureAnimDone.current || !captureReqDone.current) return; // wait for both
    // Reset flags first so a re-entrant call is a no-op
    captureAnimDone.current = false;
    captureReqDone.current  = false;
    const result = pendingCaptureResult.current;
    const errMsg = pendingCaptureError.current;
    pendingCaptureResult.current = null;
    pendingCaptureError.current  = null;

    setOrbCinematic(null);

    if (result) {
      updateBattle(result);
      if (battle.battleId) {
        queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });
      }
      const last = result.log?.slice(-1)[0];
      if (last?.action === 'capture') {
        setCaptureMsg(last.description);
        setTimeout(() => setCaptureMsg(null), 3000);
      }
    }
    if (errMsg) {
      setCaptureMsg(errMsg);
      setTimeout(() => setCaptureMsg(null), 3000);
    }
  };

  // ── Orb cinematic complete ────────────────────────────────────────────────
  // Animation side: set flag and attempt finalization.
  const onOrbCinematicComplete = useCallback(() => {
    captureAnimDone.current = true;
    finalizeCaptureRef.current();
  }, []); // stable — reads latest via ref

  // ── Capture / flee action ─────────────────────────────────────────────────
  const handleAction = useCallback(async (action: 'capture' | 'flee', orbType = 'Prism') => {
    if (!battle.battleId || isPending || isOver) return;
    setShowOrbPicker(false);

    if (action === 'capture') {
      // Reset two-flag state, then start animation and API call in parallel.
      captureAnimDone.current  = false;
      captureReqDone.current   = false;
      pendingCaptureResult.current = null;
      pendingCaptureError.current  = null;

      const targetRarity = wildMonster?.species?.rarity ?? 'C';
      setOrbCinematic({ orbType, targetRarity: targetRarity as string });

      // Fire-and-forget: store result/error then signal completion flag.
      // finalizeCaptureRef.current() applies the outcome only once both
      // animation AND this promise have settled — whichever is slower.
      performAction.mutateAsync({
        battleId: battle.battleId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { action, orbType: orbType as any },
      }).then((updated) => {
        pendingCaptureResult.current = updated;
        captureReqDone.current = true;
        finalizeCaptureRef.current();
      }).catch((err: unknown) => {
        console.error('Capture action failed:', err);
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        pendingCaptureError.current = msg ?? 'Capture failed';
        captureReqDone.current = true;
        finalizeCaptureRef.current();
      });
      return;
    }

    // Flee — no cinematic needed
    try {
      const updated = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action, orbType: undefined },
      });
      updateBattle(updated);
      queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });
    } catch (err: unknown) {
      console.error('Battle action failed:', err);
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg) { setCaptureMsg(msg); setTimeout(() => setCaptureMsg(null), 3000); }
    }
  }, [battle.battleId, isPending, isOver, wildMonster, performAction, updateBattle, queryClient]);

  const handleSwitch = async (capturedId: string) => {
    if (!battle.battleId || isPending || isOver) return;
    setShowSwitchPanel(false);
    try {
      const updated = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action: 'switch' as const, orbType: undefined, switchToMonsterId: capturedId },
      });
      updateBattle(updated);
      queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });
    } catch (err) {
      console.error('Switch myth failed:', err);
    }
  };

  // ── Early return guard (all hooks must be above this line) ────────────────
  if (!battle.active || !battle.battle || !wildMonster || !playerMonster) return null;

  const char      = getCharacter(characterType);
  const regionId  = battle.battle.regionId ?? player?.regionId;
  const theme     = getTheme(regionId);
  const lastLog   = log.slice(-1)[0];
  const logText   = lastLog?.description ?? (isOver ? getEndText(status) : 'What will you do?');
  const logActor  = lastLog?.actor === 'player' ? 'player' : lastLog?.actor === 'wild' ? 'wild' : 'system';

  const wildHpPct   = (wildMonster.currentHp / wildMonster.maxHp) * 100;
  const wildColors  = getElementColors(wildMonster.species.element);

  return (
    <div className="fixed inset-0 z-50 flex flex-col battle-screen-in" style={{ fontFamily: 'var(--font-mono, monospace)' }}>

      {/* ── ARENA ─────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">

        {/* Sky */}
        <div className="absolute inset-0" style={{ background: theme.skyGrad }} />

        {/* Ground */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: '42%',
            background: theme.groundGrad,
            borderTop: `2px solid ${theme.groundLine}`,
          }}
        />

        {/* Horizon decorations */}
        <div className="absolute left-0 right-0" style={{ bottom: '42%' }}>
          {theme.hasTrees && <ForestSilhouette color={theme.treeColor} />}
          {theme.hasRocks && !theme.hasTrees && <RockSilhouette color={theme.rockColor} />}
        </div>

        {/* Wild HP plate — upper left */}
        <div className="absolute top-4 left-4 battle-slide-up" style={{ animationDelay: '0.1s' }}>
          <HpPlate
            name={wildMonster.species.name}
            level={wildMonster.level}
            element={wildMonster.species.element}
            rarity={wildMonster.species.rarity}
            currentHp={wildMonster.currentHp}
            maxHp={wildMonster.maxHp}
            align="left"
          />
          {wildMonster.shinyVariant && (
            <div className="mt-1 text-center text-[10px] font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px gold' }}>
              ✨ {wildMonster.shinyVariant} Shiny
            </div>
          )}
          {wildHpPct < 30 && (
            <div className="mt-1 text-center text-[10px] animate-pulse" style={{ color: '#34D399' }}>
              ● Good catch chance!
            </div>
          )}
        </div>

        {/* ── Unified turn widget — top centre ────────────────────────────── */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 battle-slide-up flex flex-col items-center"
          style={{ animationDelay: '0.2s', zIndex: 13, minWidth: 90, gap: 2 }}
        >
          {/* Round chip */}
          <div
            className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
            style={{
              background: 'rgba(0,0,0,0.72)',
              border: `1.5px solid ${opponentTurnActive ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.16)'}`,
              color: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.65)',
              letterSpacing: '0.14em',
              transition: 'border-color 0.4s',
            }}
          >
            ROUND {displayedRound}
          </div>

          {/* Phase label */}
          {!isOver && (
            <div
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{
                color: opponentTurnActive ? '#FCA5A5' : 'rgba(255,255,255,0.35)',
                transition: 'color 0.35s ease',
                letterSpacing: '0.28em',
                minHeight: 13,
              }}
            >
              {cinematic || isPending || opponentTurnActive
                ? ''
                : '◆ Your turn'}
            </div>
          )}

          {/* Big countdown digit */}
          {!isOver && (
            <div
              className={[
                'text-[38px] font-black tabular-nums leading-none',
                opponentTurnActive
                  ? opponentTimer <= 3 ? 'text-red-400 timer-urgent' : 'text-red-300'
                  : roundTimer <= 3 && !cinematic && !isPending
                    ? 'text-red-400 timer-urgent'
                    : roundTimer <= 5 && !cinematic && !isPending
                      ? 'text-yellow-300'
                      : 'text-white/55',
              ].join(' ')}
              style={{
                textShadow: opponentTurnActive
                  ? opponentTimer <= 3
                    ? '0 0 24px rgba(239,68,68,0.95)'
                    : '0 0 10px rgba(239,68,68,0.4)'
                  : roundTimer <= 3 && !cinematic && !isPending
                    ? '0 0 20px rgba(239,68,68,0.9)'
                    : 'none',
                transition: 'color 0.3s, text-shadow 0.3s',
              }}
            >
              {cinematic || isPending
                ? '—'
                : opponentTurnActive
                  ? opponentTimer
                  : roundTimer}
            </div>
          )}

        </div>

        {/* Player myth HP plate — upper right */}
        <div className="absolute top-4 right-4 battle-slide-up" style={{ animationDelay: '0.15s' }}>
          <HpPlate
            name={playerMonster.species.name}
            level={playerMonster.level}
            element={playerMonster.species.element}
            rarity={playerMonster.species.rarity}
            currentHp={playerMonster.currentHp}
            maxHp={playerMonster.maxHp}
            align="right"
          />
        </div>

        {/* ── Combatants — depth-layered absolute positioning ──────────────── */}

        {/* Character — CENTER BACK (smaller, feet on ground) */}
        <div
          className="absolute battle-entrance battle-idle-bob"
          style={{
            bottom: '42%',
            left: '50%',
            transform: 'translateX(-50%)',
            animationDelay: '0.2s',
            zIndex: 1,
          }}
        >
          <CharacterFront char={char} size={78} />
          <div style={{
            width: 48, height: 8, borderRadius: '50%', marginTop: 2, marginLeft: 'auto', marginRight: 'auto',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 80%)',
          }} />
        </div>

        {/* Wild Myth — LEFT FRONT */}
        <div
          className="absolute flex flex-col items-center battle-entrance"
          style={{ bottom: '36%', left: '8%', animationDelay: '0.05s', zIndex: 2 }}
        >
          {/* Stagger wrapper — re-keyed when wild takes a hit */}
          <div key={`wstagger-${wildShake}`} className={wildShake > 0 ? 'hit-stagger-right' : ''}>
          {/* Inner lunge wrapper — re-keyed on each wild attack to replay animation */}
          <div
            key={`wlunge-${wildLungeKey}`}
            className={`flex flex-col items-center ${wildLungeKey > 0 ? 'myth-lunge-right' : ''}`}
          >
            {/* Type matchup badge */}
            {(() => {
              const mult = getTypeMultiplier(playerMonster.species.element, wildMonster.species.element);
              const txt  = getMatchupText(mult);
              if (!txt) return null;
              const color = mult >= 2 ? '#22C55E' : mult >= 1.5 ? '#86EFAC' : mult === 0 ? '#94A3B8' : '#FCA5A5';
              return (
                <div className="text-[9px] font-bold mb-1 px-2 py-0.5 rounded-full"
                  style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
                  {txt}
                </div>
              );
            })()}
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2 text-center"
              style={{ color: wildColors.primary, textShadow: `0 0 10px ${wildColors.glow}` }}
            >
              ⚔ Enemy
            </div>
            <MythSprite
              speciesId={wildMonster.species.id}
              element={wildMonster.species.element}
              rarity={wildMonster.species.rarity}
              size={110}
              shakeKey={wildShake}
              isFainting={faintCinematic?.side === 'wild'}
            />
          </div>
          </div> {/* ← close stagger wrapper */}
        </div>

        {/* Player Myth — RIGHT FRONT */}
        <div
          key={switchAnimKey}
          className="absolute flex flex-col items-center battle-entrance"
          style={{ bottom: '36%', right: '8%', animationDelay: '0.1s', zIndex: 2 }}
        >
          {/* Stagger wrapper — re-keyed when player myth takes a hit */}
          <div key={`pstagger-${playerShake}`} className={playerShake > 0 ? 'hit-stagger-left' : ''}>
          {/* Inner lunge wrapper — re-keyed on each player attack to replay animation */}
          <div
            key={`plunge-${playerLungeKey}`}
            className={`flex flex-col items-center ${playerLungeKey > 0 ? 'myth-lunge-left' : ''}`}
          >
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2 text-center text-white/50">
              Your Myth
            </div>
            <MythSprite
              speciesId={playerMonster.species.id}
              element={playerMonster.species.element}
              rarity={playerMonster.species.rarity}
              size={110}
              shakeKey={playerShake}
              isFainting={faintCinematic?.side === 'player'}
            />
          </div>
          </div> {/* ← close stagger wrapper */}
        </div>

        {/* ── Myth entrance cinematics (non-blocking cosmetic overlay) ── */}
        {showWildEntrance && wildMonster && (
          <MythEntranceCinematic
            mythId={wildMonster.species.id}
            element={wildMonster.species.element}
            rarity={wildMonster.species.rarity}
            side="wild"
            onComplete={onWildEntranceComplete}
          />
        )}
        {showPlayerEntrance && playerMonster && (
          <MythEntranceCinematic
            mythId={playerMonster.species.id}
            element={playerMonster.species.element}
            rarity={playerMonster.species.rarity}
            side="player"
            onComplete={onPlayerEntranceComplete}
          />
        )}

        {/* ── Hit flash overlays — brief white radial burst at defender ─── */}
        <div
          key={`hfw-${hitFlashWild}`}
          className={`absolute pointer-events-none rounded-full ${hitFlashWild > 0 ? 'hit-white-flash' : ''}`}
          style={{
            left: '8%', bottom: '36%',
            transform: 'translate(-10%, 10%)',
            width: 150, height: 150,
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 40%, transparent 100%)',
            zIndex: 10,
            opacity: 0,
          }}
        />
        <div
          key={`hfp-${hitFlashPlayer}`}
          className={`absolute pointer-events-none rounded-full ${hitFlashPlayer > 0 ? 'hit-white-flash' : ''}`}
          style={{
            right: '8%', bottom: '36%',
            transform: 'translate(10%, 10%)',
            width: 150, height: 150,
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 40%, transparent 100%)',
            zIndex: 10,
            opacity: 0,
          }}
        />

        {/* ── Floating damage numbers ─────────────────────────────────── */}
        {damageFloats.map(f => (
          <div
            key={f.id}
            className={`absolute ${f.crit ? 'dmg-float-crit' : 'dmg-float'}`}
            style={{
              ...(f.side === 'wild' ? { left: '12%' } : { right: '12%' }),
              bottom: '54%',
              zIndex: 12,
              fontSize: f.crit ? 34 : 22,
              fontWeight: 900,
              fontFamily: 'monospace',
              color: f.crit ? '#FDE047' : '#FF7070',
              textShadow: f.crit
                ? '0 0 24px #F59E0B, 0 0 48px #F59E0B66, 0 3px 8px rgba(0,0,0,0.98)'
                : '0 0 12px rgba(255,100,100,0.8), 0 3px 7px rgba(0,0,0,0.98)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {f.crit && (
              <div style={{
                fontSize: 10, letterSpacing: '0.25em', color: '#FDE047',
                marginBottom: 3, textShadow: '0 0 8px #F59E0B',
              }}>
                ★ CRITICAL!
              </div>
            )}
            -{f.dmg}
          </div>
        ))}

        {/* ── Round start banner (rounds 2+) — dramatic sweep ─────────── */}
        {showRoundBanner && (
          <div
            className="absolute inset-0 flex items-center justify-center round-banner-flash"
            style={{ zIndex: 14 }}
          >
            <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
              {/* Scan line */}
              <div className="battle-intro-scan absolute inset-x-0 top-0"
                style={{ height: 2, background: 'rgba(255,255,255,0.6)', zIndex: 1 }} />
              {/* Banner body */}
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '16px 0',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.93) 15%, rgba(0,0,0,0.93) 85%, transparent 100%)',
                  borderTop: '2px solid rgba(255,255,255,0.28)',
                  borderBottom: '2px solid rgba(255,255,255,0.28)',
                  boxShadow: '0 0 40px rgba(0,0,0,0.8)',
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.55em',
                  color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase',
                }}>
                  ─── Round begins ───
                </div>
                <div style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: '0.18em', lineHeight: 1,
                  color: '#fff',
                  textShadow: '0 0 30px rgba(255,255,255,0.7), 0 0 60px rgba(255,200,100,0.4), 0 3px 8px rgba(0,0,0,0.9)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  ⚔ ROUND {battle.battle?.round} ⚔
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.35em',
                  color: 'rgba(255,200,100,0.7)', marginTop: 8, textTransform: 'uppercase',
                }}>
                  Fight!
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ── Faint cinematic (plays when HP drops to 0) ─────────────── */}
        {faintCinematic && (
          <MythFaintCinematic
            mythId={faintCinematic.mythId}
            element={faintCinematic.element}
            rarity={faintCinematic.rarity}
            side={faintCinematic.side}
            onComplete={onFaintComplete}
          />
        )}

        {/* ── Orb Picker Overlay ────────────────────────────────────────── */}
        {showOrbPicker && !isOver && (
          <div
            className="absolute inset-0 flex flex-col"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-bold text-white/90 tracking-wider uppercase">Choose Orb</span>
              <button
                onClick={() => setShowOrbPicker(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <X size={14} className="text-white/70" />
              </button>
            </div>
            <p className="px-4 pb-3 text-[11px] text-white/40">
              Weaken the myth first — lower HP raises catch rate.
              {wildHpPct < 30 && <span className="text-emerald-400 ml-1">● Low HP — great moment to throw!</span>}
            </p>

            {/* Orb list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
              {ORB_CONFIG.map(orb => {
                const count = orbCounts[orb.type] ?? 0;
                const isEmpty = count <= 0;
                const catchPct = (battle.battle as any)?.captureOdds?.[orb.type] ?? 0;
                const pctColor = catchPct >= 60 ? '#34D399' : catchPct >= 30 ? '#EAB308' : catchPct >= 10 ? '#FB923C' : '#F87171';
                return (
                  <button
                    key={orb.type}
                    disabled={isEmpty || isPending}
                    onClick={() => handleAction('capture', orb.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: isEmpty ? 'rgba(255,255,255,0.03)' : orb.grad,
                      border: `1.5px solid ${isEmpty ? 'rgba(255,255,255,0.08)' : orb.border}`,
                      boxShadow: isEmpty ? 'none' : `0 0 14px ${orb.glow}`,
                    }}
                    data-testid={`button-orb-${orb.type.toLowerCase()}`}
                  >
                    {/* Orb icon */}
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: isEmpty ? 'rgba(0,0,0,0.3)' : `${orb.color}22`, border: `1px solid ${orb.color}44` }}
                    >
                      {orb.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-sm text-white truncate">{orb.type} Orb</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: `${orb.color}22`, color: orb.color, border: `1px solid ${orb.color}44` }}
                        >
                          {orb.bonusLabel} rate
                        </span>
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        {isEmpty ? 'None in bag' : `${count} remaining`}
                      </div>
                    </div>

                    {/* Live catch % */}
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <div
                        className="text-base font-black tabular-nums"
                        style={{ color: isEmpty ? 'rgba(255,255,255,0.2)' : pctColor, textShadow: isEmpty ? 'none' : `0 0 8px ${pctColor}88` }}
                      >
                        {catchPct}%
                      </div>
                      <div className="text-[8px] text-white/30 uppercase tracking-wider">catch</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Switch Myth Panel Overlay ──────────────────────────────────── */}
        {showSwitchPanel && !isOver && (
          <div
            className="absolute inset-0 flex flex-col"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-bold text-white/90 tracking-wider uppercase">Switch Myth</span>
              <button
                onClick={() => setShowSwitchPanel(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <X size={14} className="text-white/70" />
              </button>
            </div>
            <p className="px-4 pb-3 text-[11px] text-white/40">Choose a myth to send out. Fainted myths cannot battle.</p>

            {/* Team list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
              {(teamCollection ?? []).filter(m => m.inTeam).map(m => {
                const isActive  = m.id === playerMonster.capturedId;
                const isFainted = m.currentHp <= 0;
                const elColors  = getElementColors(m.species.element);
                const hpPct     = Math.max(0, Math.min(100, (m.currentHp / m.maxHp) * 100));
                const barColor  = hpPct > 50 ? '#22C55E' : hpPct > 20 ? '#EAB308' : '#EF4444';
                const displayName = m.nickname ?? m.species.name;

                return (
                  <button
                    key={m.id}
                    disabled={isActive || isFainted || isPending}
                    onClick={() => handleSwitch(m.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${elColors.primary}22, ${elColors.primary}11)`
                        : isFainted
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(255,255,255,0.07)',
                      border: isActive
                        ? `1.5px solid ${elColors.primary}55`
                        : isFainted
                          ? '1.5px solid rgba(255,255,255,0.06)'
                          : '1.5px solid rgba(255,255,255,0.12)',
                      opacity: isFainted ? 0.45 : 1,
                      cursor: isActive || isFainted ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {/* Myth icon */}
                    <div
                      className="shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                      style={{
                        width: 44, height: 44,
                        background: isFainted ? 'rgba(0,0,0,0.4)' : `${elColors.primary}18`,
                        border: `1px solid ${elColors.primary}33`,
                        filter: isFainted ? 'grayscale(1)' : undefined,
                      }}
                    >
                      <MythSvgIcon mythId={m.species.id} element={m.species.element} rarity={m.species.rarity} size={36} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white/90 truncate">{displayName}</span>
                        <span className="text-[10px] text-white/40 font-mono shrink-0">Lv.{m.level}</span>
                        {isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: `${elColors.primary}33`, color: elColors.primary }}>
                            Active
                          </span>
                        )}
                        {isFainted && (
                          <span className="text-[9px] font-bold text-red-400/70 shrink-0">Fainted</span>
                        )}
                      </div>
                      {/* HP bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${hpPct}%`,
                            background: isFainted ? '#555' : `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <div className="mt-0.5 text-[9px] font-mono text-white/35">{m.currentHp}/{m.maxHp} HP</div>
                    </div>

                    {/* Element badge */}
                    <div
                      className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${elColors.primary}22`, color: elColors.primary, border: `1px solid ${elColors.primary}44` }}
                    >
                      {m.species.element}
                    </div>
                  </button>
                );
              })}

              {(teamCollection ?? []).filter(m => m.inTeam).length === 0 && (
                <div className="text-center text-white/40 text-sm py-8">
                  No myths in your team.<br/>
                  <span className="text-[11px]">Add myths to your team from the Collection.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── End-of-battle cinematic ──────────────────────────────────────── */}
        {isOver && (
          <BattleEndCinematic
            status={status as 'won' | 'lost' | 'captured' | 'fled'}
            isPvp={battle.battle.regionId === 'pvp-arena'}
            onComplete={() => { endBattle(); setCaptureMsg(null); }}
            expReward={battle.battle.expReward ?? undefined}
            coinReward={battle.battle.coinReward ?? undefined}
            wildMythId={wildMonster.species.id}
            wildElement={wildMonster.species.element}
            wildRarity={wildMonster.species.rarity}
            wildName={wildMonster.species.name}
            playerMythId={playerMonster.species.id}
            playerMythName={playerMonster.species.name}
            playerMythElement={playerMonster.species.element}
            playerMythRarity={playerMonster.species.rarity}
            playerHpPct={(playerMonster.currentHp / playerMonster.maxHp) * 100}
            totalRounds={battle.battle.round ?? 1}
            battleLog={log as { actor: string; damageDealt: number | null; critical: boolean; description?: string }[]}
          />
        )}

        {/* ── Skill Cinematic overlay ───────────────────────────────────── */}
        {cinematic && (
          <SkillCinematic
            key={`${cinematic.skillName}-${cinematic.phase}`}
            skillName={cinematic.skillName}
            skillDesc={cinematic.description}
            element={cinematic.element}
            power={cinematic.power}
            attackerSide={cinematic.attackerSide}
            isCritical={cinematic.isCritical}
            onComplete={onCinematicComplete}
            attackerMythId={cinematic.attackerMythId}
            attackerRarity={cinematic.attackerRarity}
            skillType={cinematic.skillType}
          />
        )}

        {/* ── Orb Cinematic overlay ────────────────────────────────────── */}
        {orbCinematic && (
          <OrbCinematic
            key={`orb-${orbCinematic.orbType}`}
            orbType={orbCinematic.orbType}
            targetRarity={orbCinematic.targetRarity}
            onComplete={onOrbCinematicComplete}
          />
        )}

        {/* Capture attempt feedback toast */}
        {captureMsg && !isOver && (
          <div
            className="absolute left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold battle-slide-up"
            style={{
              top: '52%',
              background: captureMsg.includes('captured') ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              color: 'white',
            }}
          >
            {captureMsg.includes('captured') ? '✅ ' : '❌ '}{captureMsg}
          </div>
        )}
      </div>

      {/* ── BATTLE TEXT BOX ──────────────────────────────────────────────────── */}
      <div
        style={{
          height: 64,
          borderTop: `2px solid rgba(255,255,255,0.08)`,
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
        }}
      >
        <BattleTextBox
          key={`${lastLog?.turn}-${lastLog?.description}`}
          text={logText}
          actor={logActor}
        />
      </div>

      {/* ── ACTION PANEL ─────────────────────────────────────────────────────── */}
      <div
        className="px-3 py-3"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,18,0.99), rgba(3,3,12,1))',
          minHeight: 148,
        }}
      >
        {!isOver ? (
          <>
            <ActionPanel
              playerMonster={playerMonster}
              wildElement={wildMonster.species.element}
              cinematic={cinematic ?? orbCinematic ?? null}
              isPending={isPending}
              opponentTurnActive={opponentTurnActive}
              wildHpPct={wildHpPct}
              orbCounts={orbCounts}
              handleSkillAction={handleSkillAction}
              handleAction={handleAction}
              setShowSwitchPanel={setShowSwitchPanel}
              setShowOrbPicker={setShowOrbPicker}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <button
              onClick={endBattle}
              className="w-full max-w-xs rounded-xl font-bold text-base py-4 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #0E7490, #0891B2)',
                border: '1.5px solid #22D3EE55',
                boxShadow: '0 0 18px rgba(34,211,238,0.35)',
                color: 'white',
              }}
              data-testid="button-close-battle"
            >
              Continue →
            </button>
          </div>
        )}
      </div>

      {/* ── PvP Arena Entry Cinematic (covers full screen on battle start) ─── */}
      {showBattleIntro && (
        <div
          className="absolute inset-0 battle-intro-overlay flex flex-col items-center justify-center"
          style={{ zIndex: 70, pointerEvents: 'none' }}
        >
          {/* Scan line sweep */}
          <div className="battle-intro-scan absolute inset-x-0 top-0" style={{ height: 3, background: 'rgba(255,255,255,0.55)' }} />

          <div className="battle-intro-content text-center" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.55em', color: '#FCA5A5', marginBottom: 18 }}>
              PVP ARENA
            </div>
            <div style={{
              fontSize: 54, fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1,
              color: '#fff',
              textShadow: '0 0 60px rgba(239,68,68,0.75), 0 0 120px rgba(239,68,68,0.35), 0 4px 12px rgba(0,0,0,0.95)',
            }}>
              BATTLE
            </div>
            <div style={{
              fontSize: 54, fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1.05,
              color: '#fff',
              textShadow: '0 0 60px rgba(239,68,68,0.75), 0 0 120px rgba(239,68,68,0.35), 0 4px 12px rgba(0,0,0,0.95)',
            }}>
              START!
            </div>
            {/* Crossed swords accent */}
            <div className="battle-intro-swords flex items-center justify-center gap-4 mt-6">
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.8))', flex: 1, maxWidth: 60 }} />
              <span style={{ fontSize: 22 }}>⚔</span>
              <div style={{ height: 2, background: 'linear-gradient(90deg, rgba(239,68,68,0.8), transparent)', flex: 1, maxWidth: 60 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function getEndText(status: string): string {
  if (status === 'captured') return 'Gotcha! Added to your collection!';
  if (status === 'won')      return 'You win! Excellent work, trainer!';
  if (status === 'fled')     return 'Got away safely. Better luck next time!';
  if (status === 'lost')     return 'Your myth fainted... Heal up and try again!';
  return 'Battle over.';
}
