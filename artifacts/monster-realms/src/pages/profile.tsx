import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MonsterPortrait from '@/components/game/MonsterPortrait';
import { useGameStore } from '@/store/game-store';
import { useGetPlayerStats, useGetPlayerTeam } from '@workspace/api-client-react';
import { ArrowLeft, Award, MapPin, Package, Zap } from 'lucide-react';

export default function Profile() {
  const { player } = useGameStore();
  
  const { data: stats, isLoading: statsLoading } = useGetPlayerStats(player?.id || '', {
    query: { enabled: !!player?.id },
  });
  
  const { data: team, isLoading: teamLoading } = useGetPlayerTeam(player?.id || '', {
    query: { enabled: !!player?.id },
  });
  
  if (!player) return null;
  
  const xpForNextLevel = player.explorerLevel * 100;
  const xpProgress = (player.explorerXp / xpForNextLevel) * 100;
  
  return (
    <div className="min-h-[100dvh] w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/game">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold">Profile</h1>
        </div>
      </div>
      
      {/* Player Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold glow-cyan"
            style={{ backgroundColor: player.avatarColor }}
          >
            {player.username.slice(0, 2).toUpperCase()}
          </div>
          
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-bold">{player.username}</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono">
                {player.explorerRank}
              </Badge>
              {player.isGuest && (
                <Badge variant="secondary" className="font-mono">
                  Guest Account
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-mono">
                <span>Level {player.explorerLevel}</span>
                <span>{player.explorerXp} / {xpForNextLevel} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-card border border-card-border">
            <MapPin className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-2xl font-bold font-mono">{player.tilesExplored}</p>
            <p className="text-xs text-muted-foreground">Tiles Explored</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-card border border-card-border">
            <Package className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-2xl font-bold font-mono">{player.monstersCaptured}</p>
            <p className="text-xs text-muted-foreground">Monsters Captured</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-card border border-card-border">
            <Award className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-2xl font-bold font-mono">{player.monstersDiscovered}</p>
            <p className="text-xs text-muted-foreground">Species Discovered</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-card border border-card-border">
            <Zap className="mx-auto mb-2 text-yellow-400" size={24} />
            <p className="text-2xl font-bold font-mono">{player.energy} / {player.maxEnergy}</p>
            <p className="text-xs text-muted-foreground">Energy</p>
          </div>
        </div>
      </div>
      
      {/* Team */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-2xl font-bold">Active Team</h3>
        
        {teamLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading team...</p>
          </div>
        ) : !team || team.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No monsters in your team</p>
            <Link href="/collection">
              <Button variant="outline" className="mt-4" data-testid="button-go-collection">
                Go to Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {team.map((monster) => (
              <div
                key={monster.id}
                className="glass-panel p-3 rounded-xl space-y-2"
                data-testid={`team-monster-${monster.id}`}
              >
                <div className="flex justify-center">
                  <MonsterPortrait
                    element={monster.species.element}
                    size="sm"
                    shinyVariant={monster.shinyVariant}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold truncate">
                    {monster.nickname || monster.species.name}
                  </p>
                  <p className="text-xs font-mono">Lv {monster.level}</p>
                </div>
                <Progress value={(monster.currentHp / monster.maxHp) * 100} className="h-1" />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-2xl font-bold">Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Battles Won</p>
              <p className="text-xl font-bold font-mono">{stats.battlesWon}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Battles Lost</p>
              <p className="text-xl font-bold font-mono">{stats.battlesLost}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PvP Wins</p>
              <p className="text-xl font-bold font-mono">{stats.pvpWins}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PvP Losses</p>
              <p className="text-xl font-bold font-mono">{stats.pvpLosses}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Secrets Found</p>
              <p className="text-xl font-bold font-mono">{stats.secretsFound}</p>
            </div>
            <div>
              <p className="text-muted-foreground">First Discoveries</p>
              <p className="text-xl font-bold font-mono">{stats.firstDiscoveries}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Play Time</p>
              <p className="text-xl font-bold font-mono">{Math.floor(stats.totalPlayTime / 60)}h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
