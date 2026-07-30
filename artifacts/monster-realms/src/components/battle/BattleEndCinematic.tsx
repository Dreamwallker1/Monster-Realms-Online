import { motion } from 'framer-motion';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { getElementColors } from '@/lib/element-colors';

// ─── Shared particle / rain data ─────────────────────────────────────────────

const WIN_PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * 360;
  const dist  = 68 + (i % 5) * 24;
  const cols  = ['#FDE047', '#FBBF24', '#FB923C', '#F59E0B', '#FCD34D', '#FACC15', '#FDE68A'];
  return { id: i, angle, dist, size: 6 - (i % 3), delay: (i % 8) * 0.048, color: cols[i % cols.length] };
});

const CAPTURE_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  dist: 60 + (i % 4) * 20,
  size: 5 - (i % 2),
  delay: (i % 6) * 0.055,
}));

const DEFEAT_RAIN = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: (i / 22) * 100,
  delay: ((i * 37) % 15) * 0.09,
  dur: 0.85 + (i % 4) * 0.22,
  h: 16 + (i % 5) * 9,
}));

const DEFEAT_MSGS = [
  'Every champion falls before they rise.',
  'Heal your myths and return stronger.',
  'The next battle is yours, trainer.',
];

// ─── Props ────────────────────────────────────────────────────────────────────

type LogEntry = { actor: string; damageDealt: number | null; critical: boolean; description?: string };

