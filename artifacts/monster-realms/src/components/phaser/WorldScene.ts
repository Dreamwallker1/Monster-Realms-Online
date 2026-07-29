import Phaser from 'phaser';
import { TileType, TILE_BASE_COLORS, generateTerrain, isPassable } from '@/lib/terrain';
import { getCharacter, type CharacterConfig } from '@/lib/characters';
import type { ExploreInput } from '@workspace/api-client-react';

const TILE_SIZE = 32;
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 50;

// Module-level ref so DPad can call moveInDirection without forwardRef complexity
let _activeScene: WorldScene | null = null;
export function getActiveScene(): WorldScene | null { return _activeScene; }

interface OtherPlayer {
  username: string;
  x: number;
  y: number;
  color: string;
  characterType: string;
}

export default class WorldScene extends Phaser.Scene {
  private terrain: TileType[][] = [];
  private terrainGraphics?: Phaser.GameObjects.Graphics;
  private fogGraphics?: Phaser.GameObjects.Graphics;
  private dayNightOverlay?: Phaser.GameObjects.Graphics;
  private playerContainer?: Phaser.GameObjects.Container;
  private playerX = 25;
  private playerY = 12; // start near park entrance
  private characterType = 'kai';
  private exploredTiles: Set<string> = new Set();
  private otherPlayerContainers: Map<string, Phaser.GameObjects.Container> = new Map();

