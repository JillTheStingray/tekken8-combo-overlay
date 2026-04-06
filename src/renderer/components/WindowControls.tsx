import { useOverlayStore } from '../store/overlayStore'

interface Props {
  compact?: boolean
}

export default function WindowControls({ compact }: Props) {
  const { collapsed, toggleCollapse, opacity, setOpacity, selectedCharacter, clearCharacter, isHorizontal } =
    useOverlayStore()

  const handleHorizontalToggle = () => {
    window.electronAPI.toggleHorizontal()
  }

  if (compact) {
    // Minimal controls for horizontal mode header bar
    return (
      <div className="flex items-center gap-1.5 no-drag flex-shrink-0">
        <button
          onClick={handleHorizontalToggle}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-overlay-accent/20 text-overlay-accent/70 hover:text-overlay-accent transition-colors text-xs"
          title="Back to panel mode"
        >
          ⊟
        </button>
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors text-xs"
        >
          –
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/70 text-white/40 hover:text-white transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="drag-region flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-black/20">
      {/* Left */}
      <div className="no-drag flex items-center gap-2">
        {selectedCharacter ? (
          <button
            onClick={clearCharacter}
            className="text-xs text-overlay-muted hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-white/10"
            title="Back to character select"
          >
            ← Back
          </button>
        ) : (
          <span className="text-[11px] font-hud font-semibold text-overlay-accent tracking-widest uppercase">
            T8 Combos
          </span>
        )}
      </div>

      {/* Center: hotkey hint */}
      <span className="text-[9px] text-white/20 font-mono">Ctrl+Shift+T toggle</span>

      {/* Right: opacity + layout toggle + collapse + window controls */}
      <div className="no-drag flex items-center gap-1.5">
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-14 h-1 accent-overlay-accent cursor-pointer"
          title={`Opacity: ${Math.round(opacity * 100)}%`}
        />

        {/* Horizontal stretch toggle */}
        <button
          onClick={handleHorizontalToggle}
          className={`w-6 h-5 flex items-center justify-center rounded border transition-colors text-[10px] font-bold ${
            isHorizontal
              ? 'border-overlay-accent/60 bg-overlay-accent/20 text-overlay-accent'
              : 'border-white/15 hover:border-overlay-accent/40 text-white/40 hover:text-overlay-accent'
          }`}
          title={isHorizontal ? 'Switch to panel mode' : 'Switch to horizontal mode'}
        >
          ⟺
        </button>

        <button
          onClick={toggleCollapse}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs"
          title={collapsed ? 'Expand (Ctrl+Shift+C)' : 'Collapse (Ctrl+Shift+C)'}
        >
          {collapsed ? '▼' : '▲'}
        </button>
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs"
        >
          –
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/70 text-white/50 hover:text-white transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
