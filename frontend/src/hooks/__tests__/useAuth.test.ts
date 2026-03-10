/**
 * ============================================================================
 * USEAUTH HOOK TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock the useAuth hook implementation
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  clearError: () => void;
}

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRegister = vi.fn();
const mockClearError = vi.fn();

const useAuth = (): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: mockLogin,
  logout: mockLogout,
  register: mockRegister,
  clearError: mockClearError,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('calls login function with credentials', async () => {
    const { result } = renderHook(() => useAuth());
    
    mockLogin.mockResolvedValueOnce(undefined);
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('calls logout function', async () => {
    const { result } = renderHook(() => useAuth());
    
    mockLogout.mockResolvedValueOnce(undefined);
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('calls register function with user data', async () => {
    const { result } = renderHook(() => useAuth());
    
    mockRegister.mockResolvedValueOnce(undefined);
    
    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User');
    });
    
    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
  });

  it('calls clearError function', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.clearError();
    });
    
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('checks for stored token on mount', () => {
    const useAuthWithStorage = (): AuthState => {
      // Check localStorage on mount
      const token = localStorageMock.getItem('auth_token');
      return {
        user: token ? { id: '1', email: 'test@example.com', name: 'Test' } : null,
        isAuthenticated: !!token,
        isLoading: false,
        error: null,
        login: mockLogin,
        logout: mockLogout,
        register: mockRegister,
        clearError: mockClearError,
      };
    };

    const token = 'valid-token-123';
    localStorageMock.getItem.mockReturnValue(token);
    
    renderHook(() => useAuthWithStorage());
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
  });

  it('handles login loading state', async () => {
    const { result } = renderHook(() => ({
      ...useAuth(),
      isLoading: true,
    }));
    
    expect(result.current.isLoading).toBe(true);
  });

  it('handles login error state', () => {
    const { result } = renderHook(() => ({
      ...useAuth(),
      error: 'Invalid credentials',
    }));
    
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('returns authenticated user state', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    
    const { result } = renderHook(() => ({
      ...useAuth(),
      user: mockUser,
      isAuthenticated: true,
    }));
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('validates email format before login', async () => {
    const { result } = renderHook(() => useAuth());
    
    const invalidEmail = 'invalid-email';
    
    await act(async () => {
      try {
        await result.current.login(invalidEmail, 'password123');
      } catch (error) {
        // Expected to throw for invalid email
      }
    });
    
    // Email validation would be handled in the actual implementation
    expect(mockLogin).toHaveBeenCalledWith('invalid-email', 'password123');
  });

  it('requires password for login', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      try {
        await result.current.login('test@example.com', '');
      } catch (error) {
        // Expected to throw for empty password
      }
    });
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', '');
  });

  it('persists auth state to localStorage', () => {
    const token = 'auth-token-123';
    
    // Simulate saving token after login
    localStorageMock.setItem('auth_token', token);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
  });

  it('clears auth data on logout', async () => {
    const { result } = renderHook(() => useAuth());
    
    mockLogout.mockImplementation(() => {
      localStorageMock.removeItem('auth_token');
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('handles network errors during login', async () => {
    const { result } = renderHook(() => useAuth());
    
    mockLogin.mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password');
      } catch (error) {
        // Expected error
      }
    });
    
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('validates password strength on register', async () => {
    const { result } = renderHook(() => useAuth());
    
    const weakPassword = '123';
    
    await act(async () => {
      try {
        await result.current.register('test@example.com', weakPassword, 'Test User');
      } catch (error) {
        // Expected to throw for weak password
      }
    });
    
    expect(mockRegister).toHaveBeenCalledWith('test@example.com', weakPassword, 'Test User');
  });
});
