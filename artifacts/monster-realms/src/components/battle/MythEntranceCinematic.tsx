import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MYTH_ARCHETYPE } from '@/lib/myth-svgs';

// ─── Types ────────────────────────────────────────────────────────────────────

type StrikeType =
  | 'CLAW_SLASH' | 'BITE_LUNGE' | 'FLAME_BURST' | 'ROCK_SMASH'
  | 'TIDAL_SLAM' | 'BUBBLE_SHOT' | 'VINE_WHIP'   | 'SPORE_BOMB'
  | 'LIGHTNING_BOLT' | 'SPARK_DASH' | 'THUNDER_STOMP'
  | 'SHADOW_CLAW' | 'VOID_PULL' | 'ECLIPSE_BEAM';

// Same map as SkillCinematic — entrance style matches the myth's strike personality
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
// C=simple, B=glow added, A=particles, S=full aura reveal

const RARITY_CFG: Record<string, { scale: number; dur: number; timeout: number; aura: boolean; rings: number }> = {
  C: { scale: 0.65, dur: 0.30, timeout: 380, aura: false, rings: 0 },
  B: { scale: 0.90, dur: 0.40, timeout: 460, aura: false, rings: 1 },
  A: { scale: 1.10, dur: 0.50, timeout: 540, aura: true,  rings: 2 },
  S: { scale: 1.30, dur: 0.60, timeout: 600, aura: true,  rings: 3 },
};
const getRarityCfg = (r?: string) => RARITY_CFG[r ?? 'C'] ?? RARITY_CFG['C']!;

// ─── Element colors ───────────────────────────────────────────────────────────

const EL: Record<string, { color: string; glow: string }> = {
  Fire:     { color: '#FF6B35', glow: 'rgba(255,107,53,0.6)' },
  Water:    { color: '#38BDF8', glow: 'rgba(56,189,248,0.6)' },
  Nature:   { color: '#4ADE80', glow: 'rgba(74,222,128,0.6)' },
  Electric: { color: '#FDE047', glow: 'rgba(253,224,71,0.7)' },
  Dark:     { color: '#C084FC', glow: 'rgba(192,132,252,0.6)' },
};
const getEl = (e: string) => EL[e] ?? { color: '#94A3B8', glow: 'rgba(148,163,184,0.4)' };

// ─── Position helpers ─────────────────────────────────────────────────────────
// cx/cy are % positions of the myth sprite centre in the battle arena

function mythCenter(side: 'player' | 'wild') {
  // Wild: left:'8%', bottom:'36%' — approx centre ~13% from left, ~50% from top
  // Player: right:'8%', bottom:'36%' — approx centre ~87% from left
  return side === 'wild'
    ? { cx: '13%', cy: '52%' }
    : { cx: '87%', cy: '52%' };
}

// ─── Aura rings (B–S) ─────────────────────────────────────────────────────────

function AuraRings({ cx, cy, color, glow, count, scale }: {
  cx: string; cy: string; color: string; glow: string; count: number; scale: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, r) => (
        <motion.div
          key={`aura-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: cx, top: cy,
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${14 * scale}px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{
            width:  [0, (90 + r * 55) * scale],
            height: [0, (90 + r * 55) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.46, delay: r * 0.08, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ─── S-rarity extra: screen flash + radial aura ───────────────────────────────

function SReveal({ cx, color, glow }: { cx: string; color: string; glow: string }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'white', zIndex: 5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.28, 0] }}
        transition={{ duration: 0.16, delay: 0.08 }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at ${cx} 52%, ${color}55 0%, transparent 65%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.55, delay: 0.06 }}
      />
    </>
  );
}

// ─── 1. CLAW_SLASH entrance: dash in from off-screen edge ─────────────────────

function EntranceClawSlash({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const fromX = side === 'player' ? '140%' : '-40%';
  const streakDir = side === 'player' ? '270deg' : '90deg';

  return (
    <>
      {/* Speed streaks that dissolve */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`streak-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: `calc(${cy} + ${(i - 1) * 10 * scale}px)`,
            height: `${(4 - i) * scale}px`,
            background: `linear-gradient(${streakDir}, transparent, ${color}99, transparent)`,
            boxShadow: `0 0 6px ${glow}`,
            left: side === 'player' ? '20%' : '10%',
            right: side === 'player' ? '10%' : '20%',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.85, 0] }}
          transition={{ duration: dur * 0.6, delay: i * 0.03, ease: 'easeOut' }}
        />
      ))}
      {/* Arrival burst */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}88 0%, transparent 70%)`,
          boxShadow: `0 0 ${22 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 100 * scale, 0], height: [0, 100 * scale, 0], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.28, delay: dur * 0.65, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 2. BITE_LUNGE entrance: lunge in with fang flash ────────────────────────

