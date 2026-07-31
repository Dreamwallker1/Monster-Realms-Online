import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MYTH_ARCHETYPE } from '@/lib/myth-svgs';

// ─── Types ────────────────────────────────────────────────────────────────────

type StrikeType =
  | 'CLAW_SLASH' | 'BITE_LUNGE' | 'FLAME_BURST' | 'ROCK_SMASH'
  | 'TIDAL_SLAM' | 'BUBBLE_SHOT' | 'VINE_WHIP'   | 'SPORE_BOMB'
  | 'LIGHTNING_BOLT' | 'SPARK_DASH' | 'THUNDER_STOMP'
  | 'SHADOW_CLAW' | 'VOID_PULL' | 'ECLIPSE_BEAM';

// Same map as MythEntranceCinematic
const ARCHETYPE_STRIKE: Record<string, StrikeType> = {
  FireWolf: 'CLAW_SLASH',    FireDrake: 'BITE_LUNGE',
  FireSpirit: 'FLAME_BURST', FireGolem: 'ROCK_SMASH',
  EmberMoth: 'FLAME_BURST',  CinderSerpent: 'BITE_LUNGE',
  LavaCrab: 'ROCK_SMASH',    FlameHatch: 'FLAME_BURST',
  WaterTurtle: 'TIDAL_SLAM', WaterCanine: 'CLAW_SLASH',
  SeaJelly: 'BUBBLE_SHOT',   SeaSerpent: 'BITE_LUNGE',
  TidalCrab: 'TIDAL_SLAM',   AbyssAngler: 'BITE_LUNGE',
  GlacierGiant: 'TIDAL_SLAM',TempestEel: 'BITE_LUNGE',
  Treant: 'VINE_WHIP',       VineSprite: 'VINE_WHIP',
  NatureWolf: 'CLAW_SLASH',  ForestBeast: 'SPORE_BOMB',
  FernFox: 'CLAW_SLASH',     ThornSerpent: 'BITE_LUNGE',
  BloomBee: 'VINE_WHIP',     MossGolem: 'ROCK_SMASH',
  ThunderHawk: 'LIGHTNING_BOLT', LightningFox: 'SPARK_DASH',
  ElectricRay: 'LIGHTNING_BOLT', StormGolem: 'THUNDER_STOMP',
  SparkRabbit: 'SPARK_DASH', ThunderWorm: 'LIGHTNING_BOLT',
  VoltFish: 'LIGHTNING_BOLT',TeslaOrb: 'THUNDER_STOMP',
  ShadowCat: 'CLAW_SLASH',   VoidWraith: 'SHADOW_CLAW',
  DarkBird: 'SHADOW_CLAW',   ShadowGolem: 'VOID_PULL',
  NightHound: 'CLAW_SLASH',  VoidMoth: 'SHADOW_CLAW',
  EclipseOwl: 'ECLIPSE_BEAM',AbyssSpider: 'VOID_PULL',
};

function getStrike(mythId?: string): StrikeType {
  if (!mythId) return 'CLAW_SLASH';
  const arch = MYTH_ARCHETYPE[mythId];
  return (arch && ARCHETYPE_STRIKE[arch]) ? ARCHETYPE_STRIKE[arch]! : 'CLAW_SLASH';
}

// ─── Rarity config ────────────────────────────────────────────────────────────
// C = quick fade, B = brief glow burst, A = particles, S = dramatic collapse
// All timeouts ≤ 500 ms

const RARITY_CFG: Record<string, { scale: number; dur: number; timeout: number }> = {
  C: { scale: 0.65, dur: 0.22, timeout: 260 },
  B: { scale: 0.85, dur: 0.28, timeout: 320 },
  A: { scale: 1.10, dur: 0.36, timeout: 400 },
  S: { scale: 1.30, dur: 0.44, timeout: 480 },
};
const getRarityCfg = (r?: string) => RARITY_CFG[r ?? 'C'] ?? RARITY_CFG['C']!;

// ─── Element colors ───────────────────────────────────────────────────────────

