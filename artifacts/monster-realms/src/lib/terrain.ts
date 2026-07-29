export enum TileType {
  Grass    = 0, // park lawn — passable
  Path     = 1, // paved walkway — passable
  Tree     = 2, // tree / bush — impassable
  Pond     = 3, // water feature — impassable
  Flower   = 4, // flower bed — passable
  Building = 5, // city building edge — impassable
}

// Base fill colors used by WorldScene renderer
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

/** Paint a horizontal stripe of Path tiles */
function paintHPath(
  terrain: TileType[][],
  row: number,
  colStart: number,
  colEnd: number,
  width = 2,
) {
  for (let r = row; r < row + width; r++) {
    for (let c = colStart; c <= colEnd; c++) {
      if (r >= 0 && r < terrain.length && c >= 0 && c < terrain[0].length) {
        terrain[r][c] = TileType.Path;
      }
    }
  }
}

function paintVPath(
  terrain: TileType[][],
  col: number,
  rowStart: number,
  rowEnd: number,
  width = 2,
) {
  for (let c = col; c < col + width; c++) {
    for (let r = rowStart; r <= rowEnd; r++) {
      if (r >= 0 && r < terrain.length && c >= 0 && c < terrain[0].length) {
        terrain[r][c] = TileType.Path;
      }
    }
  }
}

function paintCircle(
  terrain: TileType[][],
  cx: number,
  cy: number,
  radius: number,
  type: TileType,
) {
  const h = terrain.length;
  const w = terrain[0].length;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) {
          terrain[y][x] = type;
        }
      }
    }
  }
}

export function generateTerrain(width: number, height: number): TileType[][] {
  // --- Base layer: grass ---
  const terrain: TileType[][] = Array.from({ length: height }, () =>
    Array(width).fill(TileType.Grass),
  );

  // --- City buildings along the top 3 rows ---
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < width; x++) {
      terrain[y][x] = TileType.Building;
    }
  }

  // --- Entrance path from buildings down ---
  // Central vertical path (main entrance)
  paintVPath(terrain, Math.floor(width / 2) - 1, 3, height - 1, 3);

  // Horizontal perimeter paths
  paintHPath(terrain, 3, 0, width - 1, 2);         // top park border
  paintHPath(terrain, height - 3, 0, width - 1, 2); // bottom border

  // Vertical perimeter paths
  paintVPath(terrain, 0, 3, height - 1, 2);          // left border
  paintVPath(terrain, width - 2, 3, height - 1, 2);  // right border

  // Inner cross paths — creates four quadrants like a real park
  const midRow = Math.floor(height / 2);
  const midCol = Math.floor(width / 2);
  paintHPath(terrain, midRow - 1, 2, width - 2, 2);
  paintVPath(terrain, midCol - 1, 3, height - 3, 2);

  // Diagonal-ish paths (45°-ish shortcuts through the park)
  // Top-left quadrant diagonal
  for (let i = 0; i < 14; i++) {
    const r = 5 + i;
    const c = 4 + i;
    if (r < terrain.length && c < terrain[0].length) {
      terrain[r][c] = TileType.Path;
      if (c + 1 < terrain[0].length) terrain[r][c + 1] = TileType.Path;
    }
  }
  // Bottom-right quadrant diagonal
  for (let i = 0; i < 14; i++) {
    const r = midRow + 3 + i;
    const c = midCol + 3 + i;
    if (r < terrain.length && c < terrain[0].length) {
      terrain[r][c] = TileType.Path;
      if (c + 1 < terrain[0].length) terrain[r][c + 1] = TileType.Path;
    }
  }

  // --- Central fountain / pond ---
  paintCircle(terrain, midCol, midRow, 4, TileType.Pond);

  // --- Flower beds alongside main paths ---
  const flowerSpots = [
    [midRow - 4, midCol - 6], [midRow - 4, midCol + 5],
    [midRow + 3, midCol - 6], [midRow + 3, midCol + 5],
    [8, 8], [8, width - 10],
    [height - 10, 8], [height - 10, width - 10],
    [12, midCol - 8], [12, midCol + 6],
  ];
  for (const [fy, fx] of flowerSpots) {
    paintCircle(terrain, fx, fy, 2, TileType.Flower);
  }

  // --- Tree clusters (kept away from paths/pond) ---
  const treeSeeds = [
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
    // 3–5 tile organic cluster
    const size = 2 + Math.floor(Math.random() * 2);
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= size && Math.random() < 0.65) {
          const x = tx + dx;
          const y = ty + dy;
          if (
            x >= 0 && x < width && y >= 0 && y < height &&
            terrain[y][x] === TileType.Grass // don't overwrite paths
          ) {
            terrain[y][x] = TileType.Tree;
          }
        }
      }
    }
  }

  return terrain;
}
