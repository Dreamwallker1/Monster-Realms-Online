import { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { getElementColors, QUALITY_LABEL } from '@/lib/element-colors';
import { getWeaknesses, getStrengths, getNotVery, ELEMENT_ICON, ELEMENT_COLOR } from '@/lib/type-chart';
import { useUpdateCapturedMonster, getGetPlayerCollectionQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { CapturedMonster } from '@workspace/api-client-react';
import { X, Pencil, Check, Swords, Shield, Zap, Heart } from 'lucide-react';

interface MythDetailModalProps {
  monster: CapturedMonster | null;
  playerId: string;
  onClose: () => void;
}

const MAX_STAT = 200;

function StatBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = Math.min(100, (value / MAX_STAT) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 w-14 shrink-0">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-[10px] font-mono text-white/50">{label}</span>
      </div>
      <div
        className="flex-1 h-2.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}55`,
          }}
        />
      </div>
      <span className="text-[11px] font-mono text-white/70 w-8 text-right shrink-0 font-bold">
        {value}
      </span>
    </div>
  );
}

function SkillBadge({ skill }: { skill: { name: string; type: string; element: string; power: number; accuracy: number; description: string } }) {
  const elColor = ELEMENT_COLOR[skill.element] ?? '#888';
  return (
    <div
      className="rounded-xl p-2.5 space-y-1"
      style={{
        background: `rgba(255,255,255,0.04)`,
        border: `1px solid ${elColor}33`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-white">{skill.name}</span>
        <div className="flex gap-1">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: elColor + '33', color: elColor }}
          >
            {ELEMENT_ICON[skill.element]} {skill.element}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          >
            {skill.type}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-white/40 leading-relaxed">{skill.description}</p>
      <div className="flex gap-3 text-[9px] font-mono text-white/30">
        <span>PWR {skill.power}</span>
        <span>ACC {skill.accuracy}%</span>
      </div>
    </div>
  );
}

