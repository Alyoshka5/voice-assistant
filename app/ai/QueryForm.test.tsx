import { render, screen } from '@testing-library/react';
import QueryForm from './QueryForm';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('QueryForm', () => {
    it('renders form when assistant is activated', () => {
        const mockFormHandler = vi.fn();
        const mockSetState = vi.fn();

        render(<QueryForm
            handleQueryFormSubmit={mockFormHandler}
            formInputValue=''
            setFormInputValue={mockSetState}
        />);

        expect(screen.getByRole('form')).toBeInTheDocument();
    })

    it('calls setFormInputValue with correct data when user types', async () => {
        const mockFormHandler = vi.fn();
        const mockSetState = vi.fn();
        const user = userEvent.setup();

        render(<QueryForm
            handleQueryFormSubmit={mockFormHandler}
            formInputValue=''
            setFormInputValue={mockSetState}
        />);

        expect(mockSetState).not.toHaveBeenCalled();
        await user.type(screen.getByRole('textbox'), 'hi');
        expect(mockSetState).toHaveBeenCalledWith('h');
        expect(mockSetState).toHaveBeenCalledWith('i');
    })
    
    it('updates input value with correct data when user types', async () => {
        const mockFormHandler = vi.fn();
        const user = userEvent.setup();
    
        const TestWrapper = () => {
            const [val, setVal] = React.useState('');
            return (
                <QueryForm 
                    handleQueryFormSubmit={mockFormHandler} 
                    formInputValue={val} 
                    setFormInputValue={setVal} 
                />
            );
        };
        render(<TestWrapper />)

        const input = screen.getByRole('textbox');
        await user.type(input, 'hi');
        expect(input).toHaveValue('hi');
        expect(input).not.toHaveValue('h');
        expect(input).not.toHaveValue('i');
    })
    
    it('submits form when user clicks submit button', async () => {
        const mockFormHandler = vi.fn();
        const mockSetState = vi.fn();
        const user = userEvent.setup();
    
        render(<QueryForm
            handleQueryFormSubmit={mockFormHandler}
            formInputValue=''
            setFormInputValue={mockSetState}
        />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'hi');
        await user.click(screen.getByRole('button'));
        expect(mockFormHandler).toHaveBeenCalled();
    })

    it('submits form when user presses enter key', async () => {
        const mockFormHandler = vi.fn();
        const mockSetState = vi.fn();
        const user = userEvent.setup();
    
        render(<QueryForm
            handleQueryFormSubmit={mockFormHandler}
            formInputValue=''
            setFormInputValue={mockSetState}
        />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'hi');
        await user.keyboard('{Enter}');
        expect(mockFormHandler).toHaveBeenCalled();
    })
})