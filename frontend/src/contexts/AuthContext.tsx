"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setAccessToken, getAccessToken } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from "@/components/ui/toaster"

// Simple toast helper for auth events
const showAuthToast = (message: string, isError = false) => {
  toast({
    title: message,
    variant: isError ? "destructive" : "success"
  })
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
    
    // Decoupled notification: informs any active socket connection to terminate
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
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
      } catch (e: any) {
        // Only log non-401 errors to avoid Next.js dev overlay for expected "Missing refresh token"
        if (e?.status !== 401) {
          console.error("Auth init failed", e);
        }
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
