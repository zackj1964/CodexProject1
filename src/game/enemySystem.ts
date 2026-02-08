import * as THREE from "three";
import { Enemy } from "./types";
import { Level } from "./level";

const BASE_HP = 40;
const BASE_SPEED = 2;
const BASE_DAMAGE = 7;

export class EnemySystem {
  private enemies: Enemy[] = [];
  private idCounter = 1;

  constructor(private readonly scene: THREE.Scene, private readonly enemyBarsLayer: HTMLElement) {}

  spawn(level: Level, count: number, floor: number): void {
    this.clear();
    for (let i = 0; i < count; i += 1) {
      const enemy = this.createEnemy(level, floor);
      this.enemies.push(enemy);
      this.scene.add(enemy.mesh);
      this.enemyBarsLayer.append(enemy.healthBar);
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
        dps += enemy.damage;
      }
    }
    return dps;
  }

  updateHealthBars(camera: THREE.Camera, viewportWidth: number, viewportHeight: number): void {
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        enemy.healthBar.style.display = "none";
        continue;
      }

      const headPos = enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.9, 0));
      const toEnemy = headPos.clone().sub((camera as THREE.PerspectiveCamera).position);
      if (cameraDirection.dot(toEnemy) <= 0) {
        enemy.healthBar.style.display = "none";
        continue;
      }

      const projected = headPos.project(camera);
      const offScreen =
        projected.x < -1 ||
        projected.x > 1 ||
        projected.y < -1 ||
        projected.y > 1 ||
        projected.z < -1 ||
        projected.z > 1;

      if (offScreen) {
        enemy.healthBar.style.display = "none";
        continue;
      }

      const x = (projected.x * 0.5 + 0.5) * viewportWidth;
      const y = (-projected.y * 0.5 + 0.5) * viewportHeight;
      enemy.healthBar.style.display = "block";
      enemy.healthBar.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      enemy.healthFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
    }
  }

  damageEnemy(object: THREE.Object3D, amount: number): Enemy | null {
    const enemy = this.enemies.find((item) => item.mesh === object || item.mesh.uuid === object.uuid);
    if (!enemy || !enemy.alive) {
      return null;
    }
    enemy.hp = Math.max(0, enemy.hp - amount);
    if (enemy.hp <= 0) {
      enemy.alive = false;
      this.scene.remove(enemy.mesh);
      enemy.healthBar.remove();
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
    this.enemies.forEach((enemy) => {
      this.scene.remove(enemy.mesh);
      enemy.healthBar.remove();
    });
    this.enemies = [];
  }

  private createEnemy(level: Level, floor: number): Enemy {
    const geometry = new THREE.CapsuleGeometry(0.55, 0.8, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xd65252 });
    const mesh = new THREE.Mesh(geometry, material);

    const hpVariance = 0.9 + Math.random() * 0.2;
    const maxHp = Math.round((BASE_HP + floor * 5) * hpVariance);
    const speedMultiplier = Math.min(2, 1 + floor * 0.05);
    const damage = Math.min(18, BASE_DAMAGE + floor * 0.5);

    let spawned = false;
    for (let tries = 0; tries < 30 && !spawned; tries += 1) {
      mesh.position.set((Math.random() - 0.5) * 34, 1.2, (Math.random() - 0.5) * 34);
      spawned = level.canOccupy(mesh.position, 0.8) && mesh.position.length() > 7;
    }

    const healthBar = document.createElement("div");
    healthBar.className = "enemy-health-bar";
    const healthFill = document.createElement("div");
    healthFill.className = "enemy-health-fill";
    healthBar.append(healthFill);

    return {
      id: this.idCounter++,
      hp: maxHp,
      maxHp,
      speed: BASE_SPEED * speedMultiplier,
      damage,
      mesh,
      alive: true,
      healthBar,
      healthFill,
    };
  }
}
