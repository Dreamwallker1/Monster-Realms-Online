import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft, Trophy, Users, Clock, Zap, Crown,
  CheckCircle2, AlertTriangle, RefreshCw, Swords,
  ChevronUp, ChevronDown, Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';
import { getToken } from '@/lib/auth';
import { connectPhantom, getConnectedWallet, isPhantomInstalled } from '@/lib/phantom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Standing {
  playerId: string;
  username: string | null;
  avatarColor: string | null;
  wins: number;
  losses: number;
  byes: number;
  finalRank: number | null;
  payoutLamports: number;
  payoutClaimed: boolean;
}

interface TournamentData {
  tournament: {
    id: string;
    date: string;
    status: string;
    currentRound: number;
    totalRounds: number;
    prizePoolLamports: number;
    prizePoolSol: number;
    startHour: number;
  };
  isRegistered: boolean;
  myStats: Standing | null;
  standings: Standing[];
  currentMatches: Array<{
    id: string; round: number;
    player1Id: string; player2Id: string;
    winnerId: string | null; status: string;
  }>;
  prizeDistribution: Array<{ from: number; to: number; pct: number }>;
}

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-400 font-black text-base">🥇</span>;
  if (rank === 2) return <span className="text-slate-300 font-black text-base">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-black text-base">🥉</span>;
  return <span className="text-slate-500 font-bold text-sm">#{rank}</span>;
}

