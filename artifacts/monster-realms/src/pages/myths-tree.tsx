import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Lock, Trees } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useGetPlayerCollection } from '@workspace/api-client-react';
import { ALL_MYTHS } from '@/lib/myth-catalogue';
import { MythCard } from '@/components/MythCard';
import { ELEMENT_ICON, ELEMENT_COLOR } from '@/lib/type-chart';
import type { MythEntry } from '@/lib/myth-catalogue';

const ELEMENTS = ['All', 'Fire', 'Water', 'Nature', 'Electric', 'Dark'] as const;

export default function MythsTree() {
  const { player } = useGameStore();
  const [elementFilter, setElementFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedMyth, setSelectedMyth] = useState<MythEntry | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);

  const { data: collection } = useGetPlayerCollection(player?.id ?? '', {
    query: { enabled: !!player?.id },
  });

  // Build a map of owned myth IDs → highest level
  const ownedMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!collection) return map;
    for (const captured of collection) {
      const id = captured.species.id;
      const lv = (captured as any).level ?? 1;
      map[id] = Math.max(map[id] ?? 0, lv);
    }
    return map;
  }, [collection]);

  const discoveredCount = useMemo(
    () => ALL_MYTHS.filter((m) => ownedMap[m.id] !== undefined).length,
    [ownedMap],
  );

  const filtered = useMemo(() => {
    return ALL_MYTHS.filter((m) => {
      if (elementFilter !== 'All' && m.element !== elementFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const owned = ownedMap[m.id] !== undefined;
        if (!owned && !m.name.toLowerCase().includes(q)) return false;
        if (owned && !m.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [elementFilter, search, ownedMap]);

  // Sort: owned first, then by rarity (S→A→B→C), then name
  const rarityOrder = { S: 0, A: 1, B: 2, C: 3 };
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aOwned = ownedMap[a.id] !== undefined ? 0 : 1;
      const bOwned = ownedMap[b.id] !== undefined ? 0 : 1;
      if (aOwned !== bOwned) return aOwned - bOwned;
      const rDiff = (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4);
      if (rDiff !== 0) return rDiff;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, ownedMap]);

  return (
    <div className="min-h-[100dvh] w-full" style={{ background: 'linear-gradient(180deg, #050512 0%, #080818 100%)' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: 'rgba(5,5,18,0.94)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href="/game">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <ArrowLeft size={22}/>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Trees size={20} className="text-emerald-400"/>
              <h1 className="text-xl font-bold text-white">Myths Tree</h1>
            </div>
          </div>
          {/* Discovery counter */}
          <div className="text-right">
            <p className="text-lg font-bold text-white">{discoveredCount}<span className="text-white/40 text-sm font-normal"> / {ALL_MYTHS.length}</span></p>
            <p className="text-[10px] text-white/40 font-mono">Discovered</p>
          </div>
        </div>

        {/* Element filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {ELEMENTS.map((el) => {
            const active = elementFilter === el;
            const color = el === 'All' ? '#94A3B8' : ELEMENT_COLOR[el];
            const count = el === 'All'
              ? ALL_MYTHS.length
              : ALL_MYTHS.filter((m) => m.element === el).length;
            const ownedCount = el === 'All'
              ? discoveredCount
              : ALL_MYTHS.filter((m) => m.element === el && ownedMap[m.id] !== undefined).length;
            return (
              <button
                key={el}
                onClick={() => setElementFilter(el)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 text-xs font-bold transition-all"
                style={{
                  background: active ? color + '30' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? color + '88' : 'transparent'}`,
                  color: active ? color : 'rgba(255,255,255,0.45)',
                  boxShadow: active ? `0 0 12px ${color}44` : 'none',
                }}
              >
                {el !== 'All' && <span>{ELEMENT_ICON[el]}</span>}
                {el}
                <span className="opacity-60 font-normal">{ownedCount}/{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search myths..."
            className="pl-8 h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25"
          />
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(discoveredCount / ALL_MYTHS.length) * 100}%`,
              background: 'linear-gradient(90deg, #22C55E, #06B6D4)',
              boxShadow: '0 0 8px #22C55E88',
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">No myths match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {sorted.map((myth) => (
              <MythCard
                key={myth.id}
                myth={myth}
                capturedLevel={ownedMap[myth.id]}
                compact
                onClick={() => {
                  setSelectedMyth(myth);
                  setSelectedLevel(ownedMap[myth.id]);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedMyth && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedMyth(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl">
            {ownedMap[selectedMyth.id] !== undefined ? (
              <MythCard myth={selectedMyth} capturedLevel={selectedLevel}/>
            ) : (
              // Locked preview
              <div className="rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(160deg,rgba(10,10,28,0.98),rgba(5,5,18,1))',
                         border: '1.5px solid rgba(255,255,255,0.08)' }}>
                <div className="h-3 bg-white/10"/>
                <div className="flex flex-col items-center py-10 px-6 gap-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-5xl opacity-20">🔒</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Lock size={18} className="text-white/30"/>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white/20 mb-1">???</p>
                    <p className="text-sm text-white/30">{selectedMyth.element} type</p>
                    <p className="text-xs text-white/20 mt-2">Encounter and capture this myth to reveal its secrets.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
