import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  skillName: string;
  skillDesc?: string;
  element: string;
  power: number;
  attackerSide: 'player' | 'wild';
  isCritical?: boolean;
  onComplete: () => void;
}

// ─── Element configs ──────────────────────────────────────────────────────────

const EL_CONFIG: Record<string, {
  color: string; glow: string; bg: string;
  icon: string; particleCount: number; particleChar: string;
}> = {
  Fire:     { color: '#FF6B35', glow: 'rgba(255,107,53,0.55)', bg: 'rgba(180,40,10,0.35)', icon: '🔥', particleCount: 9, particleChar: '🔥' },
  Water:    { color: '#38BDF8', glow: 'rgba(56,189,248,0.55)', bg: 'rgba(3,105,161,0.35)', icon: '💧', particleCount: 6, particleChar: '💧' },
  Nature:   { color: '#4ADE80', glow: 'rgba(74,222,128,0.55)', bg: 'rgba(20,83,45,0.35)',  icon: '🌿', particleCount: 8, particleChar: '🍃' },
  Electric: { color: '#FDE047', glow: 'rgba(253,224,71,0.65)', bg: 'rgba(133,77,14,0.4)',  icon: '⚡', particleCount: 5, particleChar: '⚡' },
  Dark:     { color: '#C084FC', glow: 'rgba(192,132,252,0.55)', bg: 'rgba(59,7,100,0.5)',  icon: '🌑', particleCount: 8, particleChar: '✦'  },
};

const DEFAULT_EL = { color: '#94A3B8', glow: 'rgba(148,163,184,0.4)', bg: 'rgba(30,30,60,0.4)', icon: '✦', particleCount: 6, particleChar: '✦' };

// ─── Particle position helpers ────────────────────────────────────────────────

function getParticleStartX(side: 'player' | 'wild', i: number): string {
  // player attacks from right → particles start right-ish
  // wild attacks from left → particles start left-ish
  const base = side === 'player' ? 72 : 28;
  const spread = (i % 2 === 0 ? 1 : -1) * (i * 3);
  return `${base + spread}%`;
}

function getParticleEndX(side: 'player' | 'wild'): string {
  return side === 'player' ? '18%' : '78%';
}

function getParticleY(i: number): string {
  const positions = ['35%', '45%', '55%', '40%', '50%', '38%', '52%', '44%', '48%'];
  return positions[i % positions.length]!;
}

// ─── Element-specific effects ─────────────────────────────────────────────────

function FireEffect({ side }: { side: 'player' | 'wild' }) {
  const particles = Array.from({ length: 9 });
  return (
    <>
      {/* Expanding fire ring from attacker */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={`ring-${ring}`}
          className="absolute rounded-full border-2"
          style={{
            borderColor: ring === 0 ? '#FF6B35' : ring === 1 ? '#FB923C' : '#FCD34D',
            left: side === 'player' ? '65%' : '25%',
            top: '44%',
            transform: 'translate(-50%, -50%)',
            width: 20, height: 20,
            boxShadow: '0 0 12px #FF6B35',
          }}
          animate={{ width: [20, 200 + ring * 60], height: [20, 200 + ring * 60], opacity: [0.9, 0] }}
          transition={{ duration: 0.55, delay: ring * 0.08, ease: 'easeOut' }}
        />
      ))}
      {/* Ember particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg pointer-events-none"
          style={{ left: getParticleStartX(side, i), top: getParticleY(i), fontSize: `${10 + (i % 3) * 5}px` }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            left: [getParticleStartX(side, i), getParticleEndX(side)],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 0.8, 0],
            rotate: [0, (i % 2 === 0 ? 180 : -180)],
          }}
          transition={{ duration: 0.55, delay: 0.08 + i * 0.045, ease: 'easeIn' }}
        >
          🔥
        </motion.div>
      ))}
    </>
  );
}

function WaterEffect({ side }: { side: 'player' | 'wild' }) {
  return (
    <>
      {/* Ripple rings */}
      {[0, 1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-2"
          style={{
            borderColor: '#38BDF8',
            left: side === 'player' ? '65%' : '25%',
            top: '45%',
            transform: 'translate(-50%, -50%)',
            width: 16, height: 16,
            boxShadow: '0 0 10px #38BDF8',
          }}
          animate={{ width: [16, 220 + ring * 40], height: [16, 220 + ring * 40], opacity: [0.9, 0] }}
          transition={{ duration: 0.6, delay: ring * 0.1, ease: 'easeOut' }}
        />
      ))}
      {/* Water droplets */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: getParticleStartX(side, i), top: getParticleY(i), fontSize: `${14 + (i % 2) * 6}px` }}
          initial={{ opacity: 0 }}
          animate={{
            left: [getParticleStartX(side, i), getParticleEndX(side)],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.3, 0.6],
          }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: 'easeIn' }}
        >
          💧
        </motion.div>
      ))}
    </>
  );
}

