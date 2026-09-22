'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import {
  User,
  Building2,
  Lock,
  Phone,
  Camera,
  MapPin,
  Leaf,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function RegisterPage() {
  const { appKey } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [tab, setTab] = useState<'nasabah' | 'admin'>('nasabah');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Nasabah Form State
  const [nasabahForm, setNasabahForm] = useState({
    namaNasabah: '',
    telp: '',
    alamat: '',
    username: '',
    password: '',
    confirmPassword: '',
    foto: null as File | null,
    fotoPreview: '',
    agree: false,
  });

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    namaUnit: '',
    namaPengelola: '',
    telp: '',
    username: '',
    password: '',
    confirmPassword: '',
    foto: null as File | null,
    fotoPreview: '',
    agree: false,
  });

  const handleNasabahPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 2MB', 'error');
        return;
      }
      setNasabahForm((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleAdminPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 2MB', 'error');
        return;
      }
      setAdminForm((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleRegisterNasabah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appKey) {
      showToast('App Key sistem belum terhubung.', 'error');
      return;
    }

    if (nasabahForm.password !== nasabahForm.confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok', 'error');
      return;
    }

    if (!nasabahForm.agree) {
      showToast('Anda harus menyetujui Syarat & Ketentuan', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.registerNasabah({
        username: nasabahForm.username,
        password: nasabahForm.password,
        namaNasabah: nasabahForm.namaNasabah,
        alamat: nasabahForm.alamat,
        telp: nasabahForm.telp,
        foto: nasabahForm.foto,
      });

      if (res.success) {
        showToast('Pendaftaran Nasabah berhasil! Silakan masuk.', 'success', 'Registrasi Sukses');
        router.push('/login');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pendaftaran nasabah gagal';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appKey) {
      showToast('App Key sistem belum terhubung.', 'error');
      return;
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok', 'error');
      return;
    }

    if (!adminForm.agree) {
      showToast('Anda harus menyetujui Syarat & Ketentuan', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.registerAdmin({
        username: adminForm.username,
        password: adminForm.password,
        namaUnit: adminForm.namaUnit,
        namaPengelola: adminForm.namaPengelola,
        telp: adminForm.telp,
        foto: adminForm.foto,
      });

      if (res.success) {
        showToast('Pendaftaran Unit Admin berhasil! Silakan masuk.', 'success', 'Registrasi Sukses');
        router.push('/login');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pendaftaran admin gagal';
      showToast(msg, 'error');
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
          className="w-full max-w-[500px] rounded-[36px] p-8 sm:p-11 transition-all duration-300 relative overflow-hidden backdrop-blur-xl border border-[rgba(230,238,233,0.85)] shadow-[0_25px_60px_-15px_rgba(6,78,59,0.08),0_10px_30px_-10px_rgba(0,0,0,0.05)]"
          style={{
            background: 'linear-gradient(178deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 254, 253, 0.94) 100%)',
          }}
          data-purpose="register-card-container"
        >
          {/* Top Decorative Ambient Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none" />

          {/* BEGIN: Card Header & Branding */}
          <div className="text-center relative z-10">
            {/* Badge Icon */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mb-5 shadow-md shadow-slate-900/10">
              <Leaf className="w-6 h-6 stroke-[2.2] text-[#34d399]" />
            </div>
            {/* Heading */}
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-snug">
              Pendaftaran Akun
            </h1>
            <p className="mt-2 text-xs sm:text-[13px] text-slate-500 max-w-xs mx-auto leading-relaxed font-normal">
              Bergabunglah dalam ekosistem bank sampah digital terpadu &amp; raih reward berkelanjutan.
            </p>
          </div>
          {/* END: Card Header & Branding */}

          {/* Role Switcher Pill Tab */}
          <div className="inline-flex p-1.5 bg-slate-100/90 rounded-full w-full my-6 border border-slate-200/60 shadow-inner relative z-10">
            <button
              type="button"
              onClick={() => setTab('nasabah')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                tab === 'nasabah'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              Nasabah
            </button>
            <button
              type="button"
              onClick={() => setTab('admin')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                tab === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Admin Unit
            </button>
          </div>

          {/* TAB 1: FORM REGISTER NASABAH */}
          {tab === 'nasabah' && (
            <form onSubmit={handleRegisterNasabah} className="space-y-4 relative z-10" data-purpose="form-nasabah" autoComplete="off">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center gap-1.5 pb-2">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center bg-white shadow-xs">
                    {nasabahForm.fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={nasabahForm.fotoPreview}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <label
                    htmlFor="nasabah-foto"
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-medium mt-0.5">Unggah Foto</span>
                  </label>
                  <input
                    id="nasabah-foto"
                    type="file"
                    accept="image/*"
                    onChange={handleNasabahPhoto}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Foto profil (opsional)</p>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="nasabah-nama">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="nasabah-nama"
                    type="text"
                    value={nasabahForm.namaNasabah}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, namaNasabah: e.target.value })}
                    placeholder="Nama Lengkap"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* No. Telepon / WhatsApp */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="nasabah-telp">
                  No. Telepon / WhatsApp
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="nasabah-telp"
                    type="text"
                    value={nasabahForm.telp}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, telp: e.target.value })}
                    placeholder="No. Telepon / WhatsApp"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="nasabah-alamat">
                  Alamat Lengkap
                </label>
                <div className="relative flex items-start">
                  <div className="absolute top-4 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <textarea
                    id="nasabah-alamat"
                    rows={2}
                    value={nasabahForm.alamat}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, alamat: e.target.value })}
                    placeholder="Alamat domisili atau kelas/RT..."
                    required
                    autoComplete="off"
                    className="w-full p-3.5 pl-12 rounded-2xl bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="nasabah-username">
                  Username Akun
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="nasabah-username"
                    type="text"
                    value={nasabahForm.username}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, username: e.target.value })}
                    placeholder="Pilih Username Unik"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={nasabahForm.password}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, password: e.target.value })}
                    placeholder="Kata Sandi"
                    required
                    autoComplete="new-password"
                    className="w-full h-14 pl-11 pr-10 rounded-full bg-white/90 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={nasabahForm.confirmPassword}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi Sandi"
                    required
                    autoComplete="new-password"
                    className="w-full h-14 pl-11 pr-10 rounded-full bg-white/90 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={nasabahForm.agree}
                    onChange={(e) => setNasabahForm({ ...nasabahForm, agree: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 transition"
                  />
                  <span>
                    Saya menyetujui <span className="text-emerald-700 font-bold">Syarat &amp; Ketentuan</span> Bank Sampah Digital.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
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
                      <span>Daftar Nasabah Sekarang</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: FORM REGISTER ADMIN UNIT */}
          {tab === 'admin' && (
            <form onSubmit={handleRegisterAdmin} className="space-y-4 relative z-10" data-purpose="form-admin" autoComplete="off">
              {/* Logo / Avatar Upload */}
              <div className="flex flex-col items-center justify-center gap-1.5 pb-2">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center bg-white shadow-xs">
                    {adminForm.fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={adminForm.fotoPreview}
                        alt="Preview Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <label
                    htmlFor="admin-foto"
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-medium mt-0.5">Unggah Logo</span>
                  </label>
                  <input
                    id="admin-foto"
                    type="file"
                    accept="image/*"
                    onChange={handleAdminPhoto}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Logo / Foto unit (opsional)</p>
              </div>

              {/* Nama Unit */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="admin-unit">
                  Nama Unit Bank Sampah
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="admin-unit"
                    type="text"
                    value={adminForm.namaUnit}
                    onChange={(e) => setAdminForm({ ...adminForm, namaUnit: e.target.value })}
                    placeholder="Nama Unit Bank Sampah"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Nama Pengelola */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="admin-pengelola">
                  Nama Pengelola / Ketua
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="admin-pengelola"
                    type="text"
                    value={adminForm.namaPengelola}
                    onChange={(e) => setAdminForm({ ...adminForm, namaPengelola: e.target.value })}
                    placeholder="Nama Pengelola / Ketua Unit"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* No. Telepon / WhatsApp */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="admin-telp">
                  No. Telepon / WhatsApp Pengelola
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="admin-telp"
                    type="text"
                    value={adminForm.telp}
                    onChange={(e) => setAdminForm({ ...adminForm, telp: e.target.value })}
                    placeholder="No. Telepon / WhatsApp Pengelola"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="sr-only" htmlFor="admin-username">
                  Username Admin
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    placeholder="Username Akun Admin"
                    required
                    autoComplete="off"
                    className="w-full h-14 pl-12 pr-5 rounded-full bg-white/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="Kata Sandi"
                    required
                    autoComplete="new-password"
                    className="w-full h-14 pl-11 pr-10 rounded-full bg-white/90 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi Sandi"
                    required
                    autoComplete="new-password"
                    className="w-full h-14 pl-11 pr-10 rounded-full bg-white/90 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={adminForm.agree}
                    onChange={(e) => setAdminForm({ ...adminForm, agree: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 transition"
                  />
                  <span>
                    Saya menyetujui <span className="text-emerald-700 font-bold">Syarat &amp; Ketentuan</span> unit pengelola Bank Sampah.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
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
                      <span>Daftar Unit Bank Sekarang</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* BEGIN: Footer Links inside Card */}
          <div className="mt-8 text-center pt-2 border-t border-slate-100" data-purpose="registration-prompt">
            <p className="text-xs sm:text-sm text-slate-500">
              Sudah memiliki akun?{' '}
              <Link
                href="/login"
                className="font-bold text-slate-900 hover:text-emerald-700 transition-colors ml-1 inline-flex items-center gap-0.5"
              >
                Masuk Sekarang
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
