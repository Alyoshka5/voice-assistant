import { renderHook } from '@testing-library/react';
import { beforeEach } from 'vitest';
import usePlaySpeech from './usePlaySpeech';
import convertToSpeech from '../actions/convertTextToSpeech';

vi.mock('@/app/actions/convertTextToSpeech', () => ({
    default: vi.fn()
}));

global.Audio = vi.fn().mockImplementation(function() {
    return {
        play: vi.fn(),
        src: ''
    }
});

global.AudioContext = vi.fn().mockImplementation(function() {
    return {
        createMediaElementSource: vi.fn(() => ({
            connect: vi.fn()
        })),
        createAnalyser: vi.fn(() => ({
            fftSize: 0,
            connect: vi.fn(),
            frequencyBinCount: 128,
            getByteFrequencyData: vi.fn((array) => array.fill(100))
        })),
        destination: {}
    }
});

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('usePlaySpeech', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calculates the correct average amplitude', () => {
        const { result } = renderHook(() => usePlaySpeech());
        result.current.initAudio();
        const amplitude = result.current.getAmplitude();
        
        expect(amplitude).toBe(100);
    })

    it('converts text to speech and sets audio source', async () => {
        const mockBase64 = 'SGVsbG8='; // "Hello" in base64
        vi.mocked(convertToSpeech).mockResolvedValue(mockBase64);

        const { result } = renderHook(() => usePlaySpeech());
        result.current.initAudio();
        await result.current.playSpeech('Hello');

        expect(convertToSpeech).toHaveBeenCalledWith('Hello');
        expect(URL.createObjectURL).toHaveBeenCalled();
    })

    it('resets urlRef only if playSpeech has already been called', async () => {
        const { result } = renderHook(() => usePlaySpeech());
        result.current.initAudio();

        await result.current.playSpeech('text 1');
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        
        await result.current.playSpeech('text 2');
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    })
})