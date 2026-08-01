import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useGetLeaderboard, GetLeaderboardType } from '@workspace/api-client-react';
import { useGameStore } from '@/store/game-store';
import { ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';

const LEADERBOARD_TYPES: Array<{ type: GetLeaderboardType; label: string }> = [
  { type: 'explorer', label: 'Explorer' },
  { type: 'collection', label: 'Collection' },
  { type: 'pvp', label: 'PvP' },
  { type: 'tiles', label: 'Tiles' },
];

export default function Leaderboard() {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<GetLeaderboardType>('explorer');
  
  const { data: leaderboard, isLoading } = useGetLeaderboard({ type: activeTab, limit: 50 });
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return <span className="font-mono font-bold text-muted-foreground">{rank}</span>;
  };
  
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
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top explorers across the realms</p>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GetLeaderboardType)}>
        <TabsList className="glass-panel">
          {LEADERBOARD_TYPES.map((type) => (
            <TabsTrigger key={type.type} value={type.type} data-testid={`tab-${type.type}`}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {LEADERBOARD_TYPES.map((type) => (
          <TabsContent key={type.type} value={type.type} className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : !leaderboard || leaderboard.entries.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center">
                <Trophy className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-xl text-muted-foreground">No entries yet</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="divide-y divide-border">
                  {leaderboard.entries.map((entry, i) => {
                    const isCurrentPlayer = entry.playerId === player?.id;
                    
                    return (
                      <div
                        key={entry.playerId}
                        className={`p-4 flex items-center gap-4 ${
                          isCurrentPlayer ? 'bg-primary/10 border-l-4 border-primary' : ''
                        } ${i < 3 ? 'bg-accent/5' : ''}`}
                        style={{
                          animationDelay: `${i * 30}ms`,
                        }}
                        data-testid={`leaderboard-entry-${entry.playerId}`}
                      >
                        {/* Rank */}
                        <div className="w-12 flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        {/* Avatar */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: entry.avatarColor }}
                        >
                          {entry.username.slice(0, 2).toUpperCase()}
                        </div>
                        
                        {/* Name */}
                        <div className="flex-1">
                          <p className="font-bold text-lg">{entry.username}</p>
                          {isCurrentPlayer && (
                            <Badge variant="outline" className="text-xs mt-1">
                              You
                            </Badge>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="text-right space-y-1">
                          <p className="text-2xl font-bold font-mono">{entry.score.toLocaleString()}</p>
                          <div className="flex gap-2 text-xs font-mono text-muted-foreground">
                            {entry.explorerLevel && <span>Lv{entry.explorerLevel}</span>}
                            {entry.monstersCaptured && <span>{entry.monstersCaptured} monsters</span>}
                            {entry.tilesExplored && <span>{entry.tilesExplored} tiles</span>}
                            {entry.pvpWins && <span>{entry.pvpWins} wins</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
