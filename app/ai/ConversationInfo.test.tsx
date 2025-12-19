import { render, screen } from '@testing-library/react';
import ConversationInfo from './ConversationInfo';
import React from 'react';

describe('ConversationInfo', () => {
    it('renders conversation when assistant is activated', () => {
        const userInput = 'user input text';
        const assistantResponse = 'assistant response text';
        const displayPanel = <div>display panel content</div>;
        
        render(<ConversationInfo
            assistantActivated={true}
            displayText={userInput}
            assistantResponseText={assistantResponse}
            displayPanel={displayPanel}
        />);
            
        expect(screen.getByText(userInput)).toBeInTheDocument();
        expect(screen.getByText(assistantResponse)).toBeInTheDocument();
        expect(screen.getByText('display panel content')).toBeInTheDocument();
    })
        
    it('it does not render conversation when assistant is not activated', () => {
        const userInput = 'user input text';
        const assistantResponse = 'assistant response text';
        const displayPanel = <div>display panel content</div>;
        
        render(<ConversationInfo
            assistantActivated={false}
            displayText={userInput}
            assistantResponseText={assistantResponse}
            displayPanel={displayPanel}
        />);
            
        expect(screen.queryByText(userInput)).not.toBeInTheDocument();
        expect(screen.queryByText(assistantResponse)).not.toBeInTheDocument();
        expect(screen.queryByText('display panel content')).not.toBeInTheDocument();
    })
})