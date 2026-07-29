import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/game-store';
import { useStartBattle, useGetPlayerTeam } from '@workspace/api-client-react';
import { getElementColors, getRarityColors, QUALITY_LABEL } from '@/lib/element-colors';
import { getMonsterEmoji } from '@/lib/monster-emoji';
import { Swords, AlertCircle } from 'lucide-react';

export default function EncounterPopup() {
  const { encounter, clearEncounter, startBattle, player } = useGameStore();
  const [isStarting, setIsStarting] = useState(false);

  const { data: team } = useGetPlayerTeam(player?.id || '', {
    query: { enabled: !!player?.id },
  });

  const startBattleMutation = useStartBattle();

  if (!encounter.triggered || !encounter.species) return null;

  const sp = encounter.species;
  const elColors = getElementColors(sp.element);
  const rarColors = getRarityColors(sp.rarity);
  const qualityLabel = QUALITY_LABEL[sp.rarity] ?? sp.rarity;
  const hasTeam = team && team.length > 0;

  const handleBattle = async () => {
    if (!player || !hasTeam) return;
    setIsStarting(true);
    try {
      const battle = await startBattleMutation.mutateAsync({
        data: {
          playerId: player.id,
          regionId: player.regionId || 'verdant-meadows',
          speciesId: sp.id,
          wildLevel: encounter.wildLevel,
          shinyVariant: encounter.shinyVariant as any,
          activeMonsterCapturedId: team[0].id,
        },
      });
      startBattle(battle.id, battle);
      clearEncounter();
    } catch (err) {
      console.error('Failed to start battle:', err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
      <div
        className="glass-panel rounded-t-3xl p-6 w-full max-w-lg mb-0 pointer-events-auto animate-slide-in-up"
        style={{ boxShadow: `0 -4px 40px ${rarColors.glow}, 0 -1px 0 ${elColors.primary}33` }}
      >
        {/* Shiny badge */}
        {encounter.shinyVariant && (
          <div className="text-center text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: '#ffd700', textShadow: '0 0 10px gold' }}>
            ✨ {encounter.shinyVariant} Shiny!
          </div>
        )}

        <div className="flex items-center gap-5">
          {/* Portrait */}
          <div
            className="w-24 h-24 shrink-0 rounded-2xl flex items-center justify-center text-5xl"
            style={{
              background: `radial-gradient(circle at 40% 35%, ${elColors.secondary}33, ${elColors.primary}22)`,
              border: `2px solid ${elColors.primary}66`,
              boxShadow: `0 0 20px ${elColors.primary}44`,
              filter: encounter.shinyVariant ? 'drop-shadow(0 0 10px gold)' : undefined,
            }}
          >
            <span style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))' }}>
              {getMonsterEmoji(sp.id, sp.element)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-0.5">
              A wild myth appeared!
            </p>
            <h2 className="text-2xl font-bold leading-tight truncate">{sp.name}</h2>
            <p className="text-sm text-muted-foreground font-mono mb-2">Level {encounter.wildLevel}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge style={{ backgroundColor: elColors.primary, color: '#000' }} className="font-semibold text-xs">
                {sp.element}
              </Badge>
              <Badge style={{ backgroundColor: rarColors.color, color: rarColors.color === '#9CA3AF' ? '#000' : '#fff', boxShadow: `0 0 8px ${rarColors.glow}` }} className="font-semibold text-xs">
                {qualityLabel}
              </Badge>
            </div>
          </div>
        </div>

        {/* No team warning */}
        {!hasTeam && (
          <div className="flex items-center gap-2 text-yellow-400 bg-yellow-950/30 px-3 py-2 rounded-lg mt-4 text-sm">
            <AlertCircle size={16} />
            <span>You need a myth in your team to battle! Catch one first.</span>
          </div>
        )}

        {/* Hint */}
        {hasTeam && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Weaken it to raise capture chances — use <span className="text-cyan-400 font-semibold">Throw Orb</span> during battle to catch it!
          </p>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            size="lg"
            onClick={handleBattle}
            disabled={!hasTeam || isStarting}
            className="glow-cyan font-bold text-base"
            data-testid="button-fight"
          >
            <Swords size={18} className="mr-1" />
            {isStarting ? 'Loading…' : 'Battle!'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={clearEncounter}
            className="font-bold text-base"
            data-testid="button-run-away"
          >
            Run Away
          </Button>
        </div>
      </div>
    </div>
  );
}
