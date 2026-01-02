export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.APP_ENV === 'test') {
        const { server } = await import('./app/tests/mocks/server');
        server.listen({ onUnhandledRequest: 'warn' });
    }
}