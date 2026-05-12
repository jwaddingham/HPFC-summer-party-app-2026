import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        blood: 'var(--blood)',
        chalk: 'var(--chalk)',
        pitch: 'var(--pitch)',
        sky: 'var(--sky)',
        gold: 'var(--gold)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
        hand: ['"Permanent Marker"', 'cursive'],
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px var(--ink)',
        'hard-sm': '2px 2px 0px 0px var(--ink)',
        'hard-blood': '4px 4px 0px 0px var(--blood)',
      },
    }
  },
  plugins: []
} satisfies Config;
