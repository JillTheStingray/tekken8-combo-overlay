import { useState } from 'react'
import { useOverlayStore } from '../store/overlayStore'
import type { SortKey } from '../types/combo'
import { ALL_TAGS, isSeparator } from '../types/combo'

const TAG_COLORS: Record<string, string> = {
  Heat: 'bg-red-800/50 border-red-600/50 text-red-300 data-[active]:bg-red-600/60 data-[active]:text-white',
  Wall: 'bg-blue-900/50 border-blue-600/50 text-blue-300 data-[active]:bg-blue-600/60 data-[active]:text-white',
  Rage: 'bg-purple-900/50 border-purple-600/50 text-purple-300 data-[active]:bg-purple-600/60 data-[active]:text-white',
  CH: 'bg-amber-900/50 border-amber-600/50 text-amber-300 data-[active]:bg-amber-600/60 data-[active]:text-white',
  Crouch: 'bg-green-900/50 border-green-600/50 text-green-300 data-[active]:bg-green-600/60 data-[active]:text-white',
  Standing: 'bg-cyan-900/50 border-cyan-600/50 text-cyan-300 data-[active]:bg-cyan-600/60 data-[active]:text-white',
  'No Wall': 'bg-zinc-800/50 border-zinc-600/50 text-zinc-300 data-[active]:bg-zinc-600/60 data-[active]:text-white',
}

export default function FilterBar({ compact }: { compact?: boolean }) {
  const {
    filters, toggleTag, setFilter, clearFilters,
    filteredCombos, combos, fromCache, loading,
    favoriteIds, isFavorite: _isFav,
  } = useOverlayStore()

  const [lastPulsedTag, setLastPulsedTag] = useState<string | null>(null)

  const displayed = filteredCombos().filter((item) => !isSeparator(item))
  const hasFavorites = favoriteIds.size > 0
  const showOnlyFavorites = filters.showOnlyFavorites ?? false

  const handleTagClick = (tag: string) => {
    toggleTag(tag)
    setLastPulsedTag(tag)
    setTimeout(() => setLastPulsedTag(null), 200)
  }

  const handleClear = () => {
    clearFilters()
  }

  return (
    <div className={`${compact ? 'px-4 py-1' : 'px-4 py-2'} border-b border-white/5 space-y-1.5`}>
      {/* Tag filter row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-drag" style={{ scrollbarWidth: 'none' }}>
        {/* Favorites toggle */}
        <button
          onClick={() => setFilter({ showOnlyFavorites: !showOnlyFavorites })}
          disabled={!hasFavorites}
          className={`flex-shrink-0 text-[10px] font-hud font-semibold px-2 py-0.5 rounded border transition-all ${
            showOnlyFavorites
              ? 'bg-amber-600/60 border-amber-500/60 text-white'
              : 'bg-amber-900/30 border-amber-700/40 text-amber-400/80 hover:text-amber-300 hover:border-amber-600/60'
          } ${!hasFavorites ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Show only favorites"
        >
          ★ Favs{hasFavorites ? ` (${favoriteIds.size})` : ''}
        </button>

        {/* Divider */}
        <div className="w-px h-3 bg-white/10 flex-shrink-0" />

        {ALL_TAGS.map((tag) => {
          const isActive = filters.activeTags.includes(tag)
          const colorClass = TAG_COLORS[tag] ?? TAG_COLORS.Wall
          const isPulsing = lastPulsedTag === tag
          return (
            <button
              key={tag}
              data-active={isActive || undefined}
              onClick={() => handleTagClick(tag)}
              className={`flex-shrink-0 text-[10px] font-hud font-semibold px-2 py-0.5 rounded border transition-all ${colorClass} ${isPulsing ? 'animate-tag-pulse' : ''}`}
            >
              {tag}
            </button>
          )
        })}
        {(filters.activeTags.length > 0 || showOnlyFavorites) && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 text-[10px] font-hud text-white/40 hover:text-white/70 px-1.5 py-0.5 rounded border border-white/10 hover:border-white/30 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Sort + stats row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/35 font-hud">
          {loading ? (
            <span className="shimmer inline-block w-20 h-2.5 rounded" />
          ) : (
            <>
              {displayed.length} of {combos.length} combos
              {fromCache && (
                <span className="ml-1.5 text-overlay-accent/60">● cached</span>
              )}
            </>
          )}
        </span>

        <select
          value={filters.sort}
          onChange={(e) => setFilter({ sort: e.target.value as SortKey })}
          className="text-[10px] font-hud bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/70 outline-none cursor-pointer hover:border-white/25 transition-colors no-drag"
        >
          <option value="default">Default order</option>
          <option value="damage">Highest damage</option>
          <option value="hits">Most hits</option>
        </select>
      </div>
    </div>
  )
}
