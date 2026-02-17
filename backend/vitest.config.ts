import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.js'],
      exclude: ['__test__/**/*.test.ts', '__test__/**/*.test.js'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
