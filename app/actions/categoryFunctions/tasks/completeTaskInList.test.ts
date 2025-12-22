import { beforeEach, afterEach } from 'vitest';
import completeTaskInList from './completeTaskInList';
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

describe('completeTaskInList', () => {
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
        
        global.fetch = vi.fn().mockImplementation((url, options) => {
            // GET /users/@me/lists
            if (url.includes('/users/@me/lists') && !url.includes('method: POST')) {
                return Promise.resolve(createFetchResponse({
                    items: [
                        { id: 'list-1', title: 'list 1 title' },
                        { id: 'list-2', title: 'list 2 title' }
                    ]
                }));
            }
            // PATCH /tasks
            if (url.includes('/tasks') && options?.method === 'PATCH') {
                return Promise.resolve(createFetchResponse({}));
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

        const result = await completeTaskInList(mockTaskDetails);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('marks existing task as complete', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'list-1'
        } as any)
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'task-1'
        } as any)

        const result = await completeTaskInList(mockTaskDetails);

        expect(global.fetch).toHaveBeenCalledWith(expect.any(String),
            expect.objectContaining({
                method: 'PATCH',
            })
        )
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/list-1.*list 1 title|list 1 title.*list-1/)
            })
        )
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/task-1.*task 1 title|task 1 title.*task-1/)
            })
        )
        expect(result.outputText).toMatch(/marked/i);
    })

    it('handles list not existing', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: ''
        } as any)
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'task-1'
        } as any)

        const result = await completeTaskInList(mockTaskDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/list-1.*list 1 title|list 1 title.*list-1/)
            })
        )
        expect(result.outputText).toMatch(/sorry/i);
    })

    it('handles task not existing', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: 'list-1'
        } as any)
        vi.mocked(openAIClient.responses.create).mockResolvedValueOnce({
            output_text: ''
        } as any)

        const result = await completeTaskInList(mockTaskDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/list-1.*list 1 title|list 1 title.*list-1/)
            })
        )
        expect(openAIClient.responses.create).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.stringMatching(/task-1.*task 1 title|task 1 title.*task-1/)
            })
        )
        expect(result.outputText).toMatch(/sorry/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await completeTaskInList(mockTaskDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await completeTaskInList(mockTaskDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})