'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Layers,
  ArrowUpRight,
  History,
  Gift,
  Receipt,
  User,
  Users,
  CheckSquare,
  FileSpreadsheet,
  Building,
  LogOut,
  X,
  CreditCard,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const isNasabah = pathname.startsWith('/nasabah') || role === 'nasabah' || Boolean(user?.nasabah);
  const isAdmin = (pathname.startsWith('/admin') || role === 'admin_bank' || role === 'admin' || Boolean(user?.adminBank)) && !isNasabah;

  const roleText = isNasabah ? 'Nasabah' : isAdmin ? 'Admin' : 'Digital';
  const roleSubText = isNasabah ? 'Bank Sampah Nasabah' : isAdmin ? 'Bank Sampah Admin' : 'Bank Sampah Digital';
  const targetHref = isNasabah ? '/nasabah/dashboard' : isAdmin ? '/admin/dashboard' : '/';

  const nasabahNavItems: NavItem[] = [
    { label: 'Beranda', href: '/nasabah/dashboard', icon: LayoutDashboard },
    { label: 'Jenis Sampah', href: '/nasabah/kategori-sampah', icon: Layers },
    { label: 'Ajukan Setor', href: '/nasabah/setor', icon: ArrowUpRight },
    { label: 'Status & Riwayat', href: '/nasabah/setor/riwayat', icon: History },
    { label: 'Tukar Hadiah', href: '/nasabah/hadiah', icon: Gift },
    { label: 'Bukti & Nota', href: '/nasabah/nota', icon: Receipt },
    { label: 'Akun Saya', href: '/nasabah/akun', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Verifikasi Setoran', href: '/admin/setoran', icon: CheckSquare },
    { label: 'Data Transaksi', href: '/admin/transaksi', icon: CreditCard },
    { label: 'Data Nasabah', href: '/admin/nasabah', icon: Users },
    { label: 'Kategori Sampah', href: '/admin/kategori-sampah', icon: Layers },
    { label: 'Katalog Hadiah', href: '/admin/hadiah', icon: Gift },
    { label: 'Rekapitulasi Bulanan', href: '/admin/rekapitulasi', icon: FileSpreadsheet },
    { label: 'Profil Unit', href: '/admin/profil', icon: Building },
  ];

  const navItems = isNasabah ? nasabahNavItems : isAdmin ? adminNavItems : [];

  // Determine exactly ONE active item based on highest specificity
  const activeHref = React.useMemo(() => {
    // 1. Exact match has highest priority
    const exactMatch = navItems.find((item) => item.href === pathname);
    if (exactMatch) return exactMatch.href;

    // 2. Prefix match with longest href (e.g., subpages like /nasabah/nota/[id])
    const prefixMatches = navItems
      .filter(
        (item) =>
          item.href !== '/admin/dashboard' &&
          item.href !== '/nasabah/dashboard' &&
          pathname.startsWith(`${item.href}/`)
      )
      .sort((a, b) => b.href.length - a.href.length);

    return prefixMatches[0]?.href ?? null;
  }, [navItems, pathname]);

  const displayName = isNasabah
    ? user?.nasabah?.namaNasabah || user?.username || 'Nasabah'
    : user?.adminBank?.namaPengelola || user?.adminBank?.namaUnit || user?.username || 'Pengelola Unit';

  const roleLabel = isNasabah ? 'Nasabah' : 'Admin';

  return (
    <>
      {/* Mobile Backdrop: only on screens below 768px, gentle translucent tint with no harsh dark shadow */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-emerald-950/10 backdrop-blur-[1px] md:hidden pointer-events-auto transition-opacity"
        />
      )}

      {/* Sidebar Container: Fixed at left-0, 100vh, pure white background */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[290px] h-screen bg-white border-r border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 pb-4 flex items-center justify-between">
            <Link href={targetHref} className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-[#006948] flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform shrink-0">
                <Leaf className="w-6 h-6 text-emerald-300 stroke-[2.3]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-lg text-slate-900 leading-tight flex items-center gap-1.5">
                  Bank Sampah
                  <span className="text-[#00714e] font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#64f9bc]/40">
                    {roleText}
                  </span>
                </span>
                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">
                  {roleSubText}
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Label: MENU UTAMA */}
          <div className="px-5 mb-2.5">
            <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
              MENU UTAMA
            </span>
          </div>

          {/* Navigation Items (Pill Style) */}
          <nav className="flex-1 px-4 py-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center justify-between px-4 py-3 rounded-full transition-all text-sm font-bold',
                    isActive
                      ? 'bg-[#006948] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-[#eaedff]/60 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors shrink-0',
                        isActive ? 'text-emerald-200' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-bold',
                        isActive
                          ? 'bg-white/20 text-emerald-100'
                          : 'bg-[#64f9bc]/40 text-[#00714e]'
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-4.5 h-4.5 text-emerald-200 shrink-0" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        {(isNasabah || isAdmin || Boolean(user)) && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="p-3.5 rounded-2xl bg-[#f2f3ff]/70 border border-slate-100 flex items-center justify-between shadow-xs">
              <Link
                href={isAdmin ? '/admin/profil' : '/nasabah/akun'}
                onClick={onClose}
                title={isAdmin ? 'Profil Unit' : 'Akun Saya'}
                className="flex items-center gap-3 min-w-0 group cursor-pointer"
              >
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform"
                    suppressHydrationWarning
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="font-bold text-sm text-slate-800 truncate group-hover:text-[#006948] transition-colors"
                    suppressHydrationWarning
                  >
                    {displayName}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {roleLabel}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Keluar / Logout"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
