'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthApi } from '../../lib/api';
import { prefetchData } from '../../lib/prefetch';

interface AuthContextType {
  isLoggedIn: boolean;
  isChecking: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check auth only once on app mount
  useEffect(() => {
    const checkAuth = async () => {
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
    };
    checkAuth();
  }, []); // Only runs once!

  return (
    <AuthContext.Provider value={{ isLoggedIn, isChecking, userRole }}>
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
