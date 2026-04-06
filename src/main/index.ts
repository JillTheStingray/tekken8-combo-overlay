import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { registerHotkeys, unregisterHotkeys } from './hotkeys'

let mainWindow: BrowserWindow | null = null

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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  unregisterHotkeys()
})
