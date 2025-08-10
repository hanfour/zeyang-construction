import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/auth.service';

// Mock the auth service
jest.mock('../../services/auth.service');

const TestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.username : 'No User'}</div>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('provides authentication state', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('loads user from token on mount', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', role: 'viewer' };
    const mockToken = 'test-token';
    
    localStorage.setItem('accessToken', mockToken);
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('handles login', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', role: 'viewer' };
    const mockResponse = {
      user: mockUser,
      accessToken: 'test-token',
      refreshToken: 'refresh-token'
    };
    
    (authService.login as jest.Mock).mockResolvedValue(mockResponse);
    
    const LoginTestComponent = () => {
      const { login, user } = useAuth();
      
      return (
        <div>
          <button onClick={() => login('testuser', 'password')}>Login</button>
          <div data-testid="user">{user ? user.username : 'No User'}</div>
        </div>
      );
    };
    
    renderWithProviders(<LoginTestComponent />);
    
    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
    
    expect(localStorage.getItem('accessToken')).toBe('test-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
  });

  it('handles logout', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', role: 'viewer' };
    localStorage.setItem('accessToken', 'test-token');
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    const LogoutTestComponent = () => {
      const { logout, user } = useAuth();
      
      return (
        <div>
          <button onClick={logout}>Logout</button>
          <div data-testid="user">{user ? user.username : 'No User'}</div>
        </div>
      );
    };
    
    renderWithProviders(<LogoutTestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
    
    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      logoutButton.click();
    });
    
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('handles authentication error', async () => {
    localStorage.setItem('accessToken', 'invalid-token');
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});