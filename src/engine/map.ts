import { RNG } from "./rng";
import { Position, Tile } from "./types";

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Dungeon {
  width: number;
  height: number;
  tiles: Tile[][];
  floors: Position[];
}

export function generateDungeon(width: number, height: number, rng: RNG): Dungeon {
  const tiles: Tile[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => "wall" as Tile));
  const rooms: Room[] = [];
  const roomAttempts = 120;

  for (let i = 0; i < roomAttempts; i++) {
    const w = rng.int(4, 10);
    const h = rng.int(4, 8);
    const x = rng.int(1, width - w - 2);
    const y = rng.int(1, height - h - 2);

    const room: Room = { x, y, w, h };
    if (rooms.some((r) => intersects(room, r))) {
      continue;
    }

    carveRoom(tiles, room);
    if (rooms.length > 0) {
      const prev = center(rooms[rooms.length - 1]);
      const cur = center(room);
      if (rng.next() < 0.5) {
        carveHorizontal(tiles, prev.x, cur.x, prev.y);
        carveVertical(tiles, prev.y, cur.y, cur.x);
      } else {
        carveVertical(tiles, prev.y, cur.y, prev.x);
        carveHorizontal(tiles, prev.x, cur.x, cur.y);
      }
    }
    rooms.push(room);
    if (rooms.length >= 14) {
      break;
    }
  }

  const floors: Position[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiles[y][x] === "floor") {
        floors.push({ x, y });
      }
    }
  }

  return { width, height, tiles, floors };
}

function carveRoom(tiles: Tile[][], room: Room): void {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      tiles[y][x] = "floor";
    }
  }
}

function carveHorizontal(tiles: Tile[][], x1: number, x2: number, y: number): void {
  const min = Math.min(x1, x2);
  const max = Math.max(x1, x2);
  for (let x = min; x <= max; x++) {
    tiles[y][x] = "floor";
  }
}

function carveVertical(tiles: Tile[][], y1: number, y2: number, x: number): void {
  const min = Math.min(y1, y2);
  const max = Math.max(y1, y2);
  for (let y = min; y <= max; y++) {
    tiles[y][x] = "floor";
  }
}

function center(room: Room): Position {
  return { x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) };
}

function intersects(a: Room, b: Room): boolean {
  return a.x <= b.x + b.w + 1 && a.x + a.w + 1 >= b.x && a.y <= b.y + b.h + 1 && a.y + a.h + 1 >= b.y;
}
