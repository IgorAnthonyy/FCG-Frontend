import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';

interface DecodedToken {
  sub?: string;
  nameid?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  name?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  email?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  role?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUserContext: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fcg_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fcg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const decodeAndSetUser = (jwtToken: string, fallbackEmail?: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(jwtToken);
      
      const id = decoded.sub || 
                 decoded.nameid || 
                 decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                 '';

      const name = decoded.name || 
                   decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                   'Usuário';

      const email = decoded.email || 
                    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
                    fallbackEmail || 
                    '';

      const rawRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User';
      const role = Array.isArray(rawRole)
        ? (rawRole.some(r => String(r).toUpperCase() === 'ADMIN') ? 'Admin' : rawRole[0])
        : (String(rawRole).toUpperCase() === 'ADMIN' ? 'Admin' : rawRole);

      const userData: User = { id, name, email, role };
      setUser(userData);
      localStorage.setItem('fcg_user', JSON.stringify(userData));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const handleLogoutEvent = () => logout();
    window.addEventListener('fcg_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('fcg_auth_logout', handleLogoutEvent);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const res = await authService.login(credentials);
    if (res.token) {
      localStorage.setItem('fcg_token', res.token);
      setToken(res.token);
      decodeAndSetUser(res.token, credentials.email);
    }
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    localStorage.removeItem('fcg_token');
    localStorage.removeItem('fcg_user');
    setToken(null);
    setUser(null);
  };

  const updateUserContext = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('fcg_user', JSON.stringify(newUser));
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
