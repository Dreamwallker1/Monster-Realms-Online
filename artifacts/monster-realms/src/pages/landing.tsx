import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGuestLogin, useRegisterPlayer } from '@workspace/api-client-react';
import { setToken } from '@/lib/auth';
import { useGameStore } from '@/store/game-store';
import { CHARACTERS } from '@/lib/characters';
import { Sparkles, ArrowRight, ArrowLeft, User } from 'lucide-react';

// ─── SVG character preview ────────────────────────────────────────────────────

function CharacterSVG({ char, size = 80 }: { char: typeof CHARACTERS[0]; size?: number }) {
  const s = size;
  const cx = s / 2;
  // All positions relative to center-x, proportional to size
  const sc = s / 80; // scale factor

  return (
    <svg width={s} height={s} viewBox={`0 0 80 80`} xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="40" cy="72" rx="12" ry="4" fill="black" opacity="0.2" />

      {/* Legs */}
      <rect x="27" y="55" width="9" height="14" rx="3" fill={char.pantsHex} />
      <rect x="44" y="55" width="9" height="14" rx="3" fill={char.pantsHex} />

      {/* Shoes */}
      <rect x="25" y="67" width="12" height="5" rx="2" fill="#1a1a2e" />
      <rect x="43" y="67" width="12" height="5" rx="2" fill="#1a1a2e" />

      {/* Body */}
      <rect x="26" y="36" width="28" height="22" rx="4" fill={char.outfitHex} />

      {/* Arms */}
      <rect x="14" y="36" width="12" height="17" rx="4" fill={char.outfitHex} />
      <rect x="54" y="36" width="12" height="17" rx="4" fill={char.outfitHex} />

      {/* Hands */}
      <circle cx="20" cy="56" r="5" fill={char.skinHex} />
      <circle cx="60" cy="56" r="5" fill={char.skinHex} />

      {/* Neck */}
      <rect x="36" y="29" width="8" height="10" fill={char.skinHex} />

      {/* Head */}
      <circle cx="40" cy="22" r="16" fill={char.skinHex} />

      {/* Hair */}
      <ellipse cx="40" cy="10" rx="16" ry="8" fill={char.hairHex} />
      <rect x="24" y="10" width="32" height="10" fill={char.hairHex} />
      <circle cx="26" cy="16" r="6" fill={char.hairHex} />
      <circle cx="54" cy="16" r="6" fill={char.hairHex} />

      {/* Eyes */}
      <circle cx="34" cy="22" r="3.5" fill="white" />
      <circle cx="46" cy="22" r="3.5" fill="white" />
      <circle cx="35" cy="23" r="2" fill="#1a1a2e" />
      <circle cx="47" cy="23" r="2" fill="#1a1a2e" />
      <circle cx="36" cy="22" r="0.8" fill="white" />
      <circle cx="48" cy="22" r="0.8" fill="white" />

      {/* Eyebrows */}
      <rect x="31" y="17" width="7" height="2" rx="1" fill={char.hairHex} />
      <rect x="42" y="17" width="7" height="2" rx="1" fill={char.hairHex} />

      {/* Mouth */}
      <path d="M36 29 Q40 32 44 29" stroke="#c07068" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Step types ───────────────────────────────────────────────────────────────

type Step = 'name' | 'character' | 'register';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setPlayer, setCharacterType } = useGameStore();

  const [step, setStep] = useState<Step>('name');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]!);
  const [isRegistering, setIsRegistering] = useState(false);

  const guestLogin = useGuestLogin();
  const register = useRegisterPlayer();

  const handleGuestPlay = async () => {
    try {
      const response = await guestLogin.mutateAsync({
        data: { username: username.trim(), avatarColor: selectedChar.avatarColor },
      });
      setToken(response.token);
      setPlayer(response.player);
      setCharacterType(selectedChar.id);
      setLocation('/game');
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await register.mutateAsync({
        data: { username: username.trim(), password, avatarColor: selectedChar.avatarColor },
      });
      setToken(response.token);
      setPlayer(response.player);
      setCharacterType(selectedChar.id);
      setLocation('/game');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const canProceedFromName = username.trim().length >= 2;

  // ─── Step: Enter username ───────────────────────────────────────────────
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
              Monster Realms
            </h1>
            <p className="text-muted-foreground text-sm">
              Head outside. Explore the park. Catch 'em all.
            </p>
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
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: Character selection ──────────────────────────────────────────
  if (step === 'character') {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground />
        <div className="glass-panel p-6 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-primary">Choose Your Explorer</h2>
            <p className="text-muted-foreground text-sm">Who's heading to the park today?</p>
          </div>

          {/* Character grid */}
          <div className="grid grid-cols-3 gap-3">
            {CHARACTERS.map((char) => {
              const isSelected = selectedChar.id === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/30'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:scale-102'
                    }
                  `}
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

          {/* Selected character big preview */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <CharacterSVG char={selectedChar} size={96} />
            <div className="flex-1 space-y-1">
              <p className="text-xl font-bold text-primary">{selectedChar.name}</p>
              <p className="text-muted-foreground text-sm">{selectedChar.description}</p>
              <p className="text-xs text-white/60 mt-2">
                Playing as: <span className="text-white font-semibold">{username}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
              onClick={() => setStep('name')}
            >
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 glow-cyan font-bold"
              onClick={handleGuestPlay}
              disabled={guestLogin.isPending}
              data-testid="button-guest-login"
            >
              {guestLogin.isPending ? 'Entering park...' : '🏃 Play as Guest'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setStep('register')}
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

  // ─── Step: Register / Login ─────────────────────────────────────────────
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
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep('character')}>
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
