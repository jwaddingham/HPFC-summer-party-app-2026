
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
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
      backgroundImage: {
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      }
    },
  },
  plugins: [],
}
