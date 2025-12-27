import { PostgreSqlContainer } from '@testcontainers/postgresql';

export default async function setup() {
    const container = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('test_db')
        .withUsername('test-user')
        .withPassword('test-password')
        .start();

    const dbUrl = container.getConnectionUri();
    
    process.env.DATABASE_URL = dbUrl;
    process.env.DIRECT_URL = dbUrl;

    (globalThis as any).__CONTAINER__ = container;
}