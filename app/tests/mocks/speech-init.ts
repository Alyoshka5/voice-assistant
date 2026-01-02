export const mockSpeechRecognition = () => {
    class MockSpeechRecognition {
        continuous = false;
        interimResults = false;
        lang = 'en-US';
        
        onresult: ((event: any) => void) | null = null;
        onend: (() => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onstart: (() => void) | null = null;

        constructor() {
            (window as any).mockRecognitionInstance = this;
        }

        start() {
            if (this.onstart) this.onstart();
        }

        stop() {
            if (this.onend) this.onend();
        }

        abort() {
            this.stop();
        }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;
};