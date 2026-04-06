import { create } from 'zustand'
import type { Combo, FilterState, ComboListItem } from '../types/combo'
import { FAVORITES_SEPARATOR, isSeparator } from '../types/combo'

interface OverlayStore {
  // Character
  selectedCharacter: string | null
  setCharacter: (name: string) => void
  clearCharacter: () => void

  // Combos
  combos: Combo[]
  loading: boolean
  error: string | null
  fromCache: boolean
  fetchedAt: number | null
  loadCombos: (character: string) => Promise<void>
  refreshCombos: () => Promise<void>

  // Filters
  filters: FilterState
  setFilter: (patch: Partial<FilterState>) => void
  toggleTag: (tag: string) => void
  clearFilters: () => void

  // Derived
  filteredCombos: () => ComboListItem[]

  // Favorites
  favoriteIds: Set<string>
  loadFavorites: () => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  isFavorite: (id: string) => boolean

  // Overlay UI
  collapsed: boolean
  toggleCollapse: () => void
  isHorizontal: boolean
  setHorizontal: (v: boolean) => void
  opacity: number
  setOpacity: (v: number) => void
}

const defaultFilters: FilterState = {
  activeTags: [],
  sort: 'default',
  searchQuery: '',
  showOnlyFavorites: false,
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  selectedCharacter: null,
  setCharacter: (name) => {
    set({ selectedCharacter: name, combos: [], error: null, filters: defaultFilters })
    get().loadCombos(name)
  },
  clearCharacter: () => set({ selectedCharacter: null, combos: [], error: null }),

  combos: [],
  loading: false,
  error: null,
  fromCache: false,
  fetchedAt: null,

  loadCombos: async (character) => {
    set({ loading: true, error: null })
    try {
      const result = await window.electronAPI.fetchCombos(character)
      set({
        combos: result.combos,
        fromCache: result.fromCache,
        fetchedAt: result.fetchedAt ?? Date.now(),
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  refreshCombos: async () => {
    const char = get().selectedCharacter
    if (!char) return
    await window.electronAPI.clearCache(char)
    await get().loadCombos(char)
  },

  filters: defaultFilters,
  setFilter: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  toggleTag: (tag) =>
    set((s) => {
      const active = s.filters.activeTags
      const next = active.includes(tag) ? active.filter((t) => t !== tag) : [...active, tag]
      return { filters: { ...s.filters, activeTags: next } }
    }),
  clearFilters: () => set({ filters: defaultFilters }),

  filteredCombos: () => {
    const { combos, filters, favoriteIds } = get()
    let result = [...combos]

    // Filter by active tags (AND logic)
    if (filters.activeTags.length > 0) {
      result = result.filter((c) => filters.activeTags.every((t) => c.tags.includes(t)))
    }

    // Filter by search query (notation + notes)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter(
        (c) => c.notation.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q)
      )
    }

    // Sort
    if (filters.sort === 'damage') {
      result.sort((a, b) => b.damage - a.damage)
    } else if (filters.sort === 'hits') {
      result.sort((a, b) => b.hits - a.hits)
    }

    // Show only favorites filter
    if (filters.showOnlyFavorites) {
      return result.filter((c) => favoriteIds.has(c.id))
    }

    // Pin favorites to top with a separator
    const favs = result.filter((c) => favoriteIds.has(c.id))
    const rest = result.filter((c) => !favoriteIds.has(c.id))
    if (favs.length > 0) {
      return [...favs, FAVORITES_SEPARATOR, ...rest] as ComboListItem[]
    }
    return result
  },

  // Favorites
  favoriteIds: new Set<string>(),

  loadFavorites: async () => {
    const ids = await window.electronAPI.getFavorites()
    set({ favoriteIds: new Set(ids) })
  },

  toggleFavorite: async (id: string) => {
    // Optimistic update first
    set((s) => {
      const next = new Set(s.favoriteIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { favoriteIds: next }
    })
    // Reconcile with main process
    const isNowFav = await window.electronAPI.toggleFavorite(id)
    set((s) => {
      const next = new Set(s.favoriteIds)
      if (isNowFav) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return { favoriteIds: next }
    })
  },

  isFavorite: (id: string) => get().favoriteIds.has(id),

  collapsed: false,
  toggleCollapse: () => {
    set((s) => ({ collapsed: !s.collapsed }))
    window.electronAPI.toggleCollapse()
  },

  isHorizontal: false,
  setHorizontal: (v) => set({ isHorizontal: v }),

  opacity: 1,
  setOpacity: (v) => {
    set({ opacity: v })
    window.electronAPI.setOpacity(v)
  },
}))
