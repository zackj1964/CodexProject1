import * as THREE from "three";
import { InputState } from "./types";
import { Level } from "./level";

const SENSITIVITY = 0.0023;

export class PlayerController {
  readonly camera: THREE.PerspectiveCamera;
  readonly velocity = new THREE.Vector3();
  readonly position = new THREE.Vector3(0, 1.7, 0);
  readonly input: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  };

  private yaw = 0;
  private pitch = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 200);
    this.camera.position.copy(this.position);
  }

  onMouseMove(event: MouseEvent): void {
    this.yaw -= event.movementX * SENSITIVITY;
    this.pitch -= event.movementY * SENSITIVITY;
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  update(delta: number, level: Level): void {
    const speed = this.input.sprint ? 8 : 5;
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw) * -1);
    const right = new THREE.Vector3(forward.z * -1, 0, forward.x);

    const move = new THREE.Vector3();
    if (this.input.forward) move.add(forward);
    if (this.input.backward) move.sub(forward);
    if (this.input.right) move.add(right);
    if (this.input.left) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta);
      const xCandidate = this.position.clone().add(new THREE.Vector3(move.x, 0, 0));
      if (level.canOccupy(xCandidate)) {
        this.position.x = xCandidate.x;
      }
      const zCandidate = this.position.clone().add(new THREE.Vector3(0, 0, move.z));
      if (level.canOccupy(zCandidate)) {
        this.position.z = zCandidate.z;
      }
    }

    this.camera.position.copy(this.position);
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  reset(): void {
    this.position.set(0, 1.7, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.camera.position.copy(this.position);
    this.camera.rotation.set(0, 0, 0);
    this.input.forward = false;
    this.input.backward = false;
    this.input.left = false;
    this.input.right = false;
    this.input.sprint = false;
  }
}
