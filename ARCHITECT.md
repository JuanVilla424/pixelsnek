# Architecture — pixelsnek

## 🎯 Overview

pixelsnek is a classic snake game built with Vite + TypeScript + Canvas 2D. Zero runtime dependencies — all game logic and rendering use the native Canvas 2D API and vanilla TypeScript.

## 🧰 Tech Stack

| Layer           | Technology           |
| --------------- | -------------------- |
| Language        | TypeScript (strict)  |
| Build Tool      | Vite 6+              |
| Rendering       | Canvas 2D API        |
| Package Manager | npm                  |
| CI/CD           | GitHub Actions       |
| Pre-commit      | pre-commit framework |
| Version Control | Git + GitHub         |
| Deployment      | GitHub Pages         |

## 🏗️ Project Structure

```
pixelsnek/
├── src/
│   ├── game/           # Game logic (snake, food, scoring, collision)
│   ├── engine/         # Renderer, input handler, particle system
│   ├── ui/             # HUD, leaderboard, settings, theme
│   ├── utils/          # Helper functions and utilities
│   ├── styles/         # CSS (main.css)
│   └── main.ts         # Entry point — canvas init and game bootstrap
├── index.html          # HTML shell with <canvas id="game-canvas">
├── vite.config.ts      # Vite config (base: '/pixelsnek/')
├── tsconfig.json       # TypeScript strict config
├── package.json        # Scripts and devDependencies only
├── .github/workflows/  # CI/CD pipelines
├── scripts/            # Shared CI/CD scripts (submodule)
└── .pre-commit-config.yaml
```

## 🔄 Data Flow

```
User Input (keyboard/touch swipe)
    ↓
InputManager (src/engine/Input.ts) — keyboard + touch swipe handler
    ↓
Game State (src/game/) — snake position, direction, score, food
    ↓
Renderer (src/engine/Renderer.ts) — draws to Canvas 2D context (responsive resize)
    ├── HUD (src/ui/HUD.ts) — overlays score, level, game over screen, touch hint
    ├── Leaderboard (src/ui/Leaderboard.ts) — score history panel
    └── ParticleSystem (src/engine/Particles.ts) — visual effects on eat/death
```

## 🧩 Design Decisions

| Decision             | Choice              | Rationale                                                                           |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| Runtime dependencies | None                | Canvas 2D API covers all rendering needs                                            |
| Rendering            | Canvas 2D           | Performant, simple, no framework overhead                                           |
| Language             | TypeScript strict   | Catches bugs at compile time, no `any` types                                        |
| Build tool           | Vite                | Fast HMR, zero-config TypeScript, ES module output                                  |
| Base path            | `/pixelsnek/`       | Required for GitHub Pages subdirectory deployment                                   |
| State management     | Explicit parameters | No global state — functions receive and return state                                |
| Branch strategy      | dev → main          | Trunk-based development with stable main branch                                     |
| License              | GPLv3               | Standard open-source license                                                        |
| Theme                | CSS vars + canvas   | OS preference detection, toggle, persisted setting                                  |
| Settings             | localStorage        | Grid size, speed, particles, controls — persisted                                   |
| Leaderboard          | localStorage        | Top 10 scores with name entry, date, level                                          |
| Responsive canvas    | Dynamic resize      | Portrait: full-width with grid aspect ratio; landscape: full-height                 |
| Mobile touch lock    | CSS + JS            | `touch-action: none/manipulation`, `overscroll-behavior: none`, `user-select: none` |
| Haptic feedback      | Progressive enhance | `navigator.vibrate` feature-detected; eat=10ms, death=[50,50,50]ms                  |
| PWA manifest         | manifest.json       | Enables Add to Home Screen; standalone display mode                                 |
| GitHub Pages deploy  | deploy.yml workflow | Triggers on push to main via actions/deploy-pages                                   |
