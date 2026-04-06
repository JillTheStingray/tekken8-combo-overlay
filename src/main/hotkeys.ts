import { globalShortcut, BrowserWindow } from 'electron'

export function registerHotkeys(win: BrowserWindow): void {
  // Toggle show/hide the entire overlay
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })

  // Send collapse/expand toggle to renderer
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    win.webContents.send('hotkey-toggle')
  })
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll()
}
