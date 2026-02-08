import * as THREE from "three";

export type Obstacle = {
  box: THREE.Box3;
  mesh: THREE.Mesh;
};

export type Enemy = {
  id: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  mesh: THREE.Mesh;
  alive: boolean;
  healthBar: HTMLDivElement;
  healthFill: HTMLDivElement;
};

export type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
};
