'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  ArrowUpCircle,
  History,
  Gift,
  User,
  LayoutDashboard,
  CreditCard,
  Layers,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const isNasabah = pathname.startsWith('/nasabah') || role === 'nasabah';
  const isAdmin = pathname.startsWith('/admin') || role === 'admin_bank' || role === 'admin';
  const isDashboard = isNasabah || isAdmin;

  if (!isDashboard) return null;

  const nasabahItems = [
    { label: 'Beranda', href: '/nasabah/dashboard', icon: Home },
    { label: 'Setor', href: '/nasabah/setor', icon: ArrowUpCircle },
    { label: 'Riwayat', href: '/nasabah/setor/riwayat', icon: History },
    { label: 'Tukar Poin', href: '/nasabah/hadiah', icon: Gift },
    { label: 'Akun', href: '/nasabah/akun', icon: User },
  ];

  const adminItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/admin/transaksi', icon: CreditCard },
    { label: 'Data', href: '/admin/nasabah', icon: Layers },
    { label: 'Laporan', href: '/admin/rekapitulasi', icon: FileSpreadsheet },
    { label: 'Akun', href: '/admin/profil', icon: Building },
  ];

  const items = isNasabah ? nasabahItems : isAdmin ? adminItems : [];
  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 md:hidden py-1.5 px-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/nasabah' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[56px]',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5] scale-105')} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
