import { Game } from "../engine/game";

export function renderGame(root: HTMLElement, game: Game): void {
  root.innerHTML = `
    <div class="layout">
      <h1>Roguelike MVP</h1>
      <div class="hud">
        <div>HP: ${game.player.hp}/${game.player.maxHp}</div>
        <div>Floor: ${game.floor}</div>
        <div>Enemies: ${game.enemies.length}</div>
      </div>
      <pre class="grid">${renderGrid(game)}</pre>
      <div class="panel">
        <h2>Log</h2>
        <ul>${game.messages.map((m) => `<li>${m.text}</li>`).join("")}</ul>
      </div>
      <div class="panel">
        <h2>Controls</h2>
        <p>Move: Arrow keys or WASD</p>
        <p>Attack: move into enemy tile</p>
        <p>Restart: R</p>
        <p>Next floor: N (after defeating all enemies)</p>
      </div>
      <div class="status ${game.status}">${statusMessage(game.status)}</div>
    </div>
  `;
}

function renderGrid(game: Game): string {
  const rows: string[] = [];
  for (let y = 0; y < game.height; y++) {
    let row = "";
    for (let x = 0; x < game.width; x++) {
      row += glyphFor(game, x, y);
    }
    rows.push(row);
  }
  return rows.join("\n");
}

function glyphFor(game: Game, x: number, y: number): string {
  if (game.player.x === x && game.player.y === y) {
    return "@";
  }
  if (game.enemies.some((e) => e.x === x && e.y === y)) {
    return "g";
  }
  return game.dungeon.tiles[y][x] === "wall" ? "#" : ".";
}

function statusMessage(status: Game["status"]): string {
  if (status === "lost") {
    return "Game Over";
  }
  if (status === "won") {
    return "Floor Cleared";
  }
  return "Exploring";
}
