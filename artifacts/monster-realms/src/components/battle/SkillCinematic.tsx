import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MYTH_ARCHETYPE } from '@/lib/myth-svgs';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  skillName: string;
  skillDesc?: string;
  element: string;
  power: number;
  attackerSide: 'player' | 'wild';
  isCritical?: boolean;
  onComplete: () => void;
  // New: for basic-attack personalisation
  attackerMythId?: string;
  attackerRarity?: string;
  skillType?: string; // 'normal' | 'skill1' | 'skill2' | 'ultimate'
}

// ─── Rarity config ────────────────────────────────────────────────────────────

const RARITY_CFG: Record<string, {
  hitWaves: number; scale: number; particleScale: number;
  dur: number; timeout: number; extraGlow: number;
}> = {
  C: { hitWaves: 1, scale: 0.65, particleScale: 0.6, dur: 0.85, timeout: 1400, extraGlow: 0 },
  B: { hitWaves: 2, scale: 0.90, particleScale: 1.0, dur: 1.05, timeout: 1700, extraGlow: 0.4 },
  A: { hitWaves: 2, scale: 1.10, particleScale: 1.3, dur: 1.30, timeout: 2000, extraGlow: 0.8 },
  S: { hitWaves: 3, scale: 1.40, particleScale: 1.8, dur: 1.65, timeout: 2500, extraGlow: 1.4 },
};
const getRarityCfg = (r?: string) => RARITY_CFG[r ?? 'C'] ?? RARITY_CFG['C']!;

// ─── Element base colors ──────────────────────────────────────────────────────

const EL_CONFIG: Record<string, { color: string; glow: string; bg: string; icon: string }> = {
  Fire:     { color: '#FF6B35', glow: 'rgba(255,107,53,0.55)', bg: 'rgba(180,40,10,0.35)',  icon: '🔥' },
  Water:    { color: '#38BDF8', glow: 'rgba(56,189,248,0.55)', bg: 'rgba(3,105,161,0.35)',  icon: '💧' },
  Nature:   { color: '#4ADE80', glow: 'rgba(74,222,128,0.55)', bg: 'rgba(20,83,45,0.35)',   icon: '🌿' },
  Electric: { color: '#FDE047', glow: 'rgba(253,224,71,0.65)', bg: 'rgba(133,77,14,0.4)',   icon: '⚡' },
  Dark:     { color: '#C084FC', glow: 'rgba(192,132,252,0.55)', bg: 'rgba(59,7,100,0.5)',   icon: '🌑' },
};
const DEFAULT_EL = { color: '#94A3B8', glow: 'rgba(148,163,184,0.4)', bg: 'rgba(30,30,60,0.4)', icon: '✦' };
const getEl = (e: string) => EL_CONFIG[e] ?? DEFAULT_EL;

// ─── Strike type → archetype map ─────────────────────────────────────────────

type StrikeType =
  | 'CLAW_SLASH' | 'BITE_LUNGE' | 'FLAME_BURST' | 'ROCK_SMASH'
  | 'TIDAL_SLAM' | 'BUBBLE_SHOT' | 'VINE_WHIP'   | 'SPORE_BOMB'
  | 'LIGHTNING_BOLT' | 'SPARK_DASH' | 'THUNDER_STOMP'
  | 'SHADOW_CLAW' | 'VOID_PULL' | 'ECLIPSE_BEAM';

const ARCHETYPE_STRIKE: Record<string, StrikeType> = {
  // Fire
  FireWolf:      'CLAW_SLASH',    FireDrake:     'BITE_LUNGE',
  FireSpirit:    'FLAME_BURST',   FireGolem:     'ROCK_SMASH',
  EmberMoth:     'FLAME_BURST',   CinderSerpent: 'BITE_LUNGE',
  LavaCrab:      'ROCK_SMASH',    FlameHatch:    'FLAME_BURST',
  // Water
  WaterTurtle:   'TIDAL_SLAM',    WaterCanine:   'CLAW_SLASH',
  SeaJelly:      'BUBBLE_SHOT',   SeaSerpent:    'BITE_LUNGE',
  TidalCrab:     'TIDAL_SLAM',    AbyssAngler:   'BITE_LUNGE',
  GlacierGiant:  'TIDAL_SLAM',    TempestEel:    'BITE_LUNGE',
  // Nature
  Treant:        'VINE_WHIP',     VineSprite:    'VINE_WHIP',
  NatureWolf:    'CLAW_SLASH',    ForestBeast:   'SPORE_BOMB',
  FernFox:       'CLAW_SLASH',    ThornSerpent:  'BITE_LUNGE',
  BloomBee:      'VINE_WHIP',     MossGolem:     'ROCK_SMASH',
  // Electric
  ThunderHawk:   'LIGHTNING_BOLT', LightningFox: 'SPARK_DASH',
  ElectricRay:   'LIGHTNING_BOLT', StormGolem:   'THUNDER_STOMP',
  SparkRabbit:   'SPARK_DASH',    ThunderWorm:   'LIGHTNING_BOLT',
  VoltFish:      'LIGHTNING_BOLT', TeslaOrb:     'THUNDER_STOMP',
  // Dark
  ShadowCat:     'CLAW_SLASH',    VoidWraith:    'SHADOW_CLAW',
  DarkBird:      'SHADOW_CLAW',   ShadowGolem:   'VOID_PULL',
  NightHound:    'CLAW_SLASH',    VoidMoth:      'SHADOW_CLAW',
  EclipseOwl:    'ECLIPSE_BEAM',  AbyssSpider:   'VOID_PULL',
};

