import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import {
  useGetPlayerCollection,
  useUpdatePlayerTeam,
} from '@workspace/api-client-react';
import { getElementColors, getRarityColors } from '@/lib/element-colors';
import { getMonsterEmoji } from '@/lib/monster-emoji';
import { ArrowLeft, Plus, X, Swords, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { getGetPlayerTeamQueryKey } from '@workspace/api-client-react';

// ─── Element → Tailwind gradient map ────────────────────────────────────────
const ELEMENT_GRADIENT: Record<string, string> = {
  Fire:   'from-red-900/80 via-orange-900/60 to-amber-900/40',
  Water:  'from-blue-900/80 via-cyan-900/60 to-sky-900/40',
  Earth:  'from-yellow-900/80 via-amber-800/60 to-lime-900/40',
  Storm:  'from-purple-900/80 via-violet-900/60 to-indigo-900/40',
  Shadow: 'from-gray-900/90 via-zinc-900/70 to-slate-900/50',
  Nature: 'from-green-900/80 via-emerald-900/60 to-teal-900/40',
  Electric:'from-yellow-900/80 via-amber-900/60 to-orange-900/40',
};

// ─── Stat bar ────────────────────────────────────────────────────────────────
function StatBar({
  label, value, max = 160, color,
}: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-mono text-white/50 w-6 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[9px] font-mono text-white/60 w-5 text-right">{value}</span>
    </div>
  );
}

// ─── Myth Card ───────────────────────────────────────────────────────────────
interface MythCardProps {
  monster: any;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function MythCard({ monster, selected, disabled, onToggle }: MythCardProps) {
  const elem   = getElementColors(monster.species?.element ?? '');
  const rarity = getRarityColors(monster.species?.rarity ?? 'C');
  const gradClass = ELEMENT_GRADIENT[monster.species?.element ?? ''] ?? 'from-gray-900/80 via-slate-900/60 to-zinc-900/40';
  const emoji  = getMonsterEmoji(monster.species?.id ?? monster.speciesId ?? '', monster.species?.element ?? '');

  return (
    <motion.button
      onClick={() => !disabled && onToggle()}
      whileHover={!disabled ? { scale: 1.04, rotateY: 4, rotateX: -3 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        boxShadow: selected
          ? `0 0 0 2px ${elem.primary}, 0 0 20px ${elem.glow}, 0 4px 16px rgba(0,0,0,0.5)`
          : '0 4px 16px rgba(0,0,0,0.4)',
        perspective: '600px',
        transformStyle: 'preserve-3d',
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected ? 0.4 : 1,
      }}
      className={`
        relative w-full rounded-2xl border text-left overflow-hidden
        bg-gradient-to-b ${gradClass}
        transition-[border-color,opacity] duration-200
        ${selected ? 'border-white/30' : 'border-white/10'}
      `}
    >
      {/* Selected overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="sel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${elem.glow} 0%, transparent 70%)` }}
          />
        )}
      </AnimatePresence>

      {/* ✓ check mark */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: elem.primary }}
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
              <path d="M2 6 L5 9 L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji hero */}
      <div className="pt-4 pb-1 text-center text-4xl drop-shadow-lg">{emoji}</div>

      {/* Info */}
      <div className="px-2.5 pb-3">
        {/* Name + level */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-bold text-white truncate">
            {monster.nickname ?? monster.species?.name ?? '???'}
          </span>
          <span className="text-[9px] text-white/50 ml-1 shrink-0">Lv{monster.level}</span>
        </div>

        {/* Element + Rarity badges */}
        <div className="flex gap-1 mb-2">
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: `${elem.primary}33`, color: elem.primary, border: `1px solid ${elem.primary}44` }}
          >
            {monster.species?.element}
          </span>
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: `${rarity.color}22`, color: rarity.color, border: `1px solid ${rarity.color}44` }}
          >
            {rarity.label}
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-0.5">
          <StatBar label="HP"  value={monster.maxHp}     color="#22C55E" />
          <StatBar label="ATK" value={monster.attack}    color={elem.primary} />
          <StatBar label="DEF" value={monster.defense}   color="#60A5FA" />
          <StatBar label="SPD" value={monster.speed}     color="#A78BFA" />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Team Slot ───────────────────────────────────────────────────────────────
