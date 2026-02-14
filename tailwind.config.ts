import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        accent: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          bronze: '#cd7f32',
        },
        card: '#1a1f2e',
        'bg-light': '#F2F2F2',
        'bg-dark': '#0A0A0A',
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        md: '2px',
        lg: '4px',
      },
    },
  },
  plugins: [],
}
export default config
