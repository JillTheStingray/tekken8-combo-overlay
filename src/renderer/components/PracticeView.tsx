import { useEffect, useState } from 'react'
import type { Combo } from '../types/combo'
import { parseNotation, type NotationToken, type BadgeColor } from '../utils/notationParser'

const TAG_COLORS: Record<string, string> = {
  Heat: 'bg-red-900/70 text-red-300 border-red-600/50',
  Wall: 'bg-blue-900/70 text-blue-300 border-blue-600/50',
  Rage: 'bg-purple-900/70 text-purple-300 border-purple-600/50',
  CH: 'bg-amber-900/70 text-amber-300 border-amber-600/50',
}

const BADGE_STYLES: Record<BadgeColor, string> = {
  wall:    'bg-green-500/90 text-black font-bold',
  heat:    'bg-red-600/90 text-white font-semibold',
  move:    'bg-teal-600/90 text-white font-semibold',
  counter: 'bg-amber-500/90 text-black font-bold',
  char:    'bg-orange-500/90 text-black font-semibold',
  rage:    'bg-purple-600/90 text-white font-semibold',
}

function PracticeToken({ token }: { token: NotationToken }) {
  if (token.type === 'separator') {
    return (
      <img
        src="https://tekken8combo.kagewebsite.com/tpl/img/input/follow.svg"
        alt="►"
        className="h-7 w-auto mx-2 opacity-40"
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
        className="h-9 w-auto select-none drop-shadow-md"
        onError={(e) => {
          const span = document.createElement('span')
          span.textContent = token.alt
          span.className = 'text-sm text-white/70 font-mono'
          e.currentTarget.parentElement?.replaceChild(span, e.currentTarget)
        }}
      />
    )
  }
  if (token.type === 'badge') {
    return (
      <span className={`text-[11px] font-hud px-1.5 py-0.5 rounded ${BADGE_STYLES[token.color]}`}>
        {token.value}
      </span>
    )
  }
  return <span className="font-hud text-white/60 text-[11px]">{token.value}</span>
}

export default function PracticeView() {
  const [combo, setCombo] = useState<Combo | null>(null)

  useEffect(() => {
    const unlisten = window.electronAPI.onPracticeCombo((c) => setCombo(c))
    return () => { if (typeof unlisten === 'function') unlisten() }
  }, [])

  const tokens = combo ? parseNotation(combo.notation) : []

  return (
    <div className="h-full flex flex-col select-none animate-slide-down">
      {/* Header bar */}
      <div className="drag-region flex items-center gap-3 px-4 py-2 border-b border-white/8 bg-black/30">
        {combo && (
          <>
            <span className="text-xs font-hud font-bold text-overlay-accent uppercase tracking-widest no-drag">
              {combo.character}
            </span>
            <span className="text-white/20 text-xs">|</span>
            <span className="text-[10px] font-hud text-white/40">Practice Mode</span>

            {/* Stats */}
            <div className="flex items-center gap-2 ml-2 flex-wrap">
              {combo.damage > 0 && (
                <span className="text-[10px] font-hud">
                  <span className="text-overlay-accent font-bold">DMG </span>
                  <span className="text-white/80">{combo.damage}</span>
                </span>
              )}
              {combo.hits > 0 && (
                <span className="text-[10px] font-hud">
                  <span className="text-white/40">HITS </span>
                  <span className="text-white/70">{combo.hits}</span>
                </span>
              )}
              {/* Gameplay tags */}
              {combo.tags.filter(t => !/^stage:/i.test(t)).slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className={`text-[9px] font-hud font-semibold px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] ?? 'bg-white/10 text-white/50 border-white/15'}`}
                >
                  {tag}
                </span>
              ))}
              {/* Stage requirement */}
              {combo.tags.filter(t => /^stage:/i.test(t)).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-hud px-1.5 py-0.5 rounded border bg-slate-800/70 text-slate-300/80 border-slate-600/40"
                >
                  📍 {tag.replace(/^stage:\s*/i, '')}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Close */}
        <button
          onClick={() => window.electronAPI.closePractice()}
          className="ml-auto no-drag w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/60 text-white/40 hover:text-white transition-colors text-xs"
          title="Close (Escape)"
        >
          ✕
        </button>
      </div>

      {/* Notation display — large icons, horizontally scrollable */}
      <div className="flex-1 flex items-center px-6 overflow-x-auto no-drag"
        style={{ scrollbarWidth: 'none' }}
      >
        {combo ? (
          <div className="flex items-center gap-0.5 flex-nowrap">
            {tokens.map((token, i) => (
              <PracticeToken key={i} token={token} />
            ))}
          </div>
        ) : (
          <p className="text-white/20 font-hud text-sm">Click a combo to start practicing...</p>
        )}
      </div>

      {/* Notes */}
      {combo?.notes && (
        <div className="px-4 pb-2">
          <p className="text-[9px] text-white/35 italic font-hud">{combo.notes}</p>
        </div>
      )}
    </div>
  )
}
