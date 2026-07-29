import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MonsterPortrait from './MonsterPortrait';
import { useGameStore } from '@/store/game-store';
import { useStartBattle, useGetPlayerTeam } from '@workspace/api-client-react';
import type { MonsterSpecies } from '@workspace/api-client-react';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/lib/element-colors';
import { Swords, Package, AlertCircle } from 'lucide-react';

export default function EncounterPopup() {
  const { encounter, clearEncounter, startBattle, player } = useGameStore();
  const [isStartingBattle, setIsStartingBattle] = useState(false);
  
  const { data: team } = useGetPlayerTeam(player?.id || '', {
    query: { enabled: !!player?.id },
  });
  
  const startBattleMutation = useStartBattle();
  
  if (!encounter.triggered || !encounter.species) return null;
  
  const elementColors = ELEMENT_COLORS[encounter.species.element];
  const rarityColors = RARITY_COLORS[encounter.species.rarity];
  
  const handleFight = async () => {
    if (!player || !team || team.length === 0) return;
    
    setIsStartingBattle(true);
    try {
      const battle = await startBattleMutation.mutateAsync({
        data: {
          playerId: player.id,
          regionId: player.regionId || 'default',
          speciesId: encounter.species!.id,
          wildLevel: encounter.wildLevel,
          shinyVariant: encounter.shinyVariant as any,
          activeMonsterCapturedId: team[0].id,
        },
      });
      
      startBattle(battle.id, battle);
      clearEncounter();
    } catch (error) {
      console.error('Failed to start battle:', error);
    } finally {
      setIsStartingBattle(false);
    }
  };
  
  const handleRunAway = () => {
    clearEncounter();
  };
  
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
      <div 
        className="glass-panel rounded-t-3xl p-6 w-full max-w-2xl mb-0 pointer-events-auto animate-slide-in-up shadow-2xl"
        style={{
          boxShadow: `0 -4px 32px ${rarityColors.glow}`,
        }}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <MonsterPortrait
              element={encounter.species.element}
              size="lg"
              shinyVariant={encounter.shinyVariant}
            />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--app-font-sans)' }}>
              {encounter.species.name}
            </h2>
            <p className="text-lg text-muted-foreground font-mono">
              Level {encounter.wildLevel}
            </p>
          </div>
          
          <div className="flex justify-center gap-2">
            <Badge
              style={{
                backgroundColor: elementColors.primary,
                color: '#000',
              }}
              className="font-semibold"
            >
              {encounter.species.element}
            </Badge>
            <Badge
              style={{
                backgroundColor: rarityColors.color,
                color: '#fff',
                boxShadow: `0 0 12px ${rarityColors.glow}`,
              }}
              className="font-semibold"
            >
              {encounter.species.rarity}
            </Badge>
          </div>
          
          {!team || team.length === 0 ? (
            <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-950/30 p-3 rounded-lg">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">No monsters in your team! Capture one first.</span>
            </div>
          ) : null}
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={handleFight}
              disabled={!team || team.length === 0 || isStartingBattle}
              className="glow-cyan font-bold"
              data-testid="button-fight"
            >
              <Swords size={20} />
              Fight
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {}}
              disabled={!team || team.length === 0}
              className="glow-violet font-bold"
              data-testid="button-capture"
            >
              <Package size={20} />
              Capture
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleRunAway}
              className="font-bold"
              data-testid="button-run-away"
            >
              Run Away
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
