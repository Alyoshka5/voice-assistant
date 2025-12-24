import { beforeEach } from 'vitest';
import convertToSpeech from './convertTextToSpeech';

const mocks = vi.hoisted(() => ({
    synthesizeSpeech: vi.fn()
}));

vi.mock('@google-cloud/text-to-speech', () => {
    const MockClient = function() {}
    
    MockClient.prototype.synthesizeSpeech = mocks.synthesizeSpeech

    return {
        default: {
            TextToSpeechClient: MockClient
        }
    }
});

describe('convertToSpeech', () => {
    const mockText = 'text to convert';
    const mockAudioData = 'mock audio data';

    beforeEach(() => {
        vi.clearAllMocks();

        mocks.synthesizeSpeech.mockResolvedValue([
            { audioContent: Buffer.from(mockAudioData) }
        ]);
    });

    it('requests correct configuration from Google API', async () => {
        await convertToSpeech(mockText);

        expect(mocks.synthesizeSpeech).toHaveBeenCalledWith(expect.objectContaining({
            input: { text: mockText },
            voice: expect.objectContaining({
                languageCode: 'en-US',
                name: expect.any(String)
            }),
            audioConfig: expect.objectContaining({
                audioEncoding: 'MP3',
                model: expect.any(String),
            })
        }));
    })

    it('converts audio buffer to a base64 string', async() => {
        const result = await convertToSpeech(mockText);

        expect(result).toBe(Buffer.from(mockAudioData).toString('base64'));
    })

    it('returns undefined if no audio content is received', async () => {
        mocks.synthesizeSpeech.mockResolvedValue([
            { audioContent: null }
        ]);

        const result = await convertToSpeech(mockText);

        expect(result).toBeUndefined();
    })

    it('handles Google API errors', async () => {
        mocks.synthesizeSpeech.mockRejectedValue(new Error('API Error'));

        const result = await convertToSpeech(mockText);

        expect(result).toBeNull();
    });
})