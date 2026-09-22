'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  Leaf,
  LogOut,
  Database,
  X,
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname();
  const { user, appKey, role, logout } = useAuth();
  const { showToast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSeed = async () => {
    if (!appKey) {
      showToast('Harap atur App Key terlebih dahulu', 'error');
      return;
    }
    try {
      setIsSeeding(true);
      const res = await api.seed();
      showToast(res.message || 'Data dummy berhasil digenerate!', 'success', 'Seed Sukses');
      window.location.reload();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal generate seed data';
      showToast(errorMsg, 'error', 'Error');
    } finally {
      setIsSeeding(false);
    }
  };

  const isNasabah = pathname.startsWith('/nasabah') || role === 'nasabah' || Boolean(user?.nasabah);
  const isAdmin = (pathname.startsWith('/admin') || role === 'admin_bank' || role === 'admin' || Boolean(user?.adminBank)) && !isNasabah;
  const isDashboard = isNasabah || isAdmin;

  const displayName = isNasabah
    ? user?.nasabah?.namaNasabah || user?.username || 'N'
    : user?.adminBank?.namaPengelola || user?.adminBank?.namaUnit || user?.username || 'A';

  return (
    <header className="fixed top-0 left-0 md:left-[350px] right-0 h-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-8 transition-all">
      {/* Left: Mobile Toggle & Brand (if guest) */}
      <div className="flex items-center gap-3 shrink-0 relative z-10">
        {isDashboard && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer shrink-0"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* If user not logged in, show Brand Logo */}
        {!isDashboard && (
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#006948] flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                Bank Sampah
                <span className="text-[#00714e] font-bold text-[10px] px-2 py-0.5 rounded-full bg-[#64f9bc]/40">
                  Digital
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Eco-Waste Management</p>
            </div>
          </Link>
        )}
      </div>

      {/* Center: Search Bar (Desktop) */}
      {isDashboard && (
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4 hidden sm:block">
          <GlobalSearch isNasabah={isNasabah} isAdmin={isAdmin} />
        </div>
      )}

      {/* Mobile Search Overlay Modal */}
      {isDashboard && isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs p-4 sm:hidden flex flex-col pt-5">
          <div className="bg-white rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pencarian Sistem
              </span>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <GlobalSearch
              isNasabah={isNasabah}
              isAdmin={isAdmin}
              isMobileModal
              onCloseMobile={() => setIsMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 shrink-0 relative z-10">
        {/* Mobile Search Icon Button */}
        {isDashboard && (
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Cari"
            className="sm:hidden relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Notification Bell with red indicator */}
        <button
          aria-label="Notifikasi"
          className="relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Circular Avatar - Click to Profil Unit */}
        {isDashboard && (
          <div className="flex items-center gap-2 pl-1">
            <Link
              href={isAdmin ? '/admin/profil' : '/nasabah/akun'}
              title={isAdmin ? 'Profil Unit' : 'Akun Saya'}
              className="w-9 h-9 rounded-full bg-[#006948] hover:bg-[#00855d] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-all hover:scale-105 cursor-pointer ring-offset-2 hover:ring-2 hover:ring-[#006948]/30"
              suppressHydrationWarning
            >
              {displayName.charAt(0).toUpperCase()}
            </Link>

            <button
              onClick={logout}
              title="Keluar / Logout"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
