import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
const sharedPlugins = [tsconfigPaths(), react()];

export default defineConfig({
    plugins: sharedPlugins,
    test: {
        globals: true,
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
        projects: [
            {
                plugins: sharedPlugins,
                test: {
                    name: 'unit',
                    globals: true,
                    include: ['./**/*.test.{ts,tsx}'],
                    exclude: ['./**/*.int.test.{ts,tsx}', '**/node_modules/**'],
                    environment: 'jsdom',
                    setupFiles: ['./test-setup.ts'],
                },
            },
            {
                plugins: sharedPlugins,
                test: {
                    name: 'integration',
                    globals: true,
                    include: ['./**/*.int.test.{ts,tsx}'],
                    exclude: ['**/node_modules/**'],
                    globalSetup: ['./app/tests/global-setup.ts'],
                    setupFiles: ['./test-setup.ts', './app/tests/setup-db.ts'],
                    environment: 'node',
                    fileParallelism: false,
                    testTimeout: 60000,
                    hookTimeout: 60000
                },
            },
        ]
    },
})