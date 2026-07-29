import Phaser from 'phaser';
import { TileType, TILE_COLORS, generateTerrain, isPassable } from '@/lib/terrain';
import type { ExploreInput } from '@workspace/api-client-react';

const TILE_SIZE = 32;
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 50;

interface OtherPlayer {
  username: string;
  x: number;
  y: number;
  color: string;
}

export default class WorldScene extends Phaser.Scene {
  private terrain: TileType[][] = [];
  private tileGraphics: Phaser.GameObjects.Graphics[] = [];
  private fogGraphics?: Phaser.GameObjects.Graphics;
  private player?: Phaser.GameObjects.Container;
  private playerX: number = 25;
  private playerY: number = 25;
  private playerColor: string = '#22D3EE';
  private exploredTiles: Set<string> = new Set();
  private otherPlayerSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  
  // Callbacks for React integration
  private onMove?: (input: ExploreInput) => void;
  private onRadarUpdate?: () => void;
  
  constructor() {
    super({ key: 'WorldScene' });
  }
  
  init(data: { 
    playerX: number; 
    playerY: number; 
    playerColor: string;
    onMove: (input: ExploreInput) => void;
    onRadarUpdate: () => void;
    exploredTiles: Set<string>;
  }) {
    this.playerX = data.playerX;
    this.playerY = data.playerY;
    this.playerColor = data.playerColor;
    this.onMove = data.onMove;
    this.onRadarUpdate = data.onRadarUpdate;
    this.exploredTiles = data.exploredTiles ?? new Set();
  }
  
  create() {
    // Generate terrain
    this.terrain = generateTerrain(WORLD_WIDTH, WORLD_HEIGHT);
    
    // Create tile graphics
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const tileType = this.terrain[y][x];
        const colors = TILE_COLORS[tileType];
        const color = colors[Math.random() > 0.5 ? 0 : 1];
        
        const graphics = this.add.graphics();
        graphics.fillStyle(parseInt(color.replace('#', '0x')), 1);
        graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.tileGraphics.push(graphics);
      }
    }
    
    // Create fog of war
    this.fogGraphics = this.add.graphics();
    this.updateFogOfWar();
    
    // Create player sprite
    this.player = this.add.container(this.playerX * TILE_SIZE + TILE_SIZE / 2, this.playerY * TILE_SIZE + TILE_SIZE / 2);
    const playerBody = this.add.rectangle(0, 0, 20, 24, parseInt(this.playerColor.replace('#', '0x')));
    const playerHead = this.add.circle(0, -10, 8, parseInt(this.playerColor.replace('#', '0x')));
    this.player.add([playerBody, playerHead]);
    
    // Setup camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
    
    // Setup input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event.key);
    });
    
    // Reveal initial tiles
    this.revealNearbyTiles();
  }
  
  update() {
    // Update day/night cycle based on time
    const hour = new Date().getHours();
    let tint = 0xffffff;
    if (hour < 6 || hour > 20) {
      tint = 0x4444aa; // Night
    } else if (hour < 8 || hour > 18) {
      tint = 0xaa8844; // Dawn/Dusk
    }
    
    this.tileGraphics.forEach(g => g.setTint(tint));
  }
  
  private handleKeyDown(key: string) {
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    let newX = this.playerX;
    let newY = this.playerY;
    
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        direction = 'up';
        newY--;
        break;
      case 'arrowdown':
      case 's':
        direction = 'down';
        newY++;
        break;
      case 'arrowleft':
      case 'a':
        direction = 'left';
        newX--;
        break;
      case 'arrowright':
      case 'd':
        direction = 'right';
        newX++;
        break;
    }
    
    if (!direction) return;
    
    // Check bounds
    if (newX < 0 || newX >= WORLD_WIDTH || newY < 0 || newY >= WORLD_HEIGHT) return;
    
    // Check if passable
    if (!isPassable(this.terrain[newY][newX])) return;
    
    // Move player with tween
    this.playerX = newX;
    this.playerY = newY;
    
    this.tweens.add({
      targets: this.player,
      x: this.playerX * TILE_SIZE + TILE_SIZE / 2,
      y: this.playerY * TILE_SIZE + TILE_SIZE / 2,
      duration: 150,
      ease: 'Sine.easeInOut',
    });
    
    // Notify React about the move
    if (this.onMove) {
      this.onMove({
        direction,
        regionId: 'default',
        posX: this.playerX,
        posY: this.playerY,
      });
    }
    
    this.revealNearbyTiles();
  }
  
  private revealNearbyTiles() {
    const radius = 5;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = this.playerX + dx;
        const y = this.playerY + dy;
        if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
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
    this.fogGraphics.fillStyle(0x000000, 0.85);
    
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        if (!this.exploredTiles.has(`${x},${y}`)) {
          this.fogGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
  
  public updateOtherPlayers(players: Map<string, OtherPlayer>) {
    // Remove sprites for players no longer present
    this.otherPlayerSprites.forEach((sprite, id) => {
      if (!players.has(id)) {
        sprite.destroy();
        this.otherPlayerSprites.delete(id);
      }
    });
    
    // Add/update sprites for current players
    players.forEach((player, id) => {
      let sprite = this.otherPlayerSprites.get(id);
      
      if (!sprite) {
        // Create new sprite
        sprite = this.add.container(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2);
        const body = this.add.rectangle(0, 0, 16, 20, parseInt(player.color.replace('#', '0x')));
        const head = this.add.circle(0, -8, 6, parseInt(player.color.replace('#', '0x')));
        const label = this.add.text(0, -20, player.username, {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 2, y: 1 },
        }).setOrigin(0.5);
        sprite.add([body, head, label]);
        this.otherPlayerSprites.set(id, sprite);
      } else {
        // Update position
        this.tweens.add({
          targets: sprite,
          x: player.x * TILE_SIZE + TILE_SIZE / 2,
          y: player.y * TILE_SIZE + TILE_SIZE / 2,
          duration: 150,
          ease: 'Sine.easeInOut',
        });
      }
    });
  }
  
  public updatePlayerPosition(x: number, y: number) {
    this.playerX = x;
    this.playerY = y;
    if (this.player) {
      this.player.setPosition(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
    }
    this.revealNearbyTiles();
  }
}
