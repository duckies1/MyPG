'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthApi } from '../../lib/api';
import { prefetchData } from '../../lib/prefetch';

interface AuthContextType {
  isLoggedIn: boolean;
  isChecking: boolean;
  userRole: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    setIsChecking(true);
    try {
      const user = await AuthApi.getMe();
      setIsLoggedIn(true);
      setUserRole(user.role);
      // Prefetch all data for authenticated user in background
      prefetchData.allForAuth();
    } catch {
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check auth ONLY on mount (once per session)
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isChecking, userRole, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
