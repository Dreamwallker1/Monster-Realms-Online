import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Wallet, Zap, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';
import {
  isPhantomInstalled,
  connectPhantom,
  getConnectedWallet,
  sendSolPayment,
} from '@/lib/phantom';
import { getToken } from '@/lib/auth';

// ─── Orb config (mirrors backend) ────────────────────────────────────────────

const ORB_TIERS = [
  {
    type: 'Prism',
    tier: 'C',
    name: 'Prism Orb',
    sol: 0.025,
    dailyFree: 5,
    capture: '×1.0 capture rate',
    desc: 'Reliable orbs for Common myth encounters.',
    colors: { from: '#6B7280', to: '#9CA3AF', glow: 'rgba(156,163,175,0.5)', border: '#9CA3AF55', particle: '#D1D5DB' },
    emoji: '⬜',
  },
  {
    type: 'Luna',
    tier: 'B',
    name: 'Luna Orb',
    sol: 0.050,
    dailyFree: 3,
    capture: '×1.6 capture rate',
    desc: 'Moonlit power for Uncommon myths.',
    colors: { from: '#059669', to: '#34D399', glow: 'rgba(52,211,153,0.5)', border: '#34D39955', particle: '#6EE7B7' },
    emoji: '🟢',
  },
  {
    type: 'Aether',
    tier: 'A',
    name: 'Aether Orb',
    sol: 0.075,
    dailyFree: 2,
    capture: '×2.5 capture rate',
    desc: 'Rare elemental energy that bends reality.',
    colors: { from: '#4F46E5', to: '#818CF8', glow: 'rgba(129,140,248,0.55)', border: '#818CF855', particle: '#A5B4FC' },
    emoji: '🟣',
  },
  {
    type: 'Void',
    tier: 'S',
    name: 'Void Orb',
    sol: 0.100,
    dailyFree: 1,
    capture: '×4.0 capture rate',
    desc: 'Near-guaranteed capture. Legendary power.',
    colors: { from: '#92400E', to: '#F59E0B', glow: 'rgba(245,158,11,0.65)', border: '#F59E0B66', particle: '#FDE68A' },
    emoji: '⭐',
  },
] as const;

type OrbType = typeof ORB_TIERS[number]['type'];

// ─── Animated orb sphere ──────────────────────────────────────────────────────

function OrbSphere({ tier, size = 80, pulse = false }: { tier: typeof ORB_TIERS[number]; size?: number; pulse?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${pulse ? 'animate-pulse' : ''}`}
      style={{
        width: size, height: size, flexShrink: 0,
        background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35) 0%, ${tier.colors.from} 35%, ${tier.colors.to} 75%, ${tier.colors.from}88 100%)`,
        boxShadow: `0 0 ${size * 0.4}px ${tier.colors.glow}, 0 0 ${size * 0.7}px ${tier.colors.glow}44, inset 0 -4px 10px rgba(0,0,0,0.3), inset 0 3px 8px rgba(255,255,255,0.2)`,
        border: `2px solid ${tier.colors.border}`,
        animation: 'battle-float 3s ease-in-out infinite',
      }}
    >
      {/* Shine */}
      <div className="absolute" style={{
        top: '15%', left: '18%', width: '32%', height: '22%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 100%)',
      }} />
      {/* Tier badge */}
      <span style={{ fontSize: size * 0.28, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)', zIndex: 1 }}>
        {tier.tier}
      </span>
    </div>
  );
}

// ─── Floating particles ───────────────────────────────────────────────────────

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => {
        const tier = ORB_TIERS[i % 4];
        const x = (i * 37 + 13) % 100;
        const delay = (i * 0.41) % 3;
        const dur = 4 + (i % 3);
        const size = 4 + (i % 5);
        return (
          <div key={i} className="absolute rounded-full" style={{
            left: `${x}%`, bottom: `-${size}px`,
            width: size, height: size,
            background: tier.colors.particle,
            opacity: 0.5 + (i % 3) * 0.15,
            boxShadow: `0 0 ${size * 2}px ${tier.colors.glow}`,
            animation: `enc-p-rise ${dur}s ease-out ${delay}s infinite`,
          }} />
        );
      })}
    </div>
  );
}

// ─── Countdown timer ──────────────────────────────────────────────────────────

function useCountdown(ms: number) {
  const [remaining, setRemaining] = useState(ms);
  useEffect(() => {
    if (ms <= 0) { setRemaining(0); return; }
    setRemaining(ms);
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(id);
  }, [ms]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── Main shop component ──────────────────────────────────────────────────────

export default function Shop() {
  const { player } = useGameStore();

  const [wallet, setWallet] = useState<string | null>(getConnectedWallet());
  const [status, setStatus] = useState<{
    orbs: Record<OrbType, number>;
    canClaimFree: boolean;
    msUntilRefresh: number;
    treasury: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<OrbType | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [quantities, setQuantities] = useState<Record<OrbType, number>>({ Prism: 1, Luna: 1, Aether: 1, Void: 1 });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const authHeader = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
  }), []);

  const fetchStatus = useCallback(async () => {
    if (!player) return;
    try {
      const r = await fetch('/api/shop/status', { headers: authHeader() });
      if (r.ok) setStatus(await r.json());
    } catch {}
    setLoading(false);
  }, [player, authHeader]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const countdown = useCountdown(status?.msUntilRefresh ?? 0);

  // ── Connect Phantom ──────────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (!isPhantomInstalled()) {
      showToast('Phantom wallet not found. Install it from phantom.app', false);
      return;
    }
    try {
      const addr = await connectPhantom();
      setWallet(addr);
      // Save to backend
      await fetch('/api/shop/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ walletAddress: addr }),
      });
      showToast('Wallet connected!');
    } catch (e: any) {
      showToast(e.message ?? 'Connection failed', false);
    }
  };

  // ── Claim free daily orbs ────────────────────────────────────────────────────
  const handleClaim = async () => {
    setClaiming(true);
    try {
      const r = await fetch('/api/shop/claim-daily', {
        method: 'POST',
        headers: authHeader(),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Failed');
      showToast('Free orbs claimed! ✨');
      fetchStatus();
    } catch (e: any) {
      showToast(e.message ?? 'Claim failed', false);
    } finally {
      setClaiming(false);
    }
  };

  // ── Purchase with SOL ────────────────────────────────────────────────────────
  const handleBuy = async (orbType: OrbType) => {
    if (!wallet) { showToast('Connect your Phantom wallet first', false); return; }
    if (!status?.treasury) { showToast('Shop not configured yet', false); return; }

    const tier = ORB_TIERS.find(t => t.type === orbType)!;
    const qty = quantities[orbType];
    const total = tier.sol * qty;

    setBuying(orbType);
    try {
      const sig = await sendSolPayment(status.treasury, total, (status as any).rpcUrl);
      const r = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ txSignature: sig, orbType, quantity: qty, buyerWallet: wallet }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Purchase failed');
      showToast(`${qty}× ${tier.name} purchased! 🎉`);
      fetchStatus();
    } catch (e: any) {
      showToast(e.message ?? 'Purchase failed', false);
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      {/* ── Animated background ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.18) 0%, transparent 70%), linear-gradient(160deg, #040612 0%, #080b22 50%, #040612 100%)',
      }} />
      <Particles />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/game">
            <Button variant="ghost" size="icon"><ArrowLeft size={22} /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{
              background: 'linear-gradient(90deg, #A78BFA, #60A5FA, #34D399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Mythic Bazaar
            </h1>
            <p className="text-xs text-slate-400 font-mono">Acquire legendary orbs for myth capture</p>
          </div>
        </div>

        {/* Wallet button */}
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={wallet ? {
            background: 'rgba(52,211,153,0.12)',
            border: '1.5px solid rgba(52,211,153,0.4)',
            color: '#34D399',
          } : {
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(99,102,241,0.15))',
            border: '1.5px solid rgba(99,102,241,0.5)',
            color: '#A78BFA',
          }}
        >
          <Wallet size={16} />
          {wallet ? `${wallet.slice(0,4)}…${wallet.slice(-4)}` : 'Connect Phantom'}
        </button>
      </div>

      {/* ── Current inventory strip ──────────────────────────────────────────── */}
      {!loading && status && (
        <div className="relative z-10 mx-5 mb-5 flex gap-2 flex-wrap">
          {ORB_TIERS.map(tier => (
            <div key={tier.type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: `${tier.colors.from}22`, border: `1px solid ${tier.colors.border}`, color: tier.colors.particle }}>
              <OrbSphere tier={tier} size={18} />
              <span>{status.orbs[tier.type] ?? 0}</span>
              <span className="text-slate-400 font-normal">{tier.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Free daily pack ──────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-5 mb-6">
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(16,24,40,0.97), rgba(8,12,28,0.99))',
          border: status?.canClaimFree ? '1.5px solid rgba(52,211,153,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: status?.canClaimFree ? '0 0 32px rgba(52,211,153,0.2)' : 'none',
        }}>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex gap-1.5 shrink-0">
              {ORB_TIERS.map(t => <OrbSphere key={t.type} tier={t} size={32} />)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-black text-white">Free Daily Pack</span>
                {status?.canClaimFree && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                    style={{ background: 'rgba(52,211,153,0.2)', color: '#34D399', border: '1px solid #34D39944' }}>
                    READY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">5 Prism · 3 Luna · 2 Aether · 1 Void <span className="text-slate-500">— resets every 8h</span></p>
              {!status?.canClaimFree && status?.msUntilRefresh && status.msUntilRefresh > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={11} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">Next reset in <span className="text-white">{countdown}</span></span>
                </div>
              )}
            </div>
            <button
              onClick={handleClaim}
              disabled={!status?.canClaimFree || claiming}
              className="px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-40 shrink-0"
              style={status?.canClaimFree ? {
                background: 'linear-gradient(135deg, #059669, #34D399)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(52,211,153,0.4)',
              } : {
                background: 'rgba(255,255,255,0.06)',
                color: '#64748b',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {claiming ? <RefreshCw size={16} className="animate-spin" /> : 'Claim'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Orb cards grid ───────────────────────────────────────────────────── */}
      <div className="relative z-10 px-5 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ORB_TIERS.map((tier, idx) => {
          const qty = quantities[tier.type];
          const total = (tier.sol * qty).toFixed(3);
          const isBuying = buying === tier.type;
          const inInventory = status?.orbs[tier.type] ?? 0;

          return (
            <div
              key={tier.type}
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(160deg, rgba(12,14,32,0.98), rgba(6,8,20,0.99))',
                border: `1.5px solid ${tier.colors.border}`,
                boxShadow: `0 0 40px ${tier.colors.glow}22`,
                animationDelay: `${idx * 100}ms`,
              }}
            >
              {/* Tier corner badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs"
                style={{ background: `${tier.colors.from}33`, color: tier.colors.particle, border: `1px solid ${tier.colors.border}` }}>
                {tier.tier}
              </div>

              {/* Background glow */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${tier.colors.glow} 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }} />

              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <OrbSphere tier={tier} size={64} />
                  <div>
                    <h3 className="text-lg font-black text-white">{tier.name}</h3>
                    <p className="text-xs font-bold" style={{ color: tier.colors.particle }}>{tier.capture}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.desc}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 rounded-xl px-3 py-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Free daily</div>
                    <div className="text-lg font-black text-white">{tier.dailyFree}</div>
                  </div>
                  <div className="flex-1 rounded-xl px-3 py-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">In bag</div>
                    <div className="text-lg font-black" style={{ color: inInventory > 0 ? tier.colors.particle : '#475569' }}>{inInventory}</div>
                  </div>
                  <div className="flex-1 rounded-xl px-3 py-2 text-center"
                    style={{ background: `${tier.colors.from}18`, border: `1px solid ${tier.colors.border}` }}>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Price ea.</div>
                    <div className="text-lg font-black" style={{ color: tier.colors.particle }}>{tier.sol} SOL</div>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={() => setQuantities(q => ({ ...q, [tier.type]: Math.max(1, q[tier.type] - 1) }))}
                      className="w-9 h-9 font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                    >−</button>
                    <span className="w-8 text-center font-bold text-white text-sm">{qty}</span>
                    <button
                      onClick={() => setQuantities(q => ({ ...q, [tier.type]: Math.min(20, q[tier.type] + 1) }))}
                      className="w-9 h-9 font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                    >+</button>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-slate-400">Total: </span>
                    <span className="font-black text-white">{total} SOL</span>
                  </div>
                </div>

                {/* Buy button */}
                <button
                  onClick={() => handleBuy(tier.type)}
                  disabled={!!buying || !wallet}
                  className="w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${tier.colors.from}, ${tier.colors.to})`,
                    color: '#fff',
                    boxShadow: `0 0 20px ${tier.colors.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  {/* Shine sweep */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                    animation: 'enc-flash 3s ease-in-out infinite',
                    animationDelay: `${idx * 0.7}s`,
                  }} />
                  {isBuying ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={15} className="animate-spin" /> Confirming…
                    </span>
                  ) : !wallet ? (
                    <span className="flex items-center justify-center gap-2"><Wallet size={15} /> Connect wallet to buy</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Zap size={15} /> Buy {qty}× {tier.name}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Phantom install note ─────────────────────────────────────────────── */}
      {!isPhantomInstalled() && (
        <div className="relative z-10 mx-5 mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}>
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Phantom wallet not detected.{' '}
            <a href="https://phantom.app" target="_blank" rel="noopener" className="underline font-bold">Install Phantom</a>
            {' '}to buy orbs with SOL.
          </span>
        </div>
      )}

      {/* ── Toast notification ───────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold enc-card-rise"
          style={{
            background: toast.ok ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
            boxShadow: toast.ok ? '0 0 24px rgba(16,185,129,0.5)' : '0 0 24px rgba(239,68,68,0.5)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
          }}
        >
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
