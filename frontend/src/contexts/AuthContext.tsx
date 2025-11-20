import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGet, apiPost } from '../services/api';

interface User {
  id: string;
  username: string;
  full_name?: string;
  role?: string;
  is_super_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('[AuthContext] Checking auth status...');
      const data = await apiGet('/api/auth/status');
      console.log('[AuthContext] Auth status response:', data);

      if (data.authenticated) {
        console.log('[AuthContext] User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('[AuthContext] User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await apiPost('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
