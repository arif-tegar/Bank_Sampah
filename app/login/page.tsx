'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { login, appKey } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appKey) {
      showToast('App Key sistem belum terhubung.', 'error', 'Error');
      return;
    }
    if (!username || !password) {
      showToast('Harap isi username dan kata sandi', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.login({ username, password });
      if (res.success && res.data) {
        showToast(`Selamat datang kembali, ${res.data.username}!`, 'success', 'Login Berhasil');
        login(res.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login gagal. Periksa kembali akun dan kata sandi Anda.';
      showToast(msg, 'error', 'Login Gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-800 antialiased flex flex-col justify-between font-sans selection:bg-emerald-100 selection:text-emerald-900 relative"
      style={{
        backgroundColor: '#f7f9f8',
        backgroundImage: `
          radial-gradient(rgba(5, 150, 105, 0.28) 1.4px, transparent 1.4px),
          radial-gradient(at 15% 15%, rgba(16, 185, 129, 0.08) 0px, transparent 45%),
          radial-gradient(at 88% 85%, rgba(245, 158, 11, 0.04) 0px, transparent 40%),
          radial-gradient(at 50% 105%, rgba(5, 150, 105, 0.07) 0px, transparent 50%),
          radial-gradient(at 90% 10%, rgba(209, 250, 229, 0.4) 0px, transparent 50%)
        `,
        backgroundSize: '24px 24px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* BEGIN: Top Navigation / Micro Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        <Link
          className="inline-flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
          href="/"
        >
          {/* Brand Recycling Icon Emblem */}
          <div className="w-9 h-9 rounded-xl bg-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <svg
              className="w-5 h-5 stroke-current fill-none stroke-2"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 19h8.2a1.8 1.8 0 0 0 1.583-.941 1.777 1.777 0 0 0-.009-1.783L17.5 11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m14 16 3 3 3-3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.293 13.53a1.8 1.8 0 0 0-.009-1.783L5.05 6.077A1.83 1.83 0 0 1 6.62 5.2h6.58"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m3 8 3-3 3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2v3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center leading-none">
              EcoPayard
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 mt-0.5">
              Bank Sampah Digital
            </span>
          </div>
        </Link>

        {/* Secondary Help Link */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500">
           
          <span className="text-slate-300">|</span>
          <Link href="/#layanan" className="hover:text-emerald-700 transition-colors">
            Pusat Bantuan
          </Link>
        </div>
      </header>
      {/* END: Top Navigation / Micro Header */}

      {/* BEGIN: Main Content Area (Floating Card) */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 relative z-10">
        <div
          className="w-full max-w-[460px] rounded-[36px] p-8 sm:p-11 transition-all duration-300 relative overflow-hidden backdrop-blur-xl border border-[rgba(230,238,233,0.85)] shadow-[0_25px_60px_-15px_rgba(6,78,59,0.08),0_10px_30px_-10px_rgba(0,0,0,0.05)]"
          style={{
            background: 'linear-gradient(178deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 254, 253, 0.94) 100%)',
          }}
          data-purpose="login-card-container"
        >
          {/* Top Decorative Ambient Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none" />

          {/* BEGIN: Card Header & Branding */}
          <div className="text-center relative z-10">
            {/* Badge Icon */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mb-6 shadow-md shadow-slate-900/10">
              <Leaf className="w-6 h-6 stroke-[2.2] text-[#34d399]" />
            </div>
            {/* Heading */}
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-snug">
              Selamat Datang
            </h1>
            <p className="mt-2.5 text-xs sm:text-[13px] text-slate-500 max-w-xs mx-auto leading-relaxed font-normal">
              Platform digital pengelolaan sampah daur ulang &amp; tabungan reward berkelanjutan.
            </p>
          </div>
          {/* END: Card Header & Branding */}

          {/* BEGIN: Login Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 relative z-10" data-purpose="login-form">
            {/* Input Field: Identifier (Email / NISN / No. HP) */}
            <div className="space-y-1.5">
              <label className="sr-only" htmlFor="identifier"> 
                Username / Akun
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5 stroke-[1.8]" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username / Akun"
                  required
                  className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                />
              </div>
            </div>

            {/* Input Field: Kata Sandi / PIN */}
            <div className="space-y-1.5">
              <label className="sr-only" htmlFor="password">
                Kata Sandi atau PIN
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 stroke-[1.8]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata Sandi / PIN 6-Digit"
                  required
                  className="w-full h-14 pl-12 pr-12 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                />
                {/* Toggle password button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                  title="Lihat Sandi"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5 stroke-[1.8]" />
                  ) : (
                    <Eye className="w-4.5 h-4.5 stroke-[1.8]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password Links */}
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 transition"
                />
                Ingat saya
              </label>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    'Silakan hubungi administrator bank sampah unit Anda untuk reset kata sandi.',
                    'info',
                    'Bantuan Akun'
                  )
                }
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
              >
                Lupa sandi?
              </button>
            </div>

            {/* Primary Action Button: Masuk Sekarang */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm tracking-wide shadow-lg shadow-slate-900/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

           
          </form>
          {/* END: Login Form */}

          {/* BEGIN: Footer Links inside Card */}
          <div className="mt-8 text-center pt-2" data-purpose="registration-prompt">
            <p className="text-xs sm:text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="font-bold text-slate-900 hover:text-emerald-700 transition-colors ml-1 inline-flex items-center gap-0.5"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
          {/* END: Footer Links inside Card */}
        </div>
      </main>
      {/* END: Main Content Area */}

      {/* BEGIN: Site Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 relative z-10" data-purpose="site-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 EcoPayard. Bank Sampah Digital Indonesia.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/#layanan" className="hover:text-slate-600 transition-colors">
              Ketentuan Layanan
            </Link>
            <span>•</span>
            <Link href="/#layanan" className="hover:text-slate-600 transition-colors">
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <Link href="/nasabah/kategori-sampah" className="hover:text-slate-600 transition-colors">
              Panduan Setoran Sampah
            </Link>
          </div>
        </div>
      </footer>
      {/* END: Site Footer */}
    </div>
  );
}
