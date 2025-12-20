import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: 'test-setup.ts',
        coverage: {
            provider: 'v8',
            include: [
              'app/**/*.{ts,tsx}', 
              'components/**/*.{ts,tsx}',
              'lib/**/*.{ts,tsx}',
              'actions/**/*.{ts,tsx}' 
            ], 
            exclude: [
              'app/layout.tsx',
              'app/favicon.ico',
              '**/*.d.ts',
              '**/*.test.ts',
              '**/*.test.tsx',
              '**/node_modules/**',
            ],
            reporter: ['text', 'json', 'html'],
          },
    },
    
})