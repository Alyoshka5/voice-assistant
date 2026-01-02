import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

export default async function setup() {
    const container = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('test_db')
        .withUsername('test-user')
        .withPassword('test-password')
        .start();

    const dbUrl = container.getConnectionUri();
    
    process.env.DATABASE_URL = dbUrl;
    process.env.DIRECT_URL = dbUrl;
    process.env.NEXT_PUBLIC_APP_ENV = 'test';

    execSync('npx prisma db push', {
        env: { ...process.env, DATABASE_URL: dbUrl }
    });

    (globalThis as any).__CONTAINER__ = container;

    let ready = false;
    for (let i = 0; i < 20; i++) {
        try {
            const res = await fetch('http://localhost:3000/__msw_status');
            if (res.ok) {
                ready = true;
                break;
            }
        } catch (e) {
            // Server not up yet
        }
        await new Promise(r => setTimeout(r, 500));
    }
    if (!ready) throw new Error("MSW failed to start in time");

    return async () => {
        await container.stop();
    }
}