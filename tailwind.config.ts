import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.vue',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        overlay: 'rgb(var(--c-overlay) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        'border-hover': 'rgb(var(--c-border-hover) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--c-accent-hover) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        dim: 'rgb(var(--c-dim) / <alpha-value>)',
        text: 'rgb(var(--c-text) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
