import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/store/game-store';
import { useGetPlayerCollection } from '@workspace/api-client-react';
import type { CapturedMonster } from '@workspace/api-client-react';
import { ELEMENT_COLORS, RARITY_COLORS, QUALITY_LABEL } from '@/lib/element-colors';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { MythDetailModal } from '@/components/MythDetailModal';
import { ArrowLeft, Search } from 'lucide-react';

export default function Collection() {
  const { player } = useGameStore();
  const [elementFilter, setElementFilter] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedMonster, setSelectedMonster] = useState<CapturedMonster | null>(null);
  
  const { data: collection, isLoading } = useGetPlayerCollection(
    player?.id || '',
    {
      element: elementFilter && elementFilter !== 'all' ? elementFilter : undefined,
      rarity: rarityFilter && rarityFilter !== 'all' ? rarityFilter : undefined,
    },
    { query: { enabled: !!player?.id } },
  );
  
  const filteredCollection = collection?.filter((m) =>
    m.species.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.nickname && m.nickname.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <div className="min-h-[100dvh] w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/game">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft size={24} />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Collection</h1>
            <p className="text-muted-foreground font-mono">
              {collection?.length || 0} myths captured
            </p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <Select value={elementFilter} onValueChange={setElementFilter}>
            <SelectTrigger data-testid="select-element">
              <SelectValue placeholder="Filter by element" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Elements</SelectItem>
              {['Fire', 'Water', 'Earth', 'Storm', 'Shadow'].map((el) => (
                <SelectItem key={el} value={el}>{el}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger data-testid="select-rarity">
              <SelectValue placeholder="Filter by quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Qualities</SelectItem>
              <SelectItem value="C">Common (C)</SelectItem>
              <SelectItem value="B">Uncommon (B)</SelectItem>
              <SelectItem value="A">Rare (A)</SelectItem>
              <SelectItem value="S">Legendary (S)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(elementFilter || rarityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setElementFilter('');
              setRarityFilter('');
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      ) : !filteredCollection || filteredCollection.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <p className="text-xl text-muted-foreground">No myths found</p>
          <p className="text-sm text-muted-foreground mt-2">Explore the world to capture myths!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCollection.map((monster, i) => {
            const elementColors = ELEMENT_COLORS[monster.species.element];
            const rarityColors = RARITY_COLORS[monster.species.rarity];
            
            return (
              <div
                key={monster.id}
                className="glass-panel p-4 rounded-2xl space-y-3 hover:scale-105 transition-transform cursor-pointer active:scale-100"
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
                data-testid={`monster-card-${monster.id}`}
                onClick={() => setSelectedMonster(monster)}
              >
                <div className="flex justify-center">
                  <MythSvgIcon
                    mythId={monster.species.id}
                    element={monster.species.element}
                    rarity={monster.species.rarity}
                    size={96}
                  />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-center">
                    {monster.nickname || monster.species.name}
                  </h3>
                  {monster.nickname && (
                    <p className="text-xs text-muted-foreground text-center">
                      {monster.species.name}
                    </p>
                  )}
                  <p className="text-sm text-center font-mono">Level {monster.level}</p>
                </div>
                
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge
                    style={{
                      backgroundColor: elementColors.primary,
                      color: '#000',
                      fontSize: '10px',
                    }}
                  >
                    {monster.species.element}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: rarityColors.color,
                      color: '#fff',
                      fontSize: '10px',
                    }}
                  >
                    {monster.species.rarity}
                  </Badge>
                </div>
                
                {monster.inTeam && (
                  <Badge variant="outline" className="w-full justify-center text-xs">
                    In Team
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <MythDetailModal
        monster={selectedMonster}
        playerId={player?.id || ''}
        onClose={() => setSelectedMonster(null)}
      />
    </div>
  );
}
