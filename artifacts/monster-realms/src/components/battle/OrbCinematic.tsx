import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  orbType: 'Prism' | 'Luna' | 'Aether' | 'Void' | string;
  /** Rarity of the target myth — scales struggle count / shake intensity */
  targetRarity?: string;
  onComplete: () => void;
}

// ─── Shared constants ─────────────────────────────────────────────────────────

/** All four animations share the same 1 800 ms budget so battle pacing is uniform */
const TOTAL_MS = 1800;

/** How many wobble/struggle cycles before the orb settles — scales with rarity */
const STRUGGLE_COUNT: Record<string, number> = {
  C: 1,
  B: 2,
  A: 3,
  S: 4,
};

// Player side: orb launches from ~72% → 22% (wild myth is on left)
const FROM_X  = '72%';
const TO_X    = '22%';
const FROM_XN = 72;
const TO_XN   = 22;

// ─── 1. PRISM ─── prismatic rainbow spiral trail → white-flash capture ring ──

function PrismThrow({ struggles }: { struggles: number }) {
  const rainbowColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#DA77FF'];

  return (
    <>
      {/* ── Projectile core ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '44%', transform: 'translate(-50%,-50%)',
          width: 28, height: 28, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, white 0%, #22D3EE 50%, #3B82F6 100%)',
          boxShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.4)',
        }}
        initial={{ left: FROM_X, scale: 0.2, opacity: 0 }}
        animate={{
          left: [FROM_X, TO_X, `calc(${TO_X} + ${struggles * 3}px)`, TO_X,
                 struggles > 1 ? `calc(${TO_X} - ${struggles * 2}px)` : TO_X, TO_X],
          scale:   [0.2, 1.1, 0.8, 0.8, 0.8, 0],
          opacity: [0, 1, 1, 1, 1, 0],
        }}
        transition={{ duration: TOTAL_MS / 1000, times: [0, 0.38, 0.52, 0.66, 0.80, 1.0], ease: 'easeInOut' }}
      />

      {/* ── Rainbow spiral rings around orb ── */}
      {rainbowColors.map((color, i) => (
        <motion.div
          key={`prism-ring-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: '44%', transform: 'translate(-50%,-50%)',
            width: 36 + i * 8, height: 36 + i * 8, borderRadius: '50%',
            border: `2px solid ${color}`,
            boxShadow: `0 0 8px ${color}`,
          }}
          initial={{ left: FROM_X, opacity: 0, rotate: i * 72 }}
          animate={{
            left: [FROM_X, TO_X],
            opacity: [0, 0.9, 0.6, 0],
            rotate: [i * 72, i * 72 + 360 * 2],
          }}
          transition={{ duration: (TOTAL_MS * 0.44) / 1000, delay: i * 0.025, ease: 'easeIn' }}
        />
      ))}

      {/* ── Prismatic trail sparks ── */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`prism-spark-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            top: `${40 + (i % 5) * 3}%`,
            width: 5, height: 5,
            background: rainbowColors[i % rainbowColors.length],
            boxShadow: `0 0 8px ${rainbowColors[i % rainbowColors.length]}`,
          }}
          initial={{ left: FROM_X, opacity: 0, scale: 0 }}
          animate={{ left: [FROM_X, TO_X], opacity: [0, 0.9, 0.5, 0], scale: [0, 1.2, 0.5, 0] }}
          transition={{ duration: (TOTAL_MS * 0.42) / 1000, delay: 0.02 + i * 0.025, ease: 'easeIn' }}
        />
      ))}

      {/* ── White-flash capture ring ── */}
      {Array.from({ length: 3 }).map((_, r) => (
        <motion.div
          key={`prism-cap-${r}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
            border: `${3 - r}px solid ${r === 0 ? 'white' : rainbowColors[r]}`,
            boxShadow: `0 0 20px rgba(255,255,255,0.6)`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.9 }}
          animate={{ width: [0, (80 + r * 60)], height: [0, (80 + r * 60)], opacity: [0.9, 0] }}
          transition={{ duration: 0.5, delay: (TOTAL_MS * 0.4) / 1000 + r * 0.07, ease: 'easeOut' }}
        />
      ))}

      {/* ── Struggle wobble flash ── */}
      {Array.from({ length: struggles }).map((_, s) => (
        <motion.div
          key={`prism-wobble-${s}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
            width: 40, height: 40,
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.22, delay: (TOTAL_MS * 0.52) / 1000 + s * 0.14 }}
        />
      ))}
    </>
  );
}