function NatureEffect({ side }: { side: 'player' | 'wild' }) {
  return (
    <>
      {/* Swirl vine */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: side === 'player' ? '60%' : '30%',
          top: '42%',
          transform: 'translate(-50%, -50%)',
          fontSize: 60,
          filter: 'drop-shadow(0 0 12px #4ADE80)',
        }}
        initial={{ opacity: 0, scale: 0, rotate: -90 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 1.2, 0], rotate: [-90, 0, 90] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        🌿
      </motion.div>
      {/* Leaf particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: getParticleStartX(side, i), top: getParticleY(i), fontSize: `${12 + (i % 3) * 4}px` }}
          initial={{ opacity: 0 }}
          animate={{
            left: [getParticleStartX(side, i), getParticleEndX(side)],
            top: [getParticleY(i), `${30 + (i % 3) * 15}%`],
            opacity: [0, 1, 1, 0],
            rotate: [0, (i % 2 === 0 ? 360 : -360)],
          }}
          transition={{ duration: 0.55, delay: 0.05 + i * 0.05, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>
      ))}
    </>
  );
}

function ElectricEffect({ side }: { side: 'player' | 'wild' }) {
  // Lightning bolt SVG path across the screen
  const fromPct  = side === 'player' ? 72 : 18;
  const toPct    = side === 'player' ? 18 : 72;
  const midXa    = (fromPct + toPct) / 2 - 8;
  const midXb    = (fromPct + toPct) / 2 + 8;
  const pathD    = `M ${fromPct}% 48% L ${midXa}% 38% L ${midXb}% 55% L ${toPct}% 45%`;

  return (
    <>
      {/* SVG lightning bolt */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <motion.path
          d={pathD}
          stroke="#FDE047"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 8px #FDE047) drop-shadow(0 0 16px #FBBF24)' }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.45, times: [0, 0.4, 0.7, 1], ease: 'easeOut' }}
        />
        {/* Second thinner bolt for double-strike effect */}
        <motion.path
          d={`M ${fromPct}% 52% L ${midXa - 4}% 42% L ${midXb + 4}% 58% L ${toPct}% 48%`}
          stroke="#FEF08A"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px #FEF08A)' }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: 0.45, delay: 0.04, times: [0, 0.4, 0.7, 1] }}
        />
      </svg>
      {/* Spark particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none font-bold"
          style={{ left: getParticleStartX(side, i), top: getParticleY(i), fontSize: `${16 + (i % 2) * 8}px`, color: '#FDE047', textShadow: '0 0 8px #FDE047' }}
          initial={{ opacity: 0 }}
          animate={{
            left: [getParticleStartX(side, i), getParticleEndX(side)],
            opacity: [0, 1, 0.8, 0],
            scale: [0.5, 1.4, 0.8],
          }}
          transition={{ duration: 0.38, delay: 0.06 + i * 0.04 }}
        >
          ⚡
        </motion.div>
      ))}
    </>
  );
}

function DarkEffect({ side }: { side: 'player' | 'wild' }) {
  const cx = side === 'player' ? '62%' : '32%';
  return (
    <>
      {/* Void collapse then explode */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx, top: '44%',
          transform: 'translate(-50%, -50%)',
          width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(192,132,252,0.7) 0%, rgba(88,28,135,0.4) 50%, transparent 100%)',
          boxShadow: '0 0 40px rgba(192,132,252,0.6)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 0.2, 1.4, 0], opacity: [0, 0.9, 0.7, 0] }}
        transition={{ duration: 0.65, times: [0, 0.2, 0.6, 1], ease: 'easeOut' }}
      />
      {/* Shadow particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: cx, top: '44%', transform: 'translate(-50%, -50%)', fontSize: `${12 + (i % 3) * 5}px` }}
          animate={{
            left: [cx, `${parseInt(cx) + (Math.cos((i / 8) * Math.PI * 2) * 25)}%`],
            top: ['44%', `${44 + Math.sin((i / 8) * Math.PI * 2) * 15}%`],
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.03 }}
        >
          ✦
        </motion.div>
      ))}
      {/* Dark wave to target */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`p${i}`}
          className="absolute pointer-events-none"
          style={{ left: getParticleStartX(side, i), top: getParticleY(i), fontSize: '14px', color: '#C084FC', textShadow: '0 0 10px #A855F7' }}
          initial={{ opacity: 0 }}
          animate={{
            left: [getParticleStartX(side, i), getParticleEndX(side)],
            opacity: [0, 1, 0.7, 0],
            scale: [0.5, 1.3, 0.5],
          }}
          transition={{ duration: 0.55, delay: 0.12 + i * 0.06 }}
        >
          ✦
        </motion.div>
      ))}
    </>
  );
}

