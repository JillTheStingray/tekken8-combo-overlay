import { contextBridge, ipcRenderer } from 'electron'
import type { Combo } from '../renderer/types/combo'

contextBridge.exposeInMainWorld('electronAPI', {
  fetchCombos: (character: string) => ipcRenderer.invoke('fetch-combos', character),
  getCharacterList: () => ipcRenderer.invoke('get-character-list'),
  clearCache: (character?: string) => ipcRenderer.invoke('clear-cache', character),

  setIgnoreMouse: (ignore: boolean) => ipcRenderer.send('set-ignore-mouse', ignore),
  toggleCollapse: () => ipcRenderer.send('toggle-collapse'),
  toggleHorizontal: () => ipcRenderer.send('toggle-horizontal'),
  setOpacity: (opacity: number) => ipcRenderer.send('set-opacity', opacity),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),

  openPractice: (combo: Combo) => ipcRenderer.send('open-practice', combo),
  closePractice: () => ipcRenderer.send('close-practice'),

  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enable: boolean) => ipcRenderer.invoke('set-auto-launch', enable),

  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  toggleFavorite: (id: string) => ipcRenderer.invoke('toggle-favorite', id),
  isFavorite: (id: string) => ipcRenderer.invoke('is-favorite', id),

  onHotkeyToggle: (cb: () => void) => {
    ipcRenderer.on('hotkey-toggle', cb)
    return () => ipcRenderer.removeListener('hotkey-toggle', cb)
  },
  onHorizontalChanged: (cb: (isHorizontal: boolean) => void) => {
    const handler = (_: unknown, val: boolean) => cb(val)
    ipcRenderer.on('horizontal-changed', handler)
    return () => ipcRenderer.removeListener('horizontal-changed', handler)
  },
  onPracticeCombo: (cb: (combo: Combo) => void) => {
    const handler = (_: unknown, combo: Combo) => cb(combo)
    ipcRenderer.on('practice-combo', handler)
    return () => ipcRenderer.removeListener('practice-combo', handler)
  },
})
