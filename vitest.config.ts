import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.claude/**',
      'HPFC-summer-party-app-2026/**',
      'Magic Patterns design/**',
      'docs/Magic Patterns design/**',
    ],
  },
});
