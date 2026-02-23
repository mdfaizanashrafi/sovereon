/**
 * Admin Context
 * Provides admin authentication state throughout the admin panel
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/adminApi';

interface AdminUser {
  id: string;
  username: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const initAdmin = async () => {
      try {
        const response = await adminApi.getCurrentAdmin();
        if (response.success && response.data) {
          setAdmin(response.data as AdminUser);
        }
      } catch (error) {
        console.error('Admin initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAdmin();
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await adminApi.login(username, password);
      if (response.success && response.data) {
        setAdmin(response.data as AdminUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await adminApi.logout();
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh admin data
  const refreshAdmin = useCallback(async (): Promise<void> => {
    try {
      const response = await adminApi.getCurrentAdmin();
      if (response.success && response.data) {
        setAdmin(response.data as AdminUser);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error('Refresh admin error:', error);
      setAdmin(null);
    }
  }, []);

  const value: AdminContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    refreshAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

// Custom hook to use admin context
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;
