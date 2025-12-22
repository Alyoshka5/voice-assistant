import { beforeEach, afterEach } from 'vitest';
import getAllTaskLists from './getAllTaskLists';
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

describe('getAllTaskLists', () => {    
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

        const result = await getAllTaskLists();

        expect(result.outputText).toMatch(/sign.*in/i);
    })

    it('returns list of task lists', async () => {
        global.fetch = vi.fn().mockResolvedValue(Promise.resolve(createFetchResponse({
            items: [
                { title: 'list1' },
                { title: 'list2' },
                { title: 'list3' },
            ]
        })))
        
        const result = await getAllTaskLists();

        expect(global.fetch).toHaveBeenCalled();
        expect(result.outputText).toMatch(/list1.*list2.*list3/i);
    })

    it('handles Google API errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getAllTaskLists();

        expect(result.outputText).toMatch(/sorry/i);
    });
})