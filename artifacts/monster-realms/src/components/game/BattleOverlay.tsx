import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import MonsterPortrait from './MonsterPortrait';
import { useGameStore } from '@/store/game-store';
import { useGetBattle, usePerformBattleAction, getGetBattleQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ELEMENT_COLORS } from '@/lib/element-colors';
import { Swords, Zap, Shield, Package } from 'lucide-react';

export default function BattleOverlay() {
  const { battle, endBattle, updateBattle } = useGameStore();
  const queryClient = useQueryClient();
  
  const { data: battleData } = useGetBattle(battle.battleId || '', {
    query: {
      enabled: !!battle.battleId && battle.active,
      queryKey: getGetBattleQueryKey(battle.battleId || ''),
      refetchInterval: battle.active ? 1000 : false,
    },
  });
  
  const performAction = usePerformBattleAction();
  
  useEffect(() => {
    if (battleData && battle.active) {
      updateBattle(battleData);
      
      // Check if battle ended
      if (battleData.status !== 'active') {
        setTimeout(() => {
          endBattle();
        }, 3000);
      }
    }
  }, [battleData]);
  
  if (!battle.active || !battle.battle) return null;
  
  const { wildMonster, playerMonster, log, status } = battle.battle;
  
  const handleAction = async (action: 'attack' | 'skill1' | 'skill2' | 'ultimate' | 'capture' | 'flee') => {
    if (!battle.battleId) return;
    
    try {
      const updatedBattle = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action, orbType: action === 'capture' ? 'Basic' : null },
      });
      updateBattle(updatedBattle);
      
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };
  
  const playerHpPercent = (playerMonster.currentHp / playerMonster.maxHp) * 100;
  const wildHpPercent = (wildMonster.currentHp / wildMonster.maxHp) * 100;
  
  const wildColors = ELEMENT_COLORS[wildMonster.species.element];
  const playerColors = ELEMENT_COLORS[playerMonster.species.element];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-2xl p-6 space-y-4">
        {/* Battle Status */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">
            {status === 'active' ? 'Battle in Progress' : status === 'won' ? 'Victory!' : status === 'captured' ? 'Captured!' : status === 'fled' ? 'Escaped' : 'Defeated'}
          </h2>
        </div>
        
        {/* Monsters */}
        <div className="grid grid-cols-2 gap-8">
          {/* Player Monster */}
          <div className="space-y-3">
            <div className="flex justify-start">
              <MonsterPortrait
                element={playerMonster.species.element}
                size="lg"
                shinyVariant={playerMonster.shinyVariant}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">{playerMonster.species.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">Level {playerMonster.level}</p>
              <Progress value={playerHpPercent} className="mt-2 h-3" />
              <p className="text-xs font-mono mt-1">
                HP: {playerMonster.currentHp} / {playerMonster.maxHp}
              </p>
              <div className="flex gap-2 mt-2 text-xs font-mono">
                <Badge variant="outline">ATK {playerMonster.attack}</Badge>
                <Badge variant="outline">DEF {playerMonster.defense}</Badge>
                <Badge variant="outline">SPD {playerMonster.speed}</Badge>
              </div>
            </div>
          </div>
          
          {/* Wild Monster */}
          <div className="space-y-3">
            <div className="flex justify-end">
              <MonsterPortrait
                element={wildMonster.species.element}
                size="lg"
                shinyVariant={wildMonster.shinyVariant}
              />
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold">{wildMonster.species.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">Level {wildMonster.level}</p>
              <Progress value={wildHpPercent} className="mt-2 h-3" />
              <p className="text-xs font-mono mt-1">
                HP: {wildMonster.currentHp} / {wildMonster.maxHp}
              </p>
              <div className="flex gap-2 mt-2 text-xs font-mono justify-end">
                <Badge variant="outline">ATK {wildMonster.attack}</Badge>
                <Badge variant="outline">DEF {wildMonster.defense}</Badge>
                <Badge variant="outline">SPD {wildMonster.speed}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Battle Log */}
        <ScrollArea className="h-32 glass-panel rounded-lg p-3">
          <div className="space-y-1">
            {log.slice(-8).map((entry, i) => (
              <p key={i} className="text-sm font-mono">
                <span className={entry.actor === 'player' ? 'text-cyan-400' : 'text-violet-400'}>
                  Turn {entry.turn}:
                </span>{' '}
                {entry.description}
                {entry.damageDealt ? ` (${entry.damageDealt} damage${entry.critical ? ' - CRITICAL!' : ''})` : ''}
              </p>
            ))}
          </div>
        </ScrollArea>
        
        {/* Actions */}
        {status === 'active' ? (
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={() => handleAction('attack')}
              disabled={performAction.isPending}
              className="glow-cyan font-bold"
              data-testid="button-attack"
            >
              <Swords size={20} />
              Attack
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleAction('skill1')}
              disabled={performAction.isPending}
              className="glow-violet font-bold"
              data-testid="button-skill"
            >
              <Zap size={20} />
              Skill
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction('capture')}
              disabled={performAction.isPending}
              className="font-bold glow-gold"
              data-testid="button-capture-battle"
            >
              <Package size={20} />
              Capture
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction('flee')}
              disabled={performAction.isPending}
              className="font-bold"
              data-testid="button-flee"
            >
              Flee
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            {status === 'won' && (
              <div className="text-lg font-semibold">
                <p className="text-green-400">You won the battle!</p>
                {battle.battle.expReward && <p className="text-sm font-mono">+{battle.battle.expReward} EXP</p>}
                {battle.battle.coinReward && <p className="text-sm font-mono">+{battle.battle.coinReward} coins</p>}
              </div>
            )}
            <Button variant="default" onClick={endBattle} data-testid="button-close-battle">
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
