export class Hud {
  private hpEl: HTMLSpanElement;
  private floorEl: HTMLSpanElement;
  private enemiesEl: HTMLSpanElement;
  private logListEl: HTMLUListElement;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div id="overlay" class="overlay visible">
        <div class="overlay-card">
          <h1>3D Roguelite Shooter</h1>
          <p>Click to Play</p>
          <small>WASD move • Mouse look • Shift sprint • Left click shoot • R restart</small>
        </div>
      </div>
      <div id="game-over" class="overlay hidden">
        <div class="overlay-card">
          <h2>Game Over</h2>
          <p>Press R to restart</p>
        </div>
      </div>
      <div id="crosshair">+</div>
      <div class="hud">
        <div>HP: <span id="hp">100</span></div>
        <div>Floor: <span id="floor">1</span></div>
        <div>Enemies: <span id="enemies">0</span></div>
      </div>
      <div class="log-panel">
        <h3>Events</h3>
        <ul id="log-list"></ul>
      </div>
    `;

    this.hpEl = this.getById<HTMLSpanElement>("hp");
    this.floorEl = this.getById<HTMLSpanElement>("floor");
    this.enemiesEl = this.getById<HTMLSpanElement>("enemies");
    this.logListEl = this.getById<HTMLUListElement>("log-list");
  }

  updateStats(hp: number, floor: number, enemiesRemaining: number): void {
    this.hpEl.textContent = String(Math.max(0, Math.round(hp)));
    this.floorEl.textContent = String(floor);
    this.enemiesEl.textContent = String(enemiesRemaining);
  }

  updateLog(entries: string[]): void {
    this.logListEl.innerHTML = "";
    entries.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = entry;
      this.logListEl.appendChild(item);
    });
  }

  setStartOverlayVisible(visible: boolean): void {
    this.toggleOverlay("overlay", visible);
  }

  setGameOverVisible(visible: boolean): void {
    this.toggleOverlay("game-over", visible);
  }

  private toggleOverlay(id: string, visible: boolean): void {
    const node = this.getById<HTMLElement>(id);
    node.classList.toggle("visible", visible);
    node.classList.toggle("hidden", !visible);
  }

  private getById<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Missing UI element #${id}`);
    }
    return el as T;
  }
}
