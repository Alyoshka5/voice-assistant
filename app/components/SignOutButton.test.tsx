import { render, screen } from '@testing-library/react';
import SignOutButton from './SignOutButton';
import userEvent from '@testing-library/user-event';
import React from 'react';

const { mockSignOut } = vi.hoisted(() => ({
    mockSignOut: vi.fn()
}))

vi.mock('@/app/actions/signout', () => ({
    default: mockSignOut
}));

describe('SignOutButton', () => {
    it('calls signOut function when user clicks sign out button', async () => {
        const user = userEvent.setup();

        render(<SignOutButton />);

        await user.click(screen.getByRole('button'));
        expect(mockSignOut).toHaveBeenCalled();
    })
})