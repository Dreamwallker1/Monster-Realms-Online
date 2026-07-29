import { Badge } from '@/components/ui/badge';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { getElementColors, QUALITY_LABEL } from '@/lib/element-colors';
import { getWeaknesses, getStrengths, getNotVery, ELEMENT_ICON, ELEMENT_COLOR } from '@/lib/type-chart';
import type { MythEntry } from '@/lib/myth-catalogue';

interface MythCardProps {
  myth: MythEntry;
  capturedLevel?: number;    // if player owns it; undefined = not owned
  compact?: boolean;          // small version for grid
  onClick?: () => void;
}

const MAX_STAT = 145; // approximate max stat value for normalization

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, (value / MAX_STAT) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-white/50 w-8 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/60 w-7 text-right shrink-0">{value}</span>
    </div>
  );
}

export function MythCard({ myth, capturedLevel, compact = false, onClick }: MythCardProps) {
  const el       = getElementColors(myth.element);
  const qualLabel = QUALITY_LABEL[myth.rarity] ?? myth.rarity;
  const isOwned  = capturedLevel !== undefined;

  const weakTo    = getWeaknesses(myth.element);
  const strongVs  = getStrengths(myth.element);
  const notVery   = getNotVery(myth.element);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="relative rounded-2xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95 hover:scale-102 text-left"
        style={{
          background: isOwned
            ? `linear-gradient(135deg, rgba(10,10,25,0.92), rgba(5,5,15,0.96))`
            : 'rgba(5,5,15,0.6)',
          border: `1.5px solid ${isOwned ? el.primary + '66' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: isOwned ? `0 0 14px ${el.glow}` : 'none',
        }}
      >
        {/* SVG art or locked silhouette */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {isOwned ? (
            <MythSvgIcon mythId={myth.id} element={myth.element} rarity={myth.rarity} size={60}/>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <MythSvgIcon mythId={myth.id} element={myth.element} rarity={myth.rarity} size={52}
                  className="opacity-15 grayscale saturate-0"/>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </>
          )}
        </div>
        {/* Name */}
        <div className="text-center">
          <p className="text-[11px] font-bold leading-tight"
            style={{ color: isOwned ? 'white' : 'rgba(255,255,255,0.3)' }}>
            {isOwned ? myth.name : '???'}
          </p>
          <div className="flex gap-1 justify-center mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: isOwned ? el.primary + '33' : 'rgba(255,255,255,0.05)',
                       color: isOwned ? el.primary : 'rgba(255,255,255,0.2)' }}>
              {isOwned ? myth.element : '?'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
              {isOwned ? qualLabel : '?'}
            </span>
          </div>
        </div>
        {capturedLevel !== undefined && (
          <span className="text-[9px] font-mono text-white/40">Lv.{capturedLevel}</span>
        )}
      </button>
    );
  }

  // Full card view
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(160deg, rgba(10,10,28,0.98) 0%, rgba(5,5,18,1) 100%)`,
        border: `1.5px solid ${el.primary}55`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.8), 0 0 20px ${el.glow}`,
        maxWidth: 320,
      }}
    >
      {/* Header banner */}
      <div className="h-3" style={{ background: `linear-gradient(90deg, ${el.primary}, ${el.secondary})` }}/>

      {/* Art area */}
      <div className="relative flex items-center justify-center py-6"
        style={{ background: `radial-gradient(ellipse at 50% 60%, ${el.primary}22 0%, transparent 70%)` }}>
        <MythSvgIcon mythId={myth.id} element={myth.element} rarity={myth.rarity} size={130}/>
        {/* Rarity badge top-right */}
        <div className="absolute top-3 right-3">
          <Badge className="text-[10px] font-bold px-2 py-0.5"
            style={{ background: el.primary + '33', color: el.primary,
                     border: `1px solid ${el.primary}55`, boxShadow: 'none' }}>
            {qualLabel}
          </Badge>
        </div>
        {capturedLevel !== undefined && (
          <div className="absolute top-3 left-3">
            <Badge className="text-[10px] font-mono px-2 py-0.5"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                       border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'none' }}>
              Lv.{capturedLevel}
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-5 pb-5 space-y-4">
        {/* Name + element */}
        <div className="flex items-baseline justify-between">
          <h3 className="font-bold text-lg text-white">{myth.name}</h3>
          <span className="text-sm font-bold" style={{ color: el.primary }}>
            {ELEMENT_ICON[myth.element]} {myth.element}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-white/50 leading-relaxed">{myth.description}</p>

        {/* Stats */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-2">Base Stats</p>
          <StatBar label="HP"  value={myth.baseHp}      color={el.primary}/>
          <StatBar label="ATK" value={myth.baseAttack}  color="#EF4444"/>
          <StatBar label="DEF" value={myth.baseDefense} color="#3B82F6"/>
          <StatBar label="SPD" value={myth.baseSpeed}   color="#22C55E"/>
        </div>

        {/* Type matchups */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Type Matchups</p>
          {strongVs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-white/40 self-center">Strong vs</span>
              {strongVs.map((e) => (
                <span key={e} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: ELEMENT_COLOR[e] + '33', color: ELEMENT_COLOR[e] }}>
                  {ELEMENT_ICON[e]} {e}
                </span>
              ))}
            </div>
          )}
          {weakTo.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-white/40 self-center">Weak to</span>
              {weakTo.map((e) => (
                <span key={e} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: ELEMENT_COLOR[e] + '22', color: ELEMENT_COLOR[e], border: `1px solid ${ELEMENT_COLOR[e]}44` }}>
                  {ELEMENT_ICON[e]} {e}
                </span>
              ))}
            </div>
          )}
          {notVery.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-white/30 self-center">Resisted by</span>
              {notVery.map((e) => (
                <span key={e} className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                  {ELEMENT_ICON[e]} {e}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MythCard;
