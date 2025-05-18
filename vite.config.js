import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    open: true,
    hmr: {
      overlay: false, // Disable the error overlay
    },
  },
  css: {
    devSourcemap: true,
  },
});