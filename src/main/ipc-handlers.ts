import { ipcMain, BrowserWindow, screen } from 'electron'
import { scrapeCharacterCombos } from './scraper'
import { getCachedCombos, setCachedCombos, clearCache, getCacheInfo } from './cache'
import { CHARACTER_NAMES } from '../renderer/types/combo'
import { openPracticeWindow, registerPracticeIpc } from './practiceWindow'
import { getFavorites, isFavorite, addFavorite, removeFavorite } from './favorites'
import type { Combo } from '../renderer/types/combo'

// Stored panel size for restoring after horizontal/collapse
const PANEL = { width: 800, height: 840 }
const HORIZONTAL = { height: 260 }

export function registerIpcHandlers(win: BrowserWindow): void {
  registerPracticeIpc()

  // Fetch combos for a character (cache-first)
  ipcMain.handle('fetch-combos', async (_, character: string) => {
    try {
      const cached = getCachedCombos(character)
      if (cached) {
        const info = getCacheInfo(character)
        return { combos: cached, fromCache: true, fetchedAt: info?.fetchedAt }
      }
      const { combos, rawHtml } = await scrapeCharacterCombos(character)
      setCachedCombos(character, combos, rawHtml)
      return { combos, fromCache: false, fetchedAt: Date.now() }
    } catch (err) {
      throw new Error(`Failed to fetch combos for ${character}: ${(err as Error).message}`)
    }
  })

  ipcMain.handle('get-character-list', () => CHARACTER_NAMES)

  ipcMain.handle('clear-cache', (_, character?: string) => {
    clearCache(character)
    return true
  })

  // Window controls
  ipcMain.on('close-window', () => win.close())
  ipcMain.on('minimize-window', () => win.minimize())

  ipcMain.on('set-ignore-mouse', (_, ignore: boolean) => {
    win.setIgnoreMouseEvents(ignore, { forward: true })
  })

  // Collapse to title bar
  let isCollapsed = false
  ipcMain.on('toggle-collapse', () => {
    const [w] = win.getSize()
    if (isCollapsed) {
      win.setSize(w, PANEL.height, true)
      isCollapsed = false
    } else {
      win.setSize(w, 48, true)
      isCollapsed = true
    }
  })

  // Horizontal stretch toggle
  let isHorizontal = false
  ipcMain.on('toggle-horizontal', () => {
    if (isHorizontal) {
      // Restore to panel mode
      win.setSize(PANEL.width, PANEL.height, true)
      isHorizontal = false
    } else {
      // Stretch to full-width horizontal bar
      const { width: screenW } = screen.getPrimaryDisplay().workAreaSize
      win.setSize(screenW, HORIZONTAL.height, true)
      const [, y] = win.getPosition()
      // Keep y position but clamp so it doesn't go off-screen
      const { height: screenH } = screen.getPrimaryDisplay().workAreaSize
      win.setPosition(0, Math.min(y, screenH - HORIZONTAL.height))
      isHorizontal = true
    }
    win.webContents.send('horizontal-changed', isHorizontal)
  })

  // Set opacity
  ipcMain.on('set-opacity', (_, opacity: number) => {
    win.setOpacity(Math.max(0.1, Math.min(1, opacity)))
  })

  // Open practice window with a combo
  ipcMain.on('open-practice', (_, combo: Combo) => {
    openPracticeWindow(combo)
  })

  // Favorites
  ipcMain.handle('get-favorites', () => getFavorites())
  ipcMain.handle('toggle-favorite', (_, id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id)
      return false
    } else {
      addFavorite(id)
      return true
    }
  })
  ipcMain.handle('is-favorite', (_, id: string) => isFavorite(id))
}