  private onMove?: (input: ExploreInput) => void;
  private onRadarUpdate?: () => void;

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data?: Partial<{
    playerX: number;
    playerY: number;
    characterType: string;
    onMove: (input: ExploreInput) => void;
    onRadarUpdate: () => void;
    exploredTiles: Set<string>;
  }>) {
    this.playerX       = data?.playerX       ?? this.playerX;
    this.playerY       = data?.playerY       ?? this.playerY;
    this.characterType = data?.characterType  ?? this.characterType;
    this.onMove        = data?.onMove        ?? this.onMove;
    this.onRadarUpdate = data?.onRadarUpdate  ?? this.onRadarUpdate;
    this.exploredTiles = data?.exploredTiles  ?? this.exploredTiles ?? new Set();
  }

  create() {
    // Register this instance globally so DPad can call moveInDirection directly
    _activeScene = this;
    this.terrain = generateTerrain(WORLD_WIDTH, WORLD_HEIGHT);

    // --- Single graphics object for all terrain (much faster than 2500 objects) ---
    this.terrainGraphics = this.add.graphics();
    this.terrainGraphics.setDepth(0);
    this.drawTerrain();

    // --- Day/night overlay ---
    this.dayNightOverlay = this.add.graphics();
    this.dayNightOverlay.setDepth(1);

    // --- Fog of war ---
    this.fogGraphics = this.add.graphics();
    this.fogGraphics.setDepth(3);

    // --- Player sprite ---
    const char = getCharacter(this.characterType);
    this.playerContainer = this.createHumanSprite(char);
    this.playerContainer.setDepth(2);
    this.playerContainer.setPosition(
      this.playerX * TILE_SIZE + TILE_SIZE / 2,
      this.playerY * TILE_SIZE + TILE_SIZE / 2,
    );

    // --- Camera ---
    this.cameras.main.startFollow(this.playerContainer, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);

    // --- Input ---
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event.key);
    });

    this.revealNearbyTiles();
    this.updateFogOfWar();
  }

  // ─── Terrain drawing ──────────────────────────────────────────────────────

  private drawTerrain() {
    if (!this.terrainGraphics) return;
    const g = this.terrainGraphics;
    g.clear();

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const tile = this.terrain[y]?.[x] ?? TileType.Grass;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        switch (tile) {
          case TileType.Grass:
            this.drawGrassTile(g, px, py, x, y);
            break;
          case TileType.Path:
            this.drawPathTile(g, px, py);
            break;
          case TileType.Tree:
            this.drawTreeTile(g, px, py);
            break;
          case TileType.Pond:
            this.drawPondTile(g, px, py);
            break;
          case TileType.Flower:
            this.drawFlowerTile(g, px, py, x, y);
            break;
          case TileType.Building:
            this.drawBuildingTile(g, px, py, x);
            break;
        }
      }
    }
  }

  private drawGrassTile(g: Phaser.GameObjects.Graphics, px: number, py: number, tx: number, ty: number) {
    // Slight color variation for natural look
    const shade = ((tx + ty) % 3 === 0) ? 0x3d9240 : ((tx * ty) % 5 === 0) ? 0x2e7a32 : 0x369138;
    g.fillStyle(shade, 1);
    g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // Tiny darker specks for grass texture
    if ((tx + ty * 3) % 7 === 0) {
      g.fillStyle(0x2a6e2e, 0.6);
      g.fillRect(px + 6, py + 10, 3, 2);
      g.fillRect(px + 18, py + 6, 2, 3);
      g.fillRect(px + 24, py + 20, 3, 2);
    }
  }

  private drawPathTile(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    // Paved path — warm tan with subtle lines
    g.fillStyle(0xc8b89a, 1);
    g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // Paving stone lines
    g.fillStyle(0xb09a7a, 0.5);
    g.fillRect(px, py + 10, TILE_SIZE, 1);
    g.fillRect(px, py + 22, TILE_SIZE, 1);
    g.fillRect(px + 10, py, 1, TILE_SIZE);
    g.fillRect(px + 22, py, 1, TILE_SIZE);
    // Edge shadow
    g.fillStyle(0x987860, 0.3);
    g.fillRect(px, py, TILE_SIZE, 1);
    g.fillRect(px, py, 1, TILE_SIZE);
  }

  private drawTreeTile(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    // Ground base (shadowed grass)
    g.fillStyle(0x1a5020, 1);
    g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // Tree trunk
    g.fillStyle(0x7a5230, 1);
    g.fillRect(px + 13, py + 18, 6, 10);
    // Tree canopy — layered circles
    g.fillStyle(0x1e6e24, 1);
    g.fillCircle(px + 16, py + 14, 13);
    g.fillStyle(0x288030, 1);
    g.fillCircle(px + 14, py + 12, 9);
    g.fillStyle(0x34a040, 0.7);
    g.fillCircle(px + 18, py + 10, 6);
    // Highlight dot
    g.fillStyle(0x5acc60, 0.4);
    g.fillCircle(px + 13, py + 8, 3);
  }

  private drawPondTile(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    // Deep water
    g.fillStyle(0x1a5a9a, 1);
    g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // Lighter water center shimmer
    g.fillStyle(0x2878c0, 0.7);
    g.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    // Ripple lines
    g.fillStyle(0x5aaae0, 0.4);
    g.fillRect(px + 6, py + 12, 14, 2);
    g.fillRect(px + 10, py + 20, 10, 2);
    // Highlight sparkle
    g.fillStyle(0xaad8f8, 0.6);
    g.fillRect(px + 8, py + 8, 4, 2);
    g.fillRect(px + 20, py + 16, 3, 2);
  }

  private drawFlowerTile(g: Phaser.GameObjects.Graphics, px: number, py: number, tx: number, ty: number) {
    // Grass base
    g.fillStyle(0x48a84a, 1);
    g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // Flower colors — vary by position
    const flowerColors = [0xff6b8a, 0xffcc44, 0xff8c44, 0xcc66ff, 0xff4466, 0xffee55];
    const col = flowerColors[(tx + ty) % flowerColors.length]!;
    // Draw 3-4 flowers
    const positions = [[8, 8], [22, 14], [10, 22], [24, 24]] as const;
    for (const [fx, fy] of positions) {
      // Stem
      g.fillStyle(0x2a8030, 1);
      g.fillRect(px + fx + 1, py + fy + 4, 2, 5);
      // Petals
      g.fillStyle(col, 1);
      g.fillCircle(px + fx + 2, py + fy, 4);
      // Center
      g.fillStyle(0xffee88, 1);
      g.fillCircle(px + fx + 2, py + fy, 2);
    }
  }

  private drawBuildingTile(g: Phaser.GameObjects.Graphics, px: number, py: number, tx: number) {
    // Sky / background
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // Building facade — vary by column for skyline variety
    const buildingColors = [0x4a5568, 0x374151, 0x5a6678, 0x2d3748, 0x6b7280];
    const bColor = buildingColors[tx % buildingColors.length]!;
    const bHeight = 18 + (tx * 7) % 14;
    g.fillStyle(bColor, 1);
    g.fillRect(px, py + (TILE_SIZE - bHeight), TILE_SIZE, bHeight);
    // Windows
    g.fillStyle(0xffd070, 0.85);
    const winRows = Math.floor(bHeight / 8);
    for (let wr = 0; wr < winRows; wr++) {
      g.fillRect(px + 5, py + (TILE_SIZE - bHeight) + 3 + wr * 8, 6, 4);
      g.fillRect(px + 18, py + (TILE_SIZE - bHeight) + 3 + wr * 8, 6, 4);
    }
    // Rooftop detail
    g.fillStyle(0x718096, 1);
    g.fillRect(px + 8, py + (TILE_SIZE - bHeight) - 3, TILE_SIZE - 16, 3);
  }

  // ─── Human sprite ─────────────────────────────────────────────────────────

  private createHumanSprite(char: CharacterConfig): Phaser.GameObjects.Container {
    const g = this.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 14, 16, 6);

    // Legs
    g.fillStyle(char.pantsColor, 1);
    g.fillRect(-6, 6, 5, 8);  // left leg
    g.fillRect(1,  6, 5, 8);  // right leg

    // Shoes
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(-7, 13, 6, 3);
    g.fillRect(1,  13, 6, 3);

    // Body / torso
    g.fillStyle(char.outfitColor, 1);
    g.fillRect(-7, -4, 14, 12);

    // Arms
    g.fillStyle(char.outfitColor, 1);
    g.fillRect(-12, -4, 5, 9); // left arm
    g.fillRect(7,   -4, 5, 9); // right arm

    // Hands (skin)
    g.fillStyle(char.skinColor, 1);
    g.fillCircle(-10, 5, 3);
    g.fillCircle(10,  5, 3);

    // Neck
    g.fillStyle(char.skinColor, 1);
    g.fillRect(-3, -8, 6, 6);

    // Head
    g.fillStyle(char.skinColor, 1);
    g.fillCircle(0, -14, 9);

    // Hair (top arc)
    g.fillStyle(char.hairColor, 1);
    g.fillRect(-9, -22, 18, 9);  // hair block
    g.fillCircle(-7, -20, 5);    // left side hair
    g.fillCircle(7,  -20, 5);    // right side hair
    g.fillCircle(0,  -22, 6);    // top hair

    // Eyes
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(-4, -15, 2);
    g.fillCircle(4,  -15, 2);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(-3, -16, 1);
    g.fillCircle(5,  -16, 1);

    // Mouth
    g.fillStyle(0xc0706a, 1);
    g.fillRect(-3, -10, 6, 2);

    const container = this.add.container(0, 0, [g]);
    return container;
  }

  // ─── Update loop ──────────────────────────────────────────────────────────

  update() {
    if (!this.dayNightOverlay) return;
    const hour = new Date().getHours();
    this.dayNightOverlay.clear();
    if (hour < 6 || hour >= 21) {
      this.dayNightOverlay.fillStyle(0x080830, 0.6);
      this.dayNightOverlay.fillRect(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    } else if (hour < 8 || hour >= 18) {
      this.dayNightOverlay.fillStyle(0x7a3a10, 0.28);
      this.dayNightOverlay.fillRect(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    }
  }

  // ─── Movement ─────────────────────────────────────────────────────────────

  /** Called from keyboard handler and from the React D-pad overlay */
  public moveInDirection(dx: number, dy: number) {
    const newX = this.playerX + dx;
    const newY = this.playerY + dy;

    if (newX < 0 || newX >= WORLD_WIDTH || newY < 0 || newY >= WORLD_HEIGHT) return;

    // For diagonals, both target tile AND the two corner tiles must be passable
    if (!isPassable(this.terrain[newY]?.[newX] ?? TileType.Tree)) return;
    if (dx !== 0 && dy !== 0) {
      if (!isPassable(this.terrain[this.playerY]?.[newX] ?? TileType.Tree)) return;
      if (!isPassable(this.terrain[newY]?.[this.playerX] ?? TileType.Tree)) return;
    }

    this.playerX = newX;
    this.playerY = newY;

    this.tweens.add({
      targets: this.playerContainer,
      x: this.playerX * TILE_SIZE + TILE_SIZE / 2,
      y: this.playerY * TILE_SIZE + TILE_SIZE / 2,
      duration: 120,
      ease: 'Sine.easeInOut',
    });

    // Map dx/dy → API direction (cardinal only for API; diagonals handled locally)
    const apiDir = this.toApiDirection(dx, dy);
    this.onMove?.({ direction: apiDir ?? 'up', regionId: 'verdant-meadows', posX: this.playerX, posY: this.playerY });
    this.revealNearbyTiles();
  }

  private toApiDirection(dx: number, dy: number): 'up' | 'down' | 'left' | 'right' | null {
    if (dx === 0 && dy === -1) return 'up';
    if (dx === 0 && dy === 1)  return 'down';
    if (dx === -1 && dy === 0) return 'left';
    if (dx === 1 && dy === 0)  return 'right';
    return null; // diagonal — local only; we still pass posX/posY to server
  }

  private handleKeyDown(key: string) {
    // Cardinal
    if (key === 'ArrowUp'    || key === 'w' || key === 'W' || key === '8') { this.moveInDirection(0, -1);  return; }
    if (key === 'ArrowDown'  || key === 's' || key === 'S' || key === '2') { this.moveInDirection(0,  1);  return; }
    if (key === 'ArrowLeft'  || key === 'a' || key === 'A' || key === '4') { this.moveInDirection(-1, 0);  return; }
    if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === '6') { this.moveInDirection(1,  0);  return; }
    // Diagonal
    if (key === 'q' || key === 'Q' || key === '7') { this.moveInDirection(-1, -1); return; }
    if (key === 'e' || key === 'E' || key === '9') { this.moveInDirection(1,  -1); return; }
    if (key === 'z' || key === 'Z' || key === '1') { this.moveInDirection(-1,  1); return; }
    if (key === 'c' || key === 'C' || key === '3') { this.moveInDirection(1,   1); return; }
  }

  // ─── Fog of war ───────────────────────────────────────────────────────────

  private revealNearbyTiles() {
    const radius = 6;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const x = this.playerX + dx;
          const y = this.playerY + dy;
          if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
            this.exploredTiles.add(`${x},${y}`);
          }
        }
      }
    }
    this.updateFogOfWar();
  }

  private updateFogOfWar() {
    if (!this.fogGraphics) return;
    this.fogGraphics.clear();
    this.fogGraphics.fillStyle(0x000000, 0.88);
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        if (!this.exploredTiles.has(`${x},${y}`)) {
          this.fogGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  // ─── Other players ────────────────────────────────────────────────────────

  public updateOtherPlayers(players: Map<string, OtherPlayer>) {
    // Remove departed players
    this.otherPlayerContainers.forEach((container, id) => {
      if (!players.has(id)) {
        container.destroy();
        this.otherPlayerContainers.delete(id);
      }
    });

    // Add / update
    players.forEach((p, id) => {
      let container = this.otherPlayerContainers.get(id);
      if (!container) {
        const char = getCharacter(p.characterType ?? 'kai');
        container = this.createHumanSprite(char);
        container.setDepth(2);
        // Username label
        const label = this.add.text(0, -30, p.username, {
          fontSize: '9px',
          color: '#ffffff',
          backgroundColor: '#000000bb',
          padding: { x: 3, y: 1 },
        }).setOrigin(0.5);
        container.add(label);
        this.otherPlayerContainers.set(id, container);
      }
      this.tweens.add({
        targets: container,
        x: p.x * TILE_SIZE + TILE_SIZE / 2,
        y: p.y * TILE_SIZE + TILE_SIZE / 2,
        duration: 150,
        ease: 'Sine.easeInOut',
      });
    });
  }

  public updatePlayerPosition(x: number, y: number) {
    this.playerX = x;
    this.playerY = y;
    this.playerContainer?.setPosition(
      x * TILE_SIZE + TILE_SIZE / 2,
      y * TILE_SIZE + TILE_SIZE / 2,
    );
    this.revealNearbyTiles();
  }

  public updateCharacterType(type: string) {
    if (type === this.characterType) return;
    this.characterType = type;
    if (!this.playerContainer) return;
    // Rebuild sprite with new character
    this.playerContainer.destroy();
    const char = getCharacter(type);
    this.playerContainer = this.createHumanSprite(char);
    this.playerContainer.setDepth(2);
    this.playerContainer.setPosition(
      this.playerX * TILE_SIZE + TILE_SIZE / 2,
      this.playerY * TILE_SIZE + TILE_SIZE / 2,
    );
    this.cameras.main.startFollow(this.playerContainer, true, 0.1, 0.1);
  }
}
