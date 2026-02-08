import { Game } from "./engine/game";
import { parseSeed } from "./engine/rng";
import { bindInput } from "./ui/input";
import { renderGame } from "./ui/render";
import "./style.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app element");
}

const initialSeed = parseSeed(window.location.search);
const game = new Game(initialSeed);

const rerender = () => renderGame(root, game);
const restart = () => {
  const seed = parseSeed(window.location.search);
  game.reset(seed);
};

bindInput(game, rerender, restart);
rerender();
