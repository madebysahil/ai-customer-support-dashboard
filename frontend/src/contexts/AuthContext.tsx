"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setAccessToken, getAccessToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        if (!getAccessToken()) {
          // Attempt silent refresh
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setAccessToken(data.accessToken);
            // Decode JWT to get user state, or fetch /me endpoint. For simplicity, we parse JWT manually.
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            if (mounted) setUser({ id: payload.sub, role: payload.role, email: '', fullName: '' }); // Usually we'd fetch the full user profile here
          }
        }
      } catch (e) {
        console.error("Auth init failed", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();
    return () => { mounted = false; };
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, credentials);
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {});
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
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
