import prisma from "@/app/lib/db";
import { Page } from '@playwright/test';

export async function clearDatabase() {
    const tablenames = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'`
    );

    for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        }
    }
}

export async function resetDatabaseWithUser() {
    await clearDatabase();

    await prisma.user.create({
        data: {
            name: 'Test User Name',
            email: 'test@example.com',
        }
    });
}

export async function speakCommand(page: Page, transcript: string) {
    await page.evaluate((text) => {
        const instance = (window as any).mockRecognitionInstance;
        
        if (!instance || !instance.onresult) {
            throw new Error("No active SpeechRecognition instance found. Is the assistant activated?");
        }

        const mockEvent = {
            resultIndex: 0,
            results: {
                0: {
                    0: { transcript: text, confidence: 0.99 },
                    isFinal: true,
                    length: 1
                },
                length: 1
            },
            [Symbol.iterator]: function* () {
                yield { 0: { transcript: text, confidence: 0.99 }, isFinal: true };
            }
        };

        instance.onresult(mockEvent);
        
    }, transcript);
}