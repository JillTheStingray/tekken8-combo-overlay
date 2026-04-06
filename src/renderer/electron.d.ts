import type { Combo, FetchResult } from './types/combo'

declare global {
  interface Window {
    electronAPI: {
      fetchCombos: (character: string) => Promise<FetchResult>
      getCharacterList: () => Promise<string[]>
      clearCache: (character?: string) => Promise<boolean>

      setIgnoreMouse: (ignore: boolean) => void
      toggleCollapse: () => void
      toggleHorizontal: () => void
      setOpacity: (opacity: number) => void
      closeWindow: () => void
      minimizeWindow: () => void

      openPractice: (combo: Combo) => void
      closePractice: () => void

      getAutoLaunch: () => Promise<boolean>
      setAutoLaunch: (enable: boolean) => Promise<boolean>

      getFavorites: () => Promise<string[]>
      toggleFavorite: (id: string) => Promise<boolean>
      isFavorite: (id: string) => Promise<boolean>

      onHotkeyToggle: (cb: () => void) => () => void
      onHorizontalChanged: (cb: (isHorizontal: boolean) => void) => () => void
      onPracticeCombo: (cb: (combo: Combo) => void) => () => void
    }
  }
}

export {}