function EntranceBiteLunge({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Lunge trail line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.line
          x1={side === 'player' ? '110%' : '-10%'} y1={cy}
          x2={cx} y2={cy}
          stroke={color}
          strokeWidth={4 * scale}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 ${8 * scale}px ${color})` }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: dur * 0.7, ease: 'easeIn' }}
        />
      </svg>
      {/* Fang marks on arrival */}
      {[-10, 10].map((dy, i) => (
        <motion.div
          key={`fang-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: cx,
            top: `calc(${cy} + ${dy * scale}px)`,
            transform: 'translate(-50%,-50%)',
            width: `${5 * scale}px`,
            height: `${20 * scale}px`,
            background: color,
            borderRadius: '3px',
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.22, delay: dur * 0.62 + i * 0.04 }}
        />
      ))}
    </>
  );
}

// ─── 3. FLAME_BURST entrance: spiral in with expanding fire rings ─────────────

function EntranceFlameBurst({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {Array.from({ length: 3 }).map((_, r) => (
        <motion.div
          key={`ring-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: cx, top: cy,
            transform: 'translate(-50%,-50%)',
            borderColor: r % 2 === 0 ? color : '#FFF',
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ width: 10 * scale, height: 10 * scale, opacity: 0.9 }}
          animate={{
            width:  [10 * scale, (80 + r * 50) * scale, 0],
            height: [10 * scale, (80 + r * 50) * scale, 0],
            opacity: [0.9, 0.7, 0],
          }}
          transition={{ duration: dur, delay: r * 0.06, ease: 'easeOut' }}
        />
      ))}
      {/* Spark burst */}
      {Array.from({ length: Math.round(5 * scale) }).map((_, i) => {
        const angle = (i / 5) * 360;
        const dist = 40 * scale;
        return (
          <motion.div
            key={`spark-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${5 * scale}px`, height: `${5 * scale}px`,
              background: color,
              boxShadow: `0 0 ${6 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              opacity: [0, 0.9, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{ duration: dur * 0.75, delay: 0.06 + i * 0.025 }}
          />
        );
      })}
    </>
  );
}

// ─── 4. ROCK_SMASH entrance: drop from above with shockwave ──────────────────

function EntranceRockSmash({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Drop shadow trail */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cx,
          transform: 'translateX(-50%)',
          width: `${8 * scale}px`,
          background: `linear-gradient(180deg, transparent, ${color}88)`,
          boxShadow: `0 0 ${10 * scale}px ${glow}`,
        }}
        initial={{ top: '0%', height: 0, opacity: 0 }}
        animate={{ top: ['-5%', cy], height: [`${80 * scale}px`, 0], opacity: [0, 0.8, 0] }}
        transition={{ duration: dur * 0.65, ease: 'easeIn' }}
      />
      {/* Ground shockwave on impact */}
      {[0, 1, 2].map((r) => (
        <motion.div
          key={`shockwave-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: cx, top: cy,
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{
            width:  [0, (80 + r * 50) * scale],
            height: [0, (30 + r * 18) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.36, delay: dur * 0.6 + r * 0.07, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ─── 5. TIDAL_SLAM entrance: wave wash-in from the side ──────────────────────

function EntranceTidalSlam({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const fromX = side === 'player' ? '110%' : '-10%';

  return (
    <>
      {/* Wave panels */}
      {[0, 1].map((w) => (
        <motion.div
          key={`wave-${w}`}
          className="absolute pointer-events-none"
          style={{
            top: `calc(${cy} - ${30 * scale}px)`,
            height: `${60 * scale}px`,
            width: `${24 * scale}px`,
            background: `linear-gradient(90deg, transparent, ${color}cc, transparent)`,
            boxShadow: `0 0 ${16 * scale}px ${glow}`,
          }}
          initial={{ left: fromX, opacity: 0 }}
          animate={{ left: [fromX, cx], opacity: [0, 0.9, 0] }}
          transition={{ duration: dur * 0.7, delay: w * 0.07, ease: 'easeIn' }}
        />
      ))}
      {/* Splash rings on arrival */}
      {[0, 1].map((r) => (
        <motion.div
          key={`splash-${r}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: cx, top: cy,
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ width: 8, height: 8, opacity: 0.9 }}
          animate={{
            width:  [(8 + r * 10) * scale, (90 + r * 50) * scale],
            height: [(6 + r * 6) * scale,  (55 + r * 30) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.38, delay: dur * 0.68 + r * 0.08, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ─── 6. BUBBLE_SHOT entrance: float in surrounded by bubbles ─────────────────

function EntranceBubbleShot({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(6 * Math.max(scale, 0.7));

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const orbitR = (28 + (i % 3) * 10) * scale;
        return (
          <motion.div
            key={`bubble-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: `${(7 + (i % 3) * 3) * scale}px`,
              height: `${(7 + (i % 3) * 3) * scale}px`,
              background: `radial-gradient(circle at 35% 35%, white 0%, ${color} 55%, ${color}44 100%)`,
              boxShadow: `0 0 ${8 * scale}px ${glow}`,
              left: cx, top: cy,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              scale:   [0, 1, 1, 0],
              x: [0, Math.cos((angle * Math.PI) / 180) * orbitR],
              y: [0, Math.sin((angle * Math.PI) / 180) * orbitR],
            }}
            transition={{ duration: dur, delay: 0.04 + i * 0.04, ease: 'easeInOut' }}
          />
        );
      })}
    </>
  );
}

// ─── 7. VINE_WHIP entrance: swing in on a vine arc ───────────────────────────

function EntranceVineWhip({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const startX = side === 'player' ? '110%' : '-10%';
  const midX = side === 'player' ? '70%' : '30%';

  return (
    <>
      {/* Vine arc path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d={`M ${startX} 10% Q ${midX} 20% ${cx} ${cy}`}
          stroke={color}
          strokeWidth={4 * scale}
          fill="none"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 ${8 * scale}px ${color})` }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.85, 0] }}
          transition={{ duration: dur, ease: 'easeInOut' }}
        />
      </svg>
      {/* Leaf burst on landing */}
      {Array.from({ length: Math.round(4 * scale) }).map((_, i) => {
        const angle = (i / 4) * 360;
        const dist = 30 * scale;
        return (
          <motion.div
            key={`leaf-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${6 * scale}px`, height: `${10 * scale}px`,
              background: color,
              boxShadow: `0 0 ${5 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              opacity: [0, 0.9, 0],
              scale: [0, 1, 0],
              rotate: [0, angle + 180],
            }}
            transition={{ duration: 0.32, delay: dur * 0.7 + i * 0.025 }}
          />
        );
      })}
    </>
  );
}

// ─── 8. SPORE_BOMB entrance: materialise from an expanding cloud ──────────────

function EntranceSporeBomb({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const count = Math.round(8 * scale);

  return (
    <>
      {/* Central cloud core */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}99 0%, ${color}22 60%, transparent 100%)`,
          boxShadow: `0 0 ${20 * scale}px ${glow}`,
        }}
        initial={{ width: 10, height: 10, opacity: 0 }}
        animate={{
          width:  [10, 120 * scale, 0],
          height: [10, 120 * scale, 0],
          opacity: [0, 0.8, 0],
        }}
        transition={{ duration: dur, ease: 'easeOut' }}
      />
      {/* Spore dots */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360 + 15;
        const dist = (30 + (i % 3) * 14) * scale;
        return (
          <motion.div
            key={`spore-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: cx, top: cy,
              width: `${(3 + i % 3) * scale}px`,
              height: `${(3 + i % 3) * scale}px`,
              background: color,
              boxShadow: `0 0 ${4 * scale}px ${glow}`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: [0, Math.cos((angle * Math.PI) / 180) * dist],
              y: [0, Math.sin((angle * Math.PI) / 180) * dist],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{ duration: dur * 0.8, delay: 0.05 + i * 0.022, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

// ─── 9. LIGHTNING_BOLT entrance: teleport in with electric flash ──────────────

function EntranceLightningBolt({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const segs = 4;

  function boltPath() {
    const startX = side === 'player' ? 90 : 10;
    const endX = side === 'player' ? 87 : 13;
    const step = (endX - startX) / segs;
    let d = `M ${startX}% 0%`;
    for (let i = 1; i <= segs; i++) {
      const x = startX + step * i;
      const y = (i / segs) * 52 + (i % 2 === 0 ? -8 : 8) * scale;
      d += ` L ${x}% ${y}%`;
    }
    return d;
  }

  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {[0, 1].map((w) => (
          <motion.path
            key={`bolt-${w}`}
            d={boltPath()}
            stroke={w === 0 ? color : '#FFF'}
            strokeWidth={(4 - w * 1.5) * scale}
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${8 * scale}px ${color})` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: dur * 0.55, delay: w * 0.05, ease: 'easeIn' }}
          />
        ))}
      </svg>
      {/* Thunder flash on arrival */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, white 0%, ${color}88 50%, transparent 100%)`,
          boxShadow: `0 0 ${30 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 100 * scale, 0], height: [0, 100 * scale, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.26, delay: dur * 0.52 }}
      />
    </>
  );
}

// ─── 10. SPARK_DASH entrance: super-speed blur dash in ───────────────────────

function EntranceSparkDash({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const fromX = side === 'player' ? '115%' : '-15%';
  const dashes = 3;

  return (
    <>
      {Array.from({ length: dashes }).map((_, d) => (
        <motion.div
          key={`dash-${d}`}
          className="absolute pointer-events-none"
          style={{
            height: `${(5 - d) * scale}px`,
            top: `calc(${cy} + ${(d - 1) * 8}px)`,
            borderRadius: `${3 * scale}px`,
            background: `linear-gradient(${side === 'player' ? '270deg' : '90deg'}, ${color}, ${color}44, transparent)`,
            boxShadow: `0 0 ${10 * scale}px ${glow}`,
          }}
          initial={{ left: fromX, width: 0, opacity: 0 }}
          animate={{ left: [fromX, cx], width: [`${80 * scale}px`, 0], opacity: [0, 1, 0] }}
          transition={{ duration: dur * 0.55, delay: d * 0.05, ease: 'easeIn' }}
        />
      ))}
      {/* Impact burst */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)`,
          boxShadow: `0 0 ${20 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 80 * scale, 0], height: [0, 80 * scale, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.24, delay: dur * 0.5 }}
      />
    </>
  );
}

// ─── 11. THUNDER_STOMP entrance: stomp down from above ───────────────────────

function EntranceThunderStomp({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);

  return (
    <>
      {/* Electric pillar descending */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: cx, transform: 'translateX(-50%)',
          width: `${14 * scale}px`,
          background: `linear-gradient(180deg, transparent, ${color}bb, ${color}, ${color}bb, transparent)`,
          boxShadow: `0 0 ${16 * scale}px ${glow}`,
        }}
        initial={{ top: '2%', height: 0, opacity: 0 }}
        animate={{ top: ['2%', cy], height: [`${80 * scale}px`, 0], opacity: [0, 0.9, 0] }}
        transition={{ duration: dur * 0.65, ease: 'easeIn' }}
      />
      {/* Ground shockwave rings */}
      {Array.from({ length: 3 }).map((_, r) => (
        <motion.div
          key={`stomp-${r}`}
          className="absolute pointer-events-none"
          style={{
            left: cx,
            bottom: '26%',
            transform: 'translate(-50%, 50%)',
            borderRadius: '50%',
            border: `${2 * scale}px solid ${color}`,
            boxShadow: `0 0 ${8 * scale}px ${glow}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{
            width:  [0, (70 + r * 44) * scale],
            height: [0, (20 + r * 12) * scale],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 0.4, delay: dur * 0.6 + r * 0.07, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// ─── 12. SHADOW_CLAW entrance: phase in through shadow tear marks ─────────────

function EntranceShadowClaw({ side, color, glow, scale, dur }: {
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
              height: `${(30 + (t % 3) * 10) * scale}px`,
              background: `linear-gradient(180deg, transparent, ${color}, ${color}, transparent)`,
              boxShadow: `0 0 ${12 * scale}px ${glow}, 0 0 ${5 * scale}px #000`,
              rotate: `${(t % 2 === 0 ? 1 : -1) * 15}deg`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0.7, 0], opacity: [0, 1, 0.8, 0] }}
            transition={{ duration: dur * 0.85, delay: t * 0.06, ease: 'easeOut' }}
          />
        );
      })}
      {/* Darkness pulse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          boxShadow: `0 0 ${28 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 110 * scale, 0], height: [0, 110 * scale, 0], opacity: [0, 0.7, 0] }}
        transition={{ duration: dur * 0.8, delay: 0.08, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 13. VOID_PULL entrance: emerge from a void portal ───────────────────────

function EntranceVoidPull({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const particleCount = Math.round(10 * scale);

  return (
    <>
      {/* Collapsing singularity rings (portal opening) */}
      {[0, 1].map((w) => (
        <motion.div
          key={`portal-${w}`}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: cx, top: cy,
            transform: 'translate(-50%,-50%)',
            borderColor: color,
            boxShadow: `0 0 ${14 * scale}px ${glow}`,
          }}
          initial={{ width: (130 + w * 60) * scale, height: (130 + w * 60) * scale, opacity: 0.8 }}
          animate={{ width: [null, 0], height: [null, 0], opacity: [0.8, 0.9, 0] }}
          transition={{ duration: dur * 0.65, delay: w * 0.07, ease: 'easeIn' }}
        />
      ))}
      {/* Particles pulled inward from orbit */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360;
        const dist = (40 + (i % 4) * 12) * scale;
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
            transition={{ duration: dur * 0.6, delay: 0.04 + i * 0.016, ease: 'easeIn' }}
          />
        );
      })}
      {/* Explosion ring after emerging */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: cy,
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${color}99 0%, transparent 70%)`,
          boxShadow: `0 0 ${38 * scale}px ${glow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 140 * scale, 0], height: [0, 140 * scale, 0], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.3, delay: dur * 0.65, ease: 'easeOut' }}
      />
    </>
  );
}

