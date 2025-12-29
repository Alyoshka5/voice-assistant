import { render, screen } from '@testing-library/react';
import ConversationInfo from './ConversationInfo';
import React from 'react';

describe('ConversationInfo', () => {
    it('renders conversation with correct content', () => {
        const userInput = 'user input text';
        const assistantResponse = 'assistant response text';
        const displayPanel = <div>display panel content</div>;
        
        render(<ConversationInfo
            displayText={userInput}
            assistantResponseText={assistantResponse}
            displayPanel={displayPanel}
        />);
            
        expect(screen.getByText(userInput)).toBeInTheDocument();
        expect(screen.getByText(assistantResponse)).toBeInTheDocument();
        expect(screen.getByText('display panel content')).toBeInTheDocument();
    })
})