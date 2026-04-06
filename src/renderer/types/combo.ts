export interface Combo {
  id: string
  notation: string
  notationImages: string[]   // ordered img src URLs from the site
  damage: number
  hits: number
  version: string
  creator: string
  notes: string
  tags: string[]
  character: string
}

export type SortKey = 'damage' | 'hits' | 'default'

export interface FilterState {
  activeTags: string[]
  sort: SortKey
  searchQuery: string
  showOnlyFavorites: boolean
}

// Sentinel item injected between pinned favorites and the rest
export const FAVORITES_SEPARATOR = { id: '__favorites_sep__' } as const
export type FavoritesSeparator = typeof FAVORITES_SEPARATOR
export type ComboListItem = Combo | FavoritesSeparator
export function isSeparator(item: ComboListItem): item is FavoritesSeparator {
  return item.id === '__favorites_sep__'
}

export interface FetchResult {
  combos: Combo[]
  fromCache: boolean
  fetchedAt?: number
}

export const ALL_TAGS = ['Heat', 'Wall', 'Rage', 'CH', 'Crouch', 'Standing', 'No Wall']

export const CHARACTER_SLUGS: Record<string, string> = {
  'Alisa': 'alisa',
  'Anna': 'anna',
  'Armor King': 'armor-king',
  'Asuka': 'asuka',
  'Azucena': 'azucena',
  'Bryan': 'bryan',
  'Claudio': 'claudio',
  'Clive': 'clive',
  'Devil Jin': 'devil-jin',
  'Dragunov': 'dragunov',
  'Eddy': 'eddy',
  'Fahkumram': 'fahkumram',
  'Feng': 'feng',
  'Heihachi': 'heihachi',
  'Hwoarang': 'hwoarang',
  'Jack-8': 'jack8',
  'Jin': 'jin',
  'Jun': 'jun',
  'Kazuya': 'kazuya',
  'King': 'king',
  'Kuma': 'kuma',
  'Lars': 'lars',
  'Law': 'law',
  'Lee': 'lee',
  'Leo': 'leo',
  'Leroy': 'leroy',
  'Lidia': 'lidia',
  'Lili': 'lili',
  'Miary-Zo': 'miary-zo',
  'Nina': 'nina',
  'Panda': 'panda',
  'Paul': 'paul',
  'Raven': 'raven',
  'Reina': 'reina',
  'Shaheen': 'shaheen',
  'Steve': 'steve',
  'Victor': 'victor',
  'Xiaoyu': 'xiaoyu',
  'Yoshimitsu': 'yoshimitsu',
  'Zafina': 'zafina',
}

export const CHARACTER_NAMES = Object.keys(CHARACTER_SLUGS)
