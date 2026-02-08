import * as THREE from "three";
import { Enemy } from "./types";
import { Level } from "./level";

export class EnemySystem {
  private enemies: Enemy[] = [];
  private idCounter = 1;

  constructor(private readonly scene: THREE.Scene) {}

  spawn(level: Level, count: number): void {
    this.clear();
    for (let i = 0; i < count; i += 1) {
      const enemy = this.createEnemy(level);
      this.enemies.push(enemy);
      this.scene.add(enemy.mesh);
    }
  }

  update(delta: number, playerPos: THREE.Vector3, level: Level): number {
    let dps = 0;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const toPlayer = playerPos.clone().sub(enemy.mesh.position);
      const distance = toPlayer.length();
      if (distance > 0.001) {
        const move = toPlayer.normalize().multiplyScalar(enemy.speed * delta);
        const candidate = enemy.mesh.position.clone().add(new THREE.Vector3(move.x, 0, move.z));
        if (level.canOccupy(candidate, 0.7)) {
          enemy.mesh.position.copy(candidate);
        }
      }
      if (distance < 1.7) {
        dps += 8;
      }
    }
    return dps;
  }

  damageEnemy(object: THREE.Object3D, amount: number): Enemy | null {
    const enemy = this.enemies.find((item) => item.mesh === object || item.mesh.uuid === object.uuid);
    if (!enemy || !enemy.alive) {
      return null;
    }
    enemy.hp -= amount;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      this.scene.remove(enemy.mesh);
    }
    return enemy;
  }

  getAliveCount(): number {
    return this.enemies.filter((enemy) => enemy.alive).length;
  }

  getTargetMeshes(): THREE.Object3D[] {
    return this.enemies.filter((enemy) => enemy.alive).map((enemy) => enemy.mesh);
  }

  clear(): void {
    this.enemies.forEach((enemy) => this.scene.remove(enemy.mesh));
    this.enemies = [];
  }

  private createEnemy(level: Level): Enemy {
    const geometry = new THREE.CapsuleGeometry(0.55, 0.8, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xd65252 });
    const mesh = new THREE.Mesh(geometry, material);

    let spawned = false;
    for (let tries = 0; tries < 30 && !spawned; tries += 1) {
      mesh.position.set((Math.random() - 0.5) * 34, 1.2, (Math.random() - 0.5) * 34);
      spawned = level.canOccupy(mesh.position, 0.8) && mesh.position.length() > 7;
    }

    return {
      id: this.idCounter++,
      hp: 45,
      speed: 2 + Math.random() * 0.8,
      mesh,
      alive: true,
    };
  }
}