// ─── 14. ECLIPSE_BEAM entrance: revealed by sweeping beam ────────────────────

function EntranceEclipseBeam({ side, color, glow, scale, dur }: {
  side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const { cx, cy } = mythCenter(side);
  const startX = side === 'player' ? '-5%' : '105%';

  return (
    <>
      {/* Sweeping reveal beam */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[0, 1].map((w) => (
          <motion.line
            key={`ebeam-${w}`}
            x1={startX} y1={`${50 + w * 3}%`}
            x2={cx} y2={cy}
            stroke={w === 0 ? '#fff' : color}
            strokeWidth={(4 - w * 1.5) * scale * 2}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${(12 - w * 3) * scale}px ${color})` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: dur * 0.75, delay: w * 0.04, times: [0, 0.5, 1] }}
          />
        ))}
      </svg>
      {/* Eclipse corona at myth position */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: cx, top: cy, transform: 'translate(-50%,-50%)', zIndex: 2 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 0.34, delay: dur * 0.6 }}
      >
        <div style={{
          width: `${55 * scale}px`, height: `${55 * scale}px`,
          borderRadius: '50%',
          background: '#000',
          border: `${2.5 * scale}px solid ${color}`,
          boxShadow: `0 0 ${22 * scale}px ${glow}, 0 0 ${44 * scale}px ${glow}`,
        }} />
      </motion.div>
    </>
  );
}

// ─── Entrance dispatcher ──────────────────────────────────────────────────────

function EntranceEffect({ strike, side, color, glow, scale, dur }: {
  strike: StrikeType; side: 'player' | 'wild'; color: string; glow: string; scale: number; dur: number;
}) {
  const p = { side, color, glow, scale, dur };
  switch (strike) {
    case 'CLAW_SLASH':     return <EntranceClawSlash    {...p} />;
    case 'BITE_LUNGE':     return <EntranceBiteLunge    {...p} />;
    case 'FLAME_BURST':    return <EntranceFlameBurst   {...p} />;
    case 'ROCK_SMASH':     return <EntranceRockSmash    {...p} />;
    case 'TIDAL_SLAM':     return <EntranceTidalSlam    {...p} />;
    case 'BUBBLE_SHOT':    return <EntranceBubbleShot   {...p} />;
    case 'VINE_WHIP':      return <EntranceVineWhip     {...p} />;
    case 'SPORE_BOMB':     return <EntranceSporeBomb    {...p} />;
    case 'LIGHTNING_BOLT': return <EntranceLightningBolt {...p} />;
    case 'SPARK_DASH':     return <EntranceSparkDash    {...p} />;
    case 'THUNDER_STOMP':  return <EntranceThunderStomp {...p} />;
    case 'SHADOW_CLAW':    return <EntranceShadowClaw   {...p} />;
    case 'VOID_PULL':      return <EntranceVoidPull     {...p} />;
    case 'ECLIPSE_BEAM':   return <EntranceEclipseBeam  {...p} />;
  }
}

// ─── Exported props ───────────────────────────────────────────────────────────

export interface MythEntranceProps {
  mythId: string;
  element: string;
  rarity?: string;
  side: 'player' | 'wild';
  onComplete: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MythEntranceCinematic({
  mythId, element, rarity = 'C', side, onComplete,
}: MythEntranceProps) {
  const el  = getEl(element);
  const rc  = getRarityCfg(rarity);
  const strike = getStrike(mythId);
  const { cx, cy } = mythCenter(side);

  useEffect(() => {
    const t = setTimeout(onComplete, rc.timeout);
    return () => clearTimeout(t);
  }, [onComplete, rc.timeout]);

  return (
    <AnimatePresence>
      <motion.div
        key={`entrance-${mythId}-${side}`}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 25 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* S-rarity screen flash + radial aura */}
        {rarity === 'S' && <SReveal cx={cx} color={el.color} glow={el.glow} />}

        {/* Archetype-specific entrance effect */}
        <EntranceEffect
          strike={strike}
          side={side}
          color={el.color}
          glow={el.glow}
          scale={rc.scale}
          dur={rc.dur}
        />

        {/* Rarity aura rings (B–S) */}
        {rc.rings > 0 && (
          <AuraRings
            cx={cx} cy={cy}
            color={el.color}
            glow={el.glow}
            count={rc.rings}
            scale={rc.scale}
          />
        )}

        {/* Rarity label flash (A–S) */}
        {rc.aura && (
          <motion.div
            className="absolute pointer-events-none select-none"
            style={{
              left: cx, top: `calc(${cy} - ${50 * rc.scale}px)`,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 4,
            }}
            initial={{ opacity: 0, scale: 0.4, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 0.8], y: [8, 0, 0, -6] }}
            transition={{ duration: rc.dur * 1.6, times: [0, 0.18, 0.65, 1] }}
          >
            <p
              className="font-black tracking-widest uppercase leading-none"
              style={{
                fontSize: rarity === 'S' ? '1.2rem' : '0.9rem',
                color: el.color,
                textShadow: `0 0 16px ${el.glow}, 0 0 32px ${el.glow}`,
                letterSpacing: '0.14em',
              }}
            >
              {rarity === 'S' ? '★ S-CLASS ★' : '★★ A-CLASS ★★'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
