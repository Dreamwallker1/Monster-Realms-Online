import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import {
  useGetPlayerCollection,
  useUpdatePlayerTeam,
} from '@workspace/api-client-react';
import { getElementColors } from '@/lib/element-colors';
import { getMonsterEmoji } from '@/lib/monster-emoji';
import { MythSvgIcon } from '@/lib/myth-svgs';
import {
  ArrowLeft, Plus, X, Swords, Sparkles, Shield, Heart,
  Flame, RotateCcw, BookOpen, Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { getGetPlayerTeamQueryKey } from '@workspace/api-client-react';

// ─── Quality tier configs ─────────────────────────────────────────────────────
const QUALITY_CONFIG: Record<string, {
  bg: string; topGlow: string; border: string; boxShadow: string;
  badgeBg: string; badgeText: string; badgeLabel: string; badgeIcon: string;
  shimmer: boolean; headerLine: string; statTrack: string;
}> = {
  S: {
    bg: 'linear-gradient(165deg, #0d0800 0%, #1c1100 25%, #0a0500 55%, #160e00 100%)',
    topGlow: 'radial-gradient(ellipse at 50% -5%, rgba(251,191,36,0.45) 0%, rgba(217,119,6,0.25) 40%, transparent 70%)',
    border: '#D97706',
    boxShadow: '0 0 0 1.5px #D97706, 0 0 28px rgba(251,191,36,0.5), 0 8px 32px rgba(0,0,0,0.6)',
    badgeBg: 'linear-gradient(135deg, #92400E 0%, #D97706 35%, #FBBF24 55%, #F59E0B 80%, #92400E 100%)',
    badgeText: '#000000',
    badgeLabel: 'LEGENDARY',
    badgeIcon: '✦',
    shimmer: true,
    headerLine: 'linear-gradient(90deg, transparent, #FBBF24, #FDE68A, #FBBF24, transparent)',
    statTrack: 'rgba(251,191,36,0.12)',
  },
  A: {
    bg: 'linear-gradient(165deg, #0c0814 0%, #140a22 25%, #08061a 55%, #100a1e 100%)',
    topGlow: 'radial-gradient(ellipse at 50% -5%, rgba(167,139,250,0.4) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)',
    border: '#7C3AED',
    boxShadow: '0 0 0 1.5px #7C3AED, 0 0 22px rgba(139,92,246,0.5), 0 8px 32px rgba(0,0,0,0.6)',
    badgeBg: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 40%, #A855F7 60%, #7C3AED 100%)',
    badgeText: '#ffffff',
    badgeLabel: 'RARE',
    badgeIcon: '◆',
    shimmer: false,
    headerLine: 'linear-gradient(90deg, transparent, #A855F7, #C4B5FD, #A855F7, transparent)',
    statTrack: 'rgba(167,139,250,0.12)',
  },
  B: {
    bg: 'linear-gradient(165deg, #04120a 0%, #071a0e 25%, #031008 55%, #061610 100%)',
    topGlow: 'radial-gradient(ellipse at 50% -5%, rgba(52,211,153,0.35) 0%, rgba(5,150,105,0.18) 40%, transparent 70%)',
    border: '#059669',
    boxShadow: '0 0 0 1.5px #059669, 0 0 18px rgba(52,211,153,0.4), 0 8px 28px rgba(0,0,0,0.6)',
    badgeBg: 'linear-gradient(135deg, #064E3B 0%, #059669 40%, #34D399 60%, #059669 100%)',
    badgeText: '#ffffff',
    badgeLabel: 'UNCOMMON',
    badgeIcon: '●',
    shimmer: false,
    headerLine: 'linear-gradient(90deg, transparent, #34D399, #6EE7B7, #34D399, transparent)',
    statTrack: 'rgba(52,211,153,0.12)',
  },
  C: {
    bg: 'linear-gradient(165deg, #07101e 0%, #0e1a2c 25%, #060e1a 55%, #0c1828 100%)',
    topGlow: 'radial-gradient(ellipse at 50% -5%, rgba(148,163,184,0.25) 0%, rgba(100,116,139,0.12) 40%, transparent 70%)',
    border: '#475569',
    boxShadow: '0 0 0 1px #475569, 0 0 12px rgba(100,116,139,0.3), 0 6px 24px rgba(0,0,0,0.5)',
    badgeBg: 'linear-gradient(135deg, #1E293B 0%, #334155 40%, #64748B 60%, #475569 100%)',
    badgeText: '#E2E8F0',
    badgeLabel: 'COMMON',
    badgeIcon: '•',
    shimmer: false,
    headerLine: 'linear-gradient(90deg, transparent, #64748B, #94A3B8, #64748B, transparent)',
    statTrack: 'rgba(148,163,184,0.1)',
  },
};

// ─── Stat row ─────────────────────────────────────────────────────────────────
function StatRow({
  icon, label, value, max = 180, color, track,
}: {
  icon: React.ReactNode; label: string; value: number; max?: number;
  color: string; track: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 shrink-0 opacity-70">{icon}</div>
      <span className="text-[10px] font-bold text-white/50 w-7 shrink-0 tracking-wide">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: track }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <span
        className="text-[11px] font-black w-6 text-right shrink-0"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

type CardTraits = {
  courage: number;
  strength: number;
  endurance: number;
  ferocity: number;
};

function getCardTraits(monster: any): CardTraits {
  const rarityBonus: Record<string, number> = { C: 0, B: 8, A: 16, S: 25 };
  const level = monster.level ?? 1;
  const bonus = rarityBonus[monster.species?.rarity ?? 'C'] ?? 0;
  const skills = monster.species?.skills ?? [];
  const peakSkill = Math.max(0, ...skills.map((skill: any) => skill.power ?? 0));

  const cap = (value: number) => Math.max(1, Math.min(100, Math.round(value)));
  return {
    courage: cap(32 + level * 2 + bonus + (monster.friendship ?? 0) / 8),
    strength: cap((monster.attack ?? 0) * 0.78 + bonus * 0.45),
    endurance: cap((monster.defense ?? 0) * 0.62 + (monster.maxHp ?? 0) * 0.1),
    ferocity: cap((monster.speed ?? 0) * 0.52 + peakSkill * 0.24),
  };
}

const TRAIT_CONFIG = [
  { key: 'courage', label: 'CES', fullLabel: 'CESARET', color: '#EF4444', icon: Heart },
  { key: 'strength', label: 'GÜÇ', fullLabel: 'GÜÇ', color: '#F97316', icon: Dumbbell },
  { key: 'endurance', label: 'DAY', fullLabel: 'DAYANIKLILIK', color: '#60A5FA', icon: Shield },
  { key: 'ferocity', label: 'YIR', fullLabel: 'YIRTICILIK', color: '#C084FC', icon: Flame },
] as const;

// ─── Shimmer overlay (S-tier only) ────────────────────────────────────────────
function ShimmerOverlay() {
  return (
    <>
      <style>{`
        @keyframes card-shimmer {
          0%   { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        .card-shimmer { animation: card-shimmer 2.8s ease-in-out infinite; }
      `}</style>
      <div className="absolute inset-0 overflow-hidden rounded-[18px] pointer-events-none z-10">
        <div
          className="card-shimmer absolute top-0 bottom-0 w-1/3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,220,100,0.12), rgba(255,240,150,0.22), rgba(255,220,100,0.12), transparent)' }}
        />
      </div>
    </>
  );
}

function LivingMythPortrait({
  monster,
  rarity,
  size,
  interactive = false,
}: {
  monster: any;
  rarity: string;
  size: number;
  interactive?: boolean;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const speciesId = monster.species?.id ?? monster.speciesId ?? '';
  const element = monster.species?.element ?? '';
  const elem = getElementColors(element);
  const isFlarelynx = speciesId === 'flarelynx';

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -9, y: px * 11 });
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, perspective: 900 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <style>{`
        @keyframes myth-ember-rise {
          0% { transform: translate3d(0, 12px, 0) scale(.55); opacity: 0; }
          25% { opacity: .9; }
          100% { transform: translate3d(var(--ember-x), -70px, 26px) scale(1.1); opacity: 0; }
        }
        @keyframes myth-fire-pulse {
          0%, 100% { opacity: .28; transform: scale(.92); }
          50% { opacity: .58; transform: scale(1.08); }
        }
      `}</style>

      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.78,
          height: size * 0.78,
          background: `radial-gradient(circle, ${elem.glow} 0%, transparent 68%)`,
          filter: isFlarelynx ? 'blur(4px)' : 'blur(8px)',
        }}
        animate={{ scale: [0.94, 1.08, 0.94], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: isFlarelynx ? 1.8 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {isFlarelynx && Array.from({ length: 7 }).map((_, index) => (
        <span
          key={index}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 2 + (index % 3),
            height: 2 + (index % 3),
            left: `${22 + index * 9}%`,
            bottom: `${12 + (index % 2) * 8}%`,
            background: index % 2 ? '#F97316' : '#FBBF24',
            boxShadow: '0 0 7px #F97316',
            '--ember-x': `${(index % 2 ? 1 : -1) * (8 + index * 2)}px`,
            animation: `myth-ember-rise ${1.35 + index * 0.11}s ease-out ${index * 0.18}s infinite`,
          } as React.CSSProperties}
        />
      ))}

      <motion.div
        className="relative z-10"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          y: [0, -3, 0],
          scale: [1, isFlarelynx ? 1.018 : 1.01, 1],
        }}
        transition={{
          rotateX: { type: 'spring', stiffness: 180, damping: 18 },
          rotateY: { type: 'spring', stiffness: 180, damping: 18 },
          y: { duration: isFlarelynx ? 2.2 : 3, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: isFlarelynx ? 2.2 : 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          transformStyle: 'preserve-3d',
          filter: isFlarelynx
            ? 'drop-shadow(0 12px 18px rgba(0,0,0,.65)) drop-shadow(0 0 10px rgba(249,115,22,.35))'
            : undefined,
        }}
      >
        <MythSvgIcon
          mythId={speciesId}
          element={element}
          rarity={rarity}
          size={size}
        />
      </motion.div>
    </div>
  );
}

