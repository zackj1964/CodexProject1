import { Dungeon, generateDungeon } from "./map";
import { RNG } from "./rng";
import { Enemy, GameStatus, Message, Position } from "./types";

const DIRECTIONS: Position[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

export class Game {
  width = 60;
  height = 30;
  player = { x: 0, y: 0, hp: 20, maxHp: 20 };
  enemies: Enemy[] = [];
  dungeon!: Dungeon;
  floor = 1;
  status: GameStatus = "playing";
  messages: Message[] = [];

  private rng: RNG;

  constructor(seed: number) {
    this.rng = new RNG(seed);
    this.newFloor();
  }

  reset(seed: number): void {
    this.rng = new RNG(seed);
    this.floor = 1;
    this.player.hp = this.player.maxHp;
    this.status = "playing";
    this.messages = [];
    this.log(`New run started (seed ${seed}).`);
    this.newFloor();
  }

  attemptMove(dx: number, dy: number): void {
    if (this.status !== "playing") {
      return;
    }

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    if (!this.isWalkable(nx, ny)) {
      this.log("Bumped into a wall.");
      return;
    }

    const enemy = this.enemyAt(nx, ny);
    if (enemy) {
      enemy.hp -= 4;
      this.log(`You hit enemy #${enemy.id} for 4.`);
      if (enemy.hp <= 0) {
        this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
        this.log(`Enemy #${enemy.id} dies.`);
        if (this.enemies.length === 0) {
          this.status = "won";
          this.log("All enemies defeated. Press N for next floor.");
        }
      }
    } else {
      this.player.x = nx;
      this.player.y = ny;
    }

    this.enemyTurn();
    this.updateStatus();
  }

  nextFloor(): void {
    if (this.status !== "won") {
      return;
    }
    this.floor += 1;
    this.status = "playing";
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
    this.newFloor();
    this.log(`Descended to floor ${this.floor}.`);
  }

  private newFloor(): void {
    this.dungeon = generateDungeon(this.width, this.height, this.rng);
    if (this.dungeon.floors.length === 0) {
      throw new Error("Map generation failed: no floor tiles");
    }
    const spawn = this.rng.pick(this.dungeon.floors);
    this.player.x = spawn.x;
    this.player.y = spawn.y;

    const enemyCount = this.rng.int(5, 10);
    const used = new Set<string>([this.key(spawn.x, spawn.y)]);
    this.enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const tile = this.findOpenTile(used);
      used.add(this.key(tile.x, tile.y));
      this.enemies.push({ id: i + 1, x: tile.x, y: tile.y, hp: 8, maxHp: 8 });
    }
    this.log(`Floor ${this.floor} generated with ${enemyCount} enemies.`);
  }

  private enemyTurn(): void {
    for (const enemy of this.enemies) {
      if (isAdjacent(enemy, this.player)) {
        this.player.hp -= 2;
        this.log(`Enemy #${enemy.id} hits you for 2.`);
        continue;
      }

      const step = bestStep(enemy, this.player, (x, y) => this.canEnemyMoveTo(enemy.id, x, y));
      if (step) {
        enemy.x = step.x;
        enemy.y = step.y;
      }
    }
  }

  private canEnemyMoveTo(enemyId: number, x: number, y: number): boolean {
    if (!this.isWalkable(x, y)) {
      return false;
    }
    if (x === this.player.x && y === this.player.y) {
      return false;
    }
    return !this.enemies.some((e) => e.id !== enemyId && e.x === x && e.y === y);
  }

  private isWalkable(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height && this.dungeon.tiles[y][x] === "floor";
  }

  private findOpenTile(used: Set<string>): Position {
    for (let i = 0; i < 1000; i++) {
      const p = this.rng.pick(this.dungeon.floors);
      if (!used.has(this.key(p.x, p.y))) {
        return p;
      }
    }
    throw new Error("Unable to place entity on floor tile");
  }

  private enemyAt(x: number, y: number): Enemy | undefined {
    return this.enemies.find((enemy) => enemy.x === x && enemy.y === y);
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  private updateStatus(): void {
    if (this.player.hp <= 0) {
      this.status = "lost";
      this.log("Game Over. Press R to restart.");
    }
  }

  private log(text: string): void {
    this.messages.unshift({ text });
    this.messages = this.messages.slice(0, 5);
  }
}

function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function bestStep(from: Position, to: Position, canMove: (x: number, y: number) => boolean): Position | null {
  let best: Position | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const dir of DIRECTIONS) {
    const nx = from.x + dir.x;
    const ny = from.y + dir.y;
    if (!canMove(nx, ny)) {
      continue;
    }
    const dist = Math.abs(nx - to.x) + Math.abs(ny - to.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = { x: nx, y: ny };
    }
  }

  return best;
}
