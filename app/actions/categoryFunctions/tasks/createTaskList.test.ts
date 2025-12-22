import { beforeEach, afterEach } from 'vitest';
import createTaskList from './createTaskList';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
    auth: vi.fn()
}));

function createFetchResponse(data: any, ok: boolean = true) {
    return {
        ok,
        json: () => Promise.resolve(data)
    }
}

describe('createTaskList', () => {
    const mockListTitle = 'list title';
    
    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(auth).mockResolvedValue({
            accessToken: 'abdef',
            user: { name: 'Test User' }
        } as any)
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns error message when user not signed in', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await createTaskList(mockListTitle);

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('creates a new list with given title', async () => {
        global.fetch = vi.fn().mockResolvedValue(Promise.resolve(createFetchResponse({})))
        
        const result = await createTaskList(mockListTitle);

        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), 
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining(mockListTitle)
            }
        ));
        expect(result.outputText).toMatch(/added.*/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await createTaskList(mockListTitle);

        expect(result.outputText).toMatch(/sorry/i);
    });
})