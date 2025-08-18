import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    // open: true,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../types'),
    },
  },
  build: {
    sourcemap: true,
  },
});
