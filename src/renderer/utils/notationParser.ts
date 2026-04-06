const IMG_BASE = 'https://tekken8combo.kagewebsite.com/tpl/img/input'

const DIRECTION_MAP: Record<string, string> = {
  // Neutral
  'n': 'n', 'N': 'n',
  // Tap directions (lowercase / slash notation)
  'f': 'f', 'b': 'b', 'u': 'u', 'd': 'd',
  'd/f': 'df', 'df': 'df',
  'd/b': 'db', 'db': 'db',
  'u/f': 'uf', 'uf': 'uf',
  'u/b': 'ub', 'ub': 'ub',
  // Hold directions (uppercase) — F context handled in parseNotation
  'F': 'fh', 'B': 'bh', 'U': 'uh', 'D': 'dh',
  'D/F': 'dfh', 'D/f': 'dfh', 'DF': 'dfh',
  'D/B': 'dbh', 'D/b': 'dbh', 'DB': 'dbh',
  'U/F': 'ufh', 'U/f': 'ufh', 'UF': 'ufh',
  'U/B': 'ubh', 'U/b': 'ubh', 'UB': 'ubh',
}

const BUTTON_MAP: Record<string, string> = {
  '1': '1', '2': '2', '3': '3', '4': '4',
  '12': '12', '13': '13', '14': '14',
  '23': '23', '24': '24', '34': '34',
  '123': '123', '124': '124', '134': '134', '234': '234',
  '1234': '1234',
}

const SPECIAL_IMG_MAP: Record<string, string> = {
  'dp': 'dp',
}

export type BadgeColor =
  | 'wall'    // W!, WB!, BB! etc  → bright green
  | 'heat'    // During Heat, Heat Smash, Heat Burst → red
  | 'move'    // Dash, FC, BT, WS, WR, SS… → teal
  | 'counter' // CH → amber
  | 'char'    // character-specific named stances/moves → orange
  | 'rage'    // Rage Art, Rage Drive → purple

export type NotationToken =
  | { type: 'image'; src: string; alt: string }
  | { type: 'badge'; value: string; color: BadgeColor }
  | { type: 'text'; value: string }
  | { type: 'separator' }

function imgToken(name: string, alt?: string): NotationToken {
  return { type: 'image', src: `${IMG_BASE}/${name}.svg`, alt: alt ?? name }
}

function badge(value: string, color: BadgeColor): NotationToken {
  return { type: 'badge', value, color }
}

// ── Badge category sets ───────────────────────────────────────────────────────

const WALL_LABELS = new Set([
  'W!', 'WB!', 'WBl!', 'WBo!', 'FB!', 'FBl!', 'BB!', 'F!',
])

const MOVE_LABELS = new Set([
  'WS', 'WR', 'SS', 'SSL', 'SSR',
  'iWS', 'iWR', 'FC', 'BT',
  'CC', 'cc', 'CD', 'cd', 'LP',
  'Dash',
])

const HEAT_LABELS = new Set(['During Heat', 'Heat Smash', 'Heat Burst'])
const RAGE_LABELS = new Set(['Rage Art', 'Rage Drive'])
const COUNTER_LABELS = new Set(['CH'])

// ── Multi-word labels that MAY be split across comma tokens ───────────────────
// Ordered longest-first so greedy match works correctly
const MULTI_WORD_LABELS: string[] = [
  // 4-word
  'Jin Ji Du Li',
  // 3-word
  'Mutou No Kiwami',
  'Stalking Wolf Stance',
  "Wind God's Kamae",
  "Thunder God's Kamae",
  'Heaven and Earth',
  'Wind God Step',
  // 2-word — heat/rage (most likely to be comma-split on site)
  'During Heat', 'Heat Smash', 'Heat Burst',
  'Rage Art', 'Rage Drive',
  // 2-word stage props
  'Floor Blast', 'Wall Blast', 'Wall Bounce', 'Balcony Break',
  // 2-word character-specific stances & moves — all 40 characters covered
  'Bad Jaguar',        // Armor King
  'Baobab Mihira',     // Miary-Zo
  'Bear Roll',         // Kuma / Panda
  'Bear Sit',          // Kuma / Panda
  'Beast Step',        // Armor King
  'Cat Stance',        // Lidia
  'Chaos Judgement',   // Anna
  'Deep Dive',         // Paul
  'Dew Glide',         // Lili
  'Dragon Charge',     // Law
  'Dual Boot',         // Alisa
  'Ducking In',        // Steve
  'Ducking Left',      // Steve
  'Dynamic Entry',     // Lars
  'Elephant Bomb',     // Kuma/Panda
  'Flicker Stance',    // Steve
  'Fo Bu',             // Leo
  'Gamma Howl',        // Jack-8
  'Garuda Cannon',     // Fahkumram
  'Garuda Force',      // Fahkumram
  'Hammer Chance',     // Anna
  'Horse Stance',      // Lidia
  'Iai Stance',        // Victor
  "Heaven's Wrath",    // Reina
  'Left Flamingo',     // Hwoarang
  'Left Stance',       // Hwoarang
  'Lion Heart',        // Steve
  'Manji Dragonfly',   // Yoshimitsu
  'Mantis Stance',     // Zafina
  'Morengy Miroso',    // Miary-Zo
  'Mourning Crow',     // Devil Jin
  'Naniwa Gusto',      // Asuka
  'Phoenix Shift',     // Clive
  'Pleasure Time',     // Anna
  'Right Flamingo',    // Hwoarang
  'Right Stance',      // Hwoarang
  'Scarecrow Stance',  // Zafina
  'Silent Entry',      // Lars
  'Slither Step',      // Bryan
  'Snake Eyes',        // Bryan
  'Stealth Step',      // Shaheen
  'Warrior Instinct',  // Heihachi
]

function parseButtonCombo(token: string): NotationToken | null {
  const digits = token
    .split('+')
    .map((s) => s.trim())
    .filter((s) => /^\d$/.test(s))
    .sort()
    .join('')
  if (BUTTON_MAP[digits]) return imgToken(BUTTON_MAP[digits], token)
  return null
}

function categoriseBadge(value: string): NotationToken {
  const v = value.trim()
  if (WALL_LABELS.has(v)) return badge(v, 'wall')
  if (MOVE_LABELS.has(v)) return badge(v, 'move')
  if (HEAT_LABELS.has(v)) return badge(v, 'heat')
  if (RAGE_LABELS.has(v)) return badge(v, 'rage')
  if (COUNTER_LABELS.has(v)) return badge(v, 'counter')
  return badge(v, 'char')
}

/** Parse a single atomic notation token (no commas, no ►). */
function parseAtom(raw: string): NotationToken[] {
  if (!raw) return []

  // ── Just-frame prefix: ":2" → jf.svg + 2.svg ────────────────────────────
  if (raw.startsWith(':')) {
    return [imgToken('jf', 'just frame'), ...parseAtom(raw.slice(1).trim())]
  }

  // ── Just-frame embedded mid-token: "d/f:2", "b:3", "u/f:4" ─────────────
  // Split on every ':' that is NOT at position 0 and insert jf.svg between parts
  if (raw.includes(':')) {
    const parts = raw.split(':')
    const result: NotationToken[] = []
    parts.forEach((part, i) => {
      if (i > 0) result.push(imgToken('jf', ':'))
      if (part.trim()) result.push(...parseAtom(part.trim()))
    })
    return result
  }

  // ── *(max) suffix ─────────────────────────────────────────────────────────
  if (/\*\s*\(max\)$/i.test(raw)) {
    const base = raw.replace(/\*\s*\(max\)/i, '').trim()
    return [...parseAtom(base), imgToken('holdmax', '*(max)')]
  }

  // ── * hold suffix ─────────────────────────────────────────────────────────
  if (raw.endsWith('*')) {
    return [...parseAtom(raw.slice(0, -1).trim()), imgToken('hold', '*')]
  }

  // ── ~ slide modifier ──────────────────────────────────────────────────────
  if (raw.includes('~')) {
    const parts = raw.split('~')
    const result: NotationToken[] = []
    parts.forEach((part, i) => {
      if (i > 0) result.push(imgToken('tilde', '~'))
      result.push(...parseAtom(part.trim()))
    })
    return result
  }

  // ── < delay modifier ──────────────────────────────────────────────────────
  if (raw.includes('<')) {
    const parts = raw.split('<')
    const result: NotationToken[] = []
    parts.forEach((part, i) => {
      if (i > 0) result.push(imgToken('delay', '<'))
      result.push(...parseAtom(part.trim()))
    })
    return result
  }

  // ── (Switch) ──────────────────────────────────────────────────────────────
  if (/^\(switch\)$/i.test(raw)) return [imgToken('switch', 'Switch')]

  // ── Lone brackets ─────────────────────────────────────────────────────────
  if (raw === '(') return [imgToken('bracket_op', '(')]
  if (raw === ')') return [imgToken('bracket_cl', ')')]

  // ── Token starts with ( but no closing ) → bracket_op + rest ─────────────
  if (raw.startsWith('(') && !raw.endsWith(')')) {
    return [imgToken('bracket_op', '('), ...parseAtom(raw.slice(1).trim())]
  }

  // ── Token ends with ) but no opening ( → rest + bracket_cl ───────────────
  if (raw.endsWith(')') && !raw.startsWith('(')) {
    return [...parseAtom(raw.slice(0, -1).trim()), imgToken('bracket_cl', ')')]
  }

  // ── Balanced outer parens → bracket_op + inner + bracket_cl ──────────────
  if (raw.startsWith('(') && raw.endsWith(')')) {
    return [
      imgToken('bracket_op', '('),
      ...parseAtom(raw.slice(1, -1).trim()),
      imgToken('bracket_cl', ')'),
    ]
  }

  // ── Direction lookup ──────────────────────────────────────────────────────
  if (DIRECTION_MAP[raw]) return [imgToken(DIRECTION_MAP[raw], raw)]
  const rawLower = raw.toLowerCase()
  if (DIRECTION_MAP[rawLower]) return [imgToken(DIRECTION_MAP[rawLower], raw)]

  // ── Special image map ─────────────────────────────────────────────────────
  if (SPECIAL_IMG_MAP[rawLower]) return [imgToken(SPECIAL_IMG_MAP[rawLower], raw)]

  // ── Single button ─────────────────────────────────────────────────────────
  if (BUTTON_MAP[raw]) return [imgToken(BUTTON_MAP[raw], raw)]

  // ── Button combo with + ───────────────────────────────────────────────────
  if (/^\d(\+\d)+$/.test(raw)) {
    const bt = parseButtonCombo(raw)
    return bt ? [bt] : [categoriseBadge(raw)]
  }

  // ── Named badge labels (exact + case-insensitive fallback) ────────────────
  if (WALL_LABELS.has(raw)) return [badge(raw, 'wall')]
  if (MOVE_LABELS.has(raw)) return [badge(raw, 'move')]
  if (HEAT_LABELS.has(raw)) return [badge(raw, 'heat')]
  if (RAGE_LABELS.has(raw)) return [badge(raw, 'rage')]
  if (COUNTER_LABELS.has(raw)) return [badge(raw, 'counter')]

  for (const s of [...WALL_LABELS, ...MOVE_LABELS, ...HEAT_LABELS, ...RAGE_LABELS, ...COUNTER_LABELS]) {
    if (s.toLowerCase() === rawLower) return [categoriseBadge(s)]
  }

  // ── Everything else → character-specific named move badge (orange) ────────
  return [categoriseBadge(raw)]
}

export function parseNotation(notation: string): NotationToken[] {
  if (!notation?.trim()) return []

  const result: NotationToken[] = []
  const parts = notation.split('►')

  parts.forEach((part, partIdx) => {
    if (partIdx > 0) result.push({ type: 'separator' })

    const trimmed = part.trim()
    if (!trimmed) return

    const rawTokens = trimmed.split(',').map((t) => t.trim()).filter(Boolean)

    // Track context for heat-dash detection:
    // fe.svg (blue heat dash) is used when F immediately follows another F
    // or when F is the final token in a sequence starting with "Dash"
    let lastWasHoldF = false   // previous token produced fh.svg
    let hasDashInPart = rawTokens.some((t) => t.toLowerCase() === 'dash')

    let i = 0
    while (i < rawTokens.length) {
      const t0 = rawTokens[i]
      const t1 = i + 1 < rawTokens.length ? rawTokens[i + 1] : ''
      const t2 = i + 2 < rawTokens.length ? rawTokens[i + 2] : ''
      const t3 = i + 3 < rawTokens.length ? rawTokens[i + 3] : ''

      // 4-word merge (e.g. "Jin Ji Du Li")
      if (t1 && t2 && t3) {
        const m4 = `${t0} ${t1} ${t2} ${t3}`
        if (MULTI_WORD_LABELS.some((l) => l.toLowerCase() === m4.toLowerCase())) {
          result.push(categoriseBadge(m4))
          lastWasHoldF = false
          i += 4
          continue
        }
      }

      // 3-word merge
      if (t1 && t2) {
        const m3 = `${t0} ${t1} ${t2}`
        if (MULTI_WORD_LABELS.some((l) => l.toLowerCase() === m3.toLowerCase())) {
          result.push(categoriseBadge(m3))
          lastWasHoldF = false
          i += 3
          continue
        }
      }

      // 2-word merge
      if (t1) {
        const m2 = `${t0} ${t1}`
        if (MULTI_WORD_LABELS.some((l) => l.toLowerCase() === m2.toLowerCase())) {
          result.push(categoriseBadge(m2))
          lastWasHoldF = false
          i += 2
          continue
        }
      }

      // ── Heat-dash F detection ──────────────────────────────────────────────
      // fe.svg when: previous token was also F (double-F pattern)
      //           OR this F is the last token in a Dash-containing sequence
      if (t0 === 'F' && (lastWasHoldF || (hasDashInPart && i === rawTokens.length - 1))) {
        result.push(imgToken('fe', 'F (Heat Dash)'))
        lastWasHoldF = false // fe resets the chain
        i++
        continue
      }

      const atoms = parseAtom(t0)
      result.push(...atoms)

      // Track whether this token resolved to a hold-forward image
      lastWasHoldF = atoms.length === 1 &&
        atoms[0].type === 'image' &&
        (atoms[0] as { type: 'image'; src: string; alt: string }).src.includes('/fh.svg')

      i++
    }
  })

  return result
}