const EL: Record<string, { color: string; glow: string }> = {
  Fire:     { color: '#FF6B35', glow: 'rgba(255,107,53,0.6)' },
  Water:    { color: '#38BDF8', glow: 'rgba(56,189,248,0.6)' },
  Earth:    { color: '#CA8A04', glow: 'rgba(202,138,4,0.6)' },
  Storm:    { color: '#A855F7', glow: 'rgba(168,85,247,0.7)' },
  Shadow:   { color: '#6366F1', glow: 'rgba(99,102,241,0.6)' },
  // Legacy collection fallbacks
  Nature:   { color: '#4ADE80', glow: 'rgba(74,222,128,0.6)' },
  Electric: { color: '#FDE047', glow: 'rgba(253,224,71,0.7)' },
  Dark:     { color: '#C084FC', glow: 'rgba(192,132,252,0.6)' },
};
const getEl = (e: string) => EL[e] ?? { color: '#94A3B8', glow: 'rgba(148,163,184,0.4)' };

// ─── Sprite centre helpers ────────────────────────────────────────────────────

function mythCenter(side: 'player' | 'wild') {
  return side === 'wild'
    ? { cx: '13%', cy: '52%' }
    : { cx: '87%', cy: '52%' };
}

// ─── 1. CLAW_SLASH faint: stumble slide off-screen ───────────────────────────

function FaintClawSlash({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const exitX = side === 'player' ? '140%' : '-40%';

  return (
    <>
      {/* Dust puff at feet */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * 120 + (side === 'player' ? 200 : -20);
        const dist = (20 + i * 8) * scale;
        return (
          <motion.div
            key={`dust-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: `calc(${cy} + ${20 * scale}px)`,
              width: `${(8 + i * 4) * scale}px`, height: `${(8 + i * 4) * scale}px`,
              background: `${color}55`,
              boxShadow: `0 0 ${6 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.7, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              scale: [0, 1.2, 0],
            }}
            transition={{ duration: dur * 0.9, delay: i * 0.03, ease: 'easeOut' }}
          />
        );
      })}
      {/* Speed streak leaving */}
      {[0, 1].map((i) => (
        <motion.div
          key={`streak-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: `calc(${cy} + ${(i - 0.5) * 10 * scale}px)`,
            height: `${(3 - i) * scale}px`,
            background: `linear-gradient(${side === 'player' ? '90deg' : '270deg'}, ${color}88, transparent)`,
            boxShadow: `0 0 4px ${glow}`,
          }}
          initial={{ left: cx, width: 0, opacity: 0 }}
          animate={{
            left: [cx, exitX],
            width: [`${50 * scale}px`, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: dur * 0.7, delay: 0.04 + i * 0.03, ease: 'easeIn' }}
        />
      ))}
    </>
  );
}

// ─── 2. BITE_LUNGE faint: reel backward and collapse ─────────────────────────

function FaintBiteLunge({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Two fang-marks that fade as it falls */}
      {[-10, 10].map((dy, i) => (
        <motion.div
          key={`fang-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: cx,
            top: `calc(${cy} + ${dy * scale}px)`,
            transform: 'translate(-50%,-50%)',
            width: `${4 * scale}px`,
            height: `${18 * scale}px`,
            background: color,
            borderRadius: '3px',
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: dur * 0.7, delay: i * 0.04 }}
        />
      ))}
      {/* Impact ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 ${14 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0.8 }}
        animate={{ width: [0, 80 * scale], height: [0, 50 * scale], opacity: [0.8, 0] }}
        transition={{ duration: dur * 0.9, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 3. FLAME_BURST faint: embers extinguish ─────────────────────────────────

function FaintFlameBurst({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(8 * scale);

  return (
    <>
      {/* Ember scatter */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = (30 + (i % 3) * 14) * scale;
        return (
          <motion.div
            key={`ember-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${(3 + i % 3) * scale}px`, height: `${(3 + i % 3) * scale}px`,
              background: i % 2 === 0 ? color : '#FFA500',
              boxShadow: `0 0 ${5 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist + (20 * scale)],
              scale: [0, 1, 0],
            }}
            transition={{ duration: dur * 0.85, delay: 0.03 + i * 0.018, ease: 'easeOut' }}
          />
        );
      })}
      {/* Smoke puff */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, rgba(80,80,80,0.5) 0%, transparent 70%)`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 70 * scale], height: [0, 70 * scale], opacity: [0, 0.5, 0], y: [0, -20 * scale] }}
        transition={{ duration: dur, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 4. ROCK_SMASH faint: crumble to debris ──────────────────────────────────

function FaintRockSmash({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(6 * scale);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = (25 + i * 7) * scale;
        return (
          <motion.div
            key={`chunk-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: cx, top: cy,
              width: `${(6 + i % 4) * scale}px`, height: `${(6 + i % 4) * scale}px`,
              background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color})`,
              boxShadow: `0 0 ${4 * scale}px ${glow}`,
              borderRadius: '2px',
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0.8, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist + 18 * scale],
              rotate: [0, 90 + i * 30],
              scale: [0, 1, 0.5],
            }}
            transition={{ duration: dur * 0.9, delay: 0.02 + i * 0.02, ease: 'easeOut' }}
          />
        );
      })}
      {/* Ground shockwave */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: `calc(${cy} + ${24 * scale}px)`,
          transform: 'translate(-50%,-50%)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 ${8 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0.8 }}
        animate={{ width: [0, 90 * scale], height: [0, 22 * scale], opacity: [0.8, 0] }}
        transition={{ duration: dur * 0.8, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 5. TIDAL_SLAM faint: dissolve into droplets ─────────────────────────────

function FaintTidalSlam({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(8 * scale);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360 - 90;
        const dist = (20 + (i % 4) * 10) * scale;
        return (
          <motion.div
            key={`drop-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${(4 + i % 3) * scale}px`, height: `${(6 + i % 3) * scale}px`,
              background: `radial-gradient(circle at 35% 30%, white 0%, ${color} 50%)`,
              boxShadow: `0 0 ${5 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.9, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist + 10 * scale],
              scale: [0, 1, 0],
            }}
            transition={{ duration: dur, delay: 0.02 + i * 0.022, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// ─── 6. BUBBLE_SHOT faint: pop into bubbles ──────────────────────────────────

function FaintBubbleShot({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(7 * Math.max(scale, 0.7));

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = (22 + (i % 3) * 12) * scale;
        return (
          <motion.div
            key={`bubble-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${(8 + i % 3 * 4) * scale}px`, height: `${(8 + i % 3 * 4) * scale}px`,
              background: `radial-gradient(circle at 35% 35%, white 0%, ${color} 50%, ${color}33 100%)`,
              boxShadow: `0 0 ${8 * scale}px ${glow}`,
              border: `1px solid ${color}66`,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              scale: [0, 1, 1, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist - 5 * scale],
            }}
            transition={{ duration: dur * 0.9, delay: 0.03 + i * 0.03, ease: 'easeInOut' }}
          />
        );
      })}
    </>
  );
}

// ─── 7. VINE_WHIP faint: wilt with falling leaves ────────────────────────────

function FaintVineWhip({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(5 * scale);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const driftX = ((i % 2 === 0 ? 1 : -1) * (10 + i * 6)) * scale;
        return (
          <motion.div
            key={`leaf-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: `calc(${cx} + ${((i - 2) * 12) * scale}px)`,
              top: `calc(${cy} - ${(i % 3) * 8 * scale}px)`,
              width: `${5 * scale}px`, height: `${9 * scale}px`,
              background: color,
              boxShadow: `0 0 ${4 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.9, 0],
              y: [0, (28 + i * 6) * scale],
              x: [0, driftX],
              rotate: [0, (i % 2 === 0 ? 90 : -90)],
            }}
            transition={{ duration: dur * 1.0, delay: i * 0.025, ease: 'easeIn' }}
          />
        );
      })}
    </>
  );
}

// ─── 8. SPORE_BOMB faint: cloud dispersal ────────────────────────────────────

function FaintSporeBomb({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(9 * scale);

  return (
    <>
      {/* Central cloud expanding outward */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}77 0%, ${color}22 55%, transparent 100%)`,
          boxShadow: `0 0 ${18 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 100 * scale, 0], height: [0, 100 * scale, 0], opacity: [0, 0.7, 0] }}
        transition={{ duration: dur, ease: 'easeOut' }}
      />
      {/* Spore dots */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360 + 20;
        const dist = (18 + i % 4 * 12) * scale;
        return (
          <motion.div
            key={`spore-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${(2 + i % 3) * scale}px`, height: `${(2 + i % 3) * scale}px`,
              background: color,
              boxShadow: `0 0 ${3 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              scale: [0, 1, 0],
            }}
            transition={{ duration: dur * 0.85, delay: 0.04 + i * 0.018, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// ─── 9. LIGHTNING_BOLT faint: electric fizzle ────────────────────────────────

function FaintLightningBolt({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Electric flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'white' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.18, 0] }}
        transition={{ duration: 0.12, delay: 0.02 }}
      />
      {/* Spark lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[0, 1, 2].map((i) => {
          const ang = 60 + i * 60;
          const len = (25 + i * 10) * scale;
          const ex = Math.cos((ang * Math.PI) / 180) * len;
          const ey = Math.sin((ang * Math.PI) / 180) * len;
          return (
            <motion.line
              key={`spark-${i}`}
              x1={cx} y1={cy}
              x2={`calc(${cx} + ${ex}px)`} y2={`calc(${cy} + ${ey}px)`}
              stroke={i % 2 === 0 ? color : '#FFF'}
              strokeWidth={2 * scale}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 ${5 * scale}px ${color})` }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 0], opacity: [0, 0.9, 0] }}
              transition={{ duration: dur * 0.65, delay: i * 0.04, ease: 'easeOut' }}
            />
          );
        })}
      </svg>
      {/* Central flash burst */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, white 0%, ${color}88 50%, transparent 100%)`,
          boxShadow: `0 0 ${20 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 60 * scale, 0], height: [0, 60 * scale, 0], opacity: [0, 0.8, 0] }}
        transition={{ duration: dur * 0.8, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 10. SPARK_DASH faint: speed-burst off screen ────────────────────────────

function FaintSparkDash({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const exitX = side === 'player' ? '120%' : '-20%';

  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`dash-${i}`}
          className="absolute pointer-events-none"
          style={{
            height: `${(4 - i) * scale}px`,
            top: `calc(${cy} + ${(i - 1) * 7}px)`,
            borderRadius: `${3 * scale}px`,
            background: `linear-gradient(${side === 'player' ? '90deg' : '270deg'}, ${color}, ${color}44, transparent)`,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ left: cx, width: 0, opacity: 0 }}
          animate={{ left: [cx, exitX], width: [`${70 * scale}px`, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: dur * 0.7, delay: i * 0.03, ease: 'easeIn' }}
        />
      ))}
    </>
  );
}

// ─── 11. THUNDER_STOMP faint: collapse with shockwave ────────────────────────

function FaintThunderStomp({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Ground shockwave rings */}
      {[0, 1].map((r) => (
        <motion.div
          key={`stomp-${r}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: cx, top: `calc(${cy} + ${22 * scale}px)`,
            transform: 'translate(-50%,-50%)',
            border: `${2 * scale}px solid ${color}`,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{
            width:  [0, (70 + r * 44) * scale],
            height: [0, (20 + r * 12) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: dur * 0.85, delay: r * 0.07, ease: 'easeOut' }}
        />
      ))}
      {/* Debris scatter */}
      {Array.from({ length: Math.round(4 * scale) }).map((_, i) => (
        <motion.div
          key={`debris-${i}`}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: cx, top: cy,
            width: `${4 * scale}px`, height: `${4 * scale}px`,
            background: color,
            boxShadow: `0 0 ${4 * scale}px ${glow}`,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            x: [(i % 2 === 0 ? 1 : -1) * (12 + i * 8) * scale, 0],
            y: [(-20 - i * 6) * scale, 20 * scale],
            rotate: [0, 180 + i * 45],
          }}
          transition={{ duration: dur * 0.9, delay: 0.03 + i * 0.04 }}
        />
      ))}
    </>
  );
}

// ─── 12. SHADOW_CLAW faint: fade through shadow tears ────────────────────────

function FaintShadowClaw({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const tearCount = 4;

  return (
    <>
      {Array.from({ length: tearCount }).map((_, t) => {
        const dy = (t - tearCount / 2) * 14 * scale;
        const dx = (t % 2 === 0 ? 1 : -1) * (t % 3) * 10 * scale;
        return (
          <motion.div
            key={`tear-${t}`}
            className="absolute pointer-events-none"
            style={{
              left: `calc(${cx} + ${dx}px)`,
              top: `calc(${cy} + ${dy}px)`,
              transform: 'translate(-50%,-50%)',
              width: `${(3 + t % 2) * scale}px`,
              height: `${(28 + t % 3 * 10) * scale}px`,
              background: `linear-gradient(180deg, transparent, ${color}, ${color}, transparent)`,
              boxShadow: `0 0 ${10 * scale}px ${glow}, 0 0 ${4 * scale}px #000`,
              rotate: `${(t % 2 === 0 ? 1 : -1) * 15}deg`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: dur * 0.9, delay: t * 0.05, ease: 'easeInOut' }}
          />
        );
      })}
      {/* Darkness pulse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
          boxShadow: `0 0 ${22 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 90 * scale], height: [0, 90 * scale], opacity: [0, 0.6, 0] }}
        transition={{ duration: dur * 0.8, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 13. VOID_PULL faint: dissolve into a void tear ──────────────────────────

function FaintVoidPull({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const particleCount = Math.round(10 * scale);

  return (
    <>
      {/* Particles sucked toward center */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360;
        const dist = (35 + (i % 4) * 10) * scale;
        const sx = Math.cos((angle * Math.PI) / 180) * dist;
        const sy = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.div
            key={`vp-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: cx, top: cy,
              width: `${(3 + i % 3) * scale}px`, height: `${(3 + i % 3) * scale}px`,
              background: color,
              boxShadow: `0 0 ${4 * scale}px ${glow}`,
            }}
            initial={{ x: sx, y: sy, opacity: 0.8 }}
            animate={{ x: [sx, 0], y: [sy, 0], opacity: [0.8, 1, 0], scale: [1, 1.5, 0] }}
            transition={{ duration: dur * 0.7, delay: 0.03 + i * 0.016, ease: 'easeIn' }}
          />
        );
      })}
      {/* Void singularity collapse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, #000 0%, ${color}99 50%, transparent 100%)`,
          boxShadow: `0 0 ${28 * scale}px ${glow}`,
        }}
        initial={{ width: 70 * scale, height: 70 * scale, opacity: 0 }}
        animate={{ width: [70 * scale, 0], height: [70 * scale, 0], opacity: [0, 0.9, 0] }}
        transition={{ duration: dur * 0.8, ease: 'easeIn' }}
      />
    </>
  );
}

// ─── 14. ECLIPSE_BEAM faint: fade to darkness with corona ────────────────────

function FaintEclipseBeam({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Dark screen wash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: '#000' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.25, 0] }}
        transition={{ duration: dur * 1.1, ease: 'easeInOut' }}
      />
      {/* Eclipse corona collapse */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cx, top: cy, transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: '#000',
          border: `${2.5 * scale}px solid ${color}`,
          boxShadow: `0 0 ${20 * scale}px ${glow}, 0 0 ${40 * scale}px ${glow}`,
        }}
        initial={{ width: 50 * scale, height: 50 * scale, opacity: 0.8 }}
        animate={{ width: [50 * scale, 0], height: [50 * scale, 0], opacity: [0.8, 0] }}
        transition={{ duration: dur * 0.75, ease: 'easeIn' }}
      />
    </>
  );
}

