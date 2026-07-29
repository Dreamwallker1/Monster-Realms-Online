export enum TileType {
  Grass = 0,
  Forest = 1,
  Water = 2,
  Mountain = 3,
  Sand = 4,
  Ancient = 5,
}

export const TILE_COLORS: Record<TileType, string[]> = {
  [TileType.Grass]: ['#2d5a27', '#3d7a33'],
  [TileType.Forest]: ['#1a4020', '#1a5028'],
  [TileType.Water]: ['#1a3a6b', '#1e4a7e'],
  [TileType.Mountain]: ['#4a4a4a', '#5a5a5a'],
  [TileType.Sand]: ['#8a7a50', '#9a8a60'],
  [TileType.Ancient]: ['#3a2a4a', '#4a3a5a'],
};

export function generateTerrain(width: number, height: number): TileType[][] {
  const terrain: TileType[][] = [];
  
  // Initialize with grass
  for (let y = 0; y < height; y++) {
    terrain[y] = [];
    for (let x = 0; x < width; x++) {
      terrain[y][x] = TileType.Grass;
    }
  }
  
  // Generate clusters of different terrain types
  const clusters = [
    { type: TileType.Forest, count: 8, size: 6 },
    { type: TileType.Water, count: 5, size: 5 },
    { type: TileType.Mountain, count: 6, size: 4 },
    { type: TileType.Sand, count: 4, size: 5 },
    { type: TileType.Ancient, count: 2, size: 3 },
  ];
  
  clusters.forEach(({ type, count, size }) => {
    for (let i = 0; i < count; i++) {
      const centerX = Math.floor(Math.random() * width);
      const centerY = Math.floor(Math.random() * height);
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;
          
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= size && Math.random() < 0.7) {
              terrain[y][x] = type;
            }
          }
        }
      }
    }
  });
  
  return terrain;
}

export function isPassable(tileType: TileType): boolean {
  return tileType !== TileType.Water && tileType !== TileType.Mountain;
}
