import prisma from '@/app/lib/db';
import getOpenAIResponse from '@/app/actions/getOpenAIResponse';
import { UserRequestDetails } from '@/app/types/types';
import { beforeAll } from 'vitest';
import { resetDatabaseWithUser } from '@/app/tests/test-utils';

describe('Other Controller Integration', async () => {

    beforeAll(async () => {
        await resetDatabaseWithUser();
    })

    const mockUserRequestDetails: UserRequestDetails = {
        coordinates: { latitude: 23.283412, longitude: -38.102932 },
        date: "Wednesday, December 19, 2025",
        time: "2:30 PM",
        isoNow: "2025-12-19T14:30:00.000Z",
        timeZone: "America/Vancouver",
    }
    
    it('classifies request as "other" and returns a response', async () => {
        const userMessage = 'How are you?';
        const assistantMessage = 'I am doing great. How about you?';

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toBe(assistantMessage);
        expect(response.action).toBe('');
        expect(response.details).toEqual({});

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toBe(assistantMessage);
    })
})