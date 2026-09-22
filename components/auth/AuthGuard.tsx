'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: 'nasabah' | 'admin';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, token, appKey, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Protected pages: /nasabah/* and /admin/*
    const isNasabahRoute = pathname.startsWith('/nasabah');
    const isAdminRoute = pathname.startsWith('/admin');
    const isProtectedRoute = isNasabahRoute || isAdminRoute;

    if (isProtectedRoute) {
      // Protected routes require active authentication
      if (!token || !user) {
        router.replace('/login');
        return;
      }

      const userRole = user.role;
      const isNasabah = userRole === 'nasabah' || Boolean(user.nasabah);
      const isAdmin = (userRole === 'admin_bank' || userRole === 'admin' || Boolean(user.adminBank)) && !isNasabah;

      // Only redirect if the user DEFINITELY belongs to the opposite role
      if (isNasabahRoute && isAdmin && !isNasabah) {
        router.replace('/admin/dashboard');
        return;
      }

      if (isAdminRoute && isNasabah && !isAdmin) {
        router.replace('/nasabah/dashboard');
        return;
      }
    }
  }, [user, token, appKey, isLoading, pathname, router]);

  return <>{children}</>;
};

export default AuthGuard;
