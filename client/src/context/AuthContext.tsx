import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';
import { storage } from '../utils/storage';
import { AdminUser, LoginRequest, LoginResponse } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = storage.getToken();
    const savedUser = storage.getUser();

    if (token && savedUser) {
      setUser(savedUser);
      // Verify token is still valid
      api
        .get('/api/auth/me')
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.data);
            storage.setUser(response.data.data);
          }
        })
        .catch(() => {
          storage.clear();
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await api.post<{ success: true; data: LoginResponse }>(
      '/api/auth/login',
      credentials
    );

    if (response.data.success) {
      const { token, user } = response.data.data;
      storage.setToken(token);
      storage.setUser(user);
      setUser(user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
