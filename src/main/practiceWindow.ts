import { BrowserWindow, screen, ipcMain } from 'electron'
import { join } from 'path'
import type { Combo } from '../renderer/types/combo'

let practiceWin: BrowserWindow | null = null
let pendingCombo: Combo | null = null

export function openPracticeWindow(combo: Combo): void {
  pendingCombo = combo

  if (practiceWin && !practiceWin.isDestroyed()) {
    // Already open — just send new combo
    practiceWin.webContents.send('practice-combo', combo)
    practiceWin.show()
    practiceWin.focus()
    return
  }

  const { width } = screen.getPrimaryDisplay().workAreaSize
  const preload = join(__dirname, '../preload/index.js')

  practiceWin = new BrowserWindow({
    width,
    height: 160,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: true,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  practiceWin.setAlwaysOnTop(true, 'screen-saver')
  practiceWin.setVisibleOnAllWorkspaces(true)

  const baseUrl = process.env['ELECTRON_RENDERER_URL']
  if (baseUrl) {
    practiceWin.loadURL(`${baseUrl}?mode=practice`)
  } else {
    practiceWin.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { mode: 'practice' },
    })
  }

  // Once loaded, send the combo data
  practiceWin.webContents.once('did-finish-load', () => {
    practiceWin?.webContents.send('practice-combo', pendingCombo)
  })

  practiceWin.on('closed', () => {
    practiceWin = null
  })
}

export function closePracticeWindow(): void {
  if (practiceWin && !practiceWin.isDestroyed()) {
    practiceWin.close()
    practiceWin = null
  }
}

export function registerPracticeIpc(): void {
  ipcMain.on('close-practice', () => closePracticeWindow())
}
