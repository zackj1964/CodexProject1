import * as THREE from "three";

export type Obstacle = {
  box: THREE.Box3;
  mesh: THREE.Mesh;
};

export type Enemy = {
  id: number;
  hp: number;
  speed: number;
  mesh: THREE.Mesh;
  alive: boolean;
};

export type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
};
