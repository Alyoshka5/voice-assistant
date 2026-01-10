/** @vitest-environment jsdom */
import { render, screen, waitFor, act } from '@testing-library/react';
import { beforeEach } from 'vitest';
import Assistant from './page';
import userEvent from '@testing-library/user-event';
import * as useSpeechHook from '@/app/hooks/useSpeechRecognition';

const mockStartListening = vi.fn();
const mockStopListening = vi.fn();
const mockGetResponse = vi.fn();
const mockPlaySpeech = vi.fn();
const mockInitAudio = vi.fn();

vi.mock('@/app/hooks/useOpenAI', () =>({
    default: () => ({
        getResponse: mockGetResponse
    })
}));

vi.mock('@/app/hooks/useSpeechRecognition', () => ({
    default: () => ({
        text: '',
        isFinal: false,
        startListening: mockStartListening,
        stopListening: mockStopListening
    })
}));

vi.mock('../hooks/usePlaySpeech', () => ({
    default: () => ({
        initAudio: mockInitAudio,
        playSpeech: mockPlaySpeech,
        getAmplitude: () => 0
    })
}))

vi.mock('@/app/components/ParticleOrb', () => ({
    default: () => <div data-testid="mock-orb" />
}));

const { mockGoogleSignIn } = vi.hoisted(() => ({
    mockGoogleSignIn: vi.fn()
}));

vi.mock('@/app/actions/google-signin', () => ({
    default: mockGoogleSignIn
}));

vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: { user: { name: 'firstname lastname' } },
        status: 'authenticated',
    }),
}));

// browser APIs
const mockCoordinates = {
    latitude: 49.2382,
    longitude: -104.3823
}
const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementation(success => success({
        coords: {
            latitude: mockCoordinates.latitude,
            longitude: mockCoordinates.longitude
        }
    }))
}
Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    configurable: true,
    writable: true
})

describe('Assistant', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it('renders particle orb and menu buttons before activation', () => {
        render(<Assistant />);

        expect(screen.getByRole('button', { name: 'Activate Assistant' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
        expect(screen.getByTestId('mock-orb')).toBeInTheDocument();
    })

    it('requests geolocation on mount', () => {
        render(<Assistant />);

        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    })

    it('displays welcome message on load', async () => {
        render(<Assistant />);

        const welcomeMessage = await screen.findByTestId('assistant-response');

        expect(welcomeMessage).toBeInTheDocument();
        expect(welcomeMessage.textContent).toMatch(/firstname/i);
    })

    it('activates assistant and renders conversation content when activation button is clicked', async () => {
        const user = userEvent.setup();

        render(<Assistant />);

        await user.click(screen.getByRole('button', { name: 'Activate Assistant' }));
        expect(screen.getByTestId('conversation-content')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(mockStartListening).toHaveBeenCalled();
        expect(mockInitAudio).toHaveBeenCalled();
    })

    it('handles text input and displays conversation', async () => {
        const userMessage = 'How are you doing?';
        const assistantMessage = 'I am doing great! How about you?';
        mockGetResponse.mockResolvedValue({
            outputText: assistantMessage
        });
        const user = userEvent.setup();

        render(<Assistant />);

        await user.click(screen.getByRole('button', { name: 'Activate Assistant' }));
        await user.type(screen.getByRole('textbox'), userMessage);
        await user.click(screen.getByRole('button', { name: 'Submit Query' }));
        expect(mockGetResponse).toHaveBeenCalledWith(
            userMessage,
            expect.objectContaining({
                coordinates: { latitude: mockCoordinates.latitude, longitude: mockCoordinates.longitude }
            })
        );
        await waitFor(() => {
            expect(screen.getByText(userMessage)).toBeInTheDocument();
            expect(screen.getByText(assistantMessage)).toBeInTheDocument();
        });
    })

    it('triggers response and displays conversation when wake word is detected', async () => {
        const userMessage = 'How are you doing?';
        const assistantMessage = 'I am doing great! How about you?';
        mockGetResponse.mockResolvedValue({
            outputText: assistantMessage
        });

        const { rerender } = render(<Assistant />);

        vi.spyOn(useSpeechHook, 'default').mockReturnValue({
            text: 'apex ' + userMessage,
            isFinal: false,
            startListening: mockStartListening,
            stopListening: mockStopListening
        });
        rerender(<Assistant />);

        vi.spyOn(useSpeechHook, 'default').mockReturnValue({
            text: 'apex ' + userMessage,
            isFinal: true,
            startListening: mockStartListening,
            stopListening: mockStopListening
        });
        rerender(<Assistant />);

        await waitFor(() => {
            expect(mockGetResponse).toHaveBeenCalledWith(
                expect.stringContaining(userMessage),
                expect.any(Object)
            );
            expect(screen.getByText(userMessage)).toBeInTheDocument();
            expect(screen.getByText(assistantMessage)).toBeInTheDocument();
        })
    })

    it('renders Youtube player panel when assistant requests the action', async () => {
        mockGetResponse.mockResolvedValue({
            outputText: 'Here is "How to fry eggs" by HowToCook',
            action: 'displayYoutubeVideo',
            details: {
                videoId: 'video-id'
            }
        });
        const user = userEvent.setup();

        render(<Assistant />);

        await user.click(screen.getByRole('button', { name: 'Activate Assistant' }));
        await user.type(screen.getByRole('textbox'), 'Find a video on how to fry eggs');
        await user.click(screen.getByRole('button', { name: 'Submit Query' }));
        await waitFor(() => {
            expect(screen.getByTestId('player-wrapper')).toBeInTheDocument();
        })
    })

    it('renders current weather panel when assistant requests the action', async () => {
        mockGetResponse.mockResolvedValue({
            outputText: 'It is currently cloudy with a temperature of 20 degrees',
            action: 'displayCurrentWeatherTab',
            details: {
                weatherIcon: 'http://iconuri.com',
                description: 'cloudy',
                temperature: 20,
                feelsLike: 21,
                precipitation: 0,
                windSpeed: 2
            }
        });
        const user = userEvent.setup();

        render(<Assistant />);

        await user.click(screen.getByRole('button', { name: 'Activate Assistant' }));
        await user.type(screen.getByRole('textbox'), 'What\' the weather?');
        await user.click(screen.getByRole('button', { name: 'Submit Query' }));
        await waitFor(() => {
            expect(screen.getByTestId('current-weather-panel')).toBeInTheDocument();
            expect(screen.getByText('cloudy')).toBeInTheDocument();
            expect(screen.getByText(/20°/)).toBeInTheDocument();
        })
    })

    it('renders future weather forecast panel when assistant requests the action', async () => {
        mockGetResponse.mockResolvedValue({
            outputText: 'Tomorrow it is sunny with a high of 25 degrees',
            action: 'displayForecastWeatherTab',
            details: {
                weatherIcon: 'http://iconuri.com',
                weatherDescription: 'sunny',
                maxTemperature: 25,
                minTemperature: 10,
                displayDate: '12/30/2024'
            }
        });
        const user = userEvent.setup();

        render(<Assistant />);

        await user.click(screen.getByRole('button', { name: 'Activate Assistant' }));
        await user.type(screen.getByRole('textbox'), 'What\' the weather tomorrow?');
        await user.click(screen.getByRole('button', { name: 'Submit Query' }));
        await waitFor(() => {
            expect(screen.getByTestId('future-weather-forecast-panel')).toBeInTheDocument();
            expect(screen.getByText('sunny')).toBeInTheDocument();
            expect(screen.getByText(/25°/)).toBeInTheDocument();
            expect(screen.getByText(/10°/)).toBeInTheDocument();
        });
    })
})