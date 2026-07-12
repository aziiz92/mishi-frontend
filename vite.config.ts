/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { colors } from './src/theme/tokens.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // index.html may not contain raw hex (single-source token rule):
      // %MISHI_*% placeholders are filled from src/theme/tokens.ts at
      // build/serve time.
      name: 'mishi:inject-tokens',
      transformIndexHtml(html) {
        return html
          .replaceAll('%MISHI_SURFACE_CANVAS%', colors.surface.canvas)
          .replaceAll('%MISHI_CONTENT_PRIMARY%', colors.content.primary);
      },
    },
  ],
  build: {
    // Rolldown emits <link rel="modulepreload"> for the three chunk in the
    // HTML, which would download 256KB gz of WebGL eagerly in EVERY tier —
    // the chunk must be fetched only when Tier A lazily mounts Stage.
    modulePreload: {
      resolveDependencies: (_url: string, deps: string[]) => deps.filter((d) => !d.includes('three')),
    },
    rollupOptions: {
      output: {
        // three/R3F/drei live in a lazy chunk fetched after first paint,
        // Tier A only. GSAP + Lenis stay in the main chunk (statically
        // imported). The 300KB gz initial-JS budget is measured on the
        // main chunk.
        manualChunks(id: string) {
          if (/node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three';
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
});
