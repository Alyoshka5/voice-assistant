import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

let container: any;

beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('test_db')
        .withUsername('test-user')
        .withPassword('test-password')
        .start()

    const dbUrl = `postgres://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getFirstMappedPort()}/${container.getDatabase()}`;

    process.env.DATABASE_URL = dbUrl;
    process.env.DIRECT_URL = dbUrl;

    execSync('npx prisma db push', { env: process.env });

    server.listen({ onUnhandledRequest: 'warn' });
}, 60000);

afterEach(() => {
    server.resetHandlers();
})

afterAll(async () => {
    if (container) {
        await container.stop()
    }

    server.close();
})