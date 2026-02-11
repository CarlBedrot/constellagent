# Constellagent

Desktop terminal UI for Claude Code. Four-panel Electron app with an embedded terminal, git worktree management, diff/file editor, and cron job scheduler.

![Constellagent screenshot](https://github.com/user-attachments/assets/placeholder)

## Features

- **Terminal** — Real PTY sessions via xterm.js + node-pty, multiple tabs, Cmd+T/Cmd+W shortcuts
- **Worktrees** — Browse, add, remove git worktrees with branch badges
- **Editor** — Monaco-powered diff view and file editor with syntax highlighting, Cmd+S save
- **Cron** — Schedule recurring commands with cron expressions, toggle on/off, run manually
- **Layout persistence** — Panel sizes, window position, and last repo path are remembered across sessions
- **Keyboard shortcuts** — Cmd+B (toggle sidebar), Cmd+T (new tab), Cmd+W (close tab), Cmd+S (save), Cmd+D (toggle diff), Cmd+1-9 (switch tabs)

## Tech Stack

| Component | Library |
|---|---|
| Shell | Electron 33+ |
| Frontend | React 19, TypeScript, TailwindCSS 4 |
| Terminal | xterm.js 5, node-pty |
| Editor | Monaco Editor |
| Git | simple-git |
| Cron | node-cron, electron-store |
| Layout | react-resizable-panels |
| State | Zustand 5 |
| Bundler | electron-vite 5 |

## Getting Started

```bash
git clone https://github.com/CarlBedrot/constellagent.git
cd constellagent
npm install
npm run dev
```

`npm install` automatically rebuilds `node-pty` for Electron via the postinstall script.

## Architecture

```
src/
  main/           # Electron main process
    ipc/          # IPC channel handlers (pty, git, file, cron, layout)
    services/     # Business logic (PtyManager, GitService, CronService, etc.)
    utils/        # Path validation
  preload/        # contextBridge API (typed, minimal surface)
  renderer/       # React app
    components/   # Terminal, Editor, Worktree, Cron, Layout panels
    hooks/        # Keyboard shortcuts
    store/        # Zustand stores (terminal, editor, worktree, cron)
    styles/       # Global CSS + dark theme
```

IPC follows a strict pattern: `contextIsolation: true`, `nodeIntegration: false`. All communication goes through typed invoke/handle channels exposed via `contextBridge`.

## Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build
npm run preview   # Preview production build
```

## License

MIT
