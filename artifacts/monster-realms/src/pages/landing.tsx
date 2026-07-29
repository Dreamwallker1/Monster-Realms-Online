import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGuestLogin, useRegisterPlayer } from '@workspace/api-client-react';
import { setToken } from '@/lib/auth';
import { useGameStore } from '@/store/game-store';
import { Sparkles } from 'lucide-react';

const AVATAR_COLORS = [
  '#22D3EE', // cyan
  '#A78BFA', // violet
  '#F472B6', // pink
  '#FB923C', // orange
  '#34D399', // green
  '#FBBF24', // yellow
  '#818CF8', // indigo
  '#F87171', // red
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setPlayer } = useGameStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const guestLogin = useGuestLogin();
  const register = useRegisterPlayer();
  
  const handleGuestLogin = async () => {
    if (!username.trim()) return;
    
    try {
      const response = await guestLogin.mutateAsync({
        data: { username: username.trim(), avatarColor: selectedColor },
      });
      setToken(response.token);
      setPlayer(response.player);
      setLocation('/game');
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };
  
  const handleRegister = async () => {
    if (!username.trim() || !password) return;
    
    try {
      const response = await register.mutateAsync({
        data: { username: username.trim(), password, avatarColor: selectedColor },
      });
      setToken(response.token);
      setPlayer(response.player);
      setLocation('/game');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan">
              <Sparkles size={40} className="text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Monster Realms Online
          </h1>
          <p className="text-muted-foreground">
            Every tile could be a legendary encounter
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your explorer name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              data-testid="input-username"
            />
          </div>
          
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Avatar Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedColor === color ? 'ring-4 ring-primary scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  data-testid={`color-${color}`}
                />
              ))}
            </div>
          </div>
          
          {!isRegistering ? (
            <div className="space-y-3">
              <Button
                variant="default"
                size="lg"
                className="w-full glow-cyan font-bold text-lg"
                onClick={handleGuestLogin}
                disabled={!username.trim() || guestLogin.isPending}
                data-testid="button-guest-login"
              >
                Play as Guest
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold"
                onClick={() => setIsRegistering(true)}
                data-testid="button-show-register"
              >
                Create Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="default"
                size="lg"
                className="w-full glow-violet font-bold text-lg"
                onClick={handleRegister}
                disabled={!username.trim() || !password || register.isPending}
                data-testid="button-register"
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold"
                onClick={() => setIsRegistering(false)}
                data-testid="button-show-guest"
              >
                Back to Guest Login
              </Button>
            </div>
          )}
        </div>
        
        {(guestLogin.isError || register.isError) && (
          <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg">
            {guestLogin.error?.message || register.error?.message || 'An error occurred. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
}
