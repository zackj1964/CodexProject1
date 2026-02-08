import { Game } from "../engine/game";

export function bindInput(game: Game, onChange: () => void, restart: () => void): void {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "r") {
      restart();
      onChange();
      return;
    }

    if (key === "n") {
      game.nextFloor();
      onChange();
      return;
    }

    const move = movementFor(event.key);
    if (!move) {
      return;
    }

    event.preventDefault();
    game.attemptMove(move.dx, move.dy);
    onChange();
  });
}

function movementFor(key: string): { dx: number; dy: number } | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return { dx: 0, dy: -1 };
    case "ArrowDown":
    case "s":
    case "S":
      return { dx: 0, dy: 1 };
    case "ArrowLeft":
    case "a":
    case "A":
      return { dx: -1, dy: 0 };
    case "ArrowRight":
    case "d":
    case "D":
      return { dx: 1, dy: 0 };
    default:
      return null;
  }
}
