import { useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/game-store';
import { useGetBattle, usePerformBattleAction, getGetBattleQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getElementColors, QUALITY_LABEL } from '@/lib/element-colors';
import { getMonsterEmoji } from '@/lib/monster-emoji';
import { getCharacter } from '@/lib/characters';
import type { CharacterConfig } from '@/lib/characters';
import { Swords, Zap, Package, Wind } from 'lucide-react';

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
  'verdant-meadows': {
    skyGrad:    'linear-gradient(180deg, #1565C0 0%, #1E88E5 25%, #64B5F6 55%, #B3E5FC 80%, #C8E6C9 100%)',
    groundGrad: 'linear-gradient(180deg, #8BC34A 0%, #558B2F 55%, #33691E 100%)',
    groundLine: '#8BC34A',
    hasTrees:   true,  treeColor: '#1B5E20',
    hasRocks:   false, rockColor: '#388E3C',
    ambientColor: '#22C55E',
  },
  'volcanic-peaks': {
    skyGrad:    'linear-gradient(180deg, #000000 0%, #1A0000 40%, #3E0000 70%, #6D2200 100%)',
    groundGrad: 'linear-gradient(180deg, #D84315 0%, #A00000 55%, #700000 100%)',
    groundLine: '#D84315',
    hasTrees:   false, treeColor: '#4E342E',
    hasRocks:   true,  rockColor: '#5D4037',
    ambientColor: '#EF4444',
  },
  'mystic-forest': {
    skyGrad:    'linear-gradient(180deg, #051505 0%, #0D2A0D 35%, #1B3A1B 70%, #2D4A2D 100%)',
    groundGrad: 'linear-gradient(180deg, #388E3C 0%, #1B5E20 55%, #0A3D0A 100%)',
    groundLine: '#388E3C',
    hasTrees:   true,  treeColor: '#051505',
    hasRocks:   false, rockColor: '#1B5E20',
    ambientColor: '#4ADE80',
  },
  'crystal-caves': {
    skyGrad:    'linear-gradient(180deg, #0D0D2B 0%, #1A237E 45%, #283593 75%, #3949AB 100%)',
    groundGrad: 'linear-gradient(180deg, #7B1FA2 0%, #512DA8 55%, #311B92 100%)',
    groundLine: '#7B1FA2',
    hasTrees:   false, treeColor: '#4A148C',
    hasRocks:   true,  rockColor: '#7B1FA2',
    ambientColor: '#C084FC',
  },
  'ocean-bay': {
    skyGrad:    'linear-gradient(180deg, #0277BD 0%, #0288D1 35%, #03A9F4 65%, #B3E5FC 100%)',
    groundGrad: 'linear-gradient(180deg, #006994 0%, #01579B 55%, #0D47A1 100%)',
    groundLine: '#006994',
    hasTrees:   false, treeColor: '#0277BD',
    hasRocks:   false, rockColor: '#01579B',
    ambientColor: '#38BDF8',
  },
  'urban-district': {
    skyGrad:    'linear-gradient(180deg, #1C1C2E 0%, #2D2D44 40%, #3D3D5C 70%, #4A4A70 100%)',
    groundGrad: 'linear-gradient(180deg, #4A5568 0%, #2D3748 55%, #1A202C 100%)',
    groundLine: '#4A5568',
    hasTrees:   false, treeColor: '#2D3748',
    hasRocks:   true,  rockColor: '#2D3748',
    ambientColor: '#94A3B8',
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

// ─── Myth Sphere sprite ─────────────────────────────────────────────────────────

function MythSphere({
  speciesId, element, size = 110, shakeKey, side,
}: {
  speciesId: string; element: string; size?: number;
  shakeKey: number; side: 'left' | 'right';
}) {
  const colors = getElementColors(element);
  const emoji  = getMonsterEmoji(speciesId, element);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (shakeKey > 0) setAnimKey((k) => k + 1);
  }, [shakeKey]);

  return (
    <div className="flex flex-col items-center">
      {/* Sphere */}
      <div
        key={animKey}
        className={`relative flex items-center justify-center rounded-full battle-float ${animKey > 0 ? 'hit-flash' : ''}`}
        style={{
          width: size, height: size,
          background: `radial-gradient(circle at 38% 32%, ${colors.secondary}88 0%, ${colors.primary}55 45%, ${colors.primary}22 100%)`,
          border: `3px solid ${colors.primary}99`,
          boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}, inset 0 -6px 12px ${colors.primary}33, inset 0 3px 8px rgba(255,255,255,0.2)`,
          fontSize: size * 0.42,
          lineHeight: 1,
        }}
      >
        {/* Shine spot */}
        <div
          className="absolute"
          style={{
            top: '14%', left: '22%', width: '30%', height: '20%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 100%)',
          }}
        />
        {/* Emoji */}
        <span style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px rgba(0,0,0,0.4))' }}>
          {emoji}
        </span>
      </div>
      {/* Platform oval shadow */}
      <div style={{
        width: size * 0.75, height: 14, borderRadius: '50%', marginTop: 6,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 80%)',
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

// ─── Main Battle Overlay ─────────────────────────────────────────────────────────

export default function BattleOverlay() {
  const { battle, endBattle, updateBattle, characterType, player } = useGameStore();
  const queryClient = useQueryClient();

  const [wildShake, setWildShake]     = useState(0);
  const [playerShake, setPlayerShake] = useState(0);
  const [captureMsg, setCaptureMsg]   = useState<string | null>(null);

  const prevWildHp   = useRef<number | null>(null);
  const prevPlayerHp = useRef<number | null>(null);

  const { data: battleData } = useGetBattle(battle.battleId || '', {
    query: {
      enabled: !!battle.battleId && battle.active,
      queryKey: getGetBattleQueryKey(battle.battleId || ''),
      refetchInterval: battle.active ? 1200 : false,
    },
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
    prevWildHp.current   = wd.currentHp;
    prevPlayerHp.current = pd.currentHp;

    updateBattle(battleData);
    if (battleData.status !== 'active') {
      setTimeout(() => { endBattle(); setCaptureMsg(null); }, 4000);
    }
  }, [battleData]);

  if (!battle.active || !battle.battle) return null;

  const { wildMonster, playerMonster, log, status } = battle.battle;
  const isPending = performAction.isPending;
  const isOver    = status !== 'active';
  const char      = getCharacter(characterType);
  const regionId  = battle.battle.regionId ?? player?.regionId;
  const theme     = getTheme(regionId);

  const lastLog   = log.slice(-1)[0];
  const logText   = lastLog?.description ?? (isOver ? getEndText(status) : 'What will you do?');
  const logActor  = lastLog?.actor === 'player' ? 'player' : lastLog?.actor === 'wild' ? 'wild' : 'system';

  const handleAction = async (action: 'attack' | 'skill1' | 'capture' | 'flee') => {
    if (!battle.battleId || isPending || isOver) return;
    try {
      const updated = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action, orbType: action === 'capture' ? 'Basic' : null },
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
  };

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

        {/* ── Three combatants at ground level ─────────────────────────────── */}
        <div
          className="absolute left-0 right-0 flex items-end justify-around px-4 sm:px-10"
          style={{ bottom: '36%' }}
        >
          {/* Wild Myth — LEFT */}
          <div className="flex flex-col items-center battle-entrance" style={{ animationDelay: '0.05s' }}>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2 text-center"
              style={{ color: wildColors.primary, textShadow: `0 0 10px ${wildColors.glow}` }}
            >
              ⚔ Enemy
            </div>
            <MythSphere
              speciesId={wildMonster.species.id}
              element={wildMonster.species.element}
              size={110}
              shakeKey={wildShake}
              side="left"
            />
          </div>

          {/* Character — CENTER */}
          <div className="flex flex-col items-center battle-entrance" style={{ animationDelay: '0.2s' }}>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2 text-center text-white/50">
              Trainer
            </div>
            <div className="battle-idle-bob">
              <CharacterFront char={char} size={110} />
            </div>
            {/* Trainer shadow */}
            <div style={{
              width: 70, height: 12, borderRadius: '50%', marginTop: 4,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 80%)',
            }} />
          </div>

          {/* Player Myth — RIGHT */}
          <div className="flex flex-col items-center battle-entrance" style={{ animationDelay: '0.1s' }}>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2 text-center text-white/50">
              Your Myth
            </div>
            <MythSphere
              speciesId={playerMonster.species.id}
              element={playerMonster.species.element}
              size={100}
              shakeKey={playerShake}
              side="right"
            />
          </div>
        </div>

        {/* ── End-of-battle result overlay ────────────────────────────────── */}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          >
            <div className="text-center space-y-4 capture-success px-6">
              {status === 'captured' && (
                <>
                  <div className="text-6xl mb-2">{getMonsterEmoji(wildMonster.species.id, wildMonster.species.element)}</div>
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
          <div className="grid grid-cols-2 gap-2.5 h-full">
            {/* Attack */}
            <button
              onClick={() => handleAction('attack')}
              disabled={isPending}
              className="relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #0E7490, #0891B2)',
                border: '1.5px solid #22D3EE55',
                boxShadow: '0 0 18px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                color: 'white',
                minHeight: 52,
              }}
              data-testid="button-attack"
            >
              <Swords size={16} />
              <span>Attack</span>
            </button>

            {/* Skill */}
            <button
              onClick={() => handleAction('skill1')}
              disabled={isPending}
              className="relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6D28D9, #7C3AED)',
                border: '1.5px solid #A78BFA55',
                boxShadow: '0 0 18px rgba(167,139,250,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                color: 'white',
                minHeight: 52,
              }}
              data-testid="button-skill"
            >
              <Zap size={16} />
              <span>Skill</span>
            </button>

            {/* Throw Orb */}
            <button
              onClick={() => handleAction('capture')}
              disabled={isPending}
              className="relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #92400E, #B45309)',
                border: '1.5px solid #F59E0B55',
                boxShadow: '0 0 18px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                color: '#FDE68A',
                minHeight: 52,
              }}
              data-testid="button-capture-battle"
            >
              <Package size={16} />
              <span>Throw Orb</span>
              {wildHpPct < 30 && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Flee */}
            <button
              onClick={() => handleAction('flee')}
              disabled={isPending}
              className="relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(30,30,60,0.9), rgba(20,20,45,0.95))',
                border: '1.5px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)',
                minHeight: 52,
              }}
              data-testid="button-flee"
            >
              <Wind size={16} />
              <span>Flee</span>
            </button>
          </div>
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
