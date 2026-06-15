import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'client',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/test-setup.ts'],
          css: false,
          include: ['src/**/*.{test,spec}.{ts,tsx}']
        }
      },
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          globals: true,
          include: ['server/**/*.{test,spec}.ts'],
          exclude: ['server/__tests__/setup.ts', 'server/__tests__/*.integration.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'server:integration',
          environment: 'node',
          globals: true,
          include: ['server/__tests__/*.integration.test.ts'],
          setupFiles: ['./server/__tests__/setup.ts']
        }
      }
    ]
  }
});
