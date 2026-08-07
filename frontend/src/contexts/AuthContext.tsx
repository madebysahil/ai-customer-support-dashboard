"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setAccessToken, getAccessToken } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { disconnectSocket } from '@/hooks/useSocket';

// Simple toast helper for auth events
const showAuthToast = (message: string, isError = false) => {
  const el = document.createElement("div");
  el.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in slide-in-from-bottom-5 ${isError ? 'bg-destructive' : 'bg-green-600'}`;
  el.innerText = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add("opacity-0", "transition-opacity", "duration-500");
    setTimeout(() => el.remove(), 500);
  }, 3000);
};

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
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
  const queryClient = useQueryClient();

  const aggressiveLogout = React.useCallback(() => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    disconnectSocket();
    router.replace('/login');
  }, [queryClient, router]);

  useEffect(() => {
    const handleSessionExpired = () => {
      showAuthToast("Session expired. Please log in again.", true);
      aggressiveLogout();
    };
    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
  }, [aggressiveLogout]);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        if (!getAccessToken()) {
          // Attempt silent refresh
          const res = await api.post('/auth/refresh', {});
          if (res.ok) {
            const data = await res.json();
            setAccessToken(data.accessToken);
            if (data.user && mounted) {
              setUser(data.user);
            } else if (mounted) {
              // Fallback if backend hasn't updated yet
              const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
              setUser({ id: payload.sub, role: payload.role, email: '', fullName: '' });
            }
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
      const res = await api.post('/auth/login', credentials);
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
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      aggressiveLogout();
      showAuthToast("Signed out successfully");
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
