import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin } from '../services/api';

interface Admin {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  admin: null, token: null, isAuthenticated: false,
  login: async () => {}, logout: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('sentinel_token');
    const savedAdmin = localStorage.getItem('sentinel_admin');
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const { access_token, admin: adminData } = res.data;
    setToken(access_token);
    setAdmin(adminData);
    localStorage.setItem('sentinel_token', access_token);
    localStorage.setItem('sentinel_admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_admin');
  };

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
