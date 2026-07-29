import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useGameStore } from '@/store/game-store';
import { getToken } from '@/lib/auth';
import { getElementColors } from '@/lib/element-colors';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { ELEMENT_ICON } from '@/lib/type-chart';
import { Swords, Users, Trophy, ChevronLeft, Shield, Zap } from 'lucide-react';
import { QUALITY_LABEL, RARITY_COLORS } from '@/lib/element-colors';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Opponent {
  player: {
    id: string;
    username: string;
    avatarColor: string;
    explorerLevel: number;
    explorerRank: string;
    battlesWon: number;
    pvpWins: number;
  };
  leadMyth: {
    id: string;
    speciesId: string;
    speciesName: string;
    element: string;
    rarity: string;
    level: number;
    currentHp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  teamSize: number;
}

// ─── Opponent Card ────────────────────────────────────────────────────────────

function OpponentCard({
  opp,
  onChallenge,
  challenging,
}: {
  opp: Opponent;
  onChallenge: (id: string) => void;
  challenging: string | null;
}) {
  const el = getElementColors(opp.leadMyth.element);
  const rar = RARITY_COLORS[opp.leadMyth.rarity];
  const isBusy = challenging !== null;

  return (
    <div
      className="rounded-2xl p-4 border transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(10,10,25,0.9), rgba(5,5,18,0.95))',
        borderColor: el.primary + '44',
        boxShadow: `0 2px 20px rgba(0,0,0,0.6), 0 0 8px ${el.glow}`,
      }}
    >
      {/* Player header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0"
          style={{ background: opp.player.avatarColor }}
        >
          {opp.player.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{opp.player.username}</p>
          <p className="text-[11px] text-white/50">
            Lv.{opp.player.explorerLevel} · {opp.player.explorerRank}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-yellow-400/80 font-mono">🏆 {opp.player.pvpWins}W</p>
          <p className="text-[10px] text-white/40 font-mono">⚔ {opp.player.battlesWon}</p>
        </div>
      </div>

      {/* Lead myth */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl mb-3"
        style={{
          background: el.primary + '12',
          border: `1px solid ${el.primary}33`,
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: el.primary + '20', border: `1px solid ${el.primary}44` }}
        >
          <MythSvgIcon
            mythId={opp.leadMyth.speciesId}
            element={opp.leadMyth.element}
            rarity={opp.leadMyth.rarity}
            size={44}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{opp.leadMyth.speciesName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: el.primary + '30', color: el.primary, border: `1px solid ${el.primary}44` }}>
              {ELEMENT_ICON[opp.leadMyth.element]} {opp.leadMyth.element}
            </span>
            {rar && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: rar.color + '20', color: rar.color, border: `1px solid ${rar.color}44` }}>
                {QUALITY_LABEL[opp.leadMyth.rarity] ?? opp.leadMyth.rarity}
              </span>
            )}
            <span className="text-[10px] text-white/40 font-mono">Lv.{opp.leadMyth.level}</span>
          </div>
          {/* Stats mini-bar */}
          <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-white/40">
            <span>⚔ {opp.leadMyth.attack}</span>
            <span>🛡 {opp.leadMyth.defense}</span>
            <span>💨 {opp.leadMyth.speed}</span>
            <span className="ml-auto">Team: {opp.teamSize}</span>
          </div>
        </div>
      </div>

      {/* Challenge button */}
      <button
        onClick={() => onChallenge(opp.player.id)}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
        style={{
          background: isBusy && challenging === opp.player.id
            ? 'linear-gradient(135deg, #713F12, #92400E)'
            : `linear-gradient(135deg, ${el.primary}44, ${el.primary}22)`,
          border: `1.5px solid ${el.primary}55`,
          color: el.primary,
          boxShadow: `0 0 12px ${el.glow}`,
        }}
      >
        {challenging === opp.player.id ? (
          <><span className="animate-spin">⚔</span> Starting battle…</>
        ) : (
          <><Swords size={15} /> Challenge</>
        )}
      </button>
    </div>
  );
}

// ─── Main PvP Page ────────────────────────────────────────────────────────────

export default function PvPPage() {
  const [, setLocation] = useLocation();
  const { player, startBattle } = useGameStore();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenging, setChallenging] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authH = useCallback(() => ({ Authorization: `Bearer ${getToken()}` }), []);

  const fetchOpponents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/pvp/opponents', { headers: authH() });
      if (!r.ok) throw new Error('Failed to load opponents');
      const data = await r.json();
      setOpponents(data);
    } catch {
      setError('Could not load opponents. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  }, [authH]);

  useEffect(() => { fetchOpponents(); }, [fetchOpponents]);

  const handleChallenge = async (opponentId: string) => {
    if (!player) return;
    setChallenging(opponentId);
    setError(null);
    try {
      const r = await fetch(`/api/pvp/challenge/${opponentId}`, {
        method: 'POST',
        headers: authH(),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error ?? 'Challenge failed');
      }
      const { battleId } = await r.json();
      // Fetch full battle data then activate it
      const br = await fetch(`/api/battles/${battleId}`, { headers: authH() });
      if (!br.ok) throw new Error('Could not load battle');
      const battleData = await br.json();
      startBattle(battleId, battleData);
      setLocation('/game');
    } catch (err) {
      setError((err as Error).message);
      setChallenging(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: 'linear-gradient(180deg, #05050F 0%, #0A0A1E 60%, #0D0D28 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-white/08">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => setLocation('/game')} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <Swords size={22} className="text-red-400" />
            <h1 className="text-xl font-black text-white">PvP Arena</h1>
          </div>
          <span className="ml-auto text-[11px] text-white/30 font-mono">Challenge other trainers</span>
        </div>

        {/* Info banner */}
        <div className="mt-3 p-3 rounded-xl flex items-start gap-3 text-[11px] text-white/50"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Shield size={14} className="text-cyan-400 shrink-0 mt-0.5" />
          <span>Challenge uses your lead myth vs their lead myth. Damage is based on actual stats — level, rarity, attack and defense all matter.</span>
        </div>
      </div>

      {/* Player's own stats */}
      {player && (
        <div className="mx-4 mt-3 p-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
          <Zap size={14} className="text-cyan-400 shrink-0" />
          <div className="flex gap-4 text-[11px]">
            <span className="text-cyan-300 font-bold">{player.username}</span>
            <span className="text-white/50">Lv.{player.explorerLevel}</span>
            <span className="text-yellow-400/80">🏆 {(player as any).pvpWins ?? 0} PvP wins</span>
            <span className="text-white/40">⚔ {(player as any).battlesWon ?? 0} battles</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 mt-4">

        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-white/50" />
          <span className="text-xs text-white/50 font-mono uppercase tracking-wider">Available challengers</span>
          <button onClick={fetchOpponents} className="ml-auto text-[10px] text-white/30 hover:text-white/60 transition-colors font-mono">
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-sm text-white/40">Loading challengers…</p>
          </div>
        ) : opponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-4xl opacity-30">⚔</div>
            <p className="text-sm text-white/40">No challengers available right now.</p>
            <p className="text-xs text-white/25">Other players need at least one myth in their team.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opponents.map((opp) => (
              <OpponentCard
                key={opp.player.id}
                opp={opp}
                onChallenge={handleChallenge}
                challenging={challenging}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
