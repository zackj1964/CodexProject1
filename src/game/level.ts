import * as THREE from "three";
import { Obstacle } from "./types";

const ROOM_HALF_SIZE = 24;
const WALL_HEIGHT = 5;
const PLAYER_RADIUS = 0.6;

export class Level {
  readonly group = new THREE.Group();
  readonly obstacles: Obstacle[] = [];
  portal: THREE.Mesh | null = null;

  constructor(private readonly scene: THREE.Scene, seedFloor: number) {
    this.group.clear();
    this.generateArena(seedFloor);
    this.scene.add(this.group);
  }

  destroy(): void {
    this.scene.remove(this.group);
  }

  canOccupy(position: THREE.Vector3, radius = PLAYER_RADIUS): boolean {
    if (
      Math.abs(position.x) > ROOM_HALF_SIZE - 1 - radius ||
      Math.abs(position.z) > ROOM_HALF_SIZE - 1 - radius
    ) {
      return false;
    }

    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - radius, 0, position.z - radius),
      new THREE.Vector3(position.x + radius, 2, position.z + radius)
    );

    return !this.obstacles.some((obstacle) => obstacle.box.intersectsBox(playerBox));
  }

  spawnPortal(): void {
    if (this.portal) {
      return;
    }
    const geometry = new THREE.TorusGeometry(1.2, 0.35, 16, 48);
    const material = new THREE.MeshStandardMaterial({ color: 0x66ccff, emissive: 0x224466 });
    const portal = new THREE.Mesh(geometry, material);
    portal.position.set(0, 1.5, -ROOM_HALF_SIZE + 4);
    portal.rotation.x = Math.PI / 2;
    this.portal = portal;
    this.group.add(portal);
  }

  isTouchingPortal(position: THREE.Vector3): boolean {
    return !!this.portal && this.portal.position.distanceTo(position) < 2;
  }

  private generateArena(floor: number): void {
    const floorGeo = new THREE.PlaneGeometry(ROOM_HALF_SIZE * 2, ROOM_HALF_SIZE * 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const wallGeo = new THREE.BoxGeometry(ROOM_HALF_SIZE * 2, WALL_HEIGHT, 1);
    const sideGeo = new THREE.BoxGeometry(1, WALL_HEIGHT, ROOM_HALF_SIZE * 2);

    const wallPositions: Array<[number, number, number, THREE.BufferGeometry]> = [
      [0, WALL_HEIGHT / 2, ROOM_HALF_SIZE, wallGeo],
      [0, WALL_HEIGHT / 2, -ROOM_HALF_SIZE, wallGeo],
      [ROOM_HALF_SIZE, WALL_HEIGHT / 2, 0, sideGeo],
      [-ROOM_HALF_SIZE, WALL_HEIGHT / 2, 0, sideGeo],
    ];

    for (const [x, y, z, geo] of wallPositions) {
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      this.group.add(wall);
    }

    const obstacleCount = 6 + Math.min(6, floor);
    for (let i = 0; i < obstacleCount; i += 1) {
      const size = 1.5 + Math.random() * 2;
      const geo = new THREE.BoxGeometry(size, 3, size);
      const mat = new THREE.MeshStandardMaterial({ color: 0x5f5f5f });
      const box = new THREE.Mesh(geo, mat);

      let placed = false;
      for (let attempts = 0; attempts < 20 && !placed; attempts += 1) {
        box.position.set((Math.random() - 0.5) * 36, 1.5, (Math.random() - 0.5) * 36);
        const obstacleBox = new THREE.Box3().setFromObject(box);
        const nearSpawn = box.position.distanceTo(new THREE.Vector3(0, 1, 0)) < 5;
        const overlaps = this.obstacles.some((obs) => obs.box.intersectsBox(obstacleBox));
        if (!nearSpawn && !overlaps) {
          this.obstacles.push({ box: obstacleBox, mesh: box });
          this.group.add(box);
          placed = true;
        }
      }
    }
  }
}