// ─── 2. LUNA ─── crescent-moon arc trajectory → silver moonbeam wrap ──────────

function LunaThrow({ struggles }: { struggles: number }) {
  const moonColor   = '#A78BFA';
  const silverColor = '#E2E8F0';

  return (
    <>
      {/* ── Crescent moon projectile ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '44%', transform: 'translate(-50%,-50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: 'transparent',
          border: `6px solid ${moonColor}`,
          boxShadow: `0 0 16px ${moonColor}, 0 0 30px rgba(167,139,250,0.5)`,
          // Crescent: inner circle masks half
          clipPath: 'ellipse(50% 100% at 70% 50%)',
        }}
        initial={{ left: FROM_X, scale: 0.1, opacity: 0, rotate: -30 }}
        animate={{
          left:    [FROM_X, `calc(${TO_X} + ${struggles * 4}px)`, TO_X],
          top:     ['44%', '30%', '44%'], // parabolic arc
          scale:   [0.1, 1.1, 0.9],
          opacity: [0, 1, 1],
          rotate:  [-30, 20, 0],
        }}
        transition={{ duration: (TOTAL_MS * 0.55) / 1000, ease: 'easeInOut' }}
      />

      {/* ── Star trail ── */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`luna-star-${i}`}
          className="absolute pointer-events-none font-bold"
          style={{
            fontSize: `${7 + (i % 3) * 4}px`,
            color: silverColor,
            textShadow: `0 0 6px ${moonColor}`,
          }}
          initial={{ left: FROM_X, top: `${36 + (i % 4) * 5}%`, opacity: 0 }}
          animate={{
            left: [FROM_X, `calc(${TO_X} + 0px)`],
            top:  [`${36 + (i % 4) * 5}%`, `${26 + (i % 4) * 7}%`, `${36 + (i % 4) * 5}%`],
            opacity: [0, 1, 0.4, 0],
            scale: [0, 1, 0.7, 0],
          }}
          transition={{ duration: (TOTAL_MS * 0.46) / 1000, delay: 0.04 + i * 0.03, ease: 'easeIn' }}
        >
          ✦
        </motion.div>
      ))}

      {/* ── Moonbeam wrap lines converging on wild ── */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * 360;
        const dist  = 50;
        return (
          <motion.div
            key={`luna-beam-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: TO_X, top: '44%',
              width: 2, height: dist,
              background: `linear-gradient(180deg, ${moonColor}, transparent)`,
              boxShadow: `0 0 6px ${moonColor}`,
              transformOrigin: '50% 100%',
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.5, delay: (TOTAL_MS * 0.42) / 1000 + i * 0.04, ease: 'easeOut' }}
          />
        );
      })}

      {/* ── Silver ripple rings ── */}
      {[0, 1, 2].map((r) => (
        <motion.div
          key={`luna-ripple-${r}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
            border: `2px solid ${r === 0 ? silverColor : moonColor}`,
            boxShadow: `0 0 12px ${moonColor}`,
          }}
          initial={{ width: 8, height: 8, opacity: 0.9 }}
          animate={{ width: [8, 80 + r * 50], height: [8, 80 + r * 50], opacity: [0.9, 0] }}
          transition={{ duration: 0.48, delay: (TOTAL_MS * 0.4) / 1000 + r * 0.09, ease: 'easeOut' }}
        />
      ))}

      {/* ── Struggle pulses ── */}
      {Array.from({ length: struggles }).map((_, s) => (
        <motion.div
          key={`luna-pulse-${s}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
            width: 36, height: 36,
            border: `3px solid ${moonColor}`,
            boxShadow: `0 0 14px ${moonColor}`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.8, 0.8], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.3, delay: (TOTAL_MS * 0.52) / 1000 + s * 0.16 }}
        />
      ))}
    </>
  );
}

// ─── 3. AETHER ─── dissolving energy wisps → ethereal shimmer cage ────────────

function AetherThrow({ struggles }: { struggles: number }) {
  const aetherColor = '#34D399';
  const aetherGlow  = 'rgba(52,211,153,0.5)';

  return (
    <>
      {/* ── Orb core ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '44%', transform: 'translate(-50%,-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, white, ${aetherColor} 60%, transparent)`,
          boxShadow: `0 0 18px ${aetherGlow}, 0 0 35px ${aetherGlow}`,
        }}
        initial={{ left: FROM_X, scale: 0.1, opacity: 0 }}
        animate={{
          left:    [FROM_X, TO_X],
          scale:   [0.1, 1, 0.7],
          opacity: [0, 0.9, 0.6],
        }}
        transition={{ duration: (TOTAL_MS * 0.4) / 1000, ease: 'easeIn' }}
      />

      {/* ── Dissolving wisps — scatter as orb travels ── */}
      {Array.from({ length: 14 }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <motion.div
            key={`aether-wisp-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${38 + (i % 6) * 3}%`,
              width: `${3 + (i % 3)}px`,
              height: `${12 + (i % 4) * 5}px`,
              borderRadius: '50% 50% 30% 30%',
              background: `linear-gradient(180deg, ${aetherColor}cc, transparent)`,
              boxShadow: `0 0 8px ${aetherGlow}`,
            }}
            initial={{ left: FROM_X, opacity: 0, scaleY: 0, rotate: side * 20 }}
            animate={{
              left:    [FROM_X, `calc(${TO_X} + ${side * (10 + i * 3)}px)`],
              opacity: [0, 0.9, 0],
              scaleY:  [0, 1, 0],
              rotate:  [side * 20, side * (40 + i * 8)],
            }}
            transition={{ duration: (TOTAL_MS * 0.5) / 1000, delay: 0.03 + i * 0.02, ease: 'easeInOut' }}
          />
        );
      })}

      {/* ── Shimmer cage bars at capture point ── */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={`aether-cage-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: TO_X, top: '44%',
            width: 2, height: 55,
            background: `linear-gradient(180deg, transparent, ${aetherColor}, transparent)`,
            boxShadow: `0 0 8px ${aetherGlow}`,
            transformOrigin: '50% 100%',
            transform: `translate(-50%, -100%) rotate(${deg}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 0.9, 0.7, 0] }}
          transition={{ duration: 0.55, delay: (TOTAL_MS * 0.36) / 1000 + i * 0.03, ease: 'easeOut' }}
        />
      ))}

      {/* ── Cage glow pulse ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${aetherColor}44 0%, transparent 70%)`,
          boxShadow: `0 0 30px ${aetherGlow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 100], height: [0, 100], opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.5, delay: (TOTAL_MS * 0.36) / 1000, ease: 'easeOut' }}
      />

      {/* ── Struggle wisps re-emerging ── */}
      {Array.from({ length: struggles }).map((_, s) => (
        <motion.div
          key={`aether-esc-${s}`}
          className="absolute pointer-events-none"
          style={{
            left: TO_X, top: '44%',
            width: 3, height: 20,
            background: `linear-gradient(180deg, ${aetherColor}, transparent)`,
            boxShadow: `0 0 6px ${aetherGlow}`,
            transform: `translate(-50%, -100%) rotate(${s * 45}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.25, delay: (TOTAL_MS * 0.5) / 1000 + s * 0.14 }}
        />
      ))}
    </>
  );
}

// ─── 4. VOID ─── dark singularity → void implosion + re-expansion ─────────────
//   Most dramatic: darkens screen, warps space, two-phase implosion/explosion

function VoidThrow({ struggles }: { struggles: number }) {
  const voidColor = '#C084FC';
  const voidGlow  = 'rgba(192,132,252,0.6)';
  const darkColor = '#0A000F';

  return (
    <>
      {/* ── Screen darkness that rolls in as orb travels ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at ${FROM_X} 50%, transparent 20%, ${darkColor}cc 100%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.7, 0.3, 0] }}
        transition={{ duration: TOTAL_MS / 1000, times: [0, 0.3, 0.55, 0.8, 1.0] }}
      />

      {/* ── Singularity orb ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '44%', transform: 'translate(-50%,-50%)',
          width: 30, height: 30, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${voidColor}66 0%, #0A000F 60%, black 100%)`,
          border: `2px solid ${voidColor}`,
          boxShadow: `0 0 24px ${voidGlow}, 0 0 50px rgba(192,132,252,0.3), inset 0 0 16px rgba(0,0,0,0.9)`,
        }}
        initial={{ left: FROM_X, scale: 0.1, opacity: 0 }}
        animate={{
          left:    [FROM_X, TO_X, `calc(${TO_X} + ${struggles * 5}px)`, TO_X],
          scale:   [0.1, 1.2, 1.0, 0],
          opacity: [0, 1, 1, 0],
          rotate:  [0, 720],
        }}
        transition={{ duration: (TOTAL_MS * 0.55) / 1000, times: [0, 0.45, 0.72, 1.0], ease: 'easeInOut' }}
      />

      {/* ── Space-warp distortion rings travelling with orb ── */}
      {[0, 1].map((r) => (
        <motion.div
          key={`void-warp-${r}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '44%', transform: 'translate(-50%,-50%)',
            border: `1px solid ${voidColor}66`,
            boxShadow: `0 0 10px ${voidGlow}`,
          }}
          initial={{ left: FROM_X, width: 50 + r * 30, height: 50 + r * 30, opacity: 0.7 }}
          animate={{
            left:    [FROM_X, TO_X],
            width:   [50 + r * 30, 20 + r * 10],
            height:  [50 + r * 30, 20 + r * 10],
            opacity: [0.7, 0],
          }}
          transition={{ duration: (TOTAL_MS * 0.42) / 1000, delay: r * 0.06, ease: 'easeIn' }}
        />
      ))}

      {/* ── Particles sucked toward orb as it flies ── */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const dist  = 60 + (i % 3) * 20;
        const startX = Math.cos((angle * Math.PI) / 180) * dist;
        const startY = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.div
            key={`void-suck-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: TO_X, top: '44%',
              width: 3 + (i % 3), height: 3 + (i % 3),
              background: voidColor,
              boxShadow: `0 0 4px ${voidColor}`,
            }}
            initial={{ x: startX, y: startY, opacity: 0.8 }}
            animate={{ x: [startX, 0], y: [startY, 0], opacity: [0.8, 0], scale: [1, 0] }}
            transition={{ duration: 0.38, delay: (TOTAL_MS * 0.28) / 1000 + i * 0.02, ease: 'easeIn' }}
          />
        );
      })}

      {/* ── PHASE 1: Void implosion — everything collapses inward ── */}
      {Array.from({ length: 3 }).map((_, r) => (
        <motion.div
          key={`void-impl-${r}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
            border: `${3 - r}px solid ${r === 0 ? voidColor : `${voidColor}88`}`,
            boxShadow: `0 0 14px ${voidGlow}`,
          }}
          initial={{ width: (120 + r * 50), height: (120 + r * 50), opacity: 0.8 }}
          animate={{ width: [120 + r * 50, 0], height: [120 + r * 50, 0], opacity: [0.8, 0] }}
          transition={{ duration: 0.32, delay: (TOTAL_MS * 0.48) / 1000 + r * 0.04, ease: 'easeIn' }}
        />
      ))}

      {/* ── PHASE 2: Re-expansion burst ── */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: TO_X, top: '44%', transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, ${voidColor}99 0%, ${voidColor}22 50%, transparent 100%)`,
          boxShadow: `0 0 60px ${voidGlow}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: [0, 200], height: [0, 200], opacity: [0, 1, 0] }}
        transition={{ duration: 0.4, delay: (TOTAL_MS * 0.62) / 1000, ease: 'easeOut' }}
      />
      {/* Void re-expansion ring shards */}
      {Array.from({ length: 8 }).map((_, i) => {
        const deg = (i / 8) * 360;
        const dx  = Math.cos((deg * Math.PI) / 180) * 60;
        const dy  = Math.sin((deg * Math.PI) / 180) * 60;
        return (
          <motion.div
            key={`void-shard-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: TO_X, top: '44%',
              width: 4, height: 16,
              background: `linear-gradient(180deg, ${voidColor}, transparent)`,
              boxShadow: `0 0 6px ${voidGlow}`,
              transformOrigin: '50% 0%',
              transform: `translate(-50%, -50%) rotate(${deg}deg)`,
            }}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], x: [0, dx], y: [0, dy] }}
            transition={{ duration: 0.38, delay: (TOTAL_MS * 0.63) / 1000 + i * 0.02, ease: 'easeOut' }}
          />
        );
      })}

      {/* ── Struggle flickers — void energy leaking out ── */}
      {Array.from({ length: struggles }).map((_, s) => (
        <motion.div
          key={`void-flicker-${s}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${TO_X} 44%, ${voidColor}33 0%, transparent 60%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.18, delay: (TOTAL_MS * 0.52) / 1000 + s * 0.15 }}
        />
      ))}
    </>
  );
}

// ─── Orb config ────────────────────────────────────────────────────────────────

const ORB_LABEL: Record<string, string> = {
  Prism:  '✦ Prism Orb',
  Luna:   '☽ Luna Orb',
  Aether: '◈ Aether Orb',
  Void:   '◉ Void Orb',
};

const ORB_BG: Record<string, string> = {
  Prism:  'rgba(34,211,238,0.12)',
  Luna:   'rgba(167,139,250,0.15)',
  Aether: 'rgba(52,211,153,0.12)',
  Void:   'rgba(192,132,252,0.10)',
};

const ORB_COLOR: Record<string, string> = {
  Prism:  '#22D3EE',
  Luna:   '#A78BFA',
  Aether: '#34D399',
  Void:   '#C084FC',
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function OrbCinematic({ orbType, targetRarity = 'C', onComplete }: Props) {
  const struggles = STRUGGLE_COUNT[targetRarity] ?? 1;
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label     = ORB_LABEL[orbType] ?? `${orbType} Orb`;
  const color     = ORB_COLOR[orbType] ?? '#94A3B8';

  useEffect(() => {
    timerRef.current = setTimeout(onComplete, TOTAL_MS);
    return () => { if (timerRef.current !== null) clearTimeout(timerRef.current); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="orb-cinematic"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 30 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background tint — matches orb color */}
        <motion.div
          className="absolute inset-0"
          style={{ background: ORB_BG[orbType] ?? 'rgba(148,163,184,0.1)', backdropFilter: 'brightness(0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: TOTAL_MS / 1000, times: [0, 0.08, 0.84, 1] }}
        />

        {/* Orb name badge */}
        <motion.div
          className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none"
          style={{ zIndex: 4 }}
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.8], y: [10, 0, 0, -8] }}
          transition={{ duration: TOTAL_MS / 1000, times: [0, 0.12, 0.65, 1] }}
        >
          <p
            className="font-black tracking-widest uppercase"
            style={{ fontSize: '1.15rem', color, textShadow: `0 0 20px ${color}, 0 0 40px ${color}` }}
          >
            {label}
          </p>
          <p className="text-xs text-white/50 mt-0.5 font-mono tracking-wider">Capture attempt</p>
        </motion.div>

        {/* Orb-specific animation layer */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {orbType === 'Prism'  && <PrismThrow  struggles={struggles} />}
          {orbType === 'Luna'   && <LunaThrow   struggles={struggles} />}
          {orbType === 'Aether' && <AetherThrow struggles={struggles} />}
          {orbType === 'Void'   && <VoidThrow   struggles={struggles} />}
          {/* Fallback for any unknown orb type */}
          {!['Prism', 'Luna', 'Aether', 'Void'].includes(orbType) && (
            <PrismThrow struggles={struggles} />
          )}
        </div>

        {/* Screen vignette flash at impact */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at ${TO_X} 50%, transparent 30%, ${color}22 100%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.4, delay: (TOTAL_MS * 0.38) / 1000 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
