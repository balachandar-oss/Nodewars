import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useGameState } from '../hooks/useGameState';
import StructureInteraction from './StructureInteraction';
import { useStructureInteraction } from '../hooks/useStructureInteraction';
import { StructureInfo, getStructureInfo } from '../utils/structureData';
import { GAME_CONFIG, ROOMS, COLLISION_LAYERS, RoomId } from '../utils/gameConstants';

interface CastleMapProps {
  onPositionChange?: (x: number, y: number, roomId: RoomId) => void;
  initialRoomId?: RoomId;
  playerId?: string;
  completedMissions?: string[];
  onStructureInteract?: (structure: StructureInfo) => void;
}

/**
 * Generate a simple tileset as a Canvas texture
 */
function generateTileset(game: Phaser.Game): void {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 48;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Tile 0: Floor (light stone)
  ctx.fillStyle = '#ccb89f';
  ctx.fillRect(0, 0, 48, 48);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 46, 46);

  // Tile 1: Wall (dark stone)
  ctx.fillStyle = '#443333';
  ctx.fillRect(48, 0, 48, 48);
  ctx.fillStyle = '#665555';
  ctx.fillRect(52, 4, 40, 40);

  // Tile 2: Door (wooden)
  ctx.fillStyle = '#8b6f47';
  ctx.fillRect(96, 0, 48, 48);
  ctx.fillStyle = '#654321';
  ctx.fillRect(100, 4, 40, 40);
  ctx.fillStyle = '#daa520';
  ctx.fillRect(110, 12, 8, 8);

  // Tile 3: Treasure (gold)
  ctx.fillStyle = '#ccb89f';
  ctx.fillRect(144, 0, 48, 48);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(156, 12, 24, 24);
  ctx.strokeStyle = '#daa520';
  ctx.lineWidth = 2;
  ctx.strokeRect(156, 12, 24, 24);

  // Tile 4: Water (blue)
  ctx.fillStyle = '#4a90e2';
  ctx.fillRect(192, 0, 48, 48);
  ctx.fillStyle = '#357abd';
  ctx.fillRect(196, 4, 40, 40);

  // Tile 5: Empty/transparent
  ctx.clearRect(240, 0, 16, 48);

  const texture = game.textures.addCanvas('tileset', canvas);
  if (texture) {
    texture.add('floor', 0, 0, 48, 48);
    texture.add('wall', 48, 0, 48, 48);
    texture.add('door', 96, 0, 48, 48);
    texture.add('treasure', 144, 0, 48, 48);
    texture.add('water', 192, 0, 48, 48);
  }
}

/**
 * Generate a simple player sprite
 */
function generatePlayerSprite(game: Phaser.Game): void {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 48;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw a simple character (blue tunic, yellow hair)
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath();
  ctx.arc(16, 8, 5, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#0066ff';
  ctx.fillRect(8, 14, 16, 16);

  // Legs
  ctx.fillStyle = '#333333';
  ctx.fillRect(10, 30, 4, 6);
  ctx.fillRect(18, 30, 4, 6);

  game.textures.addCanvas('player', canvas);
}

/**
 * Generate the tilemap array based on castle layout
 */
function generateCastleMap(): number[][] {
  const width = GAME_CONFIG.TILEMAP_WIDTH;
  const height = GAME_CONFIG.TILEMAP_HEIGHT;
  const map: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // Outer walls
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push(1); // Wall
      }
      // Room dividers (5-tile spacing for 4x4 room grid)
      else if ((x === 5 || x === 10 || x === 15 || x === 20) && y % 5 === 0) {
        row.push(1); // Wall
      } else if ((y === 5 || y === 10 || y === 15) && x % 5 === 0) {
        row.push(1); // Wall
      }
      // Random obstacles and decorations in rooms
      else if (Math.random() < 0.05) {
        row.push(Math.random() < 0.7 ? 3 : 4); // Treasure or water
      } else {
        row.push(0); // Floor
      }
    }
    map.push(row);
  }

  // Clear center of each room for player movement
  for (let ry = 0; ry < GAME_CONFIG.ROOMS_GRID; ry++) {
    for (let rx = 0; rx < GAME_CONFIG.ROOMS_GRID; rx++) {
      const startX = rx * GAME_CONFIG.ROOM_SIZE + 1;
      const startY = ry * GAME_CONFIG.ROOM_SIZE + 1;
      for (let ty = startY; ty < startY + 3; ty++) {
        for (let tx = startX; tx < startX + 3; tx++) {
          if (tx < width && ty < height) {
            map[ty][tx] = 0; // Clear floor
          }
        }
      }
    }
  }

  return map;
}

/**
 * Phaser Scene for the Castle Map
 */
class CastleScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  currentRoom: RoomId = 'COMMAND_HALL';
  positionUpdateCallback?: (x: number, y: number, roomId: RoomId) => void;
  tileMap!: Phaser.Tilemaps.Tilemap;
  collisionLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: 'CastleScene' });
  }

  preload() {
    // Textures are generated in init
  }

  create() {
    generateTileset(this.game);
    generatePlayerSprite(this.game);

    // Generate and create tilemap
    const mapData = generateCastleMap();
    this.tileMap = this.make.tilemap({
      data: mapData,
      tileWidth: GAME_CONFIG.TILE_SIZE,
      tileHeight: GAME_CONFIG.TILE_SIZE
    });

    const tileset = this.tileMap.addTilesetImage('tileset');
    if (tileset) {
      this.collisionLayer = this.tileMap.createLayer(0, tileset, 0, 0)!;
      this.collisionLayer.setCollisionBetween(1, 1); // Only walls collide
    }

    // Create player sprite
    const startX = ROOMS.COMMAND_HALL.startX + GAME_CONFIG.TILE_SIZE * 2 + 16;
    const startY = ROOMS.COMMAND_HALL.startY + GAME_CONFIG.TILE_SIZE * 2 + 16;

    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    if (this.collisionLayer) {
      this.physics.add.collider(this.player, this.collisionLayer);
    }

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      'W': this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      'A': this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      'S': this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      'D': this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Camera follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      GAME_CONFIG.TILEMAP_WIDTH * GAME_CONFIG.TILE_SIZE,
      GAME_CONFIG.TILEMAP_HEIGHT * GAME_CONFIG.TILE_SIZE
    );
  }

  update() {
    const speed = GAME_CONFIG.PLAYER_SPEED;

    // Get input
    const isUpPressed = this.cursors.up.isDown || this.wasd['W'].isDown;
    const isDownPressed = this.cursors.down.isDown || this.wasd['S'].isDown;
    const isLeftPressed = this.cursors.left.isDown || this.wasd['A'].isDown;
    const isRightPressed = this.cursors.right.isDown || this.wasd['D'].isDown;

    // Reset velocity
    this.player.setVelocity(0, 0);

    // Apply movement
    if (isUpPressed) {
      this.player.setVelocityY(-speed);
    } else if (isDownPressed) {
      this.player.setVelocityY(speed);
    }

    if (isLeftPressed) {
      this.player.setVelocityX(-speed);
    } else if (isRightPressed) {
      this.player.setVelocityX(speed);
    }

    // Determine current room
    const x = this.player.x;
    const y = this.player.y;
    const newRoom = this.getRoomAtPosition(x, y);

    if (newRoom !== this.currentRoom) {
      this.currentRoom = newRoom;
    }

    // Emit position update
    if (this.positionUpdateCallback) {
      this.positionUpdateCallback(x, y, this.currentRoom);
    }
  }

  private getRoomAtPosition(x: number, y: number): RoomId {
    const roomX = Math.floor(x / (GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE));
    const roomY = Math.floor(y / (GAME_CONFIG.ROOM_SIZE * GAME_CONFIG.TILE_SIZE));

    const roomIndex = roomY * 4 + roomX;
    const roomKeys = Object.keys(ROOMS) as RoomId[];

    if (roomIndex >= 0 && roomIndex < roomKeys.length) {
      return roomKeys[roomIndex];
    }

    return 'COMMAND_HALL';
  }
}

/**
 * CastleMap Component
 */
const CastleMap: React.FC<CastleMapProps> = ({
  onPositionChange,
  initialRoomId = 'COMMAND_HALL',
  playerId,
  completedMissions = [],
  onStructureInteract,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { updatePlayerPosition } = useGameState();

  const {
    structures,
    addStructure,
    playerPosition,
    setPlayerPosition,
  } = useStructureInteraction({ onStructureInteract });

  // Initialize structures based on completed missions
  useEffect(() => {
    const missionToStructure: Record<string, { type: any; x: number; y: number }> = {
      'mission-01': { type: 'TERMINAL', x: 150, y: 150 },
      'mission-02': { type: 'SMART_DOOR', x: 350, y: 150 },
      'mission-03': { type: 'SECURITY_GATE', x: 550, y: 150 },
      'mission-04': { type: 'RESOURCE_VAULT', x: 250, y: 300 },
      'mission-05': { type: 'ASYNC_ENGINE', x: 450, y: 300 },
      'mission-06': { type: 'LIVE_MONITOR', x: 350, y: 450 },
      'mission-07': { type: 'CORE_PATCH', x: 150, y: 450 },
    };

    completedMissions.forEach(missionId => {
      const config = missionToStructure[missionId];
      if (config) {
        addStructure(config.type, { x: config.x, y: config.y });
      }
    });
  }, [completedMissions, addStructure]);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: CastleScene,
      render: {
        pixelArt: true,
        antialias: false
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Setup position update callback
    const onGameReady = () => {
      const scene = game.scene.getScene('CastleScene') as CastleScene;
      if (scene) {
        scene.positionUpdateCallback = (x: number, y: number, roomId: RoomId) => {
          // Update structure interaction system
          setPlayerPosition({ x, y });

          // Update local state
          if (onPositionChange) {
            onPositionChange(x, y, roomId);
          }

          // Update game state hook
          updatePlayerPosition(x, y, roomId, 'idle', false);
        };

        setIsInitialized(true);
      }
    };

    // Wait for scene to be ready
    const checkScene = setInterval(() => {
      const scene = game.scene.getScene('CastleScene');
      if (scene && scene.isActive()) {
        onGameReady();
        clearInterval(checkScene);
      }
    }, 100);

    return () => {
      clearInterval(checkScene);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onPositionChange, updatePlayerPosition, setPlayerPosition]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="castle-map-container"
        style={{
          width: `${GAME_CONFIG.CANVAS_WIDTH}px`,
          height: `${GAME_CONFIG.CANVAS_HEIGHT}px`,
          border: '2px solid #333',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}
      />

      {/* Structure Interaction System */}
      <StructureInteraction
        structures={structures}
        playerPosition={playerPosition}
        onInteract={onStructureInteract}
      />
    </div>
  );
};

export default CastleMap;
