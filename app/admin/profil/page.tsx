'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { setUser } from '@/lib/auth';
import {
  Building2,
  User,
  Phone,
  Camera,
  Save,
  CheckCircle2,
  Key,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilUnitAdminPage() {
  const { user, appKey, refreshUser, login } = useAuth();
  const { showToast } = useToast();

  const adminBank = user?.adminBank;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    namaUnit: '',
    namaPengelola: '',
    telp: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (adminBank) {
      setForm({
        namaUnit: adminBank.namaUnit || '',
        namaPengelola: adminBank.namaPengelola || '',
        telp: adminBank.telp || '',
      });
      if (adminBank.foto || (adminBank as any).logo) {
        setLogoPreview(adminBank.foto || (adminBank as any).logo || '');
      }
    }
  }, [adminBank]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran logo maksimal 2MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar (PNG, JPG, WEBP)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        showToast('Logo unit berhasil dipilih. Klik "Simpan Perubahan Profil" untuk menerapkan.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          adminBank: {
            ...user.adminBank,
            id: user.adminBank?.id || 'admin-01',
            namaUnit: form.namaUnit,
            namaPengelola: form.namaPengelola,
            telp: form.telp,
            foto: logoPreview || user.adminBank?.foto,
            logo: logoPreview || (user.adminBank as any)?.logo,
          },
        };
        setUser(updatedUser as any);
        login(updatedUser);
      }
      showToast('Profil unit bank sampah berhasil diperbarui!', 'success', 'Tersimpan');
      await refreshUser();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui profil unit', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-2">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">
          Profil Unit Bank Sampah
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed relative z-10">
          Kelola identitas unit, nama penanggung jawab pengelola, dan nomor kontak resmi layanan bank sampah.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Form Card                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Unit Logo Avatar */}
          <div className="flex flex-col items-center justify-center gap-2 pb-2">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-emerald-300 flex items-center justify-center bg-emerald-50 text-[#006948] shadow-xs">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Logo Unit"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 stroke-[1.8]" />
                )}
              </div>
              <label
                htmlFor="admin-logo-upload"
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Ubah Logo</span>
              </label>
            </div>
            <p className="text-xs font-semibold text-slate-400">Logo unit bank sampah digital (Klik untuk ubah)</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#006948]" />
              Nama Unit Bank Sampah
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bank Sampah Asri Jaya"
              value={form.namaUnit}
              onChange={(e) => setForm({ ...form, namaUnit: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#006948]" />
              Nama Penanggung Jawab / Pengelola
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bapak H. Sukirman"
              value={form.namaPengelola}
              onChange={(e) => setForm({ ...form, namaPengelola: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#006948]" />
              Nomor Telepon / Kontak Resmi
            </label>
            <input
              type="tel"
              required
              placeholder="Contoh: +62 812-3456-7890"
              value={form.telp}
              onChange={(e) => setForm({ ...form, telp: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
            />
          </div>

          {/* Read-only system info */}
          <div className="p-4 rounded-2xl bg-[#f2f3ff]/60 border border-slate-100 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Username Admin:</span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                {mounted ? user?.username : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Tenant App Key:</span>
              <span className="font-mono text-slate-600 truncate max-w-[200px] bg-white px-2 py-0.5 rounded-md border border-slate-100">
                {mounted ? appKey : ''}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </form>

        <input
          id="admin-logo-upload"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleLogoChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
