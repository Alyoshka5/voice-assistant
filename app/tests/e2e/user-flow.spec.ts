import { test, expect } from '@playwright/test';
import { mockSpeechRecognition } from '@/app/tests/mocks/speech-init';
import { speakCommand } from '@/app/tests/test-utils';
import prisma from '@/app/lib/db';
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

test('handles the entire flow a user takes through the app', async ({ page, context }) => {
	await context.grantPermissions(['geolocation']);
	await context.setGeolocation({
		latitude: 39.9234,
		longitude: -23.4823
	});
	await page.addInitScript(mockSpeechRecognition);

	// signin and activation
	await page.goto('/');

	await page.getByRole('button', { name: 'Login as Test User' }).click();
	await expect(page.getByRole('button', { name: 'Activate Assistant' })).toBeVisible({ timeout: 10000 });
	await expect(page).toHaveURL(/\/ai/);

	const container = page.locator('[data-mounted="true"]');
	await expect(container).toBeVisible({ timeout: 15000 });

	await page.getByRole('button', { name: 'Activate Assistant' }).click();
	const input = page.getByPlaceholder(/type/i);
	await expect(input).toBeVisible();
	
	// first request
	await input.fill('What\'s the weather?');
	await input.press('Enter');
	await expect(page.getByText('What\'s the weather?')).toBeVisible();
	await expect(page.getByText(/currently cloudy/i)).toBeVisible();

	const weatherPanel = page.locator('[data-testid="current-weather-panel"]');
	await expect(weatherPanel).toBeVisible();
	await expect(weatherPanel).toContainText(/cloudy/i);
	await expect(weatherPanel).toContainText(/20/i);
	
	let messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
	});
	await expect(messages).toHaveLength(2);
	await expect(messages[0].role).toBe('user');
	await expect(messages[0].content).toBe('What\'s the weather?');
	await expect(messages[1].role).toBe('assistant');
	await expect(messages[1].content).toMatch('It is currently cloudy with a temperature of 20 degrees');

	// second request
	await speakCommand(page, 'Apex what are my task lists?');
	await expect(page.getByText('what are my task lists?')).toBeVisible();
	await expect(page.getByText(/lists.*work.*chores/i)).toBeVisible();
	await expect(page.locator('[data-testid="current-weather-panel"]')).not.toBeVisible();

	messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
	});
	await expect(messages).toHaveLength(4);
	await expect(messages[2].role).toBe('user');
	await expect(messages[2].content).toBe('what are my task lists?');
	await expect(messages[3].role).toBe('assistant');
	await expect(messages[3].content).toMatch(/lists.*work.*chores/i);
})
