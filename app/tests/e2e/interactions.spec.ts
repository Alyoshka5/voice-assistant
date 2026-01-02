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

test.beforeEach(async ({ page, context }) => {
    await resetDatabaseWithUser();
    await context.grantPermissions(['geolocation']);
	await context.setGeolocation({
		latitude: 39.9234,
		longitude: -23.4823
	});
	await page.addInitScript(mockSpeechRecognition);

	await page.goto('/');

	await page.getByRole('button', { name: 'Login as Test User' }).click();
	await expect(page.getByRole('button', { name: 'Activate Assistant' })).toBeVisible({ timeout: 10000 });
	await expect(page).toHaveURL(/\/ai/);

	const container = page.locator('[data-mounted="true"]');
	await expect(container).toBeVisible({ timeout: 15000 });

	await page.getByRole('button', { name: 'Activate Assistant' }).click();
	const input = page.getByPlaceholder(/type/i);
	await expect(input).toBeVisible();
});

test('handles requests through speech recognition', async ({ page }) => {
    await speakCommand(page, 'Apex what are my task lists?');
    await expect(page.getByText('what are my task lists?')).toBeVisible();
    await expect(page.getByText(/lists.*work.*chores/i)).toBeVisible();

    const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
    });
    await expect(messages).toHaveLength(2);
    await expect(messages[0].role).toBe('user');
    await expect(messages[0].content).toBe('what are my task lists?');
    await expect(messages[1].role).toBe('assistant');
    await expect(messages[1].content).toMatch(/lists.*work.*chores/i);
})

test('handles requests through text input and submission through "Enter" key', async ({ page }) => {
    const input = page.getByPlaceholder(/type/i);
	await input.fill('What are my task lists?');
	await input.press('Enter');
	await expect(page.getByText('What are my task lists?')).toBeVisible();
	await expect(page.getByText(/lists.*work.*chores/i)).toBeVisible();
	
	const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
	});
	await expect(messages).toHaveLength(2);
	await expect(messages[0].role).toBe('user');
	await expect(messages[0].content).toBe('What are my task lists?');
	await expect(messages[1].role).toBe('assistant');
	await expect(messages[1].content).toMatch(/lists.*work.*chores/i);

})

test('handles requests through text input and submission through submit button', async ({ page }) => {
    const input = page.getByPlaceholder(/type/i);
	await input.fill('What are my task lists?');
	await page.getByRole('button', { name: 'Submit Query' }).click();
	await expect(page.getByText('What are my task lists?')).toBeVisible();
	await expect(page.getByText(/lists.*work.*chores/i)).toBeVisible();
	
	const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
	});
	await expect(messages).toHaveLength(2);
	await expect(messages[0].role).toBe('user');
	await expect(messages[0].content).toBe('What are my task lists?');
	await expect(messages[1].role).toBe('assistant');
	await expect(messages[1].content).toMatch(/lists.*work.*chores/i);

})