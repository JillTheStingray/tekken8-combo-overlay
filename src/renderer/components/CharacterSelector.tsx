import { useState } from 'react'
import { useOverlayStore } from '../store/overlayStore'
import { CHARACTER_NAMES, CHARACTER_SLUGS } from '../types/combo'

const CHAR_BASE = 'https://tekken8combo.kagewebsite.com/tpl/img/char'

function CharacterCard({ name, onSelect }: { name: string; onSelect: () => void }) {
  const slug = CHARACTER_SLUGS[name]
  const [imgFailed, setImgFailed] = useState(false)

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col items-center rounded-lg border border-white/8 bg-white/3 hover:border-overlay-accent/60 hover:bg-overlay-accent/10 transition-all cursor-pointer overflow-hidden no-drag"
      title={name}
    >
      {/* Portrait image */}
      <div className="w-full aspect-square overflow-hidden bg-black/40 relative">
        {!imgFailed ? (
          <img
            src={`${CHAR_BASE}/${slug}.jpg`}
            alt={name}
            draggable={false}
            className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          /* Fallback: initials if image fails */
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-sm font-hud font-bold text-white/50">{initials}</span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Character name */}
      <div className="w-full px-1 py-1 text-center bg-black/30">
        <span className="text-[9px] font-hud font-semibold text-white/65 group-hover:text-overlay-accent transition-colors leading-tight block truncate">
          {name}
        </span>
      </div>
    </button>
  )
}

export default function CharacterSelector() {
  const { setCharacter, loading } = useOverlayStore()

  return (
    <div className="flex-1 combo-scroll px-4 py-3">
      <p className="text-[10px] text-white/30 font-hud uppercase tracking-widest mb-3">
        Select Character
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {CHARACTER_NAMES.map((name) => (
          <CharacterCard
            key={name}
            name={name}
            onSelect={() => !loading && setCharacter(name)}
          />
        ))}
      </div>
    </div>
  )
}
