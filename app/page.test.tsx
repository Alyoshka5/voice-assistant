import { render, screen } from '@testing-library/react';
import Home from './page';
import userEvent from '@testing-library/user-event';

vi.mock('./fonts', () => ({
    default: {
        className: ''
    }
}));

const { mockGoogleSignIn } = vi.hoisted(() => ({
    mockGoogleSignIn: vi.fn()
}))

vi.mock('@/app/actions/google-signin', () => ({
    default: mockGoogleSignIn
}));

describe('Home', () => {
    it('renders welcome header', () => {
        render(<Home />);

        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    })

    it('calls googleSignIn when sign in button clicked', async () => {
        const user = userEvent.setup();

        render(<Home />);
        
        await user.click(screen.getByRole('button', { name: /google/i }));
        expect(mockGoogleSignIn).toHaveBeenCalled();
    })
})