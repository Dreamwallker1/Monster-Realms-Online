import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MonsterPortrait from '@/components/game/MonsterPortrait';
import { useListMonsterSpecies, type MonsterSpecies, MonsterSpeciesElement, MonsterSpeciesRarity } from '@workspace/api-client-react';
import { ArrowLeft, Search, Info } from 'lucide-react';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/lib/element-colors';

export default function Encyclopedia() {
  const [elementFilter, setElementFilter] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<MonsterSpecies | null>(null);
  
  const { data: species, isLoading } = useListMonsterSpecies({
    params: {
      element: elementFilter || undefined,
      rarity: rarityFilter || undefined,
      search: search || undefined,
    },
  });
  
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
            <h1 className="text-4xl font-bold">Encyclopedia</h1>
            <p className="text-muted-foreground font-mono">
              {species?.length || 0} species discovered
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
              placeholder="Search species..."
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
              {Object.keys(MonsterSpeciesElement).map((element) => (
                <SelectItem key={element} value={element}>
                  {element}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger data-testid="select-rarity">
              <SelectValue placeholder="Filter by rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              {Object.keys(MonsterSpeciesRarity).map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading encyclopedia...</p>
        </div>
      ) : !species || species.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <p className="text-xl text-muted-foreground">No species found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {species.map((s, i) => {
            const elementColors = ELEMENT_COLORS[s.element];
            const rarityColors = RARITY_COLORS[s.rarity];
            
            return (
              <div
                key={s.id}
                className="glass-panel p-4 rounded-2xl space-y-3 hover:scale-105 transition-transform cursor-pointer"
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
                onClick={() => setSelectedSpecies(s)}
                data-testid={`species-card-${s.id}`}
              >
                <div className="flex justify-center">
                  <MonsterPortrait element={s.element} size="md" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-center">{s.name}</h3>
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">
                    {s.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge
                    style={{
                      backgroundColor: elementColors.primary,
                      color: '#000',
                      fontSize: '10px',
                    }}
                  >
                    {s.element}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: rarityColors.color,
                      color: '#fff',
                      fontSize: '10px',
                    }}
                  >
                    {s.rarity}
                  </Badge>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full" data-testid={`button-info-${s.id}`}>
                  <Info size={16} />
                  Details
                </Button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Detail Dialog */}
      <Dialog open={!!selectedSpecies} onOpenChange={() => setSelectedSpecies(null)}>
        <DialogContent className="max-w-2xl glass-panel">
          {selectedSpecies && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{selectedSpecies.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex justify-center">
                  <MonsterPortrait element={selectedSpecies.element} size="lg" />
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Badge
                    style={{
                      backgroundColor: ELEMENT_COLORS[selectedSpecies.element].primary,
                      color: '#000',
                    }}
                  >
                    {selectedSpecies.element}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: RARITY_COLORS[selectedSpecies.rarity].color,
                      color: '#fff',
                    }}
                  >
                    {selectedSpecies.rarity}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm">{selectedSpecies.description}</p>
                  <p className="text-sm italic text-muted-foreground">{selectedSpecies.lore}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div>
                    <p className="text-muted-foreground">Base HP</p>
                    <p className="font-bold">{selectedSpecies.baseHp}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Base Attack</p>
                    <p className="font-bold">{selectedSpecies.baseAttack}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Base Defense</p>
                    <p className="font-bold">{selectedSpecies.baseDefense}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Base Speed</p>
                    <p className="font-bold">{selectedSpecies.baseSpeed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capture Rate</p>
                    <p className="font-bold">{(selectedSpecies.captureRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Personality</p>
                    <p className="font-bold">{selectedSpecies.personality}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Skills</h4>
                  <div className="space-y-2">
                    {selectedSpecies.skills.map((skill, i) => (
                      <div key={i} className="glass-panel p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{skill.name}</p>
                            <p className="text-xs text-muted-foreground">{skill.description}</p>
                          </div>
                          <div className="text-right text-xs font-mono">
                            <p>Power: {skill.power}</p>
                            <p>Acc: {skill.accuracy}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
