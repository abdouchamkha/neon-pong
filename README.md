# 🏓 NEON PONG // Cyberpunk Arcade

<div align="center">

![Neon Pong Banner](https://img.shields.io/badge/NEON_PONG-Cyberpunk_Arcade-00f3ff?style=for-the-badge&logo=retroarch&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-39ff14?style=for-the-badge)

<p align="center">
  <b>A fast-paced, synthwave-infused retro cyberpunk arcade Pong game built with vanilla HTML5 Canvas, CSS3, and modern JavaScript.</b>
</p>

<p align="center">
  <a href="#-gameplay-preview">Gameplay Preview</a> •
  <a href="#-features">Features</a> •
  <a href="#-controls">Controls</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

</div>

---

## 🎬 Gameplay Preview

<div align="center">
  <img src="assets/preview.gif" alt="Neon Pong Gameplay Preview" width="800" style="max-width: 100%; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);" />
</div>

---

## ⚡ Features

- 🎮 **Multiple Game Modes**:
  - **Single Player vs AI**: 3 adaptive AI difficulties (Easy, Medium, Hard/Unbeatable).
  - **Local 2-Player**: Head-to-head battle on the same keyboard or touch screen.
- 💥 **Dynamic Power-Up System**:
  - **Laser Blaster**: Shoot projectiles to shrink the opponent's paddle.
  - **Multi-Ball**: Spawn extra chaos balls on court.
  - **Paddle Extension / Speed Boost**: Gain tactical advantage.
  - **Freeze Field**: Temporarily lock or slow your rival.
- 🎨 **Synthwave & Cyberpunk Aesthetics**:
  - CRT scanlines, chromatic aberration, and customizable neon glow themes (*Cyan/Magenta*, *Matrix Green*, *Sunset Amber*, *Cyber Blood*).
  - Particle burst effects on paddle hits, wall rebounds, and goal explosions.
- 🔊 **Synthesized Web Audio Engine**:
  - Pure Web Audio API procedural sound synthesis—no external audio assets needed!
  - Dynamic retro bleeps, power-up chimes, and goal explosions.
- 📱 **Fully Responsive & Touch Enabled**:
  - Seamless scaling on 1080p, 4K, laptops, tablets, and mobile devices with dedicated on-screen touch zones.

---

## 🕹️ Controls

| Action | Player 1 (Left) | Player 2 (Right) |
| :--- | :---: | :---: |
| **Move Up** | <kbd>W</kbd> | <kbd>▲ Up Arrow</kbd> |
| **Move Down** | <kbd>S</kbd> | <kbd>▼ Down Arrow</kbd> |
| **Serve / Launch Ball** | <kbd>Space</kbd> | <kbd>Space</kbd> / <kbd>Enter</kbd> |
| **Pause Game** | <kbd>P</kbd> or <kbd>Esc</kbd> | <kbd>P</kbd> or <kbd>Esc</kbd> |
| **Toggle Audio** | <kbd>M</kbd> | <kbd>M</kbd> |
| **Mobile / Touch** | Left on-screen buttons | Right on-screen buttons |

---

## 🚀 Getting Started

No build tools or installations required! Neon Pong runs directly in any modern web browser.

### Play Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abdouchamkha/neon-pong.git
   cd neon-pong
   ```
2. **Open the game**:
   - Simply double-click `index.html` to open in your browser, or
   - Run a quick local server:
     ```bash
     # Python 3
     python3 -m http.server 8000
     
     # Node (npx)
     npx serve .
     ```
3. Open `http://localhost:8000` and enjoy!

---

## 🛠️ Project Structure

```text
├── index.html       # Game markup, overlays, and canvas viewport
├── style.css        # Cyberpunk UI design, glow shaders & animations
├── js/
│   ├── main.js      # Game entry point, loop orchestrator & event routing
│   ├── game.js      # Core state machine, scoring, and court physics
│   ├── paddle.js    # Paddle physics, velocities, and collisions
│   ├── ball.js      # Ball trajectory, speed curve, and deflection math
│   ├── ai.js        # Autonomous paddle intelligence and prediction algorithms
│   ├── powerups.js  # Spawning, pickup collision, and powerup active states
│   ├── particles.js # High-performance particle emitter system
│   ├── audio.js     # Procedural Web Audio API sound synthesizer
│   └── ui.js        # HUD updates, theme switching, and modal dialogs
├── assets/
│   └── preview.gif  # Gameplay preview animation
└── README.md        # Project documentation
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ⚡ and neon glow.</b>
</div>
