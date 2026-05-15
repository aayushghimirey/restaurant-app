import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '../types';

interface AuthContextValue {
  user: AuthResponse | null;
  token: string | null;
  login: (user: AuthResponse) => void;
  logout: () => void;
  switchBranch: (data: AuthResponse) => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isTenant: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const updateAuth = (data: AuthResponse) => {
    // 1. Update State
    setUser(data);
    setToken(data.token);
    
    // 2. Update LocalStorage
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    
    // 3. Ensure Axios or other side effects pick it up 
    // (handled by reload in components, but state update is immediate)
  };

  const login = (data: AuthResponse) => updateAuth(data);
  const switchBranch = (data: AuthResponse) => updateAuth(data);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    if (!token) setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout, switchBranch,
      isAuthenticated: !!token,
      isSuperAdmin: user?.userType === 'SUPER_ADMIN',
      isTenant: user?.userType !== 'SUPER_ADMIN' && user?.userType !== 'STAFF',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