export function MythDetailModal({ monster, playerId, onClose }: MythDetailModalProps) {
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameValue, setNicknameValue] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: updateMonster } = useUpdateCapturedMonster();

  if (!monster) return null;

  const sp = monster.species;
  const el = getElementColors(sp.element);
  const qualLabel = QUALITY_LABEL[sp.rarity] ?? sp.rarity;

  const weakTo = getWeaknesses(sp.element);
  const strongVs = getStrengths(sp.element);
  const notVery = getNotVery(sp.element);

  const displayName = monster.nickname || sp.name;

  function startEditNickname() {
    setNicknameValue(monster!.nickname || '');
    setEditingNickname(true);
  }

  async function saveNickname() {
    if (!monster) return;
    setSavingNickname(true);
    try {
      await updateMonster({
        playerId,
        capturedId: monster.id,
        data: { nickname: nicknameValue.trim() || null },
      });
      queryClient.invalidateQueries({ queryKey: getGetPlayerCollectionQueryKey(playerId) });
      setEditingNickname(false);
    } catch (e) {
      console.error('Failed to save nickname', e);
    } finally {
      setSavingNickname(false);
    }
  }

  return (
    <Dialog open={!!monster} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-md w-full p-0 border-0 overflow-hidden"
        style={{
          background: `linear-gradient(160deg, rgba(8,8,22,0.99) 0%, rgba(4,4,14,1) 100%)`,
          border: `1.5px solid ${el.primary}44`,
          boxShadow: `0 12px 60px rgba(0,0,0,0.9), 0 0 30px ${el.glow}`,
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Element accent stripe */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${el.primary}, ${el.secondary})` }} />

        {/* Close button */}
        <DialogClose asChild>
          <button
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            aria-label="Close"
          >
            <X size={14} className="text-white/60" />
          </button>
        </DialogClose>

        {/* Art + header */}
        <div
          className="relative flex flex-col items-center pt-6 pb-4 px-5"
          style={{
            background: `radial-gradient(ellipse at 50% 70%, ${el.primary}20 0%, transparent 65%)`,
          }}
        >
          {/* Level badge */}
          <div className="absolute top-3 left-4">
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Lv.{monster.level}
            </span>
          </div>

          {/* Rarity badge */}
          <div className="absolute top-3 right-10">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: el.primary + '28',
                color: el.primary,
                border: `1px solid ${el.primary}44`,
              }}
            >
              {qualLabel}
            </span>
          </div>

          {/* Shiny badge */}
          {monster.shinyVariant && (
            <div className="absolute top-8 right-10">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                ✨ {monster.shinyVariant}
              </span>
            </div>
          )}

          {/* Art */}
          <MythSvgIcon
            mythId={sp.id}
            element={sp.element}
            rarity={sp.rarity}
            size={140}
          />

          {/* Name + element */}
          <div className="mt-3 flex flex-col items-center gap-1 w-full">
            {editingNickname ? (
              <div className="flex items-center gap-2 w-full max-w-[220px]">
                <Input
                  value={nicknameValue}
                  onChange={(e) => setNicknameValue(e.target.value)}
                  placeholder={sp.name}
                  maxLength={20}
                  className="h-7 text-sm text-center font-bold border-0 focus-visible:ring-1"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveNickname(); if (e.key === 'Escape') setEditingNickname(false); }}
                  autoFocus
                />
                <Button
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  variant="ghost"
                  onClick={saveNickname}
                  disabled={savingNickname}
                >
                  <Check size={14} style={{ color: el.primary }} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{displayName}</h2>
                <button
                  onClick={startEditNickname}
                  className="opacity-30 hover:opacity-70 transition-opacity"
                  title="Edit nickname"
                >
                  <Pencil size={12} className="text-white/60" />
                </button>
              </div>
            )}

            {monster.nickname && (
              <p className="text-[11px] text-white/35">{sp.name}</p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: el.primary + '25', color: el.primary }}
              >
                {ELEMENT_ICON[sp.element]} {sp.element}
              </span>
              {monster.personality && (
                <span className="text-[10px] text-white/30 italic">{monster.personality}</span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-6 space-y-5">

          {/* Description */}
          <p className="text-[11px] text-white/45 leading-relaxed text-center">{sp.description}</p>

          {/* Actual battle stats */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-2">Battle Stats</p>
            <StatBar label="HP"  value={monster.maxHp}   color={el.primary}  icon={<Heart size={10} />} />
            <StatBar label="ATK" value={monster.attack}  color="#EF4444" icon={<Swords size={10} />} />
            <StatBar label="DEF" value={monster.defense} color="#3B82F6" icon={<Shield size={10} />} />
            <StatBar label="SPD" value={monster.speed}   color="#22C55E" icon={<Zap size={10} />} />
          </div>

          {/* Type matchups */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Type Matchups</p>
            <div className="flex flex-wrap gap-1.5">
              {strongVs.map((e) => (
                <span
                  key={e}
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: ELEMENT_COLOR[e] + '30', color: ELEMENT_COLOR[e], border: `1px solid ${ELEMENT_COLOR[e]}44` }}
                  title={`Strong vs ${e}`}
                >
                  💪 {ELEMENT_ICON[e]} {e}
                </span>
              ))}
              {weakTo.map((e) => (
                <span
                  key={e}
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(255,80,80,0.12)', color: '#f87171', border: '1px solid rgba(255,80,80,0.25)' }}
                  title={`Weak to ${e}`}
                >
                  ⚠️ {ELEMENT_ICON[e]} {e}
                </span>
              ))}
              {notVery.map((e) => (
                <span
                  key={e}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                  title={`Resisted by ${e}`}
                >
                  🔻 {ELEMENT_ICON[e]} {e}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          {sp.skills && sp.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Skills</p>
              <div className="grid grid-cols-1 gap-2">
                {sp.skills.slice(0, 4).map((skill) => (
                  <SkillBadge key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Lore */}
          {(sp as any).lore && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Lore</p>
              <p className="text-[11px] text-white/35 leading-relaxed italic">{(sp as any).lore}</p>
            </div>
          )}

          {/* Extra info row */}
          <div className="flex justify-between text-[10px] font-mono text-white/25 pt-1 border-t border-white/5">
            <span>❤️ Friendship {monster.friendship}</span>
            {monster.inTeam && (
              <span className="text-green-400/50">✦ In Team</span>
            )}
            <span>📅 Lv.{monster.level}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MythDetailModal;