interface BattleEndProps {
  status: 'won' | 'lost' | 'captured' | 'fled';
  isPvp?: boolean;
  onComplete?: () => void;
  // Wild battle rewards
  expReward?: number;
  coinReward?: number;
  // Wild / opponent myth
  wildMythId?: string;
  wildElement?: string;
  wildRarity?: string;
  wildName?: string;
  // Player myth (needed for PvP matchup display)
  playerMythId?: string;
  playerMythName?: string;
  playerMythElement?: string;
  playerMythRarity?: string;
  playerHpPct?: number;   // 0–100
  totalRounds?: number;
  battleLog?: LogEntry[];
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function BattleEndCinematic({
  status, isPvp, onComplete,
  expReward, coinReward,
  wildMythId, wildElement, wildRarity, wildName,
  playerMythId, playerMythName, playerMythElement, playerMythRarity,
  playerHpPct, totalRounds, battleLog,
}: BattleEndProps) {
  // PvP battles get their own dedicated screen
  if (isPvp && (status === 'won' || status === 'lost')) {
    return (
      <PvPEndScreen
        status={status}
        onComplete={onComplete ?? (() => {})}
        playerMythId={playerMythId ?? ''}
        playerMythName={playerMythName ?? 'Your Myth'}
        playerMythElement={playerMythElement ?? 'Fire'}
        playerMythRarity={playerMythRarity ?? 'C'}
        wildMythId={wildMythId ?? ''}
        wildElement={wildElement ?? 'Fire'}
        wildRarity={wildRarity ?? 'C'}
        wildName={wildName ?? 'Opponent Myth'}
        battleLog={battleLog ?? []}
        playerHpPct={playerHpPct ?? 0}
        totalRounds={totalRounds ?? 1}
      />
    );
  }

  if (status === 'won')      return <VictoryScreen expReward={expReward} coinReward={coinReward} />;
  if (status === 'captured') return (
    <CaptureScreen
      mythId={wildMythId ?? ''}
      element={wildElement ?? 'Fire'}
      rarity={wildRarity ?? 'C'}
      name={wildName ?? 'Myth'}
    />
  );
  if (status === 'lost') return <DefeatScreen />;
  if (status === 'fled') return <FledScreen />;
  return null;
}

// ─── PvP End Screen ───────────────────────────────────────────────────────────

interface PvPEndProps {
  status: 'won' | 'lost';
  onComplete: () => void;
  playerMythId: string;
  playerMythName: string;
  playerMythElement: string;
  playerMythRarity: string;
  wildMythId: string;
  wildElement: string;
  wildRarity: string;
  wildName: string;
  battleLog: LogEntry[];
  playerHpPct: number;
  totalRounds: number;
}

function PvPEndScreen({
  status, onComplete,
  playerMythId, playerMythName, playerMythElement, playerMythRarity,
  wildMythId, wildElement, wildRarity, wildName,
  battleLog, playerHpPct, totalRounds,
}: PvPEndProps) {
  const isWin = status === 'won';

  // ── Stats computed from battle log ──────────────────────────────────────
  const playerDamage = battleLog
    .filter(e => e.actor === 'player' && (e.damageDealt ?? 0) > 0)
    .reduce((s, e) => s + (e.damageDealt ?? 0), 0);
  const damageTaken = battleLog
    .filter(e => e.actor === 'wild' && (e.damageDealt ?? 0) > 0)
    .reduce((s, e) => s + (e.damageDealt ?? 0), 0);
  const critCount = battleLog.filter(e => e.actor === 'player' && e.critical).length;

  // Extract opponent trainer name from first log description
  // Format: "PvP Battle! You challenged {username}'s {MythName} (Lv.X)!"
  const firstDesc = battleLog[0]?.description ?? '';
  const nameMatch = firstDesc.match(/You challenged (.+?)'s/);
  const opponentTrainerName = nameMatch?.[1] ?? 'Opponent';

  const playerEl = getElementColors(playerMythElement);
  const wildEl   = getElementColors(wildElement);

  const accentColor = isWin ? '#FDE047' : '#FCA5A5';
  const accentGlow  = isWin ? 'rgba(253,224,71,0.9)' : 'rgba(239,68,68,0.7)';
  const accentBg    = isWin ? 'rgba(245,158,11,0.18)' : 'rgba(127,29,29,0.38)';
  const borderColor = isWin ? 'rgba(245,158,11,0.32)' : 'rgba(239,68,68,0.28)';

  const STATS = [
    { icon: '⚔', label: 'Damage Dealt',  value: playerDamage,               color: '#F87171' },
    { icon: '🛡', label: 'Damage Taken',  value: damageTaken,                color: '#60A5FA' },
    { icon: '⭐', label: 'Critical Hits', value: critCount,                  color: '#FBBF24' },
    { icon: '🔄', label: 'Turns Fought',  value: totalRounds,                color: '#A78BFA' },
    { icon: '💪', label: 'HP Remaining',  value: `${Math.round(Math.max(0, playerHpPct))}%`, color: '#34D399' },
  ];

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ zIndex: 15, fontFamily: 'var(--font-mono, monospace)' }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${accentBg} 0%, rgba(0,0,0,0.94) 65%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      />

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full"
        style={{
          maxWidth: 340,
          margin: '0 16px',
          background: 'rgba(6,6,18,0.96)',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 22,
          boxShadow: `0 0 50px ${isWin ? 'rgba(245,158,11,0.14)' : 'rgba(239,68,68,0.12)'}, 0 24px 60px rgba(0,0,0,0.7)`,
          overflow: 'hidden',
        }}
        initial={{ y: 40, opacity: 0, scale: 0.93 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.48, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* ── Header band ──────────────────────────────────────────────── */}
        <div
          className="px-5 pt-5 pb-4 text-center"
          style={{
            background: isWin
              ? 'linear-gradient(180deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)'
              : 'linear-gradient(180deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {/* Label */}
          <p style={{ fontSize: 9, letterSpacing: '0.5em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
            ⚔ Arena Result ⚔
          </p>

          {/* VICTORY / DEFEATED */}
          <motion.div
            style={{
              fontSize: 40, fontWeight: 900, letterSpacing: '0.18em', lineHeight: 1,
              marginTop: 8, color: accentColor,
              textShadow: `0 0 28px ${accentGlow}, 0 4px 12px rgba(0,0,0,0.98)`,
            }}
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.42, delay: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {isWin ? 'VICTORY' : 'DEFEATED'}
          </motion.div>

          {/* Sub-line */}
          <motion.p
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', marginTop: 5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {isWin ? '── Outstanding battle, trainer ──' : '── Regroup and fight back ──'}
          </motion.p>
        </div>

        {/* ── Myth matchup ─────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center px-5 py-4 gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {/* Player myth */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: playerEl.primary + '1A',
                border: `1.5px solid ${playerEl.primary}50`,
                boxShadow: `0 0 16px ${playerEl.glow}22`,
              }}
            >
              <MythSvgIcon mythId={playerMythId} element={playerMythElement} rarity={playerMythRarity} size={44} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.2 }}>
              {playerMythName}
            </p>
            <span
              style={{
                fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: playerEl.primary,
                background: playerEl.primary + '18',
                border: `1px solid ${playerEl.primary}40`,
                borderRadius: 4, padding: '2px 6px',
              }}
            >
              YOU
            </span>
          </div>

          {/* Center VS + result icon */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 20,
              }}
            >
              {isWin ? '🏆' : '💀'}
            </div>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.15em' }}>VS</p>
          </div>

          {/* Opponent myth */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: wildEl.primary + '1A',
                border: `1.5px solid ${wildEl.primary}50`,
                boxShadow: `0 0 16px ${wildEl.glow}22`,
              }}
            >
              <MythSvgIcon mythId={wildMythId} element={wildElement} rarity={wildRarity} size={44} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.2 }}>
              {wildName}
            </p>
            <span
              style={{
                fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: wildEl.primary,
                background: wildEl.primary + '18',
                border: `1px solid ${wildEl.primary}40`,
                borderRadius: 4, padding: '2px 6px',
                maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              title={opponentTrainerName}
            >
              {opponentTrainerName}
            </span>
          </div>
        </motion.div>

        {/* ── Battle stats ─────────────────────────────────────────────── */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex items-center gap-3 py-2"
              style={{
                borderBottom: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
            >
              <span style={{ width: 20, textAlign: 'center', fontSize: 14 }}>{s.icon}</span>
              <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
                {s.label}
              </span>
              <motion.span
                style={{ fontSize: 14, fontWeight: 700, color: s.color, letterSpacing: '0.05em' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.62 + i * 0.07 }}
              >
                {s.value}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* ── Continue button ───────────────────────────────────────────── */}
        <motion.div
          className="px-4 py-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
            style={{
              background: isWin
                ? 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(234,179,8,0.15))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.22), rgba(185,28,28,0.12))',
              border: `1.5px solid ${isWin ? 'rgba(245,158,11,0.50)' : 'rgba(239,68,68,0.40)'}`,
              color: accentColor,
              boxShadow: `0 0 20px ${isWin ? 'rgba(245,158,11,0.16)' : 'rgba(239,68,68,0.12)'}`,
              letterSpacing: '0.18em',
            }}
          >
            CONTINUE →
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}

