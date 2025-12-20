import { renderHook, act } from '@testing-library/react';
import { beforeEach } from 'vitest';
import useSpeechRecognition from './useSpeechRecognition';

interface MockSpeechRecognition {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    onresult: ((event: any) => void) | null;
    onend: (() => void) | null;
    interimResults: boolean;
}

let mockRecognitionInstance: MockSpeechRecognition;

global.SpeechRecognition = vi.fn().mockImplementation(function(this: MockSpeechRecognition) {
    this.start = vi.fn();
    this.stop = vi.fn();
    this.onresult = null;
    this.onend = null;
    this.interimResults = true;
    mockRecognitionInstance = this;
});

global.webkitSpeechRecognition = global.SpeechRecognition;

describe('useSpeechRecognition', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRecognitionInstance = undefined as any;
    });

    it('sets state variables to correct values when manually starting recognition', () => {
        const { result } = renderHook(() => useSpeechRecognition());

        result.current.startListening();

        expect(result.current.text).toBe('');
        expect(result.current.isFinal).toBe(false);
    })

    it('starts recognition instance when manually starting recognition', () => {
        const { result } = renderHook(() => useSpeechRecognition());

        result.current.startListening();

        expect(mockRecognitionInstance.start).toHaveBeenCalled();
    })

    it('stops recognition instance when manually stopping recognition', () => {
        const { result } = renderHook(() => useSpeechRecognition());

        result.current.stopListening();

        expect(mockRecognitionInstance.stop).toHaveBeenCalled();
    })

    it('updates text when speech results are received', () => {
        const { result } = renderHook(() => useSpeechRecognition());

        const mockEvent = {
            results: [
                {
                    isFinal: true,
                    0: {transcript: 'text1'}
                },
                {
                    isFinal: true,
                    0: {transcript: 'text2'}
                }
            ]
        }

        act(() => {
            mockRecognitionInstance.onresult!(mockEvent);
        })

        expect(result.current.text).toBe('text1text2');
        expect(result.current.isFinal).toBe(true);
    })

    it('restars recognition when it ends', () => {
        renderHook(() => useSpeechRecognition());

        act(() => {
            mockRecognitionInstance.onend!();
        })

        expect(mockRecognitionInstance.start).toHaveBeenCalled();
    })

    it('cleans up listeners on unmount', () => {
        const { unmount } = renderHook(() => useSpeechRecognition());

        unmount();

        expect(mockRecognitionInstance.onend).toBe(null);
        expect(mockRecognitionInstance.onresult).toBe(null);
        expect(mockRecognitionInstance.stop).toHaveBeenCalled();
    })
})