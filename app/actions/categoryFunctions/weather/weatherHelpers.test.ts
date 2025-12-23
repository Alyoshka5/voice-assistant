import { beforeEach, afterEach } from 'vitest';
import { getCoordinates } from './weatherHelpers';
import { Coordinates } from '@/app/types/types';

function createFetchResponse(data: any, ok: boolean = true) {
    return {
        ok,
        json: () => Promise.resolve(data)
    }
}

describe('getCoordinates', () => { 
    const mockCoordinates: Coordinates = {
        latitude: 23.283412,
        longitude: -38.102932
    }
    
    beforeEach(() => {
        vi.clearAllMocks();
    })
    
    afterEach(() => {
        vi.resetAllMocks();
    })

    it('returns coordinates when valid location provided', async () => {
        global.fetch = vi.fn().mockResolvedValue(Promise.resolve(createFetchResponse([
            {
                lat: mockCoordinates.latitude,
                lon: mockCoordinates.longitude
            }
        ])));
        
        const result = await getCoordinates('valid location');

        expect(global.fetch).toHaveBeenCalled();
        expect(result).toEqual(mockCoordinates);
    })

    it('returns empty object when invalid location provided', async () => {
        global.fetch = vi.fn().mockResolvedValue(Promise.resolve(createFetchResponse([
            {}
        ])));
        
        const result = await getCoordinates('invalid location');

        expect(global.fetch).toHaveBeenCalled();
        expect(result).toEqual({});
    })

    it('handles fetch errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse({}, false));

        const result = await getCoordinates('valid location');

        expect(result).toEqual({});
    });
})