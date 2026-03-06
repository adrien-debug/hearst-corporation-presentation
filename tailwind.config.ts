import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hearst: {
          black: '#000000',
          dark: '#0a0a0a',
          900: '#111111',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#7F7F7F',
          400: '#B2B2B2',
          300: '#D4D4D4',
          200: '#E8E8E8',
          100: '#F2F2F2',
          50: '#FCFDFC',
          white: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#A7FB90',
          light: '#C4FDB5',
          dark: '#73DE56',
          muted: 'rgba(167, 251, 144, 0.15)',
          subtle: 'rgba(167, 251, 144, 0.08)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        'editorial': '65ch',
        'content': '75rem',
        'wide': '90rem',
      },
      aspectRatio: {
        'a4': '210 / 297',
        'a4-landscape': '297 / 210',
        'spread': '2 / 1',
      },
    },
  },
  plugins: [],
}

export default config
