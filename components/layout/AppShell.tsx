'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  // Automatically close sidebar on route navigation
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Standalone full-screen pages (Landing, Login, Register)
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  const isDashboardRoute = pathname.startsWith('/nasabah') || pathname.startsWith('/admin');

  return (
    <div
      className="min-h-screen font-sans selection:bg-emerald-500/20 text-slate-800 antialiased relative"
      style={{
        background:
          'linear-gradient(135deg, rgb(193, 238, 215) 0%, rgb(212, 245, 229) 35%, rgb(226, 249, 239) 70%, rgb(238, 252, 246) 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Sidebar - fixed at left-0 (z-50) */}
      {isDashboardRoute && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Content wrapper with md:pl-[290px] when sidebar is active */}
      <div className={cn('min-h-screen flex flex-col', isDashboardRoute ? 'md:pl-[290px]' : '')}>
        {/* Navbar - fixed top-0 left-0 md:left-[290px] right-0 (z-40) */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Main Content: pt-28 offsets fixed 80px navbar with 32px top margin */}
        <main className="flex-1 w-full pt-28 pb-20 md:pb-12 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
