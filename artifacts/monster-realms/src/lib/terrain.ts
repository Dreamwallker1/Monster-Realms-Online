export enum TileType {
  Grass    = 0, // park lawn — passable
  Path     = 1, // paved walkway — passable
  Tree     = 2, // tree / bush — impassable
  Pond     = 3, // water feature — impassable
  Flower   = 4, // flower bed — passable
  Building = 5, // city building edge — impassable
}

export const TILE_BASE_COLORS: Record<TileType, number> = {
  [TileType.Grass]:    0x3a8c3a,
  [TileType.Path]:     0xc8b99a,
  [TileType.Tree]:     0x1e5c20,
  [TileType.Pond]:     0x2a6ea8,
  [TileType.Flower]:   0x4aaa4a,
  [TileType.Building]: 0x4a5568,
};

/** Per-region colour palette used by WorldScene to visually distinguish zones. */
export interface RegionPalette {
  /** Three grass shades (normal, dark, light) */
  grass: [number, number, number];
  /** Canopy and ground for tree tiles */
  treeShadow: number;
  treeCanopy: [number, number, number];
  /** Grass base colour for flower tiles */
  flowerGrass: number;
  /** Accent tint for the region border edge (drawn at region boundary tiles) */
  borderTint: number;
}

export const REGION_PALETTE: Record<string, RegionPalette> = {
  'verdant-meadows': {
    grass:       [0x3d9240, 0x2e7a32, 0x369138],
    treeShadow:  0x1a5020,
    treeCanopy:  [0x1e6e24, 0x288030, 0x34a040],
    flowerGrass: 0x48a84a,
    borderTint:  0x6edd70,
  },
  'ocean-ruins': {
    grass:       [0x2a7a6a, 0x1a5a52, 0x238070],
    treeShadow:  0x0e3d40,
    treeCanopy:  [0x1a5e6a, 0x247880, 0x2e8a92],
    flowerGrass: 0x2e8878,
    borderTint:  0x40c8cc,
  },
  'volcanic-rift': {
    grass:       [0x7a3a1a, 0x602c12, 0x8a4422],
    treeShadow:  0x3a1808,
    treeCanopy:  [0x5a2e10, 0x6e3818, 0x7a4422],
    flowerGrass: 0x6e3010,
    borderTint:  0xff6620,
  },
  'shadow-marsh': {
    grass:       [0x2e2850, 0x221e3e, 0x3a3260],
    treeShadow:  0x160e28,
    treeCanopy:  [0x2e1e48, 0x3a2858, 0x1e1438],
    flowerGrass: 0x2a2248,
    borderTint:  0x9060cc,
  },
  'ancient-forest': {
    grass:       [0x1a4e2a, 0x10391c, 0x226030],
    treeShadow:  0x0c2a12,
    treeCanopy:  [0x144820, 0x1e5e2c, 0x28783a],
    flowerGrass: 0x185424,
    borderTint:  0x44cc66,
  },
  'thunder-valley': {
    grass:       [0x6a7a20, 0x526010, 0x7a8e28],
    treeShadow:  0x303e08,
    treeCanopy:  [0x4a5e10, 0x5e7418, 0x728a24],
    flowerGrass: 0x607020,
    borderTint:  0xeeee30,
  },
};

export function isPassable(tileType: TileType): boolean {
  return (
    tileType !== TileType.Tree &&
    tileType !== TileType.Pond &&
    tileType !== TileType.Building
  );
}

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────
// Fixed seed → the map is ALWAYS identical across sessions.
// Changing this number regenerates the whole map.
const MAP_SEED = 0xdeadbeef;

function makeRng(seed: number) {
  let s = seed >>> 0;
  return function rand(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Paint helpers ─────────────────────────────────────────────────────────────

function paintHPath(
  terrain: TileType[][],
  row: number, colStart: number, colEnd: number, width = 2,
) {
  for (let r = row; r < row + width; r++)
    for (let c = colStart; c <= colEnd; c++)
      if (r >= 0 && r < terrain.length && c >= 0 && c < terrain[0]!.length)
        terrain[r]![c] = TileType.Path;
}

function paintVPath(
  terrain: TileType[][],
  col: number, rowStart: number, rowEnd: number, width = 2,
) {
  for (let cc = col; cc < col + width; cc++)
    for (let r = rowStart; r <= rowEnd; r++)
      if (r >= 0 && r < terrain.length && cc >= 0 && cc < terrain[0]!.length)
        terrain[r]![cc] = TileType.Path;
}

function paintCircle(
  terrain: TileType[][],
  cx: number, cy: number, radius: number, type: TileType,
) {
  const h = terrain.length, w = terrain[0]!.length;
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++)
      if (dx * dx + dy * dy <= radius * radius) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) terrain[y]![x] = type;
      }
}

// ─── Map generation ────────────────────────────────────────────────────────────

export const WORLD_W = 50;
export const WORLD_H = 50;

/** Spawn point guaranteed to be on the entrance path */
export const SPAWN_X = 25;
export const SPAWN_Y = 4;

export function generateTerrain(
  width = WORLD_W,
  height = WORLD_H,
): TileType[][] {
  const rand = makeRng(MAP_SEED);

  // 1. Base: all grass
  const terrain: TileType[][] = Array.from({ length: height }, () =>
    Array<TileType>(width).fill(TileType.Grass),
  );

  // 2. City buildings — top 3 rows
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < width; x++)
      terrain[y]![x] = TileType.Building;

  // 3. Paths
  // Central vertical entrance
  paintVPath(terrain, Math.floor(width / 2) - 1, 3, height - 1, 3);
  // Horizontal perimeter
  paintHPath(terrain, 3,          0, width - 1, 2);
  paintHPath(terrain, height - 3, 0, width - 1, 2);
  // Vertical perimeter
  paintVPath(terrain, 0,          3, height - 1, 2);
  paintVPath(terrain, width - 2,  3, height - 1, 2);
  // Inner cross
  const midRow = Math.floor(height / 2);
  const midCol = Math.floor(width / 2);
  paintHPath(terrain, midRow - 1, 2, width - 2, 2);
  paintVPath(terrain, midCol - 1, 3, height - 3, 2);
  // Diagonal shortcuts
  for (let i = 0; i < 14; i++) {
    const r = 5 + i, c = 4 + i;
    if (r < height && c < width)     terrain[r]![c] = TileType.Path;
    if (r < height && c + 1 < width) terrain[r]![c + 1] = TileType.Path;
  }
  for (let i = 0; i < 14; i++) {
    const r = midRow + 3 + i, c = midCol + 3 + i;
    if (r < height && c < width)     terrain[r]![c] = TileType.Path;
    if (r < height && c + 1 < width) terrain[r]![c + 1] = TileType.Path;
  }

  // 4. Central pond — placed at (midCol, midRow-6) so it's NORTH of centre,
  //    far from the spawn at (25,4) and the cross-path at midRow.
  const pondCX = midCol;
  const pondCY = midRow - 6; // row 19 — well above the cross-path (row 24)
  paintCircle(terrain, pondCX, pondCY, 4, TileType.Pond);

  // 5. Flower beds
  const flowerSpots: [number, number][] = [
    [midRow - 10, midCol - 6], [midRow - 10, midCol + 5],
    [midRow + 3,  midCol - 6], [midRow + 3,  midCol + 5],
    [8, 8], [8, width - 10],
    [height - 10, 8], [height - 10, width - 10],
    [12, midCol - 8], [12, midCol + 6],
  ];
  for (const [fy, fx] of flowerSpots)
    paintCircle(terrain, fx, fy, 2, TileType.Flower);

  // 6. Tree clusters — skip any tile that is already a path/pond/flower/building
  const treeSeeds: [number, number][] = [
    [7, 7], [7, 18], [7, 35], [7, 43],
    [15, 5], [15, 42],
    [20, 12], [20, 38],
    [30, 8], [30, 41],
    [38, 12], [38, 37],
    [42, 6], [42, 43],
    [10, midCol - 14], [10, midCol + 12],
    [35, midCol - 14], [35, midCol + 12],
  ];
  for (const [ty, tx] of treeSeeds) {
    const size = 2 + Math.floor(rand() * 2); // 2 or 3
    for (let dy = -size; dy <= size; dy++)
      for (let dx = -size; dx <= size; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= size && rand() < 0.65) {
          const x = tx + dx, y = ty + dy;
          if (x >= 0 && x < width && y >= 0 && y < height &&
              terrain[y]![x] === TileType.Grass)
            terrain[y]![x] = TileType.Tree;
        }
      }
  }

  return terrain;
}

// ─── Region map ───────────────────────────────────────────────────────────────
// The 50×50 world is divided into six named zones so the explore API receives
// the correct regionId based on where the player actually stands.
//
//   Y  0–19  (top):          verdant-meadows  (starter zone)
//   Y 20–34, X  0–24 (left): ocean-ruins      (water zone)
//   Y 20–34, X 25–49 (right):volcanic-rift    (fire zone)
//   Y 35–49, X  0–16 (BL):   shadow-marsh     (dark zone)
//   Y 35–49, X 17–33 (BC):   ancient-forest   (forest zone)
//   Y 35–49, X 34–49 (BR):   thunder-valley   (electric zone)

export function getRegionIdForPosition(x: number, y: number): string {
  if (y <= 19) return 'verdant-meadows';
  if (y <= 34) return x <= 24 ? 'ocean-ruins' : 'volcanic-rift';
  // y >= 35
  if (x <= 16) return 'shadow-marsh';
  if (x <= 33) return 'ancient-forest';
  return 'thunder-valley';
}

/** BFS: find nearest passable tile to (startX, startY) */
export function nearestPassable(
  terrain: TileType[][],
  startX: number,
  startY: number,
): { x: number; y: number } {
  const h = terrain.length, w = terrain[0]!.length;
  if (isPassable(terrain[startY]?.[startX] ?? TileType.Tree))
    return { x: startX, y: startY };

  const visited = new Set<string>();
  const queue: [number, number][] = [[startX, startY]];
  const dirs = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[-1,1],[1,-1],[1,1]] as const;

  while (queue.length) {
    const [cx, cy] = queue.shift()!;
    for (const [dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (isPassable(terrain[ny]![nx]!)) return { x: nx, y: ny };
      queue.push([nx, ny]);
    }
  }
  return { x: SPAWN_X, y: SPAWN_Y };
}
