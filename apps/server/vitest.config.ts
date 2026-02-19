import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  test: {
    root: path.resolve(__dirname),
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 15000,
    teardownTimeout: 3000,
  },
});
