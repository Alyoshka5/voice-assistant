import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(async () => {
    execSync('npx prisma db push', { env: process.env });

    server.listen({ onUnhandledRequest: 'warn' });

    vi.mock('@/auth', () => ({
        auth: vi.fn(async () => ({
            user: {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User'
                },
            })
        ),
    }));
}, 60000);

afterEach(() => {
    server.resetHandlers();
})

afterAll(async () => {
    const container = (globalThis as any).__CONTAINER__;
    if (container) {
        await container.stop()
    }

    server.close();
})