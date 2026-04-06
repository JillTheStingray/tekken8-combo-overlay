import { useState, useEffect, useRef } from 'react'
import { useOverlayStore } from '../store/overlayStore'
import { CHARACTER_NAMES } from '../types/combo'

export default function SearchBar({ compact }: { compact?: boolean }) {
  const { selectedCharacter, setCharacter, setFilter, filters } = useOverlayStore()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // When a character is selected, search bar switches to combo search mode
  const isComboMode = !!selectedCharacter

  const placeholder = isComboMode
    ? `Search ${selectedCharacter} combos...`
    : 'Search character...'

  useEffect(() => {
    if (isComboMode) {
      setValue('')
    }
  }, [selectedCharacter])

  const handleChange = (v: string) => {
    setValue(v)

    if (!isComboMode) {
      // Character search
      if (v.trim()) {
        const matches = CHARACTER_NAMES.filter((name) =>
          name.toLowerCase().includes(v.toLowerCase())
        )
        setSuggestions(matches)
        setShowSuggestions(matches.length > 0)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      // Combo search with debounce
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setFilter({ searchQuery: v })
      }, 250)
    }
  }

  const selectCharacter = (name: string) => {
    setValue('')
    setSuggestions([])
    setShowSuggestions(false)
    setCharacter(name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length === 1) {
      selectCharacter(suggestions[0])
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      if (isComboMode) {
        setValue('')
        setFilter({ searchQuery: '' })
      }
    }
  }

  return (
    <div className="relative px-4 py-2 border-b border-white/5">
      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/8 focus-within:border-overlay-accent/50 transition-colors">
        <span className="text-white/30 text-sm">
          {isComboMode ? '🔍' : '🎮'}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => !isComboMode && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm font-hud outline-none placeholder-white/25 no-drag"
        />
        {value && (
          <button
            onClick={() => {
              setValue('')
              setSuggestions([])
              setShowSuggestions(false)
              if (isComboMode) setFilter({ searchQuery: '' })
            }}
            className="text-white/30 hover:text-white/60 text-xs transition-colors no-drag"
          >
            ✕
          </button>
        )}
        {isComboMode && (
          <span className="text-xs text-white/20 font-mono">
            {filters.searchQuery ? '' : ''}
          </span>
        )}
      </div>

      {/* Character suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-[rgba(15,15,22,0.97)] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden fade-in no-drag">
          {suggestions.slice(0, 8).map((name) => (
            <button
              key={name}
              onMouseDown={() => selectCharacter(name)}
              className="w-full text-left px-3 py-2 text-sm font-hud text-white/80 hover:bg-overlay-accent/20 hover:text-white transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