function getStrike(mythId?: string): StrikeType {
  if (!mythId) return 'CLAW_SLASH';
  const arch = MYTH_ARCHETYPE[mythId];
  return (arch && ARCHETYPE_STRIKE[arch]) ? ARCHETYPE_STRIKE[arch]! : 'CLAW_SLASH';
}

// ─── Shared geometry helpers ──────────────────────────────────────────────────

// attacker origin X% and defender target X%
function sides(side: 'player' | 'wild') {
  return side === 'player'
    ? { from: '70%', to: '20%', fromN: 70, toN: 20 }
    : { from: '25%', to: '75%', fromN: 25, toN: 75 };
}

// ─── 1. CLAW_SLASH ────────────────────────────────────────────────────────────
// Three diagonal tear marks sweep from attacker → impact point

function ClawSlash({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { to } = sides(side);
  const clawOffsets = [-18, 0, 18]; // vertical offsets for each claw mark
  const dir = side === 'player' ? -1 : 1;

  return (
    <>
      {/* Claw marks — appear on impact side */}
      {Array.from({ length: waves }).map((_, wave) =>
        clawOffsets.map((dy, c) => (
          <motion.div
            key={`${wave}-${c}`}
            className="absolute pointer-events-none"
            style={{
              left: to,
              top: `${44 + dy * scale}%`,
              transform: 'translate(-50%, -50%)',
              width: `${110 * scale}px`,
              height: `${6 * scale}px`,
              background: `linear-gradient(${side === 'player' ? '135deg' : '45deg'}, transparent 0%, ${color} 40%, ${color} 60%, transparent 100%)`,
              boxShadow: `0 0 ${12 * scale}px ${glow}`,
              rotate: `${dir * (c === 1 ? 0 : c === 0 ? -14 : 14)}deg`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 0.8, 0],
              opacity: [0, 1, 0.9, 0],
              x: [dir * 30, 0, dir * -8],
            }}
            transition={{ duration: 0.38, delay: wave * 0.15 + c * 0.04, ease: 'easeOut' }}
          />
        ))
      )}
      {/* Speed-streak from attacker */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`streak-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: `${42 + i * 8}%`,
            height: `${3 * scale}px`,
            background: `linear-gradient(${side === 'player' ? '90deg' : '270deg'}, transparent, ${color}88, transparent)`,
            boxShadow: `0 0 6px ${glow}`,
          }}
          initial={{ left: side === 'player' ? '75%' : '10%', width: 0, opacity: 0 }}
          animate={{
            left: side === 'player' ? ['75%', '15%'] : ['10%', '80%'],
            width: [`${60 * scale}px`, `${120 * scale}px`, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: 0.28, delay: 0.04 + i * 0.03, ease: 'easeIn' }}
        />
      ))}
    </>
  );
}

// ─── 2. BITE_LUNGE ────────────────────────────────────────────────────────────
// Open-jaw silhouette lunges from attacker to defender; fang marks at impact

function BiteLunge({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { from, to, fromN, toN } = sides(side);
  const dir = side === 'player' ? -1 : 1;

  return (
    <>
      {/* Jaw shape sweeping across */}
      {Array.from({ length: waves }).map((_, wave) => (
        <motion.div
          key={`jaw-${wave}`}
          className="absolute pointer-events-none"
          style={{
            top: '40%',
            transform: 'translate(-50%,-50%)',
            width: `${80 * scale}px`,
            height: `${56 * scale}px`,
            border: `${3 * scale}px solid ${color}`,
            borderRadius: side === 'player' ? '60% 40% 40% 60% / 50%' : '40% 60% 60% 40% / 50%',
            boxShadow: `0 0 ${16 * scale}px ${glow}, inset 0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ left: from, opacity: 0, scaleY: 0.3 }}
          animate={{
            left: [from, to],
            opacity: [0, 1, 0.9, 0],
            scaleY: [0.3, 1, 0.6],
            scaleX: [1, 0.7],
          }}
          transition={{ duration: 0.35, delay: wave * 0.14, ease: 'easeIn' }}
        />
      ))}
      {/* Fang marks at impact */}
      {[{ dy: -14, rx: -8 }, { dy: 14, rx: -4 }].map(({ dy, rx }, f) => (
        <motion.div
          key={`fang-${f}`}
          className="absolute pointer-events-none"
          style={{
            left: `calc(${to} + ${rx}px)`,
            top: `${44 + dy * scale}%`,
            width: `${5 * scale}px`,
            height: `${22 * scale}px`,
            background: color,
            borderRadius: '3px',
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
            transform: `translate(-50%,-50%) rotate(${dir * 10}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0.8, 0], opacity: [0, 1, 0.9, 0] }}
          transition={{ duration: 0.32, delay: 0.28 + f * 0.05 }}
        />
      ))}
      {/* Lunge trail */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.line
          x1={`${fromN}%`} y1="44%" x2={`${toN}%`} y2="44%"
          stroke={color} strokeWidth={4 * scale}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 ${8 * scale}px ${color})` }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
        />
      </svg>
    </>
  );
}

// ─── 3. FLAME_BURST ──────────────────────────────────────────────────────────
// Erupting ring from attacker side + scatter sparks to defender

function FlameBurst({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { from, to } = sides(side);
  const cx = side === 'player' ? '68%' : '28%';

  return (
    <>
      {/* Expanding rings from attacker */}
      {Array.from({ length: waves * 2 }).map((_, r) => (
        <motion.div
          key={`ring-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: cx, top: '44%',
            transform: 'translate(-50%, -50%)',
            borderColor: r % 2 === 0 ? color : '#FFF',
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ width: 10 * scale, height: 10 * scale, opacity: 0.9 }}
          animate={{
            width:   [10 * scale, (160 + r * 40) * scale],
            height:  [10 * scale, (160 + r * 40) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.52, delay: r * 0.07, ease: 'easeOut' }}
        />
      ))}
      {/* Spark projectiles to defender */}
      {Array.from({ length: Math.round(6 * scale) }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: `${6 * scale}px`, height: `${6 * scale}px`,
            background: color,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
            top: `${38 + (i % 5) * 4}%`,
          }}
          initial={{ left: from, opacity: 0 }}
          animate={{ left: [from, to], opacity: [0, 1, 0.8, 0], scale: [0.5, 1.2, 0.4] }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.03, ease: 'easeIn' }}
        />
      ))}
    </>
  );
}

// ─── 4. ROCK_SMASH ───────────────────────────────────────────────────────────
// Solid projectile flies across; impact crater rings + debris

function RockSmash({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { from, to } = sides(side);

  return (
    <>
      {/* Boulder projectile(s) */}
      {Array.from({ length: waves }).map((_, w) => (
        <motion.div
          key={`rock-${w}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            width:  `${32 * scale}px`,
            height: `${32 * scale}px`,
            background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color} 55%, #1a0a0022)`,
            boxShadow: `0 0 ${18 * scale}px ${glow}, 0 ${6 * scale}px ${10 * scale}px rgba(0,0,0,0.6)`,
            top: `${42 + w * 10}%`,
            transform: 'translate(-50%,-50%)',
          }}
          initial={{ left: from, opacity: 0, rotate: 0 }}
          animate={{
            left: [from, to],
            opacity: [0, 1, 1, 0],
            rotate: [0, 720],
            scale: [0.6, 1, 0.8],
          }}
          transition={{ duration: 0.36 + w * 0.06, delay: w * 0.12, ease: 'easeIn' }}
        />
      ))}
      {/* Impact shockwave rings */}
      {Array.from({ length: 3 }).map((_, r) => (
        <motion.div
          key={`crater-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: to, top: '44%',
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{ width: [0, (90 + r * 44) * scale], height: [0, (90 + r * 44) * scale], opacity: [0.9, 0] }}
          transition={{ duration: 0.42, delay: 0.32 + r * 0.08, ease: 'easeOut' }}
        />
      ))}
      {/* Debris particles */}
      {Array.from({ length: Math.round(5 * scale) }).map((_, i) => (
        <motion.div
          key={`debris-${i}`}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: to, top: '44%',
            width: `${5 * scale}px`, height: `${5 * scale}px`,
            background: color,
          }}
          initial={{ opacity: 0 }}
          animate={{
            left: [`calc(${to} + 0px)`, `calc(${to} + ${(i % 2 === 0 ? 1 : -1) * (20 + i * 8) * scale}px)`],
            top: ['44%', `${30 + (i % 3) * 14}%`],
            opacity: [0, 0.8, 0],
            rotate: [0, 180 + i * 45],
          }}
          transition={{ duration: 0.38, delay: 0.34 + i * 0.04 }}
        />
      ))}
    </>
  );
}

// ─── 5. TIDAL_SLAM ───────────────────────────────────────────────────────────
// Wall of water slides across; splash rings at target

function TidalSlam({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { from, to } = sides(side);

  return (
    <>
      {/* Water wall panels */}
      {Array.from({ length: waves }).map((_, w) => (
        <motion.div
          key={`wall-${w}`}
          className="absolute pointer-events-none"
          style={{
            top: '26%', bottom: '20%',
            width: `${28 * scale}px`,
            background: `linear-gradient(90deg, transparent, ${color}bb, ${color}dd, ${color}aa, transparent)`,
            boxShadow: `0 0 ${18 * scale}px ${glow}`,
          }}
          initial={{ left: from, opacity: 0 }}
          animate={{
            left: [from, to],
            opacity: [0, 0.85, 0.95, 0],
          }}
          transition={{ duration: 0.42, delay: w * 0.11, ease: 'easeIn' }}
        />
      ))}
      {/* Splash rings */}
      {[0, 1, 2].map((r) => (
        <motion.div
          key={`splash-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: to, top: '46%',
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ width: 8, height: 8, opacity: 0.9 }}
          animate={{ width: (100 + r * 50) * scale, height: (60 + r * 30) * scale, opacity: [0.9, 0] }}
          transition={{ duration: 0.44, delay: 0.36 + r * 0.09, ease: 'easeOut' }}
        />
      ))}
      {/* Foam droplets */}
      {Array.from({ length: Math.round(5 * scale) }).map((_, i) => (
        <motion.div
          key={`foam-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: to, width: `${5 * scale}px`, height: `${5 * scale}px`,
            background: `${color}cc`,
            boxShadow: `0 0 ${6 * scale}px ${glow}`,
          }}
          animate={{
            top: ['45%', `${28 + (i * 7) % 30}%`],
            opacity: [0, 0.9, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{ duration: 0.36, delay: 0.38 + i * 0.04 }}
        />
      ))}
    </>
  );
}

// ─── 6. BUBBLE_SHOT ──────────────────────────────────────────────────────────
// Spread of 8 orbs from attacker to defender (shotgun pattern)

function BubbleShot({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { from, to } = sides(side);
  const count = Math.round(8 * Math.max(scale, 0.7));

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const spread = (i - count / 2) * 5;
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              width:  `${(9 + (i % 3) * 4) * scale}px`,
              height: `${(9 + (i % 3) * 4) * scale}px`,
              background: `radial-gradient(circle at 35% 35%, white 0%, ${color} 55%, ${color}44 100%)`,
              boxShadow: `0 0 ${10 * scale}px ${glow}`,
              top: `${44 + spread}%`,
              transform: 'translate(-50%,-50%)',
            }}
            initial={{ left: from, opacity: 0, scale: 0 }}
            animate={{
              left: [from, to],
              top: [`${44 + spread}%`, `${44 + spread * 1.6}%`],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.6, 0],
            }}
            transition={{ duration: 0.42, delay: 0.06 + i * 0.04, ease: 'easeIn' }}
          />
        );
      })}
      {/* Pop burst at target */}
      {Array.from({ length: waves + 1 }).map((_, w) => (
        <motion.div
          key={`pop-${w}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: to, top: '44%',
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ width: 8 * scale, height: 8 * scale, opacity: 0.9 }}
          animate={{ width: (80 + w * 50) * scale, height: (80 + w * 50) * scale, opacity: [0.9, 0] }}
          transition={{ duration: 0.38, delay: 0.44 + w * 0.08, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ─── 7. VINE_WHIP ────────────────────────────────────────────────────────────
// Organic curved whip sweeps across; leaf burst at impact

function VineWhip({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { fromN, toN } = sides(side);
  const mid = (fromN + toN) / 2;

  return (
    <>
      {/* SVG whip paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: waves }).map((_, w) => (
          <motion.path
            key={`whip-${w}`}
            d={`M ${fromN}% ${46 + w * 4}% Q ${mid}% ${35 + w * 6}% ${toN}% ${44 + w * 2}%`}
            stroke={color}
            strokeWidth={(5 - w) * scale}
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${8 * scale}px ${color})` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.46, delay: w * 0.12, ease: 'easeInOut' }}
          />
        ))}
      </svg>
      {/* Leaf/petal burst at impact */}
      {Array.from({ length: Math.round(7 * scale) }).map((_, i) => {
        const angle = (i / 7) * 360;
        const dist = 30 * scale;
        return (
          <motion.div
            key={`leaf-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: `${toN}%`, top: '44%',
              width: `${8 * scale}px`, height: `${12 * scale}px`,
              background: color,
              boxShadow: `0 0 ${6 * scale}px ${glow}`,
              transformOrigin: 'center',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              opacity: [0, 1, 0],
              scale: [0, 1.1, 0],
              rotate: [0, angle + 180],
            }}
            transition={{ duration: 0.42, delay: 0.36 + i * 0.03 }}
          />
        );
      })}
    </>
  );
}

// ─── 8. SPORE_BOMB ───────────────────────────────────────────────────────────
// Expanding cloud of dots scatters from a central point

function SporeBomb({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { to } = sides(side);
  const count = Math.round(10 * scale);

  return (
    <>
      {/* Cloud core */}
      {Array.from({ length: waves }).map((_, w) => (
        <motion.div
          key={`cloud-${w}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: to, top: '44%',
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle, ${color}99 0%, ${color}22 60%, transparent 100%)`,
            boxShadow: `0 0 ${20 * scale}px ${glow}`,
          }}
          initial={{ width: 10, height: 10, opacity: 0 }}
          animate={{
            width:  [10, (100 + w * 60) * scale],
            height: [10, (100 + w * 60) * scale],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: 0.5, delay: w * 0.12, ease: 'easeOut' }}
        />
      ))}
      {/* Spore dots scattering */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360 + 15;
        const dist = (40 + (i % 3) * 20) * scale;
        return (
          <motion.div
            key={`spore-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: to, top: '44%',
              width: `${(3 + (i % 4)) * scale}px`,
              height: `${(3 + (i % 4)) * scale}px`,
              background: color,
              boxShadow: `0 0 ${5 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              opacity: [0, 0.9, 0],
              scale: [0, 1, 0],
            }}
            transition={{ duration: 0.44, delay: 0.06 + i * 0.025, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// ─── 9. LIGHTNING_BOLT ───────────────────────────────────────────────────────
// Sharp multi-segment zigzag bolt; thunder clap at impact

function LightningBolt({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { fromN, toN } = sides(side);
  const segs = 4;
  const step = (toN - fromN) / segs;

  function boltPath(yOff: number) {
    let d = `M ${fromN}% ${44 + yOff}%`;
    for (let i = 1; i <= segs; i++) {
      const x = fromN + step * i;
      const y = 44 + yOff + (i % 2 === 0 ? -8 : 8) * scale;
      d += ` L ${x}% ${y}%`;
    }
    return d;
  }

  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {Array.from({ length: waves }).map((_, w) => (
          <motion.path
            key={`bolt-${w}`}
            d={boltPath(w * 5 - (waves - 1) * 2.5)}
            stroke={w === 0 ? color : '#FFF'}
            strokeWidth={(5 - w * 1.2) * scale}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 ${(10 - w * 2) * scale}px ${color})` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 0.9, 0] }}
            transition={{ duration: 0.38, delay: w * 0.08, times: [0, 0.35, 0.7, 1] }}
          />
        ))}
      </svg>
      {/* Thunder flash at impact */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `${toN}%`, top: '44%',
          transform: 'translate(-50%,-50%)',
          width: `${60 * scale}px`, height: `${60 * scale}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, white 0%, ${color}88 50%, transparent 100%)`,
          boxShadow: `0 0 ${30 * scale}px ${glow}`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.2, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.28, delay: 0.34 }}
      />
      {/* Electric sparks at impact */}
      {Array.from({ length: Math.round(4 * scale) }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute pointer-events-none font-bold"
          style={{
            left: `${toN + (i % 2 === 0 ? 4 : -4)}%`, top: `${40 + i * 5}%`,
            color, fontSize: `${14 * scale}px`,
            textShadow: `0 0 8px ${color}`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0], rotate: [0, (i % 2 === 0 ? 90 : -90)] }}
          transition={{ duration: 0.26, delay: 0.36 + i * 0.04 }}
        >
          ⚡
        </motion.div>
      ))}
    </>
  );
}

// ─── 10. SPARK_DASH ──────────────────────────────────────────────────────────
// Rapid blur-trail dashes crossing the screen

function SparkDash({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { from, to } = sides(side);
  const dashes = Math.max(waves + 1, 2);

  return (
    <>
      {Array.from({ length: dashes }).map((_, d) => (
        <motion.div
          key={`dash-${d}`}
          className="absolute pointer-events-none"
          style={{
            height: `${(6 - d) * scale}px`,
            top: `${40 + d * 7}%`,
            borderRadius: `${3 * scale}px`,
            background: `linear-gradient(${side === 'player' ? '270deg' : '90deg'}, ${color}, ${color}44, transparent)`,
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ left: from, width: 0, opacity: 0 }}
          animate={{
            left: [from, to],
            width: [`${80 * scale}px`, `${50 * scale}px`, `${10 * scale}px`],
            opacity: [0, 1, 0.8, 0],
          }}
          transition={{ duration: 0.22, delay: d * 0.08, ease: 'easeIn' }}
        />
      ))}
      {/* After-image sparks */}
      {Array.from({ length: Math.round(6 * scale) }).map((_, i) => (
        <motion.div
          key={`after-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: `${4 * scale}px`, height: `${4 * scale}px`,
            background: color,
            boxShadow: `0 0 ${6 * scale}px ${glow}`,
          }}
          initial={{ left: from, top: `${38 + i * 4}%`, opacity: 0 }}
          animate={{
            left: [`calc(${from} + 0px)`, `calc(${from} + ${(side === 'player' ? -1 : 1) * (20 + i * 12) * scale}px)`],
            opacity: [0, 0.7, 0],
            scale: [0, 1, 0],
          }}
          transition={{ duration: 0.2, delay: 0.16 + i * 0.03 }}
        />
      ))}
      {/* Impact burst */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: to, top: '43%',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)`,
          boxShadow: `0 0 ${20 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 70 * scale], height: [0, 70 * scale], opacity: [0, 1, 0] }}
        transition={{ duration: 0.26, delay: (dashes - 1) * 0.08 + 0.18 }}
      />
    </>
  );
}

// ─── 11. THUNDER_STOMP ───────────────────────────────────────────────────────
// Ground shockwave rings + electric pillar at origin

function ThunderStomp({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const cx = side === 'player' ? '72%' : '25%';

  return (
    <>
      {/* Ground shockwave ellipses */}
      {Array.from({ length: waves * 2 + 1 }).map((_, r) => (
        <motion.div
          key={`ground-${r}`}
          className="absolute pointer-events-none"
          style={{
            left: cx, bottom: '22%',
            transform: 'translate(-50%, 50%)',
            borderRadius: '50%',
            border: `${2 * scale}px solid ${color}`,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{
            width:  [0, (80 + r * 50) * scale],
            height: [0, (24 + r * 15) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.5, delay: r * 0.07, ease: 'easeOut' }}
        />
      ))}
      {/* Electric pillar */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cx, transform: 'translateX(-50%)',
          width: `${16 * scale}px`,
          background: `linear-gradient(180deg, transparent, ${color}bb, ${color}, ${color}bb, transparent)`,
          boxShadow: `0 0 ${18 * scale}px ${glow}`,
        }}
        initial={{ top: '90%', height: 0, opacity: 0 }}
        animate={{ top: ['90%', '10%'], height: [`${60 * scale}px`, `${80 * scale}px`, 0], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
      />
      {/* Arc tendrils */}
      {Array.from({ length: Math.round(4 * scale) }).map((_, i) => (
        <motion.div
          key={`arc-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `calc(${cx} + ${(i % 2 === 0 ? 1 : -1) * (10 + i * 12) * scale}px)`,
            top: `${55 + i * 4}%`,
            width: `${(20 + i * 8) * scale}px`,
            height: `${2 * scale}px`,
            background: color,
            boxShadow: `0 0 ${6 * scale}px ${glow}`,
            rotate: `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}deg`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.26, delay: 0.1 + i * 0.06 }}
        />
      ))}
    </>
  );
}

// ─── 12. SHADOW_CLAW ─────────────────────────────────────────────────────────
// Five void-colored tear marks appear on defender side, sequentially

function ShadowClaw({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { to } = sides(side);
  const dir = side === 'player' ? -1 : 1;
  const tearCount = 3 + waves;

  return (
    <>
      {Array.from({ length: tearCount }).map((_, t) => {
        const dy = (t - tearCount / 2) * 12 * scale;
        const angle = dir * (t % 2 === 0 ? 20 : -20);
        return (
          <motion.div
            key={`tear-${t}`}
            className="absolute pointer-events-none"
            style={{
              left: `calc(${to} + ${(t % 3 - 1) * 16 * scale}px)`,
              top: `calc(44% + ${dy}px)`,
              transform: `translate(-50%,-50%) rotate(${angle}deg)`,
              width: `${(4 + (t % 2)) * scale}px`,
              height: `${(36 + (t % 3) * 10) * scale}px`,
              background: `linear-gradient(180deg, transparent, ${color}, ${color}, transparent)`,
              boxShadow: `0 0 ${14 * scale}px ${glow}, 0 0 ${6 * scale}px #000`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0.7, 0], opacity: [0, 1, 0.8, 0] }}
            transition={{ duration: 0.34, delay: t * 0.06, ease: 'easeOut' }}
          />
        );
      })}
      {/* Darkness pulse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: to, top: '44%',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          boxShadow: `0 0 ${30 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 120 * scale], height: [0, 120 * scale], opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.4, delay: 0.28, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 13. VOID_PULL ───────────────────────────────────────────────────────────
// Reality-distortion: particles sucked inward, then explode

function VoidPull({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { toN } = sides(side);
  const particleCount = Math.round(10 * scale);

  return (
    <>
      {/* Singularity ring that collapses */}
      {Array.from({ length: waves }).map((_, w) => (
        <motion.div
          key={`ring-${w}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: `${toN}%`, top: '44%',
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${14 * scale}px ${glow}`,
          }}
          initial={{ width: (160 + w * 60) * scale, height: (160 + w * 60) * scale, opacity: 0.8 }}
          animate={{ width: [0, 0], height: [0, 0], opacity: [0.8, 0] }}
          transition={{ duration: 0.3, delay: w * 0.08, ease: 'easeIn' }}
        />
      ))}
      {/* Particles pulled inward */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360;
        const dist = (50 + (i % 4) * 14) * scale;
        const startX = Math.cos((angle * Math.PI) / 180) * dist;
        const startY = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${toN}%`, top: '44%',
              width: `${(3 + i % 3) * scale}px`, height: `${(3 + i % 3) * scale}px`,
              background: color,
              boxShadow: `0 0 ${5 * scale}px ${glow}`,
            }}
            initial={{ x: startX, y: startY, opacity: 0.8 }}
            animate={{ x: [startX, 0, startX * -1.2], y: [startY, 0, startY * -1.2], opacity: [0.8, 1, 0], scale: [1, 2, 0] }}
            transition={{ duration: 0.52, delay: 0.05 + i * 0.018, ease: 'easeInOut' }}
          />
        );
      })}
      {/* Final explosion ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${toN}%`, top: '44%',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}99 0%, transparent 70%)`,
          boxShadow: `0 0 ${40 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 160 * scale], height: [0, 160 * scale], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.32, delay: 0.32, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 14. ECLIPSE_BEAM ────────────────────────────────────────────────────────
// Thin focused beam that charges then fires; corona at impact

function EclipseBeam({ side, color, glow, waves, scale }: {
  side: 'player' | 'wild'; color: string; glow: string; waves: number; scale: number;
}) {
  const { fromN, toN } = sides(side);

  return (
    <>
      {/* Charge-up glow at origin */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${fromN}%`, top: '44%',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)`,
          boxShadow: `0 0 ${30 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 60 * scale, 0], height: [0, 60 * scale, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />
      {/* Beam itself — narrow then widens */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: waves }).map((_, w) => (
          <motion.line
            key={`beam-${w}`}
            x1={`${fromN}%`} y1={`${43 + w * 2}%`}
            x2={`${toN}%`}  y2={`${43 + w * 2}%`}
            stroke={w === 0 ? '#fff' : color}
            strokeWidth={(4 - w) * scale * 2}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${(12 - w * 3) * scale}px ${color})` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 0.9, 0] }}
            transition={{ duration: 0.42, delay: 0.22 + w * 0.05, times: [0, 0.3, 0.7, 1] }}
          />
        ))}
      </svg>
      {/* Eclipse corona at impact */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `${toN}%`, top: '44%',
          transform: 'translate(-50%,-50%)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 0.36, delay: 0.5 }}
      >
        {/* Moon disc */}
        <div style={{
          width: `${60 * scale}px`, height: `${60 * scale}px`,
          borderRadius: '50%',
          background: '#000',
          border: `${3 * scale}px solid ${color}`,
          boxShadow: `0 0 ${24 * scale}px ${glow}, 0 0 ${50 * scale}px ${glow}`,
          position: 'relative',
        }}>
          {/* Corona rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: `${20 * scale}px`, height: `${2 * scale}px`,
              background: color,
              boxShadow: `0 0 ${6 * scale}px ${glow}`,
              transformOrigin: '0 50%',
              transform: `translate(${28 * scale}px, -50%) rotate(${deg}deg)`,
            }}/>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ─── Strike dispatcher ────────────────────────────────────────────────────────

function StrikeEffect({ strike, side, color, glow, waves, scale }: {
  strike: StrikeType; side: 'player' | 'wild';
  color: string; glow: string; waves: number; scale: number;
}) {
  const p = { side, color, glow, waves, scale };
  switch (strike) {
    case 'CLAW_SLASH':    return <ClawSlash    {...p} />;
    case 'BITE_LUNGE':    return <BiteLunge    {...p} />;
    case 'FLAME_BURST':   return <FlameBurst   {...p} />;
    case 'ROCK_SMASH':    return <RockSmash    {...p} />;
    case 'TIDAL_SLAM':    return <TidalSlam    {...p} />;
    case 'BUBBLE_SHOT':   return <BubbleShot   {...p} />;
    case 'VINE_WHIP':     return <VineWhip     {...p} />;
    case 'SPORE_BOMB':    return <SporeBomb    {...p} />;
    case 'LIGHTNING_BOLT':return <LightningBolt {...p} />;
    case 'SPARK_DASH':    return <SparkDash    {...p} />;
    case 'THUNDER_STOMP': return <ThunderStomp {...p} />;
    case 'SHADOW_CLAW':   return <ShadowClaw   {...p} />;
    case 'VOID_PULL':     return <VoidPull     {...p} />;
    case 'ECLIPSE_BEAM':  return <EclipseBeam  {...p} />;
  }
}

// ─── Element-based effects (for skill1 / skill2 / ultimate) ──────────────────

function ElementParticles({ element, side, particleScale }: {
  element: string; side: 'player' | 'wild'; particleScale: number;
}) {
  const el = getEl(element);
  const { from, to } = sides(side);
  const count = Math.round(7 * particleScale);

  const chars: Record<string, string> = {
    Fire: '🔥', Water: '💧', Nature: '🍃', Electric: '⚡', Dark: '✦',
  };
  const char = chars[element] ?? '✦';

  return (
    <>
      {[0, 1, 2].map((r) => (
        <motion.div
          key={`el-ring-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            borderColor: el.color,
            left: side === 'player' ? '66%' : '28%',
            top: '44%',
            transform: 'translate(-50%,-50%)',
            boxShadow: `0 0 10px ${el.glow}`,
          }}
          initial={{ width: 16, height: 16, opacity: 0.9 }}
          animate={{ width: [16, 200 + r * 60], height: [16, 200 + r * 60], opacity: [0.9, 0] }}
          transition={{ duration: 0.55, delay: r * 0.09, ease: 'easeOut' }}
        />
      ))}
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`ep-${i}`}
          className="absolute pointer-events-none"
          style={{ left: from, top: `${38 + (i % 5) * 4}%`, fontSize: `${(13 + (i % 3) * 4) * particleScale}px` }}
          initial={{ opacity: 0 }}
          animate={{ left: [from, to], opacity: [0, 1, 1, 0], scale: [0.5, 1.3, 0.6], rotate: [0, (i % 2 === 0 ? 180 : -180)] }}
          transition={{ duration: 0.52, delay: 0.08 + i * 0.05, ease: 'easeIn' }}
        >
          {char}
        </motion.div>
      ))}
    </>
  );
}

// ─── S-rarity extra: screen flash + power aura ───────────────────────────────

function SRarityExtras({ side, color, glow }: { side: 'player' | 'wild'; color: string; glow: string }) {
  return (
    <>
      {/* Full-screen white flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'white', zIndex: 5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 0.18, delay: 0.52 }}
      />
      {/* Radial power aura from attacker */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${side === 'player' ? '72%' : '28%'} 44%, ${color}55 0%, transparent 65%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.7, delay: 0.08 }}
      />
      {/* Energy tendrils radiating */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const cx = side === 'player' ? 72 : 28;
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.div
            key={`tendril-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${cx}%`, top: '44%',
              transformOrigin: '0 50%',
              height: `${3}px`,
              background: `linear-gradient(90deg, ${color}, transparent)`,
              boxShadow: `0 0 6px ${glow}`,
              transform: `rotate(${deg}deg)`,
            }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: [0, 80, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.5, delay: 0.04 + i * 0.05, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// ─── Impact flash ─────────────────────────────────────────────────────────────

function ImpactFlash({ side, color, scale }: { side: 'player' | 'wild'; color: string; scale: number }) {
  const defX = side === 'player' ? '22%' : '72%';
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: defX, top: '44%',
        transform: 'translate(-50%,-50%)',
        width: `${80 * scale}px`, height: `${80 * scale}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, white 0%, ${color}88 40%, transparent 100%)`,
        boxShadow: `0 0 ${24 * scale}px ${color}`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 2.8, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.32, delay: 0.48, ease: 'easeOut' }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SkillCinematic({
  skillName, skillDesc, element, power, attackerSide, isCritical, onComplete,
  attackerMythId, attackerRarity = 'C', skillType = 'normal',
}: Props) {
  const el = getEl(element);
  const rc = getRarityCfg(attackerRarity);
  const isNormalAttack = skillType === 'normal' || skillType === 'attack';
  const strike = isNormalAttack ? getStrike(attackerMythId) : null;

  // S-tier gets a longer timeout
  const timeout = isCritical ? rc.timeout + 120 : rc.timeout;

  useEffect(() => {
    const t = setTimeout(onComplete, timeout);
    return () => clearTimeout(t);
  }, [onComplete, timeout]);

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 30 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* ── Background tint ── */}
        <motion.div
          className="absolute inset-0"
          style={{ background: el.bg, backdropFilter: 'brightness(0.65)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: timeout / 1000, times: [0, 0.08, 0.82, 1] }}
        />

        {/* ── S-rarity screen effects (behind everything else) ── */}
        {attackerRarity === 'S' && (
          <SRarityExtras side={attackerSide} color={el.color} glow={el.glow} />
        )}

        {/* ── Skill name ── */}
        <motion.div
          className="absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none"
          style={{ zIndex: 4 }}
          initial={{ opacity: 0, scale: 0.4, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.4, attackerRarity === 'S' ? 1.3 : 1.15, 1, 0.8], y: [10, 0, 0, -8] }}
          transition={{ duration: timeout / 1000, times: [0, 0.14, 0.65, 1] }}
        >
          <p
            className="font-black tracking-widest uppercase leading-none"
            style={{
              fontSize: attackerRarity === 'S' ? '1.5rem' : attackerRarity === 'A' ? '1.25rem' : '1.1rem',
              color: el.color,
              textShadow: `0 0 20px ${el.glow}, 0 0 ${attackerRarity === 'S' ? '60px' : '40px'} ${el.glow}`,
              letterSpacing: '0.15em',
            }}
          >
            {el.icon} {skillName}
          </p>
          {/* Rarity badge */}
          {attackerRarity !== 'C' && (
            <p className="text-xs font-bold mt-0.5 tracking-wider" style={{ color: el.color, opacity: 0.7 }}>
              {attackerRarity === 'S' ? '★★★ S-CLASS ★★★' : attackerRarity === 'A' ? '★★ A-CLASS ★★' : '★ B-CLASS'}
            </p>
          )}
          {isCritical && (
            <p className="text-yellow-300 text-sm font-bold mt-1 tracking-widest animate-pulse">★ CRITICAL HIT! ★</p>
          )}
          {skillDesc && (
            <p className="text-white/50 text-xs mt-1 font-mono">{skillDesc}</p>
          )}
        </motion.div>

        {/* ── Power badge ── */}
        <motion.div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 4 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0.8, 0], scale: [0, 1, 1, 0] }}
          transition={{ duration: timeout / 1000, times: [0, 0.18, 0.62, 1] }}
        >
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: el.color, borderColor: el.color + '55', background: el.color + '18' }}
          >
            PWR {power}
          </span>
        </motion.div>

        {/* ── Strike / element effect ── */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {isNormalAttack && strike ? (
            <StrikeEffect
              strike={strike}
              side={attackerSide}
              color={el.color}
              glow={el.glow}
              waves={rc.hitWaves}
              scale={rc.scale}
            />
          ) : (
            <ElementParticles element={element} side={attackerSide} particleScale={rc.particleScale} />
          )}
        </div>

        {/* ── Impact flash ── */}
        <ImpactFlash side={attackerSide} color={el.color} scale={rc.scale} />

        {/* ── Screen vignette flash ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${attackerSide === 'player' ? '20%' : '80%'} 50%, transparent 30%, ${el.color}33 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, rc.extraGlow > 0 ? 1.0 : 0.7, 0] }}
          transition={{ duration: 0.35, delay: 0.46 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
