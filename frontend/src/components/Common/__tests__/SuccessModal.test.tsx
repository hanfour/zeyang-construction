import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuccessModal from '../SuccessModal';

// Mock AOS
jest.mock('aos', () => ({
  init: jest.fn(),
  refresh: jest.fn(),
}));

describe('SuccessModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: '成功！',
    message: '您的訊息已經成功送出。',
    autoCloseDelay: 1500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly when open', () => {
    render(<SuccessModal {...defaultProps} />);
    
    expect(screen.getByText('成功！')).toBeInTheDocument();
    expect(screen.getByText('您的訊息已經成功送出。')).toBeInTheDocument();
    expect(screen.getByText('確認')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SuccessModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('成功！')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<SuccessModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('確認'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after specified delay', () => {
    const onClose = jest.fn();
    render(<SuccessModal {...defaultProps} onClose={onClose} autoCloseDelay={1500} />);
    
    expect(onClose).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1500);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(<SuccessModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows progress indicator when autoCloseDelay is provided', () => {
    render(<SuccessModal {...defaultProps} autoCloseDelay={1500} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('does not show progress indicator when autoCloseDelay is 0', () => {
    render(<SuccessModal {...defaultProps} autoCloseDelay={0} />);
    
    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });
});