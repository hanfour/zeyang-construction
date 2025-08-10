import { render, screen } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message with provided text', () => {
    const errorText = 'Something went wrong';
    render(<ErrorMessage message={errorText} />);
    
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });

  it('renders with error styling', () => {
    render(<ErrorMessage message="Error" />);
    
    const errorContainer = screen.getByText('Error').parentElement;
    expect(errorContainer).toHaveClass('bg-red-50');
    expect(errorContainer).toHaveClass('border-red-200');
  });

  it('renders error icon', () => {
    render(<ErrorMessage message="Error" />);
    
    const errorIcon = screen.getByRole('img', { hidden: true });
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon.parentElement).toHaveClass('text-red-400');
  });

  it('handles long error messages', () => {
    const longMessage = 'This is a very long error message that should be displayed properly within the error component';
    render(<ErrorMessage message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});