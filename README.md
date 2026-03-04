# 🐍 PixelSnek

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/github/v/tag/JuanVilla424/pixelsnek?label=Version&color=blue)](VERSIONING.md)
[![Build](https://img.shields.io/github/actions/workflow/status/JuanVilla424/pixelsnek/ci.yml?branch=dev&label=Build)](https://github.com/JuanVilla424/pixelsnek/actions)
[![Status](https://img.shields.io/badge/Status-Active-green.svg)](https://github.com/JuanVilla424/pixelsnek)
[![License](https://img.shields.io/badge/License-GPLv3-purple.svg)](LICENSE)

A classic snake game built with vanilla TypeScript and the Canvas 2D API — no runtime dependencies, no frameworks, just pure browser technology. Guide your pixel snake to eat food, grow longer, and chase the high score without hitting a wall or yourself.

**Live demo:** https://juanvilla424.github.io/pixelsnek/

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [📦 Prerequisites](#-prerequisites)
  - [🔧 Installation](#-installation)
  - [⚙️ Environment Setup](#-environment-setup)
  - [🪝 Pre-Commit Hooks](#-pre-commit-hooks)
- [📋 Scripts](#-scripts)
- [🏗️ Architecture](#-architecture)
- [🤝 Contributing](#-contributing)
- [📬 Contact](#-contact)
- [📄 License](#-license)

## ✨ Features

- 🎮 Classic snake gameplay with smooth Canvas 2D rendering
- 🎨 Zero runtime dependencies — pure TypeScript + Canvas 2D API
- 🏆 Score tracking and leaderboard
- ✨ Particle effects on food consumption and game over
- ⌨️ Keyboard input with configurable controls (WASD / Arrow Keys / Vi-keys)
- 📱 Fully responsive — fills mobile screen in portrait and landscape without scrollbars
- 👆 Touch swipe controls with first-play hint overlay
- 📳 Haptic feedback on eat and death (Android Chrome via `navigator.vibrate`)
- 🔒 Mobile browser lock — no pull-to-refresh, no double-tap zoom, no context menu on long press
- 🧩 PWA manifest — installable as a home-screen app (`Add to Home Screen`)
- 🌐 Auto-deploys to GitHub Pages on push to `main`

## 🚀 Getting Started

### 📦 Prerequisites

- Node.js 20+
- npm 10+

### 🔧 Installation

```bash
git clone https://github.com/JuanVilla424/pixelsnek.git
cd pixelsnek
npm install
npm run dev
```

Open `http://localhost:5173/pixelsnek/` in your browser.

### ⚙️ Environment Setup

No environment variables required. The game runs entirely in the browser with no backend.

### 🪝 Pre-Commit Hooks

```bash
pip install pre-commit
pre-commit install
```

## 📋 Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build to dist |
| `npm run preview` | Preview production build |
| `npm run test`    | Run test suite           |

## 🏗️ Architecture

See [ARCHITECT.md](ARCHITECT.md) for full architecture documentation.

```
src/
├── game/        # Snake movement, food, scoring, collision
├── engine/      # Canvas renderer, input handler, particles
├── ui/          # HUD, leaderboard, settings, theme
├── utils/       # Pure helper functions
└── styles/      # CSS reset and game styles
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📬 Contact

Open an issue at [github.com/JuanVilla424/pixelsnek/issues](https://github.com/JuanVilla424/pixelsnek/issues).

## 📄 License

2026 — This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html). You are free to use, modify, and distribute this software under the terms of the GPL-3.0 license. For more details, see the [LICENSE](LICENSE) file.
