import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameStore } from '@/store/game-store';
import { useGetBattle, usePerformBattleAction, getGetBattleQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getElementColors } from '@/lib/element-colors';
import { getMonsterEmoji } from '@/lib/monster-emoji';
import { Swords, Zap, Package } from 'lucide-react';

export default function BattleOverlay() {
  const { battle, endBattle, updateBattle } = useGameStore();
  const queryClient = useQueryClient();
  const [captureMsg, setCaptureMsg] = useState<string | null>(null);

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
      if (battleData.status !== 'active') {
        setTimeout(() => { endBattle(); setCaptureMsg(null); }, 3500);
      }
    }
  }, [battleData]);

  if (!battle.active || !battle.battle) return null;

  const { wildMonster, playerMonster, log, status } = battle.battle;
  const playerHpPct = (playerMonster.currentHp / playerMonster.maxHp) * 100;
  const wildHpPct   = (wildMonster.currentHp / wildMonster.maxHp) * 100;
  const wildColors   = getElementColors(wildMonster.species.element);
  const playerColors = getElementColors(playerMonster.species.element);
  const isPending    = performAction.isPending;
  const isOver       = status !== 'active';

  const handleAction = async (action: 'attack' | 'skill1' | 'skill2' | 'ultimate' | 'capture' | 'flee') => {
    if (!battle.battleId) return;
    try {
      const updated = await performAction.mutateAsync({
        battleId: battle.battleId,
        data: { action, orbType: action === 'capture' ? 'Basic' : null },
      });
      updateBattle(updated);
      queryClient.invalidateQueries({ queryKey: getGetBattleQueryKey(battle.battleId) });

      // Show capture result inline
      if (action === 'capture') {
        const lastLog = updated.log?.slice(-1)[0];
        if (lastLog?.action === 'capture') {
          setCaptureMsg(lastLog.description);
          setTimeout(() => setCaptureMsg(null), 2500);
        }
      }
    } catch (err) {
      console.error('Battle action failed:', err);
    }
  };

  // HP bar color: green → yellow → red
  function hpBarColor(pct: number) {
    if (pct > 50) return 'bg-emerald-500';
    if (pct > 20) return 'bg-yellow-400';
    return 'bg-red-500';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-5 flex flex-col gap-4">

        {/* Status header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary">
            {status === 'active'   ? '⚔️ Battle!'
           : status === 'captured' ? '✅ Captured!'
           : status === 'won'      ? '🏆 Victory!'
           : status === 'fled'     ? '💨 Escaped'
           :                         '💀 Defeated'}
          </h2>
        </div>

        {/* Arena — wild on top, player on bottom */}
        <div className="flex flex-col gap-4">

          {/* Wild myth */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${wildColors.primary}15, ${wildColors.primary}05)`, border: `1px solid ${wildColors.primary}33` }}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: `radial-gradient(circle, ${wildColors.primary}33, ${wildColors.primary}11)`, border: `1px solid ${wildColors.primary}55` }}
            >
              {getMonsterEmoji(wildMonster.species.id, wildMonster.species.element)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="font-bold">{wildMonster.species.name}</span>
                <span className="text-xs font-mono text-muted-foreground">Lv {wildMonster.level}</span>
              </div>
              <div className={`h-2.5 rounded-full mt-1.5 ${hpBarColor(wildHpPct)} transition-all`}
                style={{ width: `${Math.max(0, wildHpPct)}%`, backgroundColor: undefined }}
              />
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                HP {wildMonster.currentHp} / {wildMonster.maxHp}
                {wildHpPct < 30 && <span className="text-emerald-400 ml-2">↑ Good capture chance!</span>}
              </p>
            </div>
            {wildMonster.shinyVariant && (
              <Badge className="shrink-0 text-xs" style={{ background: 'gold', color: '#000' }}>✨ Shiny</Badge>
            )}
          </div>

          {/* Player myth */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${playerColors.primary}15, ${playerColors.primary}05)`, border: `1px solid ${playerColors.primary}33` }}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: `radial-gradient(circle, ${playerColors.primary}33, ${playerColors.primary}11)`, border: `1px solid ${playerColors.primary}55` }}
            >
              {getMonsterEmoji(playerMonster.species.id, playerMonster.species.element)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="font-bold">{playerMonster.species.name}</span>
                <span className="text-xs font-mono text-muted-foreground">Lv {playerMonster.level}</span>
              </div>
              <div
                className={`h-2.5 rounded-full mt-1.5 ${hpBarColor(playerHpPct)} transition-all`}
                style={{ width: `${Math.max(0, playerHpPct)}%`, backgroundColor: undefined }}
              />
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                HP {playerMonster.currentHp} / {playerMonster.maxHp}
              </p>
            </div>
          </div>
        </div>

        {/* Capture feedback toast */}
        {captureMsg && (
          <div className={`text-center text-sm font-semibold py-2 px-4 rounded-lg ${
            captureMsg.includes('captured') ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
          }`}>
            {captureMsg.includes('captured') ? '✅' : '❌'} {captureMsg}
          </div>
        )}

        {/* Battle log */}
        <ScrollArea className="h-24 glass-panel rounded-lg p-2">
          <div className="space-y-0.5">
            {log.slice(-6).map((entry, i) => (
              <p key={i} className="text-xs font-mono leading-relaxed">
                <span className={entry.actor === 'player' ? 'text-cyan-400' : 'text-violet-400'}>
                  [{entry.turn}]
                </span>{' '}
                {entry.description}
                {entry.critical && <span className="text-yellow-400"> ★CRIT</span>}
              </p>
            ))}
          </div>
        </ScrollArea>

        {/* Actions */}
        {!isOver ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleAction('attack')}
              disabled={isPending}
              className="glow-cyan font-bold"
              data-testid="button-attack"
            >
              <Swords size={16} className="mr-1" /> Attack
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleAction('skill1')}
              disabled={isPending}
              className="glow-violet font-bold"
              data-testid="button-skill"
            >
              <Zap size={16} className="mr-1" /> Skill
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('capture')}
              disabled={isPending}
              className="font-bold border-amber-500/50 text-amber-300 hover:bg-amber-950/40"
              data-testid="button-capture-battle"
            >
              <Package size={16} className="mr-1" /> Throw Orb
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('flee')}
              disabled={isPending}
              className="font-bold"
              data-testid="button-flee"
            >
              Flee
            </Button>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            {status === 'captured' && (
              <div className="py-2">
                <p className="text-2xl mb-1">{getMonsterEmoji(wildMonster.species.id, wildMonster.species.element)}</p>
                <p className="text-emerald-400 font-bold text-lg">{wildMonster.species.name} joined your collection!</p>
              </div>
            )}
            {status === 'won' && battle.battle.expReward && (
              <div className="text-sm font-mono">
                <span className="text-cyan-400">+{battle.battle.expReward} EXP</span>
                {battle.battle.coinReward && <span className="text-yellow-400 ml-3">+{battle.battle.coinReward} coins</span>}
              </div>
            )}
            {status === 'lost' && <p className="text-red-400">Your myth fainted...</p>}
            <Button variant="default" onClick={endBattle} className="w-full" data-testid="button-close-battle">
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
