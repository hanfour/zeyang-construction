import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Contact from '../Contact/index';

// Mock AOS
jest.mock('aos', () => ({
  init: jest.fn(),
  refresh: jest.fn(),
}));

// Mock API calls
jest.mock('@/api/contact', () => ({
  submitContactForm: jest.fn(),
}));

// Mock components
jest.mock('@/components/Layout/PageBanner', () => {
  return function PageBanner({ children, config }: any) {
    return (
      <div data-testid="page-banner">
        <div>{config.logoSection.title}</div>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/Layout/MenuButton', () => {
  return function MenuButton({ isOpen, onClick }: any) {
    return <button onClick={onClick} data-testid="menu-button">Menu</button>;
  };
});

jest.mock('@/components/Layout/NavigationMenu', () => {
  return function NavigationMenu({ isOpen, onClose }: any) {
    return isOpen ? <div data-testid="navigation-menu">Navigation</div> : null;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Contact Page', () => {
  const { submitContactForm } = require('@/api/contact');
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    submitContactForm.mockResolvedValue({ success: true });
  });

  it('renders contact form with all required fields', () => {
    renderWithProviders(<Contact />);
    
    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/電話/)).toBeInTheDocument();
    expect(screen.getByLabelText(/電子郵件/)).toBeInTheDocument();
    expect(screen.getByLabelText(/主旨/)).toBeInTheDocument();
    expect(screen.getByLabelText(/訊息內容/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /送出/ })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    renderWithProviders(<Contact />);
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('姓名為必填欄位')).toBeInTheDocument();
      expect(screen.getByText('電話為必填欄位')).toBeInTheDocument();
      expect(screen.getByText('電子郵件為必填欄位')).toBeInTheDocument();
      expect(screen.getByText('主旨為必填欄位')).toBeInTheDocument();
      expect(screen.getByText('訊息內容為必填欄位')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderWithProviders(<Contact />);
    
    const emailInput = screen.getByLabelText(/電子郵件/);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('請輸入有效的電子郵件格式')).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    renderWithProviders(<Contact />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/姓名/), '張三');
    await user.type(screen.getByLabelText(/電話/), '0912345678');
    await user.type(screen.getByLabelText(/電子郵件/), 'test@example.com');
    await user.type(screen.getByLabelText(/主旨/), '詢問建案');
    await user.type(screen.getByLabelText(/訊息內容/), '我想了解更多關於建案的資訊');
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith({
        name: '張三',
        phone: '0912345678',
        email: 'test@example.com',
        subject: '詢問建案',
        message: '我想了解更多關於建案的資訊'
      });
    });
  });

  it('shows success modal after successful submission', async () => {
    renderWithProviders(<Contact />);
    
    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/姓名/), '張三');
    await user.type(screen.getByLabelText(/電話/), '0912345678');
    await user.type(screen.getByLabelText(/電子郵件/), 'test@example.com');
    await user.type(screen.getByLabelText(/主旨/), '詢問建案');
    await user.type(screen.getByLabelText(/訊息內容/), '我想了解更多關於建案的資訊');
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('訊息發送成功！')).toBeInTheDocument();
      expect(screen.getByText('您的訊息已經成功送出，我們會盡快回覆您。')).toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    renderWithProviders(<Contact />);
    
    const nameInput = screen.getByLabelText(/姓名/) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/電話/) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/電子郵件/) as HTMLInputElement;
    const subjectInput = screen.getByLabelText(/主旨/) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/訊息內容/) as HTMLTextAreaElement;
    
    // Fill out the form
    await user.type(nameInput, '張三');
    await user.type(phoneInput, '0912345678');
    await user.type(emailInput, 'test@example.com');
    await user.type(subjectInput, '詢問建案');
    await user.type(messageInput, '我想了解更多關於建案的資訊');
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(phoneInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(subjectInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });
  });

  it('handles submission error gracefully', async () => {
    submitContactForm.mockRejectedValue(new Error('Network Error'));
    renderWithProviders(<Contact />);
    
    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/姓名/), '張三');
    await user.type(screen.getByLabelText(/電話/), '0912345678');
    await user.type(screen.getByLabelText(/電子郵件/), 'test@example.com');
    await user.type(screen.getByLabelText(/主旨/), '詢問建案');
    await user.type(screen.getByLabelText(/訊息內容/), '我想了解更多關於建案的資訊');
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('發送失敗，請稍後再試')).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    // Make API call take some time
    submitContactForm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    renderWithProviders(<Contact />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/姓名/), '張三');
    await user.type(screen.getByLabelText(/電話/), '0912345678');
    await user.type(screen.getByLabelText(/電子郵件/), 'test@example.com');
    await user.type(screen.getByLabelText(/主旨/), '詢問建案');
    await user.type(screen.getByLabelText(/訊息內容/), '我想了解更多關於建案的資訊');
    
    const submitButton = screen.getByRole('button', { name: /送出/ });
    await user.click(submitButton);
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('送出中...')).toBeInTheDocument();
  });
});