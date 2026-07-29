import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';
import { Link } from 'wouter';
import { X, Grid3x3, BookOpen, User, Trophy, LogOut, Trees, ShoppingBag, Swords } from 'lucide-react';
import { clearToken } from '@/lib/auth';

export default function GameSidebar() {
  const { sidebarOpen, setSidebarOpen, player } = useGameStore();
  
  const handleLogout = () => {
    clearToken();
    window.location.href = '/';
  };
  
  if (!sidebarOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 glass-panel rounded-l-3xl p-6 animate-slide-in-right">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            data-testid="button-close-sidebar"
          >
            <X size={24} />
          </Button>
        </div>
        
        {player && (
          <div className="mb-8 p-4 rounded-lg bg-card border border-card-border">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: player.avatarColor }}
              />
              <div>
                <p className="font-bold text-lg">{player.username}</p>
                <p className="text-sm text-muted-foreground font-mono">{player.explorerRank}</p>
              </div>
            </div>
          </div>
        )}
        
        <nav className="space-y-2">
          <Link
            href="/collection"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-collection"
          >
            <Grid3x3 size={20} />
            <span className="font-semibold">Collection</span>
          </Link>
          
          <Link
            href="/encyclopedia"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-encyclopedia"
          >
            <BookOpen size={20} />
            <span className="font-semibold">Encyclopedia</span>
          </Link>
          
          <Link
            href="/profile"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-profile"
          >
            <User size={20} />
            <span className="font-semibold">Profile</span>
          </Link>
          
          <Link
            href="/leaderboard"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-leaderboard"
          >
            <Trophy size={20} />
            <span className="font-semibold">Leaderboard</span>
          </Link>

          <Link
            href="/myths-tree"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-myths-tree"
          >
            <Trees size={20} className="text-emerald-400" />
            <span className="font-semibold">Myths Tree</span>
          </Link>

          <Link
            href="/shop"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-shop"
          >
            <ShoppingBag size={20} className="text-violet-400" />
            <span className="font-semibold">Orb Shop</span>
          </Link>

          <Link
            href="/tournament"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/20 transition-colors w-full text-left"
            onClick={() => setSidebarOpen(false)}
            data-testid="link-tournament"
          >
            <Swords size={20} className="text-amber-400" />
            <span className="font-semibold">⚔️ Arena</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