function TeamSlot({ monster, slot, onRemove }: { monster?: any; slot: number; onRemove: () => void }) {
  const elem = monster ? getElementColors(monster.species?.element ?? '') : null;
  const emoji = monster ? getMonsterEmoji(monster.species?.id ?? monster.speciesId ?? '', monster.species?.element ?? '') : null;

  return (
    <motion.div
      layout
      className="relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200"
      style={{
        minHeight: 96,
        flex: 1,
        borderColor: elem ? elem.primary + '88' : 'rgba(255,255,255,0.1)',
        background: elem
          ? `linear-gradient(135deg, ${elem.primary}22 0%, ${elem.secondary}11 100%)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: elem ? `0 0 14px ${elem.glow}` : 'none',
      }}
    >
      {monster ? (
        <>
          <motion.button
            onClick={onRemove}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/70 flex items-center justify-center transition-colors z-10"
          >
            <X size={10} />
          </motion.button>
          <div className="text-3xl mb-1">{emoji}</div>
          <div className="text-[10px] font-semibold text-white/90 text-center px-1 leading-tight">
            {monster.nickname ?? monster.species?.name}
          </div>
          <div className="text-[9px] text-white/40 mt-0.5">Lv{monster.level}</div>
        </>
      ) : (
        <>
          <Plus size={18} className="text-white/20 mb-1" />
          <span className="text-[9px] text-white/25">Slot {slot + 1}</span>
        </>
      )}
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function TeamBuilder() {
  const [, navigate] = useLocation();
  const { player } = useGameStore();
  const queryClient = useQueryClient();

  // Fetch full collection
  const { data: collection = [], isLoading } = useGetPlayerCollection(player?.id ?? '', {
    query: { enabled: !!player?.id },
  });

  // Track selected IDs (max 3)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { mutateAsync: saveTeam } = useUpdatePlayerTeam();

  // Init selection from inTeam field
  useEffect(() => {
    if (collection.length > 0 && selectedIds.length === 0) {
      const inTeam = collection
        .filter((m: any) => m.inTeam)
        .sort((a: any, b: any) => (a.teamSlot ?? 99) - (b.teamSlot ?? 99))
        .map((m: any) => m.id)
        .slice(0, 3);
      if (inTeam.length > 0) setSelectedIds(inTeam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.length]);

  const selectedMonsters = selectedIds
    .map((id) => collection.find((m: any) => m.id === id))
    .filter(Boolean);

  const elements = ['all', ...Array.from(new Set(collection.map((m: any) => m.species?.element).filter(Boolean))) as string[]];

  const filtered = filter === 'all'
    ? collection
    : collection.filter((m: any) => m.species?.element === filter);

  function toggleMonster(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max reached
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

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% -20%, #1e1040 0%, #080c1a 55%, #000510 100%)',
      }}
    >
      {/* Stars bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
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
              {selectedIds.length}/3 myths selected
            </p>
          </div>
        </div>

        {/* ── Team Slots ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Your Team</p>
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
            animate={{ opacity: selectedIds.length > 0 ? 1 : 0.4, scale: selectedIds.length > 0 ? 1 : 0.98 }}
          >
            <Button
              onClick={handleEnterWorld}
              disabled={selectedIds.length === 0 || saving}
              className="w-full h-12 text-base font-bold rounded-xl relative overflow-hidden"
              style={{
                background: selectedIds.length > 0
                  ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)'
                  : 'rgba(255,255,255,0.05)',
                boxShadow: selectedIds.length > 0 ? '0 0 24px rgba(124,58,237,0.5)' : 'none',
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2"><span className="animate-spin">⚙</span> Saving…</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Swords size={18} />
                  Enter World
                  <ArrowLeft size={16} className="rotate-180" />
                </span>
              )}
            </Button>
          </motion.div>
        </div>

        {/* ── Element filter ──────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {elements.map((el) => {
            const colors = el !== 'all' ? getElementColors(el) : null;
            return (
              <button
                key={el}
                onClick={() => setFilter(el)}
                className="text-xs px-3 py-1 rounded-full border transition-all font-semibold capitalize"
                style={{
                  borderColor: filter === el ? (colors?.primary ?? '#a78bfa') : 'rgba(255,255,255,0.12)',
                  backgroundColor: filter === el ? `${colors?.primary ?? '#a78bfa'}22` : 'rgba(255,255,255,0.04)',
                  color: filter === el ? (colors?.primary ?? '#a78bfa') : 'rgba(255,255,255,0.5)',
                }}
              >
                {el === 'all' ? '✨ All' : el}
              </button>
            );
          })}
        </div>

        {/* ── Collection Grid ─────────────────────────────────────────────── */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            Collection
            {collection.length > 0 && (
              <span className="ml-2 text-white/25 normal-case">{collection.length} myths</span>
            )}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-white/30">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                ✦
              </motion.div>
              <span className="ml-3">Loading collection…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🌑</div>
              <p className="text-white/40 text-sm">
                {collection.length === 0
                  ? "You haven't captured any myths yet. Explore the world to find them."
                  : 'No myths match this filter.'}
              </p>
              {collection.length === 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/game')}
                >
                  Go Explore
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {filtered.map((monster: any) => (
                <motion.div
                  key={monster.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                >
                  <MythCard
                    monster={monster}
                    selected={selectedIds.includes(monster.id)}
                    disabled={selectedIds.length >= 3 && !selectedIds.includes(monster.id)}
                    onToggle={() => toggleMonster(monster.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Footer hint */}
        {selectedIds.length >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-amber-400/70 mt-4"
          >
            Team is full — remove a myth to swap it out
          </motion.p>
        )}
      </div>
    </div>
  );
}
