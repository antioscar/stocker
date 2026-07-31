// Hook de autenticación para React
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/auth';
import type { LoginRequest } from '../types/api';
import type { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser(authService.getToken()!);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      authService.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    authService.setToken(response.token);
    const userData = await authService.getCurrentUser(response.token);
    setUser(userData);
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
