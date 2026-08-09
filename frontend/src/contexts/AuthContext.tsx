import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PASSENGER' | 'DRIVER' | 'OPERATOR' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('cs_token');
    const storedUser = localStorage.getItem('cs_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Connect socket and join user room
        const socket = getSocket();
        const u = JSON.parse(storedUser) as User;
        socket.emit('join:user', u.id);
        if (u.role === 'OPERATOR' || u.role === 'ADMIN') {
          socket.emit('join:operator');
        }
      } catch {
        localStorage.removeItem('cs_token');
        localStorage.removeItem('cs_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log('AuthContext: login function called with email:', email);
    try {
      console.log('AuthContext: calling api.post("/auth/login")');
      const res = await api.post('/auth/login', { email, password });
      console.log('AuthContext: api.post response received:', res.status, res.data);
      const { token: t, user: u } = res.data.data;
      localStorage.setItem('cs_token', t);
      localStorage.setItem('cs_user', JSON.stringify(u));
      setToken(t);
      setUser(u);

      const socket = getSocket();
      socket.emit('join:user', u.id);
      if (u.role === 'OPERATOR' || u.role === 'ADMIN') {
        socket.emit('join:operator');
      }
    } catch (apiErr) {
      console.error('AuthContext: api.post threw an error:', apiErr);
      throw apiErr;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('cs_token', t);
    localStorage.setItem('cs_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    getSocket().emit('join:user', u.id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
