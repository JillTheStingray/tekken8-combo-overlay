import { useState } from 'react'
import type { Combo } from '../types/combo'
import { parseNotation, type NotationToken, type BadgeColor } from '../utils/notationParser'
import { useOverlayStore } from '../store/overlayStore'

interface Props {
  combo: Combo
  index?: number
  style?: React.CSSProperties
}

const BADGE_STYLES: Record<BadgeColor, string> = {
  wall:    'bg-green-500/90 text-black font-bold',
  heat:    'bg-red-600/90 text-white font-semibold',
  move:    'bg-teal-600/90 text-white font-semibold',
  counter: 'bg-amber-500/90 text-black font-bold',
  char:    'bg-orange-500/90 text-black font-semibold',
  rage:    'bg-purple-600/90 text-white font-semibold',
}

const TAG_STYLES: Record<string, string> = {
  Heat: 'bg-red-900/60 text-red-300 border-red-700/50',
  Wall: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
  Rage: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  CH: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  Crouch: 'bg-green-900/60 text-green-300 border-green-700/50',
  Standing: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
  'No Wall': 'bg-zinc-800/60 text-zinc-400 border-zinc-600/50',
  'Floor Break': 'bg-orange-900/60 text-orange-300 border-orange-700/50',
}

function TagBadge({ tag }: { tag: string }) {
  // Stage tags get a distinct location style
  if (/^stage:/i.test(tag)) {
    return (
      <span className="text-[9px] font-hud px-1.5 py-0.5 rounded border bg-slate-800/70 text-slate-300/80 border-slate-600/40 flex-shrink-0">
        📍 {tag.replace(/^stage:\s*/i, '')}
      </span>
    )
  }
  const style = TAG_STYLES[tag] ?? 'bg-white/10 text-white/60 border-white/15'
  return (
    <span className={`text-[9px] font-hud font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${style}`}>
      {tag}
    </span>
  )
}

function RenderToken({ token }: { token: NotationToken }) {
  if (token.type === 'separator') {
    return (
      <img
        src="https://tekken8combo.kagewebsite.com/tpl/img/input/follow.svg"
        alt="►"
        className="h-4 w-auto mx-1 opacity-40"
        draggable={false}
      />
    )
  }

  if (token.type === 'image') {
    return (
      <img
        src={token.src}
        alt={token.alt}
        title={token.alt}
        draggable={false}
        className="h-5 w-auto select-none"
        style={{ imageRendering: 'crisp-edges' }}
        onError={(e) => {
          const parent = e.currentTarget.parentElement
          if (parent) {
            const span = document.createElement('span')
            span.textContent = token.alt
            span.className = 'text-[10px] text-white/70 font-mono'
            parent.replaceChild(span, e.currentTarget)
          }
        }}
      />
    )
  }

  if (token.type === 'badge') {
    return (
      <span className={`text-[9px] font-hud px-1.5 py-0.5 rounded ${BADGE_STYLES[token.color]}`}>
        {token.value}
      </span>
    )
  }

  // Fallback plain text
  return (
    <span className="text-[10px] font-hud text-white/55">
      {token.value}
    </span>
  )
}

function NotationDisplay({ notation }: { notation: string }) {
  const tokens = parseNotation(notation)
  if (!tokens.length) {
    return <p className="font-mono text-xs text-white/60 italic">No notation</p>
  }

  return (
    <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1">
      {tokens.map((token, i) => (
        <RenderToken key={i} token={token} />
      ))}
    </div>
  )
}

export default function ComboCard({ combo, index = 0, style }: Props) {
  const [copied, setCopied] = useState(false)
  const [justStarred, setJustStarred] = useState(false)

  const { isFavorite, toggleFavorite } = useOverlayStore()
  const isFav = isFavorite(combo.id)

  const openPractice = () => {
    window.electronAPI.openPractice(combo)
  }

  const copyNotation = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(combo.notation).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
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
      style={{
        ...style,
        animationDelay: `${Math.min(index, 15) * 20}ms`,
      }}
      className="mx-4 mb-2 bg-white/4 border border-white/6 rounded-lg overflow-hidden hover:border-overlay-accent/40 hover:bg-white/6 transition-all group cursor-pointer animate-combo-enter"
      onClick={openPractice}
      title="Click to practice this combo"
    >
      {/* Notation row */}
      <div className="px-4 pt-3 pb-2.5 relative">
        <NotationDisplay notation={combo.notation} />

        {/* Hover action buttons */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyNotation}
            className="text-[9px] font-hud text-white/40 hover:text-overlay-accent transition-colors px-1.5 py-0.5 rounded bg-black/30 hover:bg-overlay-accent/10 border border-white/10"
            title="Copy notation"
          >
            {copied ? 'Copied!' : '📋'}
          </button>
          <span className="text-[9px] font-hud text-overlay-accent/50">▶ Practice</span>
        </div>
      </div>

      {/* Stats row — single compact line */}
      <div className="px-4 py-1.5 border-t border-white/4 flex items-center gap-2.5 min-w-0">
        {/* Favorite star */}
        <button
          onClick={handleToggleFavorite}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`flex-shrink-0 text-[14px] leading-none transition-colors no-drag ${
            isFav ? 'text-amber-400' : 'text-white/20 hover:text-white/50'
          } ${justStarred ? 'animate-star-pop' : ''}`}
        >
          {isFav ? '★' : '☆'}
        </button>

        {combo.damage > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-hud font-semibold">
            <span className="text-overlay-accent">DMG</span>
            <span className="text-white/90">{combo.damage}</span>
          </span>
        )}
        {combo.hits > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-hud">
            <span className="text-white/35">HITS</span>
            <span className="text-white/70">{combo.hits}</span>
          </span>
        )}

        {/* Tags — scrollable if overflow */}
        <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {combo.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        {/* Version + creator pushed to right */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {combo.version && (
            <span className="text-[9px] font-mono text-white/25">
              {combo.version}
            </span>
          )}
          {combo.creator && (
            <span className="text-[9px] text-white/25 font-hud">by {combo.creator}</span>
          )}
        </div>
      </div>

      {/* Notes — only if present */}
      {combo.notes && (
        <div className="px-4 pb-2">
          <p className="text-[9px] text-white/35 italic leading-tight line-clamp-1">
            {combo.notes}
          </p>
        </div>
      )}
    </div>
  )
}
