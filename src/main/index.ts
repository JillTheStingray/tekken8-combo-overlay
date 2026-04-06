import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import { registerIpcHandlers } from './ipc-handlers'
import { registerHotkeys, unregisterHotkeys } from './hotkeys'

let mainWindow: BrowserWindow | null = null

// ── Tekken 8 process watcher ──────────────────────────────────────────────
const TEKKEN_EXE = 'TekkenGame-Win64-Shipping.exe'
let tekkenRunning = false
let watcherInterval: ReturnType<typeof setInterval> | null = null

function checkTekken(): void {
  exec(`tasklist /FI "IMAGENAME eq ${TEKKEN_EXE}" /NH`, (err, stdout) => {
    if (err) return
    const isRunning = stdout.toLowerCase().includes(TEKKEN_EXE.toLowerCase())

    if (isRunning && !tekkenRunning) {
      // Game just launched — show overlay
      tekkenRunning = true
      if (mainWindow) {
        mainWindow.showInactive() // show without stealing focus from the game
        mainWindow.setAlwaysOnTop(true, 'screen-saver')
      }
    } else if (!isRunning && tekkenRunning) {
      // Game just closed — hide overlay
      tekkenRunning = false
      if (mainWindow) mainWindow.hide()
    }
  })
}

function startWatcher(): void {
  watcherInterval = setInterval(checkTekken, 3000)
}

function stopWatcher(): void {
  if (watcherInterval) { clearInterval(watcherInterval); watcherInterval = null }
}

function createWindow(): void {
  const preload = join(__dirname, '../preload/index.js')

  mainWindow = new BrowserWindow({
    width: 800,
    height: 840,
    minWidth: 560,
    minHeight: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: false,
    resizable: true,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Start hidden — the game watcher will show it when Tekken 8 launches
  mainWindow.hide()

  // Open external links in browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  if (mainWindow) {
    registerIpcHandlers(mainWindow)
    registerHotkeys(mainWindow)
  }

  // Start watching for Tekken 8
  startWatcher()
  // Also check immediately in case the game is already running
  checkTekken()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  unregisterHotkeys()
  stopWatcher()
})
