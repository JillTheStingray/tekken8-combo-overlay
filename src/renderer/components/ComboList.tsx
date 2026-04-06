import { useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useOverlayStore } from '../store/overlayStore'
import { isSeparator } from '../types/combo'
import ComboCard from './ComboCard'

function SkeletonCard() {
  return (
    <div className="mx-4 mb-2 bg-white/4 border border-white/6 rounded-lg p-3 space-y-2">
      <div className="shimmer h-3 w-full rounded" />
      <div className="shimmer h-3 w-3/4 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="shimmer h-4 w-16 rounded" />
        <div className="shimmer h-4 w-12 rounded" />
        <div className="shimmer h-4 w-10 rounded" />
      </div>
    </div>
  )
}

export default function ComboList() {
  const { loading, error, filteredCombos, selectedCharacter, refreshCombos } = useOverlayStore()
  const parentRef = useRef<HTMLDivElement>(null)
  const items = filteredCombos()

  const estimateSize = useCallback(
    (index: number) => (isSeparator(items[index]) ? 28 : 130),
    [items]
  )

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  })

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm text-white/60 font-hud">Failed to load combos</p>
        <p className="text-xs text-white/30 font-mono break-all">{error}</p>
        <button
          onClick={refreshCombos}
          className="mt-2 text-xs font-hud px-4 py-1.5 bg-overlay-accent/20 hover:bg-overlay-accent/40 border border-overlay-accent/30 text-overlay-accent rounded-lg transition-colors no-drag"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!selectedCharacter) return null

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-2xl">🥋</span>
        <p className="text-sm text-white/50 font-hud">No combos found</p>
        <p className="text-xs text-white/25">Try removing some filters</p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="flex-1 combo-scroll">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
        className="pt-1"
      >
        {virtualizer.getVirtualItems().map((vItem) => {
          const listItem = items[vItem.index]
          return (
            <div
              key={vItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vItem.start}px)`,
              }}
            >
              {isSeparator(listItem) ? (
                /* Favorites / All Combos divider */
                <div className="mx-4 my-1 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/8" />
                  <span className="text-[9px] font-hud text-white/25 uppercase tracking-widest">
                    All Combos
                  </span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>
              ) : (
                <ComboCard
                  combo={listItem}
                  index={vItem.index}
                  style={{ marginBottom: 0 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