// ─── Victory Screen (wild battle) ────────────────────────────────────────────

function VictoryScreen({ expReward, coinReward }: { expReward?: number; coinReward?: number }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 15, fontFamily: 'var(--font-mono, monospace)' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(245,158,11,0.22) 0%, rgba(0,0,0,0.88) 70%)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      />

      {/* Spinning light rays */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: '50%', top: '42%', x: '-50%', y: '-50%', width: 700, height: 700 }}
        animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 30, 60, 90, 120, 150].map((deg, i) => (
          <div key={i} className="absolute" style={{
            left: '50%', top: '50%', width: '100%', height: 2,
            transform: `translate(-50%,-50%) rotate(${deg}deg)`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(253,224,71,0.22) 42%, rgba(251,191,36,0.30) 50%, rgba(253,224,71,0.22) 58%, transparent 100%)',
          }} />
        ))}
      </motion.div>

      {/* Gold particles burst */}
      {WIN_PARTICLES.map(p => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, background: p.color, left: '50%', top: '40%', boxShadow: `0 0 8px ${p.color}` }}
          initial={{ x: -p.size / 2, y: -p.size / 2, scale: 0, opacity: 0 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.dist - p.size / 2,
            y: Math.sin((p.angle * Math.PI) / 180) * p.dist - p.size / 2,
            scale: [0, 1.8, 1.1, 0], opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.1, delay: 0.2 + p.delay, ease: 'easeOut' }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div style={{ fontSize: 66, lineHeight: 1 }}
          initial={{ scale: 0, rotate: -25 }} animate={{ scale: [0, 1.45, 1], rotate: [-25, 8, 0] }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.34, 1.56, 0.64, 1] }}>🏆</motion.div>

        <motion.div style={{
          fontSize: 54, fontWeight: 900, letterSpacing: '0.15em', lineHeight: 1, marginTop: 14,
          color: '#FDE047', textShadow: '0 0 30px rgba(253,224,71,0.95), 0 0 70px rgba(245,158,11,0.55), 0 4px 12px rgba(0,0,0,0.98)',
        }} initial={{ y: -50, opacity: 0, scale: 0.55 }} animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.42, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}>VICTORY</motion.div>

        <motion.div style={{ fontSize: 10, letterSpacing: '0.45em', color: 'rgba(253,224,71,0.55)', marginTop: 8, textTransform: 'uppercase' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }}>
          ─── Excellent work, trainer ───
        </motion.div>

        {(expReward || coinReward) && (
          <motion.div className="flex gap-3 mt-5"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.75 }}>
            {expReward && (
              <div className="px-4 py-2 rounded-full text-sm font-bold"
                style={{ background: 'rgba(34,211,238,0.15)', border: '1.5px solid rgba(34,211,238,0.45)', color: '#67E8F9', boxShadow: '0 0 14px rgba(34,211,238,0.2)' }}>
                +{expReward} EXP
              </div>
            )}
            {coinReward && (
              <div className="px-4 py-2 rounded-full text-sm font-bold"
                style={{ background: 'rgba(253,224,71,0.15)', border: '1.5px solid rgba(253,224,71,0.40)', color: '#FDE047', boxShadow: '0 0 14px rgba(253,224,71,0.25)' }}>
                +{coinReward} 🪙
              </div>
            )}
          </motion.div>
        )}

        <motion.div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(253,224,71,0.35)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <div style={{ width: 50, height: 1, background: 'rgba(253,224,71,0.3)' }} />
          <span style={{ fontSize: 16 }}>⚔</span>
          <div style={{ width: 50, height: 1, background: 'rgba(253,224,71,0.3)' }} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Defeat Screen ────────────────────────────────────────────────────────────

function DefeatScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 15, fontFamily: 'var(--font-mono, monospace)' }}>
      <motion.div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(120,20,20,0.45) 0%, rgba(0,0,0,0.90) 70%)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }} />

      {DEFEAT_RAIN.map(r => (
        <motion.div key={r.id} className="absolute pointer-events-none"
          style={{ left: `${r.x}%`, width: 1, height: r.h, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}
          initial={{ y: '-5%', opacity: 0 }} animate={{ y: '110%', opacity: [0, 0.55, 0.55, 0] }}
          transition={{ duration: r.dur, delay: r.delay, repeat: Infinity, repeatDelay: (r.id % 3) * 0.28, ease: 'linear' }} />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        <motion.div style={{ fontSize: 58, lineHeight: 1, filter: 'grayscale(0.3) brightness(0.85)' }}
          initial={{ scale: 0.35, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}>💀</motion.div>

        <motion.div style={{
          fontSize: 46, fontWeight: 900, letterSpacing: '0.15em', lineHeight: 1, marginTop: 14,
          color: '#FCA5A5', textShadow: '0 0 22px rgba(239,68,68,0.7), 0 0 50px rgba(239,68,68,0.25), 0 4px 10px rgba(0,0,0,0.98)',
        }} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}>DEFEATED</motion.div>

        <motion.div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.35, delay: 0.62 }}>
          <div style={{ width: 55, height: 1, background: 'rgba(252,165,165,0.3)' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(252,165,165,0.5)' }} />
          <div style={{ width: 55, height: 1, background: 'rgba(252,165,165,0.3)' }} />
        </motion.div>

        <div className="mt-5 space-y-2.5">
          {DEFEAT_MSGS.map((msg, i) => (
            <motion.div key={i}
              style={{ fontSize: i === 0 ? 13 : 11, color: i === 0 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.38)', letterSpacing: '0.05em', lineHeight: 1.5 }}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.72 + i * 0.22 }}>{msg}</motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Capture Screen ───────────────────────────────────────────────────────────

function CaptureScreen({ mythId, element, rarity, name }: { mythId: string; element: string; rarity: string; name: string }) {
  const elColors = getElementColors(element);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 15, fontFamily: 'var(--font-mono, monospace)' }}>
      <motion.div className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 45%, ${elColors.glow}28 0%, rgba(0,0,0,0.88) 72%)` }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />

      <motion.div className="absolute pointer-events-none rounded-full"
        style={{ width: 200, height: 200, left: '50%', top: '38%', x: '-50%', y: '-50%', border: `1.5px solid ${elColors.primary}40` }}
        animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute pointer-events-none rounded-full"
        style={{ width: 145, height: 145, left: '50%', top: '38%', x: '-50%', y: '-50%', border: `1px solid ${elColors.primary}28`, boxShadow: `0 0 22px ${elColors.glow}30` }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.15, 1], opacity: [0, 0.8, 0.5] }}
        transition={{ duration: 0.55, delay: 0.2 }} />

      {CAPTURE_PARTICLES.map(p => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, background: elColors.primary, left: '50%', top: '38%', boxShadow: `0 0 6px ${elColors.glow}` }}
          initial={{ x: -p.size / 2, y: -p.size / 2, scale: 0, opacity: 0 }}
          animate={{ x: Math.cos((p.angle * Math.PI) / 180) * p.dist - p.size / 2, y: Math.sin((p.angle * Math.PI) / 180) * p.dist - p.size / 2, scale: [0, 1.6, 0.9, 0], opacity: [0, 1, 0.9, 0] }}
          transition={{ duration: 0.9, delay: 0.25 + p.delay, ease: 'easeOut' }} />
      ))}

      <motion.div style={{ position: 'relative', zIndex: 2 }}
        initial={{ scale: 0, y: 18 }} animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.52, delay: 0.22, ease: [0.34, 1.56, 0.64, 1] }}>
        <MythSvgIcon mythId={mythId} element={element} rarity={rarity} size={104} />
      </motion.div>

      <motion.div style={{
        fontSize: 50, fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1, marginTop: 14,
        color: '#34D399', textShadow: '0 0 28px rgba(52,211,153,0.85), 0 0 55px rgba(52,211,153,0.3), 0 4px 10px rgba(0,0,0,0.98)',
      }} initial={{ y: -35, opacity: 0, scale: 0.65 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.42, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}>CAPTURED!</motion.div>

      <motion.div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', letterSpacing: '0.14em', marginTop: 8 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.62 }}>
        {name} joined your collection
      </motion.div>

      <motion.div className="mt-3 px-3 py-1 rounded-full text-xs font-bold"
        style={{ background: `${elColors.primary}22`, border: `1px solid ${elColors.primary}55`, color: elColors.primary, letterSpacing: '0.2em', textTransform: 'uppercase' }}
        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.85 }}>
        {element} · {rarity === 'S' ? 'S-Tier' : rarity === 'A' ? 'A-Tier' : rarity === 'B' ? 'B-Tier' : 'Common'}
      </motion.div>
    </div>
  );
}

// ─── Fled Screen ──────────────────────────────────────────────────────────────

function FledScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 15, fontFamily: 'var(--font-mono, monospace)' }}>
      <motion.div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.72)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div style={{ fontSize: 54, lineHeight: 1 }}
          initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}>💨</motion.div>
        <motion.div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.68)', marginTop: 14 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.28 }}>Got away safely!</motion.div>
        <motion.div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', letterSpacing: '0.25em', marginTop: 6 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Better luck next encounter</motion.div>
      </div>
    </div>
  );
}