// ─── Faint effect dispatcher ──────────────────────────────────────────────────

function FaintEffect({ strike, side, color, glow, scale, dur }: {
  strike: StrikeType; side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const p = { side, color, glow, scale, dur };
  switch (strike) {
    case 'CLAW_SLASH':     return <FaintClawSlash     {...p} />;
    case 'BITE_LUNGE':     return <FaintBiteLunge     {...p} />;
    case 'FLAME_BURST':    return <FaintFlameBurst    {...p} />;
    case 'ROCK_SMASH':     return <FaintRockSmash     {...p} />;
    case 'TIDAL_SLAM':     return <FaintTidalSlam     {...p} />;
    case 'BUBBLE_SHOT':    return <FaintBubbleShot    {...p} />;
    case 'VINE_WHIP':      return <FaintVineWhip      {...p} />;
    case 'SPORE_BOMB':     return <FaintSporeBomb     {...p} />;
    case 'LIGHTNING_BOLT': return <FaintLightningBolt {...p} />;
    case 'SPARK_DASH':     return <FaintSparkDash     {...p} />;
    case 'THUNDER_STOMP':  return <FaintThunderStomp  {...p} />;
    case 'SHADOW_CLAW':    return <FaintShadowClaw    {...p} />;
    case 'VOID_PULL':      return <FaintVoidPull      {...p} />;
    case 'ECLIPSE_BEAM':   return <FaintEclipseBeam   {...p} />;
  }
}

// ─── Exported props ───────────────────────────────────────────────────────────

export interface MythFaintProps {
  mythId: string;
  element: string;
  rarity?: string;
  side: 'player' | 'wild';
  onComplete: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MythFaintCinematic({
  mythId, element, rarity = 'C', side, onComplete,
}: MythFaintProps) {
  const el     = getEl(element);
  const rc     = getRarityCfg(rarity);
  const strike = getStrike(mythId);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    const t = setTimeout(() => onCompleteRef.current(), rc.timeout);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rc.timeout]);

  return (
    <AnimatePresence>
      <motion.div
        key={`faint-${mythId}-${side}`}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 26 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <FaintEffect
          strike={strike}
          side={side}
          color={el.color}
          glow={el.glow}
          scale={rc.scale}
          dur={rc.dur}
        />
      </motion.div>
    </AnimatePresence>
  );
}
