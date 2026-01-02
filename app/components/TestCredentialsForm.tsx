'use client'

import { signIn } from 'next-auth/react';

export default function TestCredentialsForm() {
    return (
        <div style={{ marginTop: '20px', padding: '10px', color: 'white' }}>
            <h3>Test Environment Detected</h3>
            <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    await signIn('credentials', {
                        username: formData.get('username'),
                        redirectTo: '/ai',
                    });
            }}>
                <input name="username" placeholder="Enter 'testuser'" defaultValue="testuser" />
                <button type="submit" data-testid="test-login-submit">Login as Test User</button>
            </form>
        </div>
    );
}