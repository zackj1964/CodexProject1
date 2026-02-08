export type Tile = "wall" | "floor";

export interface Position {
  x: number;
  y: number;
}

export interface Entity extends Position {
  hp: number;
  maxHp: number;
}

export interface Enemy extends Entity {
  id: number;
}

export interface Message {
  text: string;
}

export type GameStatus = "playing" | "won" | "lost";
