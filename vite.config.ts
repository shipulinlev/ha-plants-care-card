import { defineConfig } from 'vitest/config';

// One self-contained ES module (Lit bundled in), loaded by HA as a dashboard resource.
// The file name must match the repo name for HACS.
export default defineConfig({
  root: '.',
  server: { open: '/dev/index.html' },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'ha-plants-card.js',
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
