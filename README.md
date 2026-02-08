# Browser Roguelike MVP

A turn-based browser roguelike built with **Vite + TypeScript**.

## Features

- 60x30 ASCII dungeon map (`#` walls, `.` floors)
- Procedural rooms + corridors generation
- Deterministic seeds via query param, e.g. `?seed=123`
- Player movement with **Arrow keys** or **WASD**
- Player attacks by moving into enemies
- Enemies take one action per player turn:
  - Attack when adjacent
  - Otherwise move one step toward the player
- HP, floor number, status display, and a 5-line message log
- Restart with `R`
- Next floor with `N` when all enemies are defeated

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Seeded runs

Use a query string seed to reproduce generation:

- `http://localhost:5173/?seed=123`
- `http://localhost:5173/?seed=999`

## Build for production

```bash
npm run build
npm run preview
```

This outputs static assets in `dist/`, suitable for GitHub Pages hosting.

## GitHub Pages deployment

This repository includes a workflow at `.github/workflows/deploy-pages.yml` that builds and deploys the app on every push to `master`.

Expected deployed URL format:

- `https://<your-github-username>.github.io/CodexProject1/`

### Enable Pages in repository settings

1. Go to **Settings → Pages** in your GitHub repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `master` (or run the workflow manually from the Actions tab).
4. After deployment finishes, open the Pages URL above.

> Note: `vite.config.ts` sets `base: "/CodexProject1/"` so assets resolve correctly on project Pages.

## Controls

- Move: Arrow keys / WASD
- Attack: walk into enemy tile
- Restart run: `R`
- Next floor after clearing all enemies: `N`
