import "./style.css";
import { GameEngine } from "./game/engine";
import { Hud } from "./ui/hud";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app element");
}

const hudRoot = document.createElement("div");
hudRoot.id = "ui-root";
const canvasRoot = document.createElement("div");
canvasRoot.id = "canvas-root";
app.append(hudRoot, canvasRoot);

const hud = new Hud(hudRoot);
const game = new GameEngine(canvasRoot, hud);
game.start();
