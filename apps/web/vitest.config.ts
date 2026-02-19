/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    root: path.resolve(__dirname),
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['src/__tests__/setup.ts'],
  },
});
