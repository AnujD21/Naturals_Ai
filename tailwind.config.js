/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        // ── Naturals-inspired dark surfaces ──
        obsidian: {
          DEFAULT: '#0D0C0A',
          50:  '#1A1815',
          100: '#141210',
          200: '#0D0C0A',
        },
        charcoal: {
          DEFAULT: '#1C1A17',
          50:  '#2A2723',
          100: '#232120',
          200: '#1C1A17',
          300: '#161412',
        },
        // ── Naturals gold palette ──
        gold: {
          50:  '#FDF8EE',
          100: '#F7EDD0',
          200: '#EDD89A',
          300: '#DFC06A',
          400: '#C9A84C',
          500: '#B8942E',
          600: '#9A7A1E',
          700: '#7A5F14',
          DEFAULT: '#C9A84C',
          light: '#DFC06A',
          muted: 'rgba(201,168,76,0.12)',
          glow:  'rgba(201,168,76,0.20)',
        },
        // ── Warm cream / beige tones ──
        cream: {
          DEFAULT: '#F5EDD8',
          50:  '#FDFAF4',
          100: '#F9F3E5',
          200: '#F5EDD8',
          300: '#EDE0C4',
          400: '#E0CFA8',
          500: '#CCBA8A',
        },
        // ── Warm neutrals ──
        warm: {
          50:  '#FAF8F5',
          100: '#F2EDE6',
          200: '#E8DDD0',
          300: '#D4C4B0',
          400: '#B8A48E',
          500: '#9A8470',
          600: '#7A6452',
          700: '#5C4A38',
          800: '#3D3028',
          900: '#261E18',
        },
        // ── Surfaces ──
        surface: {
          DEFAULT: '#0D0C0A',
          raised:  '#161412',
          overlay: '#1C1A17',
          subtle:  '#232120',
          border:  'rgba(201,168,76,0.10)',
          'border-hover': 'rgba(201,168,76,0.22)',
        },
        // ── Accent ──
        accent: {
          DEFAULT:    '#C9A84C',
          hover:      '#DFC06A',
          muted:      'rgba(201,168,76,0.12)',
          glow:       'rgba(201,168,76,0.20)',
          foreground: '#0D0C0A',
        },
        // ── Semantic ──
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          hover:   'rgba(255,255,255,0.13)',
          gold:    'rgba(201,168,76,0.18)',
        },
        ruby:    { DEFAULT: '#9B3B3B', muted: 'rgba(155,59,59,0.12)' },
        sage:    { DEFAULT: '#4A7055', muted: 'rgba(74,112,85,0.12)'  },
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #C9A84C 0%, #DFC06A 50%, #B8942E 100%)',
        'gold-shimmer':    'linear-gradient(90deg, #C9A84C, #F0D882, #C9A84C)',
        'surface-gradient':'linear-gradient(160deg, #161412 0%, #0D0C0A 60%, #111008 100%)',
        'hero-gradient':   'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold-sm':  '0 1px 8px rgba(201,168,76,0.12)',
        'gold-md':  '0 4px 24px rgba(201,168,76,0.16)',
        'gold-lg':  '0 8px 48px rgba(201,168,76,0.20)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.12)',
        'float':    '0 20px 60px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '3xs': ['0.5rem',   { lineHeight: '0.75rem'  }],
      },
      letterSpacing: {
        luxury: '0.12em',
        wide2:  '0.08em',
      },
      animation: {
        'gold-pulse':  'goldPulse 3s ease-in-out infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'fade-up':     'fadeUp 0.5s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        goldPulse: {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1'   },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)'    },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 12px rgba(201,168,76,0.15)' },
          '50%':     { boxShadow: '0 0 28px rgba(201,168,76,0.30)' },
        },
      },
    },
  },
  plugins: [],
}
