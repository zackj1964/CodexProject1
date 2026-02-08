# 3D Browser Roguelite Shooter MVP

A first-person roguelite shooter built with **Vite + TypeScript + Three.js**.

## Core gameplay

- Click-to-play start overlay with Pointer Lock
- FPS controls (WASD + mouse look)
- Hitscan shooting from screen center
- Enemies chase and damage player at close range
- Clear all enemies to spawn a floor portal
- Touch portal to generate the next floor
- HP persists between floors with a small heal on floor clear
- HUD with HP, floor, enemies remaining, and a short event log
- Game over overlay with `R` restart

## Controls

- **Click game canvas**: start and lock pointer
- **Mouse**: look around
- **W / A / S / D**: move
- **Shift**: sprint
- **Left Click**: shoot
- **R**: restart run from Floor 1

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Build production assets

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

This repository uses `.github/workflows/deploy-pages.yml` to build and deploy `dist/` on pushes to `master`.

Expected URL format:

- `https://<your-github-username>.github.io/CodexProject1/`

`vite.config.ts` keeps `base: "/CodexProject1/"` so asset paths are correct for project Pages.
