import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      'HPFC-summer-party-app-2026/**',
      'Magic Patterns design/**',
      'docs/Magic Patterns design/**',
    ],
  },
});
