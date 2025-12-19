import { render, screen } from '@testing-library/react';
import ActivationButton from './ActivationButton';
import userEvent from '@testing-library/user-event';

describe('ActivationButton', () => {
    it('renders button when assistant is not activated', () => {
        const mockSetState = vi.fn();
        const mockInitAudio = vi.fn();
        
        render(<ActivationButton
            assistantActivated={false}
            setAssistantActivated={mockSetState}
            initAudio={mockInitAudio}
        />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    })

    it('does not render button when assistant is activated', () => {
        const mockSetState = vi.fn();
        const mockInitAudio = vi.fn();
        
        render(<ActivationButton
            assistantActivated={true}
            setAssistantActivated={mockSetState}
            initAudio={mockInitAudio}
        />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    })

    it('calls required functions when the button is clicked', async () => {
        const user = userEvent.setup();
        const mockSetState = vi.fn();
        const mockInitAudio = vi.fn();

        render(<ActivationButton
            assistantActivated={false}
            setAssistantActivated={mockSetState}
            initAudio={mockInitAudio}
        />);

        await user.click(screen.getByRole('button'));

        expect(mockSetState).toHaveBeenCalledWith(true);
        expect(mockInitAudio).toHaveBeenCalled();
    })
})