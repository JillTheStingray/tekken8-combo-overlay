/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        overlay: {
          bg: 'rgba(10, 10, 15, 0.88)',
          surface: 'rgba(20, 20, 32, 0.92)',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#e8a020',
          muted: 'rgba(255, 255, 255, 0.45)',
        },
        tag: {
          heat: '#cc3300',
          wall: '#0066cc',
          rage: '#880099',
          ch: '#cc7700',
          default: 'rgba(255,255,255,0.15)',
        }
      },
      fontFamily: {
        hud: ['"Rajdhani"', '"Barlow Condensed"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        comboEnter: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        starPop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.45)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        tagPulse: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
        'combo-enter': 'comboEnter 200ms ease-out both',
        'star-pop':    'starPop 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down':  'slideDown 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'tag-pulse':   'tagPulse 150ms ease-out',
      }
    }
  },
  plugins: []
}
