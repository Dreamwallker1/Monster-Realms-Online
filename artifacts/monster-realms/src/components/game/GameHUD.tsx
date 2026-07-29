import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/game-store';
import { useGetPlayerTeam } from '@workspace/api-client-react';
import { Coins, Zap, Radio } from 'lucide-react';

export default function GameHUD() {
  const { player } = useGameStore();
  
  const { data: team } = useGetPlayerTeam(player?.id || '', {
    query: { enabled: !!player?.id },
  });
  
  if (!player) return null;
  
  const energyPercent = (player.energy / player.maxEnergy) * 100;
  const isLowEnergy = player.energy < 20;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="glass-panel mx-4 mb-4 p-4 rounded-2xl pointer-events-auto">
        <div className="flex items-center justify-between gap-6">
          {/* Team Preview */}
          <div className="flex gap-2">
            {team?.slice(0, 3).map((monster, i) => {
              const hpPercent = (monster.currentHp / monster.maxHp) * 100;
              return (
                <div
                  key={monster.id}
                  className="w-14 h-14 rounded-lg bg-card border border-card-border p-1"
                  data-testid={`team-monster-${i}`}
                >
                  <div className="text-xs font-mono text-center truncate">{monster.species.name}</div>
                  <Progress value={hpPercent} className="h-1 mt-1" />
                  <div className="text-[10px] font-mono text-center mt-0.5">Lv{monster.level}</div>
                </div>
              );
            })}
            {(!team || team.length === 0) && (
              <div className="w-14 h-14 rounded-lg bg-card border border-dashed border-card-border flex items-center justify-center text-xs text-muted-foreground">
                Empty
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Zap size={18} className={isLowEnergy ? 'text-yellow-400 animate-pulse' : 'text-primary'} />
              <div className="flex-1">
                <Progress value={energyPercent} className="h-2" />
                <p className="text-xs font-mono mt-0.5">
                  Energy: {player.energy} / {player.maxEnergy}
                </p>
              </div>
            </div>
            
            {isLowEnergy && (
              <div className="text-xs text-yellow-400 font-semibold animate-pulse">
                Low energy! Rest or use items to restore.
              </div>
            )}
          </div>
          
          {/* Coins & Radar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins size={20} className="text-yellow-400" />
              <span className="font-mono font-bold text-lg">{player.coins}</span>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
              <Radio size={18} className="text-primary animate-pulse-glow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