// ─── Skills pills ─────────────────────────────────────────────────────────────
function SkillPills({ skills, elemColor }: { skills?: any[]; elemColor: string }) {
  if (!skills || skills.length === 0) return null;
  const typeLabel: Record<string, string> = { normal: 'ATK', skill1: 'SKILL', ultimate: 'ULT' };
  const typeBg: Record<string, string> = { normal: '#334155', skill1: '#1e3a5f', ultimate: '#3b1a5f' };
  return (
    <div className="flex gap-1 flex-wrap">
      {skills.map((s: any, i: number) => (
        <span
          key={i}
          className="text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest"
          style={{
            background: s.type === 'ultimate' ? `${elemColor}33` : typeBg[s.type] ?? '#334155',
            color: s.type === 'ultimate' ? elemColor : '#94A3B8',
            border: s.type === 'ultimate' ? `1px solid ${elemColor}55` : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {typeLabel[s.type] ?? s.type.toUpperCase()}
        </span>
      ))}
    </div>
  );
}

// ─── Myth Card ────────────────────────────────────────────────────────────────
interface MythCardProps {
  monster: any;
  selected: boolean;
  disabled: boolean;
  onOpen: () => void;
}

function MythCard({ monster, selected, disabled, onOpen }: MythCardProps) {
  const rarity = (monster.species?.rarity ?? 'C') as keyof typeof QUALITY_CONFIG;
  const cfg    = QUALITY_CONFIG[rarity] ?? QUALITY_CONFIG.C;
  const elem   = getElementColors(monster.species?.element ?? '');
  const traits = getCardTraits(monster);

  const selectedShadow = selected
    ? `0 0 0 2.5px ${elem.primary}, 0 0 32px ${elem.glow}, 0 0 64px ${elem.glow.replace('0.', '0.3')}, 0 10px 40px rgba(0,0,0,0.7)`
    : cfg.boxShadow;

  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ scale: 1.035, rotateY: 3, rotateX: -2, y: -3 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      className="relative w-full text-left rounded-[18px] overflow-hidden focus:outline-none"
      style={{
        background: cfg.bg,
        boxShadow: selectedShadow,
        border: `1.5px solid ${selected ? elem.primary : cfg.border}`,
        cursor: 'pointer',
        opacity: disabled && !selected ? 0.62 : 1,
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: cfg.topGlow }} />

      {/* S-tier shimmer */}
      {cfg.shimmer && <ShimmerOverlay />}

      {/* Selected radial overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="sel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none rounded-[18px]"
            style={{ background: `radial-gradient(ellipse at 50% 40%, ${elem.glow.replace('0.4)', '0.18)')} 0%, transparent 65%)` }}
          />
        )}
      </AnimatePresence>

      {/* ── Quality header strip ─────────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-3 pt-2.5 pb-1.5">
        {/* Quality badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: cfg.badgeBg, boxShadow: `0 2px 8px rgba(0,0,0,0.4)` }}
        >
          <span className="text-[9px] font-black tracking-widest" style={{ color: cfg.badgeText }}>
            {cfg.badgeIcon} {rarity}
          </span>
          <span className="text-[8px] font-bold tracking-widest opacity-80" style={{ color: cfg.badgeText }}>
            · {cfg.badgeLabel}
          </span>
        </div>

        {/* Level */}
        <span
          className="text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
        >
          LV{monster.level}
        </span>
      </div>

      {/* Header accent line */}
      <div className="h-px mx-3 mb-1 rounded-full opacity-60" style={{ background: cfg.headerLine }} />

      {/* ── Emoji hero zone ───────────────────────────────────────────── */}
      <div
        className="relative mx-3 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          height: 100,
          background: `radial-gradient(ellipse at 50% 60%, ${elem.glow.replace('0.4', '0.14')} 0%, transparent 75%)`,
        }}
      >
        {/* Decorative ring */}
        <div
          className="absolute w-20 h-20 rounded-full border opacity-20"
          style={{ borderColor: elem.primary }}
        />
        <div
          className="absolute w-14 h-14 rounded-full border opacity-10"
          style={{ borderColor: elem.primary }}
        />
        {/* S-tier aura ring */}
        {rarity === 'S' && (
          <motion.div
            className="absolute w-24 h-24 rounded-full border-2 opacity-30"
            style={{ borderColor: '#FBBF24' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {rarity === 'A' && (
          <motion.div
            className="absolute w-24 h-24 rounded-full border opacity-25"
            style={{ borderColor: '#A855F7' }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* Myth portrait */}
        <motion.div
          className="relative z-10 leading-none select-none"
          style={{ filter: `drop-shadow(0 4px 12px ${elem.glow.replace('0.4', '0.7')})` }}
          animate={rarity === 'S' ? {
            y: [0, -3, 0],
            filter: [
              `drop-shadow(0 4px 12px ${elem.glow.replace('0.4', '0.7')}) drop-shadow(0 0 20px rgba(251,191,36,0.4))`,
              `drop-shadow(0 8px 18px ${elem.glow.replace('0.4', '0.9')}) drop-shadow(0 0 30px rgba(251,191,36,0.65))`,
              `drop-shadow(0 4px 12px ${elem.glow.replace('0.4', '0.7')}) drop-shadow(0 0 20px rgba(251,191,36,0.4))`,
            ],
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LivingMythPortrait
            monster={monster}
            rarity={rarity}
            size={92}
          />
        </motion.div>
      </div>

      {/* ── Info block ────────────────────────────────────────────────── */}
      <div className="px-3 pt-2 pb-3 space-y-2.5">
        {/* Name */}
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-black text-white leading-tight tracking-tight">
            {monster.nickname ?? monster.species?.name ?? '???'}
          </span>
          {/* Element badge */}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5"
            style={{
              background: `${elem.primary}28`,
              color: elem.primary,
              border: `1px solid ${elem.primary}50`,
            }}
          >
            {monster.species?.element ?? '?'}
          </span>
        </div>

        {/* Description (truncated) */}
        {monster.species?.description && (
          <p className="text-[9px] text-white/35 leading-snug line-clamp-2">
            {monster.species.description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px rounded-full opacity-20" style={{ background: cfg.headerLine }} />

        {/* Card traits — PvP meanings will be connected later */}
        <div className="space-y-1.5">
          {TRAIT_CONFIG.map(({ key, label, color, icon: Icon }) => (
            <StatRow
              key={key}
              icon={<Icon size={10} />}
              label={label}
              value={traits[key]}
              max={100}
              color={color}
              track={cfg.statTrack}
            />
          ))}
        </div>

        {/* Skills */}
        {monster.species?.skills?.length > 0 && (
          <SkillPills skills={monster.species.skills} elemColor={elem.primary} />
        )}

        {/* Personality */}
        {monster.species?.personality && (
          <div
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
          >
            <span className="opacity-60">✦</span>
            {monster.species.personality}
          </div>
        )}
      </div>

      {/* ── Selected checkmark ────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: elem.primary, boxShadow: `0 0 12px ${elem.glow}` }}
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4">
              <path d="M2 7 L5.5 10.5 L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-2 right-2 text-[8px] font-bold text-white/25 flex items-center gap-1">
        <BookOpen size={9} />
        KARTI AÇ
      </div>
    </motion.button>
  );
}

function CardDetailModal({
  monster,
  selected,
  teamFull,
  onClose,
  onToggleTeam,
}: {
  monster: any;
  selected: boolean;
  teamFull: boolean;
  onClose: () => void;
  onToggleTeam: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const rarity = (monster.species?.rarity ?? 'C') as keyof typeof QUALITY_CONFIG;
  const cfg = QUALITY_CONFIG[rarity] ?? QUALITY_CONFIG.C;
  const elem = getElementColors(monster.species?.element ?? '');
  const traits = getCardTraits(monster);
  const name = monster.nickname ?? monster.species?.name ?? 'Unknown Myth';
  const story = monster.species?.lore ?? monster.species?.description ?? 'Its story has not yet been recorded.';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(0,2,10,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.72, y: 80 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 190, damping: 20 }}
        className="w-full max-w-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative w-full cursor-pointer"
          style={{ height: 570, perspective: 1400 }}
          onClick={() => setFlipped((value) => !value)}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.58, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-[26px] overflow-hidden border p-5"
              style={{
                backfaceVisibility: 'hidden',
                background: cfg.bg,
                borderColor: elem.primary,
                boxShadow: `0 0 0 1px ${cfg.border}, 0 0 50px ${elem.glow}, 0 28px 80px rgba(0,0,0,0.8)`,
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: cfg.topGlow }} />
              {cfg.shimmer && <ShimmerOverlay />}

              <div className="relative h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm px-3 py-1 rounded-full" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
                    {rarity} · {cfg.badgeLabel}
                  </span>
                  <span className="font-black text-sm text-white/70">LV. {monster.level}</span>
                </div>

                <div className="text-center mt-3">
                  <h2 className="text-3xl font-black tracking-tight uppercase">{name}</h2>
                  <span
                    className="inline-flex mt-1 text-xs font-black tracking-[0.18em] px-3 py-1 rounded-full"
                    style={{ color: elem.primary, background: `${elem.primary}20`, border: `1px solid ${elem.primary}55` }}
                  >
                    {monster.species?.element}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-0 py-2">
                  <LivingMythPortrait
                    monster={monster}
                    rarity={rarity}
                    size={210}
                    interactive
                  />
                </div>

                <div className="text-center mb-3">
                  <span className="text-xs font-black tracking-[0.2em]" style={{ color: elem.primary }}>
                    {monster.species?.personality ?? 'UNKNOWN'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {TRAIT_CONFIG.map(({ key, fullLabel, color, icon: Icon }) => (
                    <div key={key} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 flex items-center gap-2">
                      <Icon size={17} style={{ color }} />
                      <div>
                        <div className="text-[8px] font-bold tracking-widest text-white/40">{fullLabel}</div>
                        <div className="text-lg leading-none font-black" style={{ color }}>{traits[key]}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-bold text-white/30">
                  <RotateCcw size={11} />
                  HİKÂYE İÇİN KARTA DOKUN
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-[26px] overflow-hidden border p-7"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(150deg, #080b12 0%, #150b08 50%, #05070c 100%)',
                borderColor: elem.primary,
                boxShadow: `0 0 0 1px ${cfg.border}, 0 0 50px ${elem.glow}, 0 28px 80px rgba(0,0,0,0.8)`,
              }}
            >
              <div className="h-full flex flex-col items-center text-center">
                <span className="text-[10px] font-black tracking-[0.28em]" style={{ color: elem.primary }}>
                  {rarity} CLASS · {monster.species?.element}
                </span>
                <h2 className="text-3xl font-black uppercase mt-3">{name}</h2>
                <div className="h-px w-32 my-5" style={{ background: `linear-gradient(90deg, transparent, ${elem.primary}, transparent)` }} />

                <div
                  className="w-36 h-36 rounded-full flex items-center justify-center border mb-6"
                  style={{ borderColor: `${elem.primary}55`, background: `radial-gradient(circle, ${elem.glow}, transparent 68%)` }}
                >
                  <MythSvgIcon
                    mythId={monster.species?.id ?? monster.speciesId ?? ''}
                    element={monster.species?.element ?? ''}
                    rarity={rarity}
                    size={128}
                  />
                </div>

                <BookOpen size={18} style={{ color: elem.primary }} />
                <p className="mt-4 text-sm leading-7 text-white/68">{story}</p>

                <div className="mt-auto">
                  <span className="text-[10px] font-black tracking-[0.2em] text-white/35">
                    {monster.species?.personality ?? 'UNKNOWN'}
                  </span>
                  <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-bold text-white/30">
                    <RotateCcw size={11} />
                    ÖN YÜZE DÖNMEK İÇİN DOKUN
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3 mt-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 px-5 rounded-xl border-white/15 bg-black/30"
          >
            Kapat
          </Button>
          <Button
            onClick={onToggleTeam}
            disabled={!selected && teamFull}
            className="h-12 flex-1 rounded-xl font-black tracking-wide"
            style={{
              background: selected ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : `linear-gradient(135deg,${elem.secondary},${elem.primary})`,
            }}
          >
            {selected ? 'TAKIMDAN ÇIKAR' : teamFull ? 'TAKIM DOLU' : 'TAKIMA EKLE'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Team Slot ────────────────────────────────────────────────────────────────
function TeamSlot({ monster, slot, onRemove }: { monster?: any; slot: number; onRemove: () => void }) {
  const elem  = monster ? getElementColors(monster.species?.element ?? '') : null;
  const emoji = monster ? getMonsterEmoji(
    monster.species?.id ?? monster.speciesId ?? '',
    monster.species?.element ?? '',
  ) : null;
  const rarity = monster?.species?.rarity as keyof typeof QUALITY_CONFIG | undefined;
  const cfg = rarity ? QUALITY_CONFIG[rarity] : null;

  return (
    <motion.div
      layout
      className="relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200"
      style={{
        minHeight: 100,
        flex: 1,
        borderColor: elem ? elem.primary + '99' : 'rgba(255,255,255,0.1)',
        background: cfg ? cfg.bg : 'rgba(255,255,255,0.03)',
        boxShadow: elem ? `0 0 18px ${elem.glow}, ${cfg?.boxShadow ?? ''}` : 'none',
      }}
    >
      {monster ? (
        <>
          <motion.button
            onClick={onRemove}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500/80 flex items-center justify-center transition-colors z-10"
          >
            <X size={11} />
          </motion.button>
          {/* Quality badge top-left */}
          {cfg && (
            <div
              className="absolute top-1.5 left-1.5 text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: cfg.badgeBg, color: cfg.badgeText }}
            >
              {rarity}
            </div>
          )}
          <div className="text-4xl mb-1" style={{ filter: `drop-shadow(0 2px 8px ${elem?.glow ?? 'transparent'})` }}>
            {emoji}
          </div>
          <div className="text-[11px] font-bold text-white/90 text-center px-2 leading-tight">
            {monster.nickname ?? monster.species?.name}
          </div>
          <div className="text-[9px] mt-0.5 font-semibold" style={{ color: elem?.primary ?? 'rgba(255,255,255,0.4)' }}>
            {monster.species?.element} · Lv{monster.level}
          </div>
        </>
      ) : (
        <>
          <Plus size={20} className="text-white/15 mb-1" />
          <span className="text-[9px] text-white/20 font-semibold">Slot {slot + 1}</span>
        </>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeamBuilder() {
  const [, navigate] = useLocation();
  const { player } = useGameStore();
  const queryClient = useQueryClient();

  const { data: collection = [], isLoading } = useGetPlayerCollection(
    player?.id ?? '',
    undefined,
    { query: { enabled: !!player?.id, queryKey: ['team-builder-collection', player?.id] } },
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [focusedMonster, setFocusedMonster] = useState<any | null>(null);

  const { mutateAsync: saveTeam } = useUpdatePlayerTeam();

  // Init from saved team
  useEffect(() => {
    if (collection.length > 0 && selectedIds.length === 0) {
      const inTeam = (collection as any[])
        .filter((m) => m.inTeam)
        .sort((a, b) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99))
        .map((m) => m.id)
        .slice(0, 3);
      if (inTeam.length > 0) setSelectedIds(inTeam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.length]);

  const selectedMonsters = selectedIds
    .map((id) => (collection as any[]).find((m) => m.id === id))
    .filter(Boolean);

  const elements = ['all', ...Array.from(
    new Set((collection as any[]).map((m) => m.species?.element).filter(Boolean))
  ) as string[]];

  const filtered: any[] = filter === 'all'
    ? (collection as any[])
    : (collection as any[]).filter((m) => m.species?.element === filter);

  // Sort: S first, then A, B, C; within same rarity sort by level desc
  const rarityOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
  const sorted = [...filtered].sort((a, b) => {
    const ra = rarityOrder[a.species?.rarity ?? 'C'] ?? 3;
    const rb = rarityOrder[b.species?.rarity ?? 'C'] ?? 3;
    if (ra !== rb) return ra - rb;
    return (b.level ?? 0) - (a.level ?? 0);
  });

  function toggleMonster(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function handleEnterWorld() {
    if (!player?.id || selectedIds.length === 0) return;
    setSaving(true);
    try {
      await saveTeam({ playerId: player.id, data: { capturedMonsterIds: selectedIds } });
      queryClient.invalidateQueries({ queryKey: getGetPlayerTeamQueryKey(player.id) });
      navigate('/game');
    } finally {
      setSaving(false);
    }
  }

  const RARITY_ELEMENT_ICONS: Record<string, string> = {
    Fire: '🔥', Water: '💧', Earth: '🪨', Storm: '⚡', Shadow: '🌑',
    Nature: '🌿', Electric: '⚡', Dark: '🌑',
  };

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% -20%, #1a0e40 0%, #070b18 60%, #000308 100%)' }}
    >
      {/* Static stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 70 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.55 + 0.08,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-14">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/game')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Sparkles size={22} className="text-violet-400" />
              Team Builder
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              {selectedIds.length > 0
                ? `${selectedIds.length}/3 myths selected`
                : 'Select up to 3 myths for your team'}
            </p>
          </div>
        </div>

        {/* ── Team Slots ────────────────────────────────────────────────── */}
        <div className="mb-7">
          <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.18em] mb-3">
            ✦ Your Team
          </p>
          <div className="flex gap-3">
            {[0, 1, 2].map((slot) => (
              <TeamSlot
                key={slot}
                slot={slot}
                monster={selectedMonsters[slot]}
                onRemove={() => {
                  const id = selectedIds[slot];
                  if (id) setSelectedIds((prev) => prev.filter((x) => x !== id));
                }}
              />
            ))}
          </div>

          <motion.div
            className="mt-4"
            animate={{ opacity: selectedIds.length > 0 ? 1 : 0.35 }}
          >
            <Button
              onClick={handleEnterWorld}
              disabled={selectedIds.length === 0 || saving}
              className="w-full h-12 text-base font-black rounded-xl relative overflow-hidden border-0"
              style={{
                background: selectedIds.length > 0
                  ? 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 40%, #1d4ed8 100%)'
                  : 'rgba(255,255,255,0.06)',
                boxShadow: selectedIds.length > 0
                  ? '0 0 0 1px #7c3aed, 0 0 28px rgba(109,40,217,0.55), 0 4px 20px rgba(0,0,0,0.4)'
                  : 'none',
                letterSpacing: '0.08em',
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⚙</motion.span>
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Swords size={18} />
                  ENTER WORLD
                  <ArrowLeft size={15} className="rotate-180" />
                </span>
              )}
            </Button>
          </motion.div>
        </div>

        {/* ── Element filter ────────────────────────────────────────────── */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {elements.map((el) => {
            const ec = el !== 'all' ? getElementColors(el) : null;
            const icon = RARITY_ELEMENT_ICONS[el] ?? '';
            return (
              <button
                key={el}
                onClick={() => setFilter(el)}
                className="text-[11px] px-3 py-1 rounded-full border transition-all font-bold capitalize"
                style={{
                  borderColor: filter === el ? (ec?.primary ?? '#a78bfa') : 'rgba(255,255,255,0.1)',
                  background: filter === el ? `${ec?.primary ?? '#a78bfa'}1e` : 'rgba(255,255,255,0.03)',
                  color: filter === el ? (ec?.primary ?? '#a78bfa') : 'rgba(255,255,255,0.4)',
                  boxShadow: filter === el ? `0 0 10px ${ec?.glow ?? 'rgba(167,139,250,0.3)'}` : 'none',
                }}
              >
                {el === 'all' ? '✨ All' : `${icon} ${el}`}
              </button>
            );
          })}
        </div>

        {/* ── Collection Grid ───────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.18em] mb-4">
            ✦ Collection
            {collection.length > 0 && (
              <span className="ml-2 font-normal normal-case text-white/20">{collection.length} myths captured</span>
            )}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-white/25">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="text-2xl mr-3"
              >
                ✦
              </motion.div>
              Loading collection…
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌑</div>
              <p className="text-white/35 text-sm mb-4">
                {collection.length === 0
                  ? "You haven't captured any myths yet. Explore the world!"
                  : 'No myths match this filter.'}
              </p>
              {collection.length === 0 && (
                <Button variant="outline" onClick={() => navigate('/game')}>
                  Go Explore →
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            >
              {sorted.map((monster: any) => (
                <motion.div
                  key={monster.id}
                  variants={{ hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <MythCard
                    monster={monster}
                    selected={selectedIds.includes(monster.id)}
                    disabled={selectedIds.length >= 3 && !selectedIds.includes(monster.id)}
                    onOpen={() => setFocusedMonster(monster)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {selectedIds.length >= 3 && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-amber-400/60 mt-5 font-semibold"
          >
            ✦ Team full — tap a myth to remove it, then add another
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {focusedMonster && (
          <CardDetailModal
            key={focusedMonster.id}
            monster={focusedMonster}
            selected={selectedIds.includes(focusedMonster.id)}
            teamFull={selectedIds.length >= 3}
            onClose={() => setFocusedMonster(null)}
            onToggleTeam={() => toggleMonster(focusedMonster.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
