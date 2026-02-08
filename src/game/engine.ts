import * as THREE from "three";
import { EnemySystem } from "./enemySystem";
import { Level } from "./level";
import { PlayerController } from "./playerController";
import { Hud } from "../ui/hud";

export class GameEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly player: PlayerController;
  private readonly enemySystem: EnemySystem;
  private readonly raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();

  private level: Level;
  private logs: string[] = [];
  private hp = 100;
  private floor = 1;
  private running = false;
  private gameOver = false;

  constructor(private readonly canvasHost: HTMLElement, private readonly hud: Hud) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x101217);

    this.player = new PlayerController(window.innerWidth / window.innerHeight);
    this.enemySystem = new EnemySystem(this.scene);
    this.level = new Level(this.scene, this.floor);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(12, 18, 8);
    this.scene.add(directional);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasHost.appendChild(this.renderer.domElement);

    this.bindEvents();
    this.spawnFloor();
    this.renderHud();
  }

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.clock.start();
    requestAnimationFrame(this.tick);
  }

  private readonly tick = (): void => {
    if (!this.running) return;
    const delta = Math.min(0.03, this.clock.getDelta());

    if (!this.gameOver && document.pointerLockElement === this.renderer.domElement) {
      this.player.update(delta, this.level);
      const incomingDps = this.enemySystem.update(delta, this.player.position, this.level);
      if (incomingDps > 0) {
        this.hp -= incomingDps * delta;
        if (this.hp <= 0) {
          this.hp = 0;
          this.gameOver = true;
          this.hud.setGameOverVisible(true);
          this.pushLog("You were overwhelmed.");
          document.exitPointerLock();
        }
      }

      if (this.enemySystem.getAliveCount() === 0) {
        this.level.spawnPortal();
      }

      if (this.level.isTouchingPortal(this.player.position)) {
        this.floor += 1;
        this.hp = Math.min(100, this.hp + 12);
        this.pushLog(`Floor ${this.floor} reached. +12 HP`);
        this.resetFloor();
      }
    }

    this.renderHud();
    this.renderer.render(this.scene, this.player.camera);
    requestAnimationFrame(this.tick);
  };

  private bindEvents(): void {
    window.addEventListener("resize", () => {
      this.player.camera.aspect = window.innerWidth / window.innerHeight;
      this.player.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === this.renderer.domElement && !this.gameOver) {
        this.player.onMouseMove(event);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.code === "KeyR") {
        this.restart();
        return;
      }
      this.setMovement(event.code, true);
    });

    document.addEventListener("keyup", (event) => {
      this.setMovement(event.code, false);
    });

    this.renderer.domElement.addEventListener("click", () => {
      if (!this.gameOver) {
        this.renderer.domElement.requestPointerLock();
      }
      this.hud.setStartOverlayVisible(false);
    });

    document.addEventListener("mousedown", (event) => {
      if (
        event.button === 0 &&
        document.pointerLockElement === this.renderer.domElement &&
        !this.gameOver
      ) {
        this.shoot();
      }
    });
  }

  private setMovement(code: string, pressed: boolean): void {
    if (code === "KeyW") this.player.input.forward = pressed;
    if (code === "KeyS") this.player.input.backward = pressed;
    if (code === "KeyA") this.player.input.left = pressed;
    if (code === "KeyD") this.player.input.right = pressed;
    if (code === "ShiftLeft" || code === "ShiftRight") this.player.input.sprint = pressed;
  }

  private shoot(): void {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.player.camera);
    const hits = this.raycaster.intersectObjects(this.enemySystem.getTargetMeshes(), false);
    if (hits.length === 0) {
      this.pushLog("Shot missed.");
      return;
    }

    const target = hits[0].object;
    const enemy = this.enemySystem.damageEnemy(target, 25);
    if (!enemy) return;

    if (enemy.alive) {
      this.pushLog("Enemy hit for 25.");
      return;
    }
    this.pushLog("Enemy eliminated.");
  }

  private resetFloor(): void {
    this.level.destroy();
    this.level = new Level(this.scene, this.floor);
    this.spawnFloor();
    this.player.reset();
  }

  private spawnFloor(): void {
    const enemies = 6 + Math.floor(Math.random() * 5);
    this.enemySystem.spawn(this.level, enemies);
    this.pushLog(`Floor ${this.floor}: ${enemies} enemies detected.`);
  }

  private restart(): void {
    this.floor = 1;
    this.hp = 100;
    this.gameOver = false;
    this.hud.setGameOverVisible(false);
    this.pushLog("Run restarted.");
    this.resetFloor();
    this.hud.setStartOverlayVisible(true);
  }

  private pushLog(message: string): void {
    this.logs.unshift(message);
    this.logs = this.logs.slice(0, 5);
  }

  private renderHud(): void {
    this.hud.updateStats(this.hp, this.floor, this.enemySystem.getAliveCount());
    this.hud.updateLog(this.logs);
  }
}
