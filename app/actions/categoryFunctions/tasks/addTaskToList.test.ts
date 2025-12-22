import { beforeEach, afterEach } from 'vitest';
import addTaskToList from './addTaskToList';
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

describe('addTaskToList', () => {
    const mockTaskDetails = { 
        taskName: 'task name', 
        listName: 'list-1 title', 
    };
    
    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)
        
        global.fetch = vi.fn().mockImplementation(url => {
            // GET /users/@me/lists
            if (url.includes('/users/@me/lists') && !url.includes('method: POST')) {
                return Promise.resolve(createFetchResponse({
                    items: [
                        { id: 'list-1', title: 'list 1 title' },
                        { id: 'list-2', title: 'list 2 title' }
                    ]
                }));
            }
            // POST /tasks
            if (url.includes('/tasks')) {
                return Promise.resolve(createFetchResponse({ title: 'list title' }));
            }
            // POST /users/@me/lists
            return Promise.resolve(createFetchResponse({}, false));
        })
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await addTaskToList(mockTaskDetails);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('adds task to an existing list', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: 'list-1'
        } as any)

        const result = await addTaskToList(mockTaskDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/list-1.*list 1 title|list 1 title.*list-1/)
            })
        )
        expect(result.outputText).toMatch(/added/i);
    })

    it('create a new list if no match is found and adds task to the list', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output_text: ''
        } as any)
        global.fetch = vi.fn().mockImplementation(async (url, options) => {
            // GET /users/@me/lists
            if (url.endsWith('/users/@me/lists') && !options?.method) {
                return createFetchResponse({ items: [] });
            }
            // POST /users/@me/lists
            if (url.endsWith('/users/@me/lists') && options?.method === 'POST') {
                return createFetchResponse({
                    id: 'list-new',
                    title: 'list new title'
                });
            }
            // POST /tasks
            if (url.includes('/lists/list-new/tasks')) {
                return createFetchResponse({ title: 'list new title' });
            }
            return createFetchResponse({}, false);
        })

        const result = await addTaskToList(mockTaskDetails);

        expect(result.outputText).toMatch(/added/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await addTaskToList(mockTaskDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await addTaskToList(mockTaskDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})