import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        ui: ['var(--font-ui)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        gold: {
          50: '#FDF8EC',
          100: '#F7E9C3',
          200: '#EDD28A',
          400: '#D4AF5A',
          600: '#C9A036',
          800: '#8B6914',
          900: '#4A380A',
        },
        noir: {
          50: '#F2F0EC',
          100: '#D4D0C8',
          200: '#9E9A90',
          500: '#3A3830',
          700: '#1A1814',
          800: '#0F0E0B',
          900: '#070604',
        },
        cream: '#F5F0E8',
        champagne: '#E8D9B5',
      },
      boxShadow: {
        gold: '0 0 40px rgba(212, 175, 90, 0.08), 0 1px 0 rgba(212, 175, 90, 0.12) inset',
        card: '0 24px 48px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(212, 175, 90, 0.08) inset',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      animation: {
        'gold-pulse': 'goldPulse 3s ease-in-out infinite',
        'float-up': 'floatUp 8s ease-in-out infinite',
      },
      keyframes: {
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 90, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 90, 0.25)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0px)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(-80px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
