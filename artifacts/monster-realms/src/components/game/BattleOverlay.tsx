import { useEffect, useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/game-store';
import { useGetBattle, usePerformBattleAction, getGetBattleQueryKey, useGetPlayerCollection } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getElementColors, QUALITY_LABEL } from '@/lib/element-colors';
import { getCharacter } from '@/lib/characters';
import type { CharacterConfig } from '@/lib/characters';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { getTypeMultiplier, getMatchupText, ELEMENT_ICON } from '@/lib/type-chart';
import { Package, Wind, RefreshCw, X } from 'lucide-react';
import SkillCinematic from '@/components/battle/SkillCinematic';

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

// ─── Myth combatant sprite ───────────────────────────────────────────────────────

function MythSprite({
  speciesId, element, rarity = 'C', size = 110, shakeKey,
}: {
  speciesId: string; element: string; rarity?: string;
  size?: number; shakeKey: number;
}) {
  const colors   = getElementColors(element);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (shakeKey > 0) setAnimKey((k) => k + 1);
  }, [shakeKey]);

  return (
    <div className="flex flex-col items-center">
      <div
        key={animKey}
        className={`battle-float ${animKey > 0 ? 'hit-flash' : ''}`}
        style={{ filter: animKey > 0 ? `drop-shadow(0 0 16px ${colors.primary})` : undefined }}
      >
        <MythSvgIcon mythId={speciesId} element={element} rarity={rarity} size={size}/>
      </div>
      {/* Ground shadow */}
      <div style={{
        width: size * 0.65, height: 12, borderRadius: '50%', marginTop: 4,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 80%)',
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
      className="rounded-2xl px-4 py-3 min-w-[170px] max-w-[210px]"
      style={{
        background: 'linear-gradient(135deg, rgba(10,10,25,0.88), rgba(5,5,15,0.94))',
        border: `1.5px solid ${elColors.primary}55`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 12px ${elColors.glow}`,
      }}
    >
      {/* Name row */}
      <div className={`flex items-baseline gap-2 mb-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="font-bold text-sm text-white truncate max-w-[110px]">{name}</span>
        <span className="text-[10px] text-white/50 font-mono shrink-0">Lv.{level}</span>
      </div>
      {/* Element + quality badges */}
      <div className={`flex gap-1 mb-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <Badge
          className="text-[9px] h-4 px-1.5"
          style={{ background: elColors.primary + '44', color: elColors.primary, border: `1px solid ${elColors.primary}66`, boxShadow: 'none' }}
        >
          {element}
        </Badge>
        <Badge
          className="text-[9px] h-4 px-1.5"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'none' }}
        >
          {qualLabel}
        </Badge>
      </div>
      {/* HP bar track */}
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
            boxShadow: `0 0 8px ${barColor}99`,
          }}
        />
      </div>
      {/* HP numbers */}
      <div className={`flex mt-1 ${align === 'right' ? 'justify-start' : 'justify-end'}`}>
        <span className="text-[10px] font-mono text-white/50">
          <span className="text-white/75">{currentHp}</span>/{maxHp}
        </span>
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

// ─── Action Panel (skill buttons + utility row) ──────────────────────────────

function ActionPanel({
  playerMonster,
  wildElement,
  cinematic,
  isPending,
  wildHpPct,
  handleSkillAction,
  handleAction,
  setShowSwitchPanel,
}: {
  playerMonster: { species?: { skills?: unknown; element?: string } } | null;
  wildElement: string;
  cinematic: unknown;
  isPending: boolean;
  wildHpPct: number;
  handleSkillAction: (a: ActionType) => void;
  handleAction: (a: 'capture' | 'flee') => void;
  setShowSwitchPanel: (v: boolean) => void;
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

  const isBlocked = !!cinematic || isPending;

  return (
    <div className="flex flex-col gap-2">
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
          onClick={() => handleAction('capture')}
          disabled={isPending}
          className="relative flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,rgba(20,20,40,0.9),rgba(30,15,60,0.95))', border: '1.5px solid rgba(245,158,11,0.35)', boxShadow: '0 0 12px rgba(245,158,11,0.2)', color: '#FDE68A', minHeight: 42 }}
          data-testid="button-capture-battle"
        >
          <Package size={13} />
          <span>Throw Orb</span>
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
  const [switchAnimKey, setSwitchAnimKey] = useState(0);

  // ── Cinematic state ──────────────────────────────────────────────────────
  const [cinematic, setCinematic] = useState<{
    skillName: string; element: string; power: number;
    attackerSide: 'player' | 'wild'; isCritical?: boolean; description?: string;
    phase: 'player' | 'wild';
  } | null>(null);
  const pendingBattleResult = useRef<Parameters<typeof updateBattle>[0] | null>(null);
  const pendingWildCinematic = useRef<{ skillName: string; element: string; power: number; isCritical?: boolean } | null>(null);

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

  const performAction = usePerformBattleAction();

  useEffect(() => {
    if (!battleData || !battle.active) return;

    // Detect HP changes for shake animation
    const wd = battleData.wildMonster;
    const pd = battleData.playerMonster;

    if (prevWildHp.current !== null && wd.currentHp < prevWildHp.current) {
      setWildShake((k) => k + 1);
    }
    if (prevPlayerHp.current !== null && pd.currentHp < prevPlayerHp.current) {
      setPlayerShake((k) => k + 1);
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
      setTimeout(() => { endBattle(); setCaptureMsg(null); }, 4000);
    }
  }, [battleData]);

  // Derive battle data with safe defaults (must happen before early return so hooks below are always called)
  const wildMonster  = battle.battle?.wildMonster ?? null;
  const playerMonster = battle.battle?.playerMonster ?? null;
  const log          = battle.battle?.log ?? [];
  const status       = battle.battle?.status ?? 'active';
  const isPending    = performAction.isPending;
  const isOver       = status !== 'active';

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
        pendingWildCinematic.current = null;
        setCinematic({
          skillName: wild.skillName,
          element: wild.element,
          power: wild.power,
          isCritical: wild.isCritical,
          attackerSide: 'wild',
          phase: 'wild',
        });
      } else {
        setCinematic(null);
      }
    } else {
      // Wild cinematic done — clear
      setCinematic(null);
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
        };
      }
      pendingBattleResult.current = updated;
    } catch (err) {
      console.error('Battle action failed:', err);
      pendingBattleResult.current = null;
      pendingWildCinematic.current = null;
    }
  }, [battle.battleId, isPending, isOver, cinematic, playerMonster, performAction]);

  // ── Capture action (no cinematic, immediate) ──────────────────────────────
  const handleAction = useCallback(async (action: 'capture' | 'flee') => {
    if (!battle.battleId || isPending || isOver) return;
    try {
      const updated = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action, orbType: action === 'capture' ? 'Prism' : undefined },
      });
      updateBattle(updated);
      queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });
      if (action === 'capture') {
        const last = updated.log?.slice(-1)[0];
        if (last?.action === 'capture') {
          setCaptureMsg(last.description);
          setTimeout(() => setCaptureMsg(null), 3000);
        }
      }
    } catch (err) {
      console.error('Battle action failed:', err);
    }
  }, [battle.battleId, isPending, isOver, performAction, updateBattle, queryClient]);

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
          />
        </div>

        {/* Player Myth — RIGHT FRONT */}
        <div
          key={switchAnimKey}
          className="absolute flex flex-col items-center battle-entrance"
          style={{ bottom: '36%', right: '8%', animationDelay: '0.1s', zIndex: 2 }}
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
          />
        </div>

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

        {/* ── End-of-battle result overlay ────────────────────────────────── */}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', zIndex: 10 }}
          >
            <div className="text-center space-y-4 capture-success px-6">
              {status === 'captured' && (
                <>
                  <div className="flex justify-center mb-2">
                    <MythSvgIcon mythId={wildMonster.species.id} element={wildMonster.species.element} rarity={wildMonster.species.rarity} size={72}/>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#34D399', textShadow: '0 0 20px #34D399' }}>
                    Captured!
                  </p>
                  <p className="text-base text-white/80">{wildMonster.species.name} joined your collection</p>
                </>
              )}
              {status === 'won' && (
                <>
                  <div className="text-5xl mb-2">🏆</div>
                  <p className="text-2xl font-bold text-yellow-400" style={{ textShadow: '0 0 20px #EAB308' }}>Victory!</p>
                  {battle.battle.expReward && (
                    <div className="flex gap-4 justify-center text-sm font-mono">
                      <span className="text-cyan-400">+{battle.battle.expReward} EXP</span>
                      {battle.battle.coinReward && <span className="text-yellow-400">+{battle.battle.coinReward} coins</span>}
                    </div>
                  )}
                </>
              )}
              {status === 'fled' && (
                <>
                  <div className="text-5xl mb-2">💨</div>
                  <p className="text-xl font-bold text-white/70">Got away safely!</p>
                </>
              )}
              {status === 'lost' && (
                <>
                  <div className="text-5xl mb-2">💀</div>
                  <p className="text-xl font-bold text-red-400">Your myth fainted...</p>
                </>
              )}
            </div>
          </div>
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
          <ActionPanel
            playerMonster={playerMonster}
            wildElement={wildMonster.species.element}
            cinematic={cinematic}
            isPending={isPending}
            wildHpPct={wildHpPct}
            handleSkillAction={handleSkillAction}
            handleAction={handleAction}
            setShowSwitchPanel={setShowSwitchPanel}
          />
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
