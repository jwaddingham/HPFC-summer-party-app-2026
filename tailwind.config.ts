import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hpfcBlack: '#17131d',
        hpfcRed: '#b30f24',
        hpfcBlue: '#244ed4',
        hpfcGold: '#e8b517'
      }
    }
  },
  plugins: []
} satisfies Config;
