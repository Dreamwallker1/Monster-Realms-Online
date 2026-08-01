import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/game-store';
import { useGetPlayerTeam } from '@workspace/api-client-react';
import { Coins, Zap, Radio, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { getRegionInfo, speciesIdToName } from '@/lib/region-info';

export default function GameHUD() {
  const { player, currentRegionId } = useGameStore();
  const [mythsOpen, setMythsOpen] = useState(false);

  const { data: team } = useGetPlayerTeam(player?.id || '', {
    query: { enabled: !!player?.id, queryKey: ['player-team', player?.id] },
  });

  if (!player) return null;

  const energyPercent = (player.energy / player.maxEnergy) * 100;
  const isLowEnergy = player.energy < 20;
  const region = getRegionInfo(currentRegionId);

  return (
    <div className="mobile-game-hud fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      {/* Region info bar */}
      <div className="mobile-region-wrap mx-4 mb-2 pointer-events-auto">
        <button
          className="mobile-region-bar w-full flex items-center justify-between gap-3 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all"
          style={{
            background: 'rgba(10,14,26,0.80)',
            borderColor: region.accentColor + '55',
            boxShadow: `0 0 12px ${region.accentColor}22`,
          }}
          onClick={() => setMythsOpen((o) => !o)}
          data-testid="region-info-bar"
        >
          <div className="mobile-region-main flex min-w-0 items-center gap-2">
            <MapPin size={14} style={{ color: region.accentColor }} />
            <span className="mobile-region-name truncate font-bold text-white text-sm">{region.name}</span>
            <Badge
              variant="outline"
              className="mobile-region-badge text-[10px] px-1.5 py-0 font-mono border-current"
              style={{ color: region.accentColor, borderColor: region.accentColor + '88' }}
            >
              {region.element} {region.biome}
            </Badge>
          </div>
          <div className="mobile-region-count flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <span>{region.speciesIds.length} myths</span>
            {mythsOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </div>
        </button>

        {/* Myth roster — expandable */}
        {mythsOpen && (
          <div
            className="mt-1 px-4 py-3 rounded-xl border backdrop-blur-sm"
            style={{
              background: 'rgba(10,14,26,0.88)',
              borderColor: region.accentColor + '44',
            }}
          >
            <p className="text-[10px] text-muted-foreground font-mono mb-2 uppercase tracking-widest">
              Myths roaming this area
            </p>
            <div className="flex flex-wrap gap-1.5">
              {region.speciesIds.map((id) => (
                <span
                  key={id}
                  className="text-[11px] px-2 py-0.5 rounded-full border font-mono"
                  style={{
                    color: region.accentColor,
                    borderColor: region.accentColor + '55',
                    background: region.accentColor + '14',
                  }}
                >
                  {speciesIdToName(id)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main HUD panel */}
      <div className="mobile-hud-panel glass-panel mx-4 mb-4 p-4 rounded-2xl pointer-events-auto">
        <div className="mobile-hud-layout flex items-center justify-between gap-6">
          {/* Team Preview */}
          <div className="mobile-team-preview flex gap-2">
            {team?.slice(0, 3).map((monster, i) => {
              const hpPercent = (monster.currentHp / monster.maxHp) * 100;
              return (
                <div
                  key={monster.id}
                  className="mobile-team-card w-14 h-14 rounded-lg bg-card border border-card-border p-1"
                  data-testid={`team-monster-${i}`}
                >
                  <div className="text-xs font-mono text-center truncate">{monster.species.name}</div>
                  <Progress value={hpPercent} className="h-1 mt-1" />
                  <div className="text-[10px] font-mono text-center mt-0.5">Lv{monster.level}</div>
                </div>
              );
            })}
            {(!team || team.length === 0) && (
              <div className="mobile-team-card w-14 h-14 rounded-lg bg-card border border-dashed border-card-border flex items-center justify-center text-xs text-muted-foreground">
                Empty
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mobile-energy min-w-0 flex-1 space-y-2">
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
          <div className="mobile-wallet flex items-center gap-4">
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
