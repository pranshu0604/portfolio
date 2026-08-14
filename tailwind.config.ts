import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        sub: 'var(--sub)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        good: 'var(--good)',
        // alpha-aware so `text-accent/60`, `bg-accent/10` compose
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'var(--line)',
      },
    },
  },
  plugins: [],
} satisfies Config