function ElementEffect({ element, side }: { element: string; side: 'player' | 'wild' }) {
  if (element === 'Fire')     return <FireEffect side={side} />;
  if (element === 'Water')    return <WaterEffect side={side} />;
  if (element === 'Nature')   return <NatureEffect side={side} />;
  if (element === 'Electric') return <ElectricEffect side={side} />;
  if (element === 'Dark')     return <DarkEffect side={side} />;
  return <FireEffect side={side} />;
}

// ─── Impact flash ─────────────────────────────────────────────────────────────

function ImpactFlash({ side, color }: { side: 'player' | 'wild'; color: string }) {
  // flash on the DEFENDER's side
  const defenderX = side === 'player' ? '22%' : '68%';
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: defenderX, top: '44%',
        transform: 'translate(-50%, -50%)',
        width: 100, height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle, white 0%, ${color}88 40%, transparent 100%)`,
        boxShadow: `0 0 30px ${color}`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 2.5, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.35, delay: 0.5, ease: 'easeOut' }}
    />
  );
}

// ─── Main cinematic component ─────────────────────────────────────────────────

export default function SkillCinematic({
  skillName, skillDesc, element, power, attackerSide, isCritical, onComplete,
}: Props) {
  const el = EL_CONFIG[element] ?? DEFAULT_EL;

  useEffect(() => {
    const t = setTimeout(onComplete, 920);
    return () => clearTimeout(t);
  }, [onComplete]);

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
          style={{ background: el.bg, backdropFilter: 'brightness(0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, times: [0, 0.1, 0.8, 1] }}
        />

        {/* ── Skill name — centered ── */}
        <motion.div
          className="absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none"
          style={{ zIndex: 2 }}
          initial={{ opacity: 0, scale: 0.4, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 0.8], y: [10, 0, 0, -8] }}
          transition={{ duration: 0.9, times: [0, 0.15, 0.65, 1] }}
        >
          <p
            className="font-black tracking-widest uppercase text-xl leading-none"
            style={{ color: el.color, textShadow: `0 0 20px ${el.glow}, 0 0 40px ${el.glow}`, letterSpacing: '0.15em' }}
          >
            {el.icon} {skillName}
          </p>
          {isCritical && (
            <p className="text-yellow-300 text-sm font-bold mt-1 tracking-widest animate-pulse">
              ★ CRITICAL HIT! ★
            </p>
          )}
          {skillDesc && (
            <p className="text-white/60 text-xs mt-1 font-mono">{skillDesc}</p>
          )}
        </motion.div>

        {/* ── Power badge ── */}
        <motion.div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 2 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0.8, 0], scale: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1] }}
        >
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: el.color, borderColor: el.color + '55', background: el.color + '18' }}
          >
            PWR {power}
          </span>
        </motion.div>

        {/* ── Element-specific particle effect ── */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <ElementEffect element={element} side={attackerSide} />
        </div>

        {/* ── Impact flash on defender ── */}
        <ImpactFlash side={attackerSide} color={el.color} />

        {/* ── Screen edge vignette flash ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${attackerSide === 'player' ? '20%' : '80%'} 50%, transparent 30%, ${el.color}33 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.35, delay: 0.5 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
