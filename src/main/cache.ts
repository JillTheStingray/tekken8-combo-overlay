import Store from 'electron-store'
import type { Combo } from '../renderer/types/combo'

interface CacheEntry {
  data: Combo[]
  rawHtml?: string
  fetchedAt: number
  schemaVersion: number
}

interface CacheSchema {
  combos: Record<string, CacheEntry>
}

const SCHEMA_VERSION = 1
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const store = new Store<CacheSchema>({
  name: 'combo-cache',
  defaults: { combos: {} },
})

export function getCachedCombos(slug: string): Combo[] | null {
  const entry = store.get(`combos.${slug}`) as CacheEntry | undefined
  if (!entry) return null
  if (entry.schemaVersion !== SCHEMA_VERSION) return null
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null
  return entry.data
}

export function setCachedCombos(slug: string, data: Combo[], rawHtml?: string): void {
  const entry: CacheEntry = {
    data,
    rawHtml,
    fetchedAt: Date.now(),
    schemaVersion: SCHEMA_VERSION,
  }
  store.set(`combos.${slug}`, entry)
}

export function clearCache(slug?: string): void {
  if (slug) {
    const combos = store.get('combos') as Record<string, CacheEntry>
    delete combos[slug]
    store.set('combos', combos)
  } else {
    store.clear()
  }
}

export function getCacheInfo(slug: string): { fetchedAt: number; fromCache: boolean } | null {
  const entry = store.get(`combos.${slug}`) as CacheEntry | undefined
  if (!entry) return null
  return { fetchedAt: entry.fetchedAt, fromCache: true }
}
