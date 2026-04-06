import { useEffect, useState } from 'react'
import { useOverlayStore } from './store/overlayStore'
import WindowControls from './components/WindowControls'
import SearchBar from './components/SearchBar'
import CharacterSelector from './components/CharacterSelector'
import FilterBar from './components/FilterBar'
import ComboList from './components/ComboList'
import ComboListHorizontal from './components/ComboListHorizontal'
import PracticeView from './components/PracticeView'

// Detect if this window was opened in practice mode
const isPracticeMode = new URLSearchParams(window.location.search).get('mode') === 'practice'

export default function App() {
  const { selectedCharacter, collapsed, toggleCollapse, isHorizontal, setHorizontal, loadFavorites } =
    useOverlayStore()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Practice mode: render the practice view only
  if (isPracticeMode) {
    return <PracticeView />
  }

  // Listen for hotkey toggle
  useEffect(() => {
    const unlisten = window.electronAPI.onHotkeyToggle(() => toggleCollapse())
    return () => { if (typeof unlisten === 'function') unlisten() }
  }, [toggleCollapse])

  // Load persisted favorites on mount
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Sync horizontal state from main process — fade transition on switch
  useEffect(() => {
    const unlisten = window.electronAPI.onHorizontalChanged((val) => {
      setIsTransitioning(true)
      setTimeout(() => {
        setHorizontal(val)
        setIsTransitioning(false)
      }, 100)
    })
    return () => { if (typeof unlisten === 'function') unlisten() }
  }, [setHorizontal])

  // Click-through: pass through when blurred, re-enable on mouse enter
  useEffect(() => {
    const handleBlur = () => window.electronAPI.setIgnoreMouse(true)
    const handleMouseEnter = () => window.electronAPI.setIgnoreMouse(false)
    window.addEventListener('blur', handleBlur)
    document.getElementById('root')?.addEventListener('mouseenter', handleMouseEnter)
    return () => {
      window.removeEventListener('blur', handleBlur)
      document.getElementById('root')?.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  if (collapsed) {
    return (
      <div className="h-full flex items-center">
        <WindowControls />
      </div>
    )
  }

  const transitionClass = isTransitioning
    ? 'opacity-0 transition-opacity duration-100'
    : 'opacity-100 transition-opacity duration-150'

  // ── Horizontal mode ──────────────────────────────────────────────────────
  if (isHorizontal) {
    return (
      <div className={`h-full flex flex-col ${transitionClass}`}>
        {/* Compact top bar: controls + character + search + filters all inline */}
        <div className="drag-region flex items-center gap-2 px-4 py-1.5 border-b border-white/5">
          <span className="text-[11px] font-hud font-bold text-overlay-accent tracking-widest uppercase no-drag">
            T8
          </span>
          {selectedCharacter && (
            <>
              <span className="text-white/20 text-xs">|</span>
              <span className="text-xs font-hud font-semibold text-white/80 no-drag">
                {selectedCharacter}
              </span>
              <button
                onClick={() => useOverlayStore.getState().clearCharacter()}
                className="text-[9px] text-white/30 hover:text-white/60 no-drag"
              >
                ✕
              </button>
            </>
          )}
          {/* Inline search */}
          <div className="flex-1 no-drag">
            <SearchBar compact />
          </div>
          <WindowControls compact />
        </div>

        {/* Filter bar — compact single row */}
        {selectedCharacter && (
          <div className="border-b border-white/5">
            <FilterBar compact />
          </div>
        )}

        {/* Body */}
        {selectedCharacter ? (
          <ComboListHorizontal />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-xs font-hud">Search or click a character to load combos</p>
          </div>
        )}
      </div>
    )
  }

  // ── Normal vertical panel mode ───────────────────────────────────────────
  return (
    <div className={`h-full flex flex-col ${transitionClass}`}>
      <WindowControls />
      <SearchBar />

      {selectedCharacter ? (
        <>
          <div className="px-4 py-2 flex items-center gap-3 border-b border-white/5">
            <span className="text-sm font-hud font-bold text-overlay-accent tracking-wide">
              {selectedCharacter}
            </span>
            <span className="text-[10px] text-white/25 font-hud">combos</span>
            <button
              onClick={() => useOverlayStore.getState().refreshCombos()}
              className="ml-auto text-[9px] font-hud text-white/30 hover:text-white/60 px-2 py-0.5 rounded border border-white/8 hover:border-white/20 transition-colors no-drag"
              title="Refresh from site"
            >
              ↻ Refresh
            </button>
          </div>
          <FilterBar />
          <ComboList />
        </>
      ) : (
        <CharacterSelector />
      )}
    </div>
  )
}
