import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AdminUser } from '../types';
import { currentAdmin } from '../data/mockData';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_auth_token');
    if (storedToken) {
      // In production: Validate token with backend `/auth/me`
      // For mock: assume token is valid and load mock user
      setToken(storedToken);
      setUser(currentAdmin); 
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // In production: Call apiRequest('/auth/login', { method: 'POST', body: ... })
    // For mock: Simulate network and set hardcoded user
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@tutorrobot.ai' && pass === 'password') {
          const fakeToken = 'mock_jwt_token_12345';
          localStorage.setItem('admin_auth_token', fakeToken);
          setToken(fakeToken);
          setUser(currentAdmin);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    // In production: Optionally call apiRequest('/auth/logout') to invalidate session
    localStorage.removeItem('admin_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