function getPrizeLabel(rank: number, dist: TournamentData['prizeDistribution'], pool: number): string | null {
  const d = dist.find(x => rank >= x.from && rank <= x.to);
  if (!d || pool <= 0) return null;
  const lamports = Math.floor(pool * d.pct);
  return `${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
}

function getStatusColor(status: string) {
  if (status === 'registration') return { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60A5FA' };
  if (status === 'active')       return { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)', text: '#34D399' };
  return                                { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#818CF8' };
}

// ─── Countdown to start time ──────────────────────────────────────────────────

function useNextTournamentCountdown(startHour: number) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(startHour, 0, 0, 0);
      if (target <= now) target.setUTCDate(target.getUTCDate() + 1);
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startHour]);
  return label;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Tournament() {
  const { player } = useGameStore();
  const [data, setData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [wallet, setWallet] = useState<string | null>(getConnectedWallet());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4500);
  };

  const authH = useCallback(() => ({ Authorization: `Bearer ${getToken()}` }), []);

  const fetchData = useCallback(async () => {
    if (!player) return;
    try {
      const r = await fetch('/api/tournament/today', { headers: authH() });
      if (r.ok) setData(await r.json());
    } catch {}
    setLoading(false);
  }, [player, authH]);

  useEffect(() => { fetchData(); }, [fetchData]);
  // Refresh every 30s when active
  useEffect(() => {
    if (data?.tournament.status !== 'active') return;
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [data?.tournament.status, fetchData]);

  const countdown = useNextTournamentCountdown(data?.tournament.startHour ?? 20);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const r = await fetch('/api/tournament/register', { method: 'POST', headers: authH() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Failed');
      showToast('Registered! Tournament starts at ' + (data?.tournament.startHour ?? 20) + ':00 UTC');
      fetchData();
    } catch (e: any) { showToast(e.message, false); }
    finally { setRegistering(false); }
  };

  const handleClaim = async () => {
    if (!wallet && isPhantomInstalled()) {
      try {
        const addr = await connectPhantom();
        setWallet(addr);
        await fetch('/api/shop/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authH() },
          body: JSON.stringify({ walletAddress: addr }),
        });
      } catch (e: any) { showToast(e.message, false); return; }
    }
    setClaiming(true);
    try {
      const r = await fetch('/api/tournament/claim-payout', { method: 'POST', headers: authH() });
      const d = await r.json();
      if (d.pending) { showToast('Payout is being processed — check back soon!', true); return; }
      if (!r.ok) throw new Error(d.error ?? 'Failed');
      showToast(`🎉 ${d.sol?.toFixed(4)} SOL sent to your wallet!`);
      fetchData();
    } catch (e: any) { showToast(e.message, false); }
    finally { setClaiming(false); }
  };

  const t = data?.tournament;
  const sc = t ? getStatusColor(t.status) : null;

  return (
    <div className="min-h-[100dvh] relative overflow-hidden" style={{
      background: 'linear-gradient(160deg, #040612 0%, #080b22 50%, #040612 100%)',
    }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 110%, rgba(245,158,11,0.12) 0%, transparent 70%)',
      }} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/game">
            <Button variant="ghost" size="icon"><ArrowLeft size={22} /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{
              background: 'linear-gradient(90deg, #F59E0B, #FBBF24, #FDE68A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ⚔️ Arena
            </h1>
            <p className="text-xs text-slate-400 font-mono">Daily PvP Tournament · SOL Prize Pool</p>
          </div>
        </div>

        {t && sc && (
          <div className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
            {t.status === 'registration' ? '📋 Registration' : t.status === 'active' ? '⚔️ Live' : '✅ Ended'}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw size={32} className="animate-spin text-amber-400" />
        </div>
      ) : !data ? (
        <div className="text-center py-24 text-slate-500">Failed to load tournament</div>
      ) : (
        <div className="relative z-10 px-5 pb-8 space-y-5">

          {/* ── Prize Pool card ──────────────────────────────────────────────── */}
          <div className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(20,14,4,0.98), rgba(40,24,4,0.97))',
            border: '1.5px solid rgba(245,158,11,0.35)',
            boxShadow: '0 0 40px rgba(245,158,11,0.12)',
          }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                🏆
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-400/70 uppercase tracking-wider font-bold mb-0.5">Today's Prize Pool</p>
                <p className="text-3xl font-black text-amber-400">
                  {t!.prizePoolSol.toFixed(4)} <span className="text-lg">SOL</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">30% of today's orb purchases · {data.standings.length} players registered</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 mb-1">
                  {t!.status === 'registration' ? 'Starts in' : t!.status === 'active' ? `Round ${t!.currentRound}/${t!.totalRounds}` : 'Finished'}
                </p>
                {t!.status === 'registration' && (
                  <p className="font-mono text-sm font-bold text-amber-300">{countdown}</p>
                )}
                {t!.status === 'active' && (
                  <div className="flex gap-1 items-center justify-end">
                    {Array.from({ length: t!.totalRounds }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: i < t!.currentRound ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Prize Distribution ───────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Top 3', pct: '10%', emoji: '🥇', color: '#F59E0B' },
              { label: 'Rank 4–7', pct: '5%', emoji: '🥈', color: '#94A3B8' },
              { label: 'Rank 8–20', pct: '3%', emoji: '🎖️', color: '#92400E' },
            ].map(row => (
              <div key={row.label} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl mb-1">{row.emoji}</div>
                <div className="font-black" style={{ color: row.color }}>{row.pct}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{row.label}</div>
              </div>
            ))}
          </div>

          {/* ── My status / action card ───────────────────────────────────────── */}
          {t!.status === 'registration' && (
            <div className="rounded-2xl p-5" style={{
              background: data.isRegistered
                ? 'rgba(52,211,153,0.08)'
                : 'linear-gradient(135deg, rgba(14,20,40,0.98), rgba(8,12,28,0.99))',
              border: data.isRegistered ? '1.5px solid rgba(52,211,153,0.35)' : '1.5px solid rgba(255,255,255,0.1)',
            }}>
              {data.isRegistered ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-400">You're registered!</p>
                    <p className="text-xs text-slate-400">Tournament starts at {t!.startHour}:00 UTC · Results are automatic</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-white mb-0.5">Enter today's tournament</p>
                    <p className="text-xs text-slate-400">Free entry · Registration closes at {t!.startHour}:00 UTC</p>
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #B45309, #F59E0B)',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(245,158,11,0.35)',
                    }}
                  >
                    {registering ? <RefreshCw size={15} className="animate-spin" /> : '⚔️ Enter'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* My stats during/after tournament */}
          {data.myStats && t!.status !== 'registration' && (
            <div className="rounded-2xl p-5" style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1.5px solid rgba(245,158,11,0.3)',
            }}>
              <p className="text-xs text-amber-400/70 uppercase tracking-wider font-bold mb-3">Your Performance</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{data.myStats.wins}</div>
                  <div className="text-[10px] text-slate-500">WINS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400">{data.myStats.losses}</div>
                  <div className="text-[10px] text-slate-500">LOSSES</div>
                </div>
                {data.myStats.finalRank && (
                  <div className="text-center">
                    <div className="text-2xl font-black text-amber-400">#{data.myStats.finalRank}</div>
                    <div className="text-[10px] text-slate-500">RANK</div>
                  </div>
                )}
                {data.myStats.payoutLamports > 0 && (
                  <div className="flex-1 text-right">
                    <div className="text-sm font-black text-amber-400">
                      {(data.myStats.payoutLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL
                    </div>
                    <div className="text-[10px] text-slate-500">YOUR PRIZE</div>
                  </div>
                )}
              </div>

              {/* Claim button */}
              {t!.status === 'completed' && data.myStats.payoutLamports > 0 && !data.myStats.payoutClaimed && (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="mt-4 w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #B45309, #F59E0B)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(245,158,11,0.35)',
                  }}
                >
                  {claiming
                    ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" /> Sending…</span>
                    : <span className="flex items-center justify-center gap-2"><Coins size={14} /> Claim {(data.myStats.payoutLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                  }
                </button>
              )}
              {t!.status === 'completed' && data.myStats.payoutClaimed && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm font-bold justify-center">
                  <CheckCircle2 size={16} /> Payout claimed!
                </div>
              )}
            </div>
          )}

          {/* ── Standings ────────────────────────────────────────────────────── */}
          {data.standings.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{
              background: 'rgba(10,12,28,0.98)',
              border: '1.5px solid rgba(255,255,255,0.08)',
            }}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <Trophy size={15} className="text-amber-400" /> Standings
                </span>
                <button onClick={fetchData} className="text-slate-500 hover:text-white transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {data.standings.map((s, idx) => {
                  const rank = s.finalRank ?? (idx + 1);
                  const prizeLabel = getPrizeLabel(rank, data.prizeDistribution, t!.prizePoolLamports);
                  const isMe = s.playerId === player?.id;
                  return (
                    <div
                      key={s.playerId}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ background: isMe ? 'rgba(245,158,11,0.06)' : undefined }}
                    >
                      <div className="w-8 text-center shrink-0">
                        <RankBadge rank={rank} />
                      </div>
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white"
                        style={{ background: s.avatarColor ?? '#6c63ff' }}
                      >
                        {(s.username ?? '?')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isMe ? 'text-amber-300' : 'text-white'}`}>
                          {s.username ?? 'Unknown'} {isMe ? '(you)' : ''}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {s.wins}W · {s.losses}L{s.byes > 0 ? ` · ${s.byes} bye` : ''}
                        </p>
                      </div>
                      {prizeLabel && t!.prizePoolLamports > 0 && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-amber-400">{prizeLabel}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.standings.length === 0 && t!.status === 'registration' && (
            <div className="text-center py-10 text-slate-500">
              <Swords size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold">No players registered yet</p>
              <p className="text-sm mt-1">Be the first to enter today's tournament</p>
            </div>
          )}
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold"
          style={{
            background: toast.ok ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
            boxShadow: toast.ok ? '0 0 24px rgba(16,185,129,0.5)' : '0 0 24px rgba(239,68,68,0.5)',
            color: '#fff',
          }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
