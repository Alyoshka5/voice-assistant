import { test, expect } from '@playwright/test';
import { resetDatabaseWithUser } from '@/app/tests/test-utils';

test.beforeEach(async ({ page }) => {
	await page.route('**/api/auth/session', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				user: { name: 'Test User', email: 'test@example.com', image: null },
				expires: '3000-01-01T00:00:00.000Z'
			})
		})
	});
});

test.beforeEach(async ({ context }) => {
    await context.addCookies([{
        name: 'next-auth.session-token',
        value: 'fake-mock-token',
        domain: 'localhost',
        path: '/',
    }]);
});

test.beforeAll(async () => {
	await resetDatabaseWithUser();
})

test('redirects to /ai page on signin', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('button', { name: 'Login as Test User' }).click();
	await expect(page.getByRole('button', { name: 'Activate Assistant' })).toBeVisible({ timeout: 10000 });
	await expect(page).toHaveURL(/\/ai/);
})

test('redirects to home page if trying to access /ai page unauthenticated', async ({ page, context }) => {
	await page.goto('/ai');
	await expect(page).toHaveURL('/');
})
