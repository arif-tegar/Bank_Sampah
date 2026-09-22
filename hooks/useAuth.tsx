'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserAuthData, UserRole } from '@/types/api';
import { getAppKey, setAppKey as saveAppKey, removeAppKey, DEFAULT_APP_KEY, getToken, setToken as saveToken, getUser, setUser as saveUser, logout as clearSession, normalizeUserData } from '@/lib/auth';
import { api } from '@/lib/api-client';

interface AuthContextValue {
  appKey: string | null;
  setAppKey: (key: string) => void;
  clearAppKey: () => void;
  user: UserAuthData | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (userData: UserAuthData) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [appKey, setAppKeyState] = useState<string | null>(() => getAppKey());
  const [user, setUserState] = useState<UserAuthData | null>(() => getUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSetAppKey = useCallback((key: string) => {
    saveAppKey(key);
    setAppKeyState(key);
  }, []);

  const handleClearAppKey = useCallback(() => {
    saveAppKey(DEFAULT_APP_KEY);
    setAppKeyState(DEFAULT_APP_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    const currentKey = getAppKey();
    if (!currentToken || !currentKey) {
      setUserState(null);
      setTokenState(null);
      return;
    }
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        const fullData = normalizeUserData(res.data, currentToken);
        if (fullData) {
          saveUser(fullData);
          setUserState(fullData);
        }
      }
    } catch {
      // If 401 or failed, session is invalid
      clearSession();
      setUserState(null);
      setTokenState(null);
    }
  }, []);

  // Synchronize on mount if logged in
  useEffect(() => {
    let isMounted = true;
    const initialKey = getAppKey();
    const initialToken = getToken();
    const storedUser = getUser();

    console.log('[USE_AUTH_MOUNT]', { initialKey, initialToken, storedUser: storedUser?.username, nasabah: storedUser?.nasabah?.namaNasabah });

    if (storedUser && isMounted) {
      setUserState(storedUser);
      if (initialToken) setTokenState(initialToken);
      if (initialKey) setAppKeyState(initialKey);
    }

    if (initialKey && initialToken) {
      api.auth
        .me()
        .then((res) => {
          console.log('[USE_AUTH_ME_SUCCESS]', res.data);
          if (isMounted && res.success && res.data) {
            const fullData = normalizeUserData(res.data, initialToken);
            if (fullData) {
              saveUser(fullData);
              setUserState(fullData);
            }
          }
        })
        .catch((err) => {
          console.error('[USE_AUTH_ME_CATCH]', err);
          if (isMounted) {
            clearSession();
            setUserState(null);
            setTokenState(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((userData: unknown) => {
    const normalized = normalizeUserData(userData);
    if (!normalized) return;
    saveToken(normalized.token);
    saveUser(normalized);
    setTokenState(normalized.token);
    setUserState(normalized);

    const targetRole = normalized.role === 'nasabah' ? '/nasabah/dashboard' : '/admin/dashboard';
    router.push(targetRole);
  }, [router]);

  const logout = useCallback(() => {
    clearSession();
    setUserState(null);
    setTokenState(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        appKey,
        setAppKey: handleSetAppKey,
        clearAppKey: handleClearAppKey,
        user,
        token,
        role: user?.role || null,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
