/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockAuthApi, type User, type Order, type Subscription, type Invoice } from '@/services/mockAuthApi';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  
  // Profile methods
  updateProfile: (updates: Partial<User['profile']>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  // Data methods
  getOrders: () => Promise<Order[]>;
  getSubscriptions: () => Promise<Subscription[]>;
  getInvoices: () => Promise<Invoice[]>;
  getDashboardStats: () => Promise<{
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    activeSubscriptions: number;
    totalSpent: number;
    pendingInvoices: number;
    recentOrders: Order[];
    recentInvoices: Invoice[];
  } | null>;
  
  // Utility
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await mockAuthApi.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await mockAuthApi.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        console.log('Welcome back!', response.message);
        return true;
      } else {
        console.error('Login failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await mockAuthApi.register(name, email, password);
      if (response.success) {
        console.log('Registration successful!', response.message);
        return true;
      } else {
        console.error('Registration failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Registration failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await mockAuthApi.logout();
      setUser(null);
      console.log('Logged out', response.message);
    } catch (error) {
      console.error('Logout failed', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await mockAuthApi.verifyEmail(token);
      if (response.success) {
        console.log('Email verified!', response.message);
        return true;
      } else {
        console.error('Verification failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Verification failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await mockAuthApi.requestPasswordReset(email);
      if (response.success) {
        console.log('Reset link sent', response.message);
        return true;
      } else {
        console.error('Request failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Request failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await mockAuthApi.resetPassword(token, newPassword);
      if (response.success) {
        console.log('Password reset!', response.message);
        return true;
      } else {
        console.error('Reset failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Reset failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User['profile']>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const response = await mockAuthApi.updateProfile(user.id, updates);
      if (response.success && response.user) {
        setUser(response.user);
        console.log('Profile updated', 'Your profile has been updated successfully.');
        return true;
      } else {
        console.error('Update failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Update failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const response = await mockAuthApi.changePassword(user.id, currentPassword, newPassword);
      if (response.success) {
        console.log('Password changed', response.message);
        return true;
      } else {
        console.error('Change failed', response.message);
        return false;
      }
    } catch (error) {
      console.error('Change failed', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get orders
  const getOrders = useCallback(async (): Promise<Order[]> => {
    if (!user) return [];
    
    try {
      const response = await mockAuthApi.getOrders(user.id);
      return response.orders || [];
    } catch (error) {
      console.error('Failed to load orders');
      return [];
    }
  }, [user]);

  // Get subscriptions
  const getSubscriptions = useCallback(async (): Promise<Subscription[]> => {
    if (!user) return [];
    
    try {
      const response = await mockAuthApi.getSubscriptions(user.id);
      return response.subscriptions || [];
    } catch (error) {
      console.error('Failed to load subscriptions');
      return [];
    }
  }, [user]);

  // Get invoices
  const getInvoices = useCallback(async (): Promise<Invoice[]> => {
    if (!user) return [];
    
    try {
      const response = await mockAuthApi.getInvoices(user.id);
      return response.invoices || [];
    } catch (error) {
      console.error('Failed to load invoices');
      return [];
    }
  }, [user]);

  // Get dashboard stats
  const getDashboardStats = useCallback(async () => {
    if (!user) return null;
    
    try {
      const response = await mockAuthApi.getDashboardStats(user.id);
      return response.stats || null;
    } catch (error) {
      console.error('Failed to load dashboard data');
      return null;
    }
  }, [user]);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await mockAuthApi.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    getOrders,
    getSubscriptions,
    getInvoices,
    getDashboardStats,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
