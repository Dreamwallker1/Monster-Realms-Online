import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGuestLogin, useRegisterPlayer } from '@workspace/api-client-react';
import { setToken } from '@/lib/auth';
import { useGameStore } from '@/store/game-store';
import { CHARACTERS } from '@/lib/characters';
import { ELEMENT_COLORS, RARITY_COLORS, QUALITY_LABEL } from '@/lib/element-colors';
import { ELEMENT_EMOJI, getMonsterEmoji } from '@/lib/monster-emoji';
import { Sparkles, ArrowRight, ArrowLeft, User, Package, Crown } from 'lucide-react';

// ─── SVG character preview ────────────────────────────────────────────────────

function CharacterSVG({ char, size = 80 }: { char: typeof CHARACTERS[0]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="72" rx="12" ry="4" fill="black" opacity="0.2" />
      <rect x="27" y="55" width="9" height="14" rx="3" fill={char.pantsHex} />
      <rect x="44" y="55" width="9" height="14" rx="3" fill={char.pantsHex} />
      <rect x="25" y="67" width="12" height="5" rx="2" fill="#1a1a2e" />
      <rect x="43" y="67" width="12" height="5" rx="2" fill="#1a1a2e" />
      <rect x="26" y="36" width="28" height="22" rx="4" fill={char.outfitHex} />
      <rect x="14" y="36" width="12" height="17" rx="4" fill={char.outfitHex} />
      <rect x="54" y="36" width="12" height="17" rx="4" fill={char.outfitHex} />
      <circle cx="20" cy="56" r="5" fill={char.skinHex} />
      <circle cx="60" cy="56" r="5" fill={char.skinHex} />
      <rect x="36" y="29" width="8" height="10" fill={char.skinHex} />
      <circle cx="40" cy="22" r="16" fill={char.skinHex} />
      <ellipse cx="40" cy="10" rx="16" ry="8" fill={char.hairHex} />
      <rect x="24" y="10" width="32" height="10" fill={char.hairHex} />
      <circle cx="26" cy="16" r="6" fill={char.hairHex} />
      <circle cx="54" cy="16" r="6" fill={char.hairHex} />
      <circle cx="34" cy="22" r="3.5" fill="white" />
      <circle cx="46" cy="22" r="3.5" fill="white" />
      <circle cx="35" cy="23" r="2" fill="#1a1a2e" />
      <circle cx="47" cy="23" r="2" fill="#1a1a2e" />
      <circle cx="36" cy="22" r="0.8" fill="white" />
      <circle cx="48" cy="22" r="0.8" fill="white" />
      <rect x="31" y="17" width="7" height="2" rx="1" fill={char.hairHex} />
      <rect x="42" y="17" width="7" height="2" rx="1" fill={char.hairHex} />
      <path d="M36 29 Q40 32 44 29" stroke="#c07068" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Element data ──────────────────────────────────────────────────────────────

const ELEMENTS = [
  { id: 'Fire',     emoji: '🔥', flavor: 'Fierce & unstoppable' },
  { id: 'Water',    emoji: '💧', flavor: 'Fluid & enduring' },
  { id: 'Nature',   emoji: '🌿', flavor: 'Patient & resilient' },
  { id: 'Electric', emoji: '⚡', flavor: 'Fast & unpredictable' },
  { id: 'Dark',     emoji: '🌑', flavor: 'Mysterious & cunning' },
];

// ─── Step types ────────────────────────────────────────────────────────────────

type StarterMyth = {
  capturedId: string;
  speciesId: string;
  speciesName: string;
  element: string;
  rarity: string;
  level: number;
};

type Step = 'name' | 'character' | 'element' | 'starter-box' | 'register';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setPlayer, setCharacterType } = useGameStore();

  const [step, setStep] = useState<Step>('name');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]!);
  const [selectedElement, setSelectedElement] = useState<string>('');
  const [starterPack, setStarterPack] = useState<StarterMyth[]>([]);
  const [boxOpened, setBoxOpened] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [gmLoading, setGmLoading] = useState(false);

  const guestLogin = useGuestLogin();
  const register = useRegisterPlayer();

  const handleGuestPlay = async () => {
    try {
      const response = await guestLogin.mutateAsync({
        data: {
          username: username.trim(),
          avatarColor: selectedChar.avatarColor,
          starterElement: selectedElement || undefined,
        },
      });
      setToken(response.token);
      setPlayer(response.player);
      setCharacterType(selectedChar.id);
      if (response.starterPack && response.starterPack.length > 0) {
        setStarterPack(response.starterPack as StarterMyth[]);
        setBoxOpened(false);
        setStep('starter-box');
      } else {
        setLocation('/game');
      }
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await register.mutateAsync({
        data: {
          username: username.trim(),
          password,
          avatarColor: selectedChar.avatarColor,
          starterElement: selectedElement || undefined,
        },
      });
      setToken(response.token);
      setPlayer(response.player);
      setCharacterType(selectedChar.id);
      if (response.starterPack && response.starterPack.length > 0) {
        setStarterPack(response.starterPack as StarterMyth[]);
        setBoxOpened(false);
        setStep('starter-box');
      } else {
        setLocation('/game');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleGmLogin = async () => {
    setGmLoading(true);
    try {
      const r = await fetch('/api/auth/gm-login', { method: 'POST' });
      if (!r.ok) throw new Error('GM login failed');
      const data = await r.json();
      setToken(data.token);
      setPlayer(data.player);
      setCharacterType(CHARACTERS[0]!.id);
      setLocation('/game');
    } catch (err) {
      console.error(err);
    } finally {
      setGmLoading(false);
    }
  };

  const canProceedFromName = username.trim().length >= 2;

  // ─── Step: Enter username ───────────────────────────────────────────────────
  if (step === 'name') {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground />
        <div className="glass-panel p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative z-10">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan">
                <Sparkles size={40} className="text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mythora
            </h1>
            <p className="text-muted-foreground text-sm">Discover. Bond. Become legendary.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User size={14} /> Explorer Name
              </Label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canProceedFromName && setStep('character')}
                maxLength={20}
                autoFocus
                data-testid="input-username"
              />
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full glow-cyan font-bold text-base flex items-center justify-center gap-2"
              onClick={() => setStep('character')}
              disabled={!canProceedFromName}
              data-testid="button-next-character"
            >
              Choose Your Character <ArrowRight size={18} />
            </Button>

            <div className="text-center">
              <button
                className="text-xs text-muted-foreground underline underline-offset-2"
                onClick={() => { setStep('register'); setIsRegistering(true); }}
              >
                Already have an account? Sign in
              </button>
            </div>

            {/* ── Game Master shortcut ── */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={handleGmLogin}
                disabled={gmLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/5 hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all duration-200 group disabled:opacity-50"
              >
                <Crown size={15} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-yellow-300/80 group-hover:text-yellow-300">
                  {gmLoading ? 'Entering GM mode…' : 'Game Master — skip to max'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: Character selection ──────────────────────────────────────────────
  if (step === 'character') {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground />
        <div className="glass-panel p-6 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-primary">Choose Your Explorer</h2>
            <p className="text-muted-foreground text-sm">Who's heading to the park today?</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {CHARACTERS.map((char) => {
              const isSelected = selectedChar.id === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/30'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                  }`}
                  data-testid={`character-${char.id}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                  )}
                  <CharacterSVG char={char} size={72} />
                  <div className="text-center">
                    <p className="font-bold text-sm text-white">{char.name}</p>
                    <p className="text-xs text-muted-foreground">{char.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <CharacterSVG char={selectedChar} size={80} />
            <div className="flex-1 space-y-1">
              <p className="text-xl font-bold text-primary">{selectedChar.name}</p>
              <p className="text-muted-foreground text-sm">{selectedChar.description}</p>
              <p className="text-xs text-white/60 mt-2">
                Playing as: <span className="text-white font-semibold">{username}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex items-center gap-2" onClick={() => setStep('name')}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 glow-cyan font-bold"
              onClick={() => setStep('element')}
              data-testid="button-next-element"
            >
              Choose Element <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: Element selection ────────────────────────────────────────────────
  if (step === 'element') {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground />
        <div className="glass-panel p-6 rounded-3xl w-full max-w-xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-primary">Choose Your Element</h2>
            <p className="text-muted-foreground text-sm">
              Your starter box will contain myths from this element
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ELEMENTS.map((el) => {
              const colors = ELEMENT_COLORS[el.id]!;
              const isSelected = selectedElement === el.id;
              return (
                <button
                  key={el.id}
                  onClick={() => setSelectedElement(el.id)}
                  className="relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left"
                  style={{
                    borderColor: isSelected ? colors.primary : 'rgba(255,255,255,0.1)',
                    background: isSelected
                      ? `linear-gradient(135deg, ${colors.primary}22, ${colors.secondary}11)`
                      : 'rgba(255,255,255,0.03)',
                    boxShadow: isSelected ? `0 0 20px ${colors.glow}` : 'none',
                  }}
                  data-testid={`element-${el.id}`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}33, ${colors.secondary}22)`, border: `1px solid ${colors.primary}44` }}
                  >
                    {el.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">{el.id}</p>
                    <p className="text-sm text-white/60">{el.flavor}</p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: colors.primary }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex items-center gap-2" onClick={() => setStep('character')}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 glow-cyan font-bold flex items-center justify-center gap-2"
              onClick={handleGuestPlay}
              disabled={!selectedElement || guestLogin.isPending}
              data-testid="button-guest-play-element"
            >
              {guestLogin.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">✦</span> Opening your box...
                </span>
              ) : (
                <>
                  <Package size={18} /> Play as Guest
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setStep('register')}
              disabled={!selectedElement}
            >
              Create Account
            </Button>
          </div>

          {guestLogin.isError && (
            <p className="text-sm text-destructive text-center">
              {(guestLogin.error as Error)?.message || 'Something went wrong. Try a different name.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Starter box reveal ───────────────────────────────────────────────
  if (step === 'starter-box') {
    const elColors = selectedElement ? ELEMENT_COLORS[selectedElement] : null;
    const hasLegendary = starterPack.some((m) => m.rarity === 'S');

    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground />
        <div className="glass-panel p-6 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 space-y-6">
          {!boxOpened ? (
            /* ── Closed box ── */
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-primary">Your Starter Box</h2>
                <p className="text-muted-foreground text-sm">
                  A gift for every new explorer — tap to reveal your myths!
                </p>
              </div>

              <button
                onClick={() => setBoxOpened(true)}
                className="relative group cursor-pointer"
                data-testid="button-open-box"
              >
                {/* Box glow ring */}
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse scale-110"
                  style={{ background: elColors ? `radial-gradient(circle, ${elColors.glow}, transparent)` : 'radial-gradient(circle, rgba(99,102,241,0.5), transparent)' }}
                />
                {/* Box emoji */}
                <div
                  className="relative w-36 h-36 rounded-3xl flex items-center justify-center text-7xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                  style={{
                    background: elColors
                      ? `linear-gradient(135deg, ${elColors.primary}33, ${elColors.secondary}22)`
                      : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))',
                    border: `2px solid ${elColors?.primary ?? 'rgba(99,102,241,0.4)'}`,
                    boxShadow: `0 0 30px ${elColors?.glow ?? 'rgba(99,102,241,0.3)'}`,
                  }}
                >
                  🎁
                </div>
              </button>

              <p className="text-white/40 text-xs animate-pulse">Tap the box to open</p>
            </div>
          ) : (
            /* ── Opened — myth cards ── */
            <>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-primary">
                  {hasLegendary ? '🌟 Incredible!' : '✨ Welcome, Explorer!'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {hasLegendary
                    ? 'A Legendary myth revealed itself to you!'
                    : 'Your journey begins with these myths'}
                </p>
              </div>

              <div className="space-y-3">
                {starterPack.map((myth, idx) => {
                  const elC = ELEMENT_COLORS[myth.element] ?? { primary: '#6B7280', secondary: '#9CA3AF', glow: 'rgba(107,114,128,0.3)' };
                  const rarC = RARITY_COLORS[myth.rarity] ?? { color: '#9CA3AF', glow: 'rgba(156,163,175,0.3)', label: myth.rarity };
                  const isLegendary = myth.rarity === 'S';
                  const emoji = getMonsterEmoji(myth.speciesId, myth.element);

                  return (
                    <div
                      key={myth.capturedId}
                      className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
                      style={{
                        animationDelay: `${idx * 120}ms`,
                        borderColor: isLegendary ? rarC.color : elC.primary + '66',
                        background: isLegendary
                          ? `linear-gradient(135deg, ${rarC.color}22, ${elC.primary}11)`
                          : `linear-gradient(135deg, ${elC.primary}18, ${elC.secondary}0a)`,
                        boxShadow: isLegendary ? `0 0 20px ${rarC.glow}` : `0 0 10px ${elC.glow}`,
                      }}
                    >
                      {/* Emoji portrait */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${elC.primary}33, ${elC.secondary}22)`,
                          border: `1px solid ${elC.primary}55`,
                        }}
                      >
                        {emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{myth.speciesName}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge
                            className="text-[10px] px-1.5 py-0 h-4"
                            style={{ background: elC.primary + '33', color: elC.primary, border: `1px solid ${elC.primary}55` }}
                          >
                            {ELEMENT_EMOJI[myth.element]} {myth.element}
                          </Badge>
                          <Badge
                            className="text-[10px] px-1.5 py-0 h-4"
                            style={{ background: rarC.color + '22', color: rarC.color, border: `1px solid ${rarC.color}55` }}
                          >
                            {myth.rarity} · {QUALITY_LABEL[myth.rarity] ?? myth.rarity}
                          </Badge>
                          <span className="text-[10px] text-white/40">Lv.{myth.level}</span>
                        </div>
                      </div>

                      {/* Legendary crown */}
                      {isLegendary && (
                        <span className="text-2xl flex-shrink-0 animate-pulse">👑</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full glow-cyan font-bold flex items-center justify-center gap-2"
                onClick={() => setLocation('/game')}
                data-testid="button-begin-journey"
              >
                <Sparkles size={18} /> Begin Your Journey
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Register / Login ─────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-primary">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <div className="flex justify-center my-3">
            <CharacterSVG char={selectedChar} size={80} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Explorer name"
              data-testid="input-username-register"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              data-testid="input-password"
            />
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full glow-violet font-bold"
            onClick={handleRegister}
            disabled={!username.trim() || !password || register.isPending}
            data-testid="button-register"
          >
            {register.isPending ? 'Creating account...' : isRegistering ? 'Create & Play' : 'Sign In'}
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep(selectedElement ? 'element' : 'character')}>
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
            <button
              className="text-xs text-muted-foreground underline underline-offset-2"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Sign in instead' : 'Create account'}
            </button>
          </div>
        </div>

        {register.isError && (
          <p className="text-sm text-destructive text-center">
            {(register.error as Error)?.message || 'Something went wrong.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Floating particle background ─────────────────────────────────────────────

function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/15 animate-float"
          style={{
            width: `${4 + (i % 5) * 3}px`,
            height: `${4 + (i % 5) * 3}px`,
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 13 + 8) % 100}%`,
            animationDelay: `${(i * 0.4) % 3}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        />
      ))}
    </div>
  );
}
