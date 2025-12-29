import prisma from '@/app/lib/db';
import getOpenAIResponse from '@/app/actions/getOpenAIResponse';
import { UserRequestDetails } from '@/app/types/types';
import { beforeAll, afterEach } from 'vitest';
import { resetDatabaseWithUser } from '@/app/tests/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '@/app/tests/mocks/server';

describe('Tasks Controller Integration', () => {

    beforeAll(async () => {
        await resetDatabaseWithUser();

    });
    
    beforeEach(async () => {
        server.use(
            http.get('https://tasks.googleapis.com/tasks/v1/users/@me/lists', async () => {
                return HttpResponse.json({
                    items: [
                        { title: 'work', id: 'work-list-id' },
                        { title: 'chores', id: 'chores-list-id' },
                    ]
                });
            }),
            http.post('https://tasks.googleapis.com/tasks/v1/users/@me/lists', async () => {
                    return HttpResponse.json();
            }),
            http.post('https://tasks.googleapis.com/tasks/v1/lists/chores-list-id/tasks', async () => {
                return HttpResponse.json({ title: 'dishes' });
            }),
            http.get('https://tasks.googleapis.com/tasks/v1/lists/chores-list-id/tasks', async () => {
                return HttpResponse.json({
                    items: [
                        { title: 'dishes', id: 'dishes-task-id' },
                        { title: 'vacuum', id: 'vacuum-task-id' }
                    ]
                });
            }),
            http.patch('https://tasks.googleapis.com/tasks/v1/lists/chores-list-id/tasks/dishes-task-id', async () => {
                return HttpResponse.json();
            }),
        );
    })

    afterEach(async () => {
        await prisma.message.deleteMany();
    })

    const mockUserRequestDetails: UserRequestDetails = {
        coordinates: { latitude: 23.283412, longitude: -38.102932 },
        date: "Wednesday, December 19, 2025",
        time: "2:30 PM",
        isoNow: "2025-12-19T14:30:00.000Z",
        timeZone: "America/Vancouver",
    }
    
    it('runs getAllTaskLists function and returns a response', async () => {
        const userMessage = 'What are my task lists?';
        const assistantMessage = /lists.*work.*chores/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs createTaskList function and returns a response', async () => {
        const userMessage = 'Create a task list called school';
        const assistantMessage = /added.*school/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs addTaskToList function and returns a response', async () => {
        const userMessage = 'Add dishes to my chores task list';
        const assistantMessage = /added(?=.*dishes)(?=.*chores)/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs getTasksFromList function and returns a response', async () => {
        const userMessage = 'What tasks do I have in my chores list?';
        const assistantMessage = /tasks(?=.*dishes)(?=.*vacuum)/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs completeTaskInList function and returns a response', async () => {
        const userMessage = 'Set my dishes task in my chores list as completed';
        const assistantMessage = /(?=.*complete)(?=.*dishes)(?=.*chores)/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
    
    it('runs setTaskDueDate function and returns a response', async () => {
        const userMessage = 'Set my dishes task\'s due date to tomorrow';
        const assistantMessage = /(?=.*due)(?=.*dishes)(?=.*20)(?=.*december)/i;

        const response = await getOpenAIResponse(userMessage, mockUserRequestDetails);

        expect(response.outputText).toMatch(assistantMessage);
        expect(response.action).toBeFalsy();

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe(userMessage);
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toMatch(assistantMessage);
    })
})