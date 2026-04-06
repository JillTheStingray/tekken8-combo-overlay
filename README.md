# Tekken 8 Combo Overlay

A transparent, always-on-top desktop overlay for Tekken 8 that fetches combos directly from [tekken8combo.kagewebsite.com](https://tekken8combo.kagewebsite.com/) and displays them using proper SVG button notation — so you can study combos while you play.

![Electron](https://img.shields.io/badge/Electron-36BCF7?style=flat&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

## Features

- 🎮 **All 40 characters** — including Fahkumram, Miary-Zo and Jack-8
- 🖼️ **SVG notation rendering** — every input token shown as a proper button image (holds, just-frames, slides, delays, brackets, Heat Dash and more)
- ⭐ **Favorites** — star combos to pin them to the top; persists across sessions
- 🏋️ **Practice mode** — click any combo to open a step-by-step practice window
- 🏷️ **Tags & filters** — filter by Heat, Wall, Rage, CH, stage requirements and more
- 🔄 **Auto-cache** — combos are cached for 24 hours so the overlay loads instantly
- 📐 **Horizontal strip mode** — stretch to a thin bar across the top/bottom of your screen
- 🎨 **Transparent & click-through** — passes mouse clicks to the game when not in use

## Requirements

- [Node.js](https://nodejs.org/) **v18 or later**
- npm (comes with Node.js)

## How to run

```bash
# 1. Extract the ZIP (or clone the repo)

# 2. Open a terminal in the project folder and install dependencies
npm install

# 3. Start the overlay
npm run dev
```

The overlay window will appear. Press **F9** (default hotkey) to show/hide it while in-game.

## Building a standalone .exe

To build a Windows installer you can share without needing Node.js:

```bash
npm run dist
```

The installer will be in the `dist/` folder.

## Controls

| Action | How |
|--------|-----|
| Move overlay | Drag the title bar |
| Show / hide | `F9` hotkey |
| Collapse to bar | Click `—` button |
| Horizontal strip | Click `⇔` button |
| Practice a combo | Click any combo card |
| Star a combo | Click `☆` on the card |
| Refresh combos | Click `↻ Refresh` |

## Tech stack

- **Electron** + **electron-vite**
- **React 18** + **TypeScript**
- **TailwindCSS 3**
- **Zustand** (state management)
- **Cheerio** (HTML scraping in main process)
- **@tanstack/react-virtual** (virtualised combo list)
- **electron-store** (favorites + combo cache)
