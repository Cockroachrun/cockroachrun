import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});