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
