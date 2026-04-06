import { useState } from 'react'
import { useOverlayStore } from '../store/overlayStore'
import { parseNotation, type NotationToken } from '../utils/notationParser'
import { isSeparator } from '../types/combo'
import type { Combo } from '../types/combo'

const TAG_STYLES: Record<string, string> = {
  Heat: 'bg-red-900/60 text-red-300',
  Wall: 'bg-blue-900/60 text-blue-300',
  Rage: 'bg-purple-900/60 text-purple-300',
  CH: 'bg-amber-900/60 text-amber-300',
}

function MiniToken({ token }: { token: NotationToken }) {
  if (token.type === 'separator') {
    return <img src="https://tekken8combo.kagewebsite.com/tpl/img/input/follow.svg" alt="►" className="h-3.5 w-auto mx-0.5 opacity-35" draggable={false} />
  }
  if (token.type === 'image') {
    return <img src={token.src} alt={token.alt} draggable={false} className="h-4 w-auto select-none" />
  }
  const isSpecial = ['W!', 'WB!', 'During Heat', 'Heat Smash', 'Heat Burst'].includes(token.value)
  return (
    <span className={`text-[9px] font-hud ${isSpecial ? 'text-red-400' : 'text-white/50'}`}>
      {token.value}
    </span>
  )
}

function HorizontalComboCard({ combo }: { combo: Combo }) {
  const [justStarred, setJustStarred] = useState(false)
  const { isFavorite, toggleFavorite } = useOverlayStore()
  const isFav = isFavorite(combo.id)
  const tokens = parseNotation(combo.notation)

  const openPractice = () => {
    window.electronAPI.openPractice(combo)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    const wasFav = isFav
    toggleFavorite(combo.id)
    if (!wasFav) {
      setJustStarred(true)
      setTimeout(() => setJustStarred(false), 300)
    }
  }

  return (
    <div
      onClick={openPractice}
      className="flex-shrink-0 w-72 h-full border border-white/8 bg-white/4 rounded-lg hover:border-overlay-accent/50 hover:bg-overlay-accent/8 transition-all cursor-pointer group overflow-hidden flex flex-col"
      title="Click to practice this combo"
    >
      {/* Notation */}
      <div className="flex-1 px-3 pt-2.5 flex flex-wrap items-center gap-0.5 content-start overflow-hidden">
        {tokens.slice(0, 30).map((token, i) => (
          <MiniToken key={i} token={token} />
        ))}
      </div>

      {/* Stats */}
      <div className="px-3 pb-2 flex items-center gap-2 border-t border-white/4 mt-1 pt-1">
        {/* Favorite star */}
        <button
          onClick={handleToggleFavorite}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`text-[13px] leading-none transition-colors no-drag ${
            isFav ? 'text-amber-400' : 'text-white/20 hover:text-white/50'
          } ${justStarred ? 'animate-star-pop' : ''}`}
        >
          {isFav ? '★' : '☆'}
        </button>

        {combo.damage > 0 && (
          <span className="text-[10px] font-hud">
            <span className="text-overlay-accent">DMG </span>
            <span className="text-white/80">{combo.damage}</span>
          </span>
        )}
        {combo.hits > 0 && (
          <span className="text-[10px] font-hud text-white/40">
            {combo.hits} hits
          </span>
        )}
        {combo.tags.slice(0, 2).map((tag) => (
          <span key={tag} className={`text-[8px] font-hud font-semibold px-1 py-0.5 rounded ${TAG_STYLES[tag] ?? 'bg-white/10 text-white/40'}`}>
            {tag}
          </span>
        ))}
        {/* Practice hint */}
        <span className="ml-auto text-[8px] text-white/20 group-hover:text-overlay-accent/60 transition-colors font-hud">
          ▶ Practice
        </span>
      </div>
    </div>
  )
}

export default function ComboListHorizontal() {
  const { filteredCombos, loading, error } = useOverlayStore()
  // Filter out the separator sentinel — horizontal mode has no pinned section concept
  const combos = filteredCombos().filter((item) => !isSeparator(item)) as Combo[]

  if (loading) {
    return (
      <div className="flex-1 flex items-center gap-2 px-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 h-[85%] rounded-lg shimmer" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-white/40 font-hud">Failed to load — {error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-stretch gap-2 px-4 py-2 overflow-x-auto no-drag" style={{ scrollbarWidth: 'thin' }}>
      {combos.map((combo) => (
        <HorizontalComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  )
}
