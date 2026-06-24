# 🎮 Tetris Game

> A classic Tetris game built with vanilla JavaScript and HTML5 Canvas — no frameworks, no dependencies.

**Live Demo:** [Play Now 🕹️](https://tetris-game-one-gamma.vercel.app/)

---

## ✨ Features

- 7 tetromino pieces with smooth rotation and collision detection
- Ghost piece preview showing where the piece will land
- Next piece preview panel
- Progressive difficulty — speed increases every 10 lines
- Level-based scoring system with multi-line clear bonuses
- Pause / Resume functionality
- Persistent best score via `localStorage`
- Dark arcade-themed UI with Orbitron font

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `←` `→` | Move left / right |
| `↑` | Rotate piece |
| `↓` | Soft drop |
| `Space` | Pause / Resume |

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Rendering | HTML5 Canvas |
| Logic | Vanilla JavaScript |
| Styling | CSS3 |
| Font | Google Fonts (Orbitron) |
| Deployment | Vercel |

---

## 📦 Getting Started

```bash
git clone https://github.com/nishant-2111/Tetris-Game.git
cd tetris-game
open index.html
```

No build steps. No installs. Just open `index.html` in any browser and play.

---

## 📁 Project Structure

```
tetris-game/
├── index.html      # Game layout and structure
├── style.css       # Dark arcade UI styling
└── script.js       # Game logic, rendering, controls
```

---

## 🏆 Scoring

| Lines Cleared | Points |
|---|---|
| 1 line | 10 × level |
| 2 lines | 30 × level |
| 3 lines | 50 × level |
| 4 lines | 100 × level |

---

## 📄 License

This project is open source. Feel free to explore, fork, and contribute!
