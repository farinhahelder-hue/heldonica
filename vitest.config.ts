import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    alias: { "@": __dirname },
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/.claude/**', '**/dist/**'],
    // Fuseau du site, fixé pour tous.
    //
    // Les tests de formatDate passaient en CI, qui tourne en UTC, et échouaient
    // sur une machine à Paris : « 2099-12-31T23:59:59Z » y devient le
    // 1ᵉʳ janvier 2100. La fonction avait raison, les tests supposaient UTC.
    // Sans fuseau fixe, le resultat depend de la machine — et un test qui ne
    // dit pas la meme chose partout ne prouve rien.
    env: { TZ: 'Europe/Paris' },
  },
});