import "./style.css";
import { GameEngine } from "./game/engine";
import { Hud } from "./ui/hud";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing #app element");

const hudRoot = document.createElement("div");
hudRoot.id = "ui-root";
const canvasRoot = document.createElement("div");
canvasRoot.id = "canvas-root";
app.append(hudRoot, canvasRoot);

const hud = new Hud(hudRoot);
const game = new GameEngine(canvasRoot, hud);
game.start();

// ---- Pointer Lock + overlay wiring ----
const getCanvas = (): HTMLCanvasElement | null =>
  canvasRoot.querySelector("canvas");

// Try to request pointer lock on click (must be synchronous)
const requestLock = () => {
  const canvas = getCanvas();
  if (!canvas) {
    hud.setOverlayHint("Canvas not ready yet. Try again.");
    return;
  }
  // Make canvas focusable and focused (helps keyboard + pointer lock)
  canvas.tabIndex = 0;
  canvas.focus();

  try {
    canvas.requestPointerLock();
  } catch {
    hud.setOverlayHint("Pointer lock blocked. Click again.");
  }
};

// Allow clicking either the overlay or the backdrop
hud.getOverlayClickTargets().forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    requestLock();
  });
});

// Hide overlay only when pointer lock is actually active
document.addEventListener("pointerlockchange", () => {
  const canvas = getCanvas();
  const locked = !!canvas && document.pointerLockElement === canvas;
  hud.setStartOverlayVisible(!locked);
  if (!locked) hud.setOverlayHint("Click to capture mouse");
});

document.addEventListener("pointerlockerror", () => {
  hud.setStartOverlayVisible(true);
  hud.setOverlayHint("Pointer lock blocked. Click again.");
});
