import { beforeEach, afterEach } from 'vitest';
import getTasksFromList from './getTasksFromList';
import { auth } from '@/auth';
import openAIClient from '@/app/lib/openai';

vi.mock('@/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/app/lib/openai', () => ({
    default: {
        responses: {
            create: vi.fn()
        }
    }
}));

function createFetchResponse(data: any, ok: boolean = true) {
    return {
        ok,
        json: () => Promise.resolve(data)
    }
}

describe('getTasksFromList', () => {
    const mockListTitle = 'list title';
    
    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)
        
        global.fetch = vi.fn().mockImplementation(url => {
            // GET /users/@me/lists
            if (url.includes('/users/@me/lists')) {
                return Promise.resolve(createFetchResponse({
                    items: [
                        { id: 'list-1', title: 'list 1 title' },
                        { id: 'list-2', title: 'list 2 title' }
                    ]
                }));
            }
            // GET /tasks
            return Promise.resolve(createFetchResponse({
                items: [
                    { id: 'task-1', title: 'task 1 title' },
                    { id: 'task-2', title: 'task 2 title' }
                ]
            }));
        })
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await getTasksFromList(mockListTitle);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('returns tasks from given list', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'list-1'
        } as any)

        const result = await getTasksFromList(mockListTitle);

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/list-1.*list 1 title|list 1 title.*list-1/)
            })
        )
        expect(result.outputText).toMatch(/task 1 title.*task 2 title/i);
    })

    it('handles list not existing', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: ''
        } as any)

        const result = await getTasksFromList(mockListTitle);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/list-1.*list 1 title|list 1 title.*list-1/)
            })
        )
        expect(result.outputText).toMatch(/sorry/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getTasksFromList(mockListTitle);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await getTasksFromList(mockListTitle);

        expect(result.outputText).toMatch(/sorry/i);
    });
})