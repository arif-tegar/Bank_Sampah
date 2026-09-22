'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import { UserAuthData } from '@/types/api';
import {
  User,
  Phone,
  MapPin,
  Coins,
  Key,
  LogOut,
  ShieldCheck,
  Calendar,
  Receipt,
  ArrowRight,
  Recycle,
  Gift,
  Edit3,
  Camera,
  X,
  Save,
} from 'lucide-react';
import { formatPoin, formatTanggal, getFileUrl } from '@/lib/utils';

export default function AkunNasabahPage() {
  const { user, appKey, logout, login, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    namaNasabah: '',
    telp: '',
    alamat: '',
    foto: null as File | null,
    fotoPreview: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const nasabah = mounted ? user?.nasabah : null;
  const saldoPoin = nasabah?.saldoPoin ?? nasabah?.saldo_poin ?? 0;
  const fotoUrl = getFileUrl(nasabah?.foto);

  const handleOpenEdit = () => {
    setEditForm({
      namaNasabah: nasabah?.namaNasabah || nasabah?.namaLengkap || user?.username || '',
      telp: nasabah?.telp || nasabah?.noTelepon || '',
      alamat: nasabah?.alamat || '',
      foto: null,
      fotoPreview: fotoUrl || '',
    });
    setIsEditOpen(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto maksimal 2MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar (PNG, JPG, WEBP)', 'error');
        return;
      }
      setEditForm((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveFoto = () => {
    setEditForm((prev) => ({
      ...prev,
      foto: null,
      fotoPreview: '',
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const nasabahId = nasabah?.id;
      if (nasabahId) {
        await api.adminNasabah
          .update(nasabahId, {
            namaNasabah: editForm.namaNasabah,
            telp: editForm.telp,
            alamat: editForm.alamat,
            foto: editForm.foto,
          })
          .catch(() => null);
      }

      if (user) {
        const updatedUser: UserAuthData = {
          ...user,
          nasabah: {
            ...user.nasabah,
            id: nasabahId || 'nasabah-01',
            namaNasabah: editForm.namaNasabah,
            namaLengkap: editForm.namaNasabah,
            telp: editForm.telp,
            noTelepon: editForm.telp,
            alamat: editForm.alamat,
            foto: editForm.fotoPreview || user.nasabah?.foto,
          },
        };
        login(updatedUser);
      }

      showToast('Profil nasabah berhasil diperbarui!', 'success', 'Tersimpan');
      setIsEditOpen(false);
      await refreshUser().catch(() => null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui profil', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans max-w-4xl mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Akun & Keanggotaan
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Kelola data pribadi, pantau riwayat keanggotaan, dan lihat saldo poin yang telah Anda peroleh dari kepedulian lingkungan.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          
          <button
            type="button"
            onClick={logout}
            className="px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200/80 shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Hero Profile Emerald Card                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#006948] via-[#005238] to-[#043324] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-950/20">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar container */}
          <div
            onClick={handleOpenEdit}
            title="Klik untuk ubah profil & foto"
            className="relative w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer group"
          >
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoUrl}
                alt={nasabah?.namaNasabah || 'Foto Profil'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white/80" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-6 h-6" />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#64f9bc] border-2 border-[#006948]" />
          </div>

          {/* Identity & Balance */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {nasabah?.namaNasabah || nasabah?.namaLengkap || (mounted ? user?.username : '') || 'Nasabah'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold text-emerald-100 self-center sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-[#64f9bc]" />
                Terverifikasi
              </span>
            </div>

            <p className="text-xs text-emerald-100/80 font-mono">
              @{mounted ? (user?.username || 'nasabah') : '...'} • Hak Akses: Nasabah Warga
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                <Coins className="w-4 h-4 text-[#64f9bc]" />
                <span className="text-sm font-black text-white">
                  {formatPoin(saldoPoin)}
                </span>
              </div>

              <Link href="/nasabah/hadiah">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#64f9bc] text-[#004e35] text-xs font-extrabold hover:bg-[#7efbc7] transition-colors shadow-sm">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Tukar Poin</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold transition-colors border border-white/25 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Profil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Detail Identity Information Grid                           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#64f9bc]/20 flex items-center justify-center text-[#006948] flex-shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              No. Telepon / WhatsApp
            </p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {nasabah?.telp || nasabah?.noTelepon || '-'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Digunakan untuk konfirmasi setoran & notifikasi reward.
            </p>
          </div>
        </div>

        {/* Join date */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#64f9bc]/20 flex items-center justify-center text-[#006948] flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bergabung Sejak
            </p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {nasabah?.createdAt || (user as Record<string, any>)?.createdAt
                ? formatTanggal(nasabah?.createdAt || (user as Record<string, any>)?.createdAt)
                : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Status keanggotaan aktif tanpa biaya bulanan.
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] md:col-span-2 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#64f9bc]/20 flex items-center justify-center text-[#006948] flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Alamat Domisili Terdaftar
              </p>
            
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">
              {nasabah?.alamat || 'Belum mencantumkan alamat lengkap'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Alamat penjemputan sampah terdaftar. Anda dapat memperbaruinya melalui tombol Edit Profil.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Tenant App Key & Security Notice                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Koneksi Unit Bank Sampah (Tenant ID)
            </p>
            <p className="text-xs font-mono font-bold text-slate-700 mt-0.5" suppressHydrationWarning>
              {appKey ? `${appKey.substring(0, 16)}...` : 'Default Tenant'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse" />
          <span>Sesi Terenkripsi & Terhubung</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Quick Access Actions                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/nasabah/setor" className="group">
          <div className="p-5 rounded-3xl bg-white border border-emerald-950/5 shadow-xs hover:shadow-md hover:border-[#006948]/30 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#64f9bc]/20 flex items-center justify-center text-[#006948]">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006948] transition-colors">
                  Setor Sampah Daur Ulang
                </h4>
                <p className="text-xs text-slate-400">Ajukan tiket penimbangan sampah baru</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006948] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/nasabah/nota" className="group">
          <div className="p-5 rounded-3xl bg-white border border-emerald-950/5 shadow-xs hover:shadow-md hover:border-[#006948]/30 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#006948] transition-colors">
                  Lihat Nota & Arsip
                </h4>
                <p className="text-xs text-slate-400">Semua bukti setoran dan penukaran</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006948] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. Modal Edit Profil Nasabah                                 */}
      {/* ------------------------------------------------------------- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Profil Nasabah
                  </h3>
                  <p className="text-xs text-slate-400">Perbarui foto, kontak, dan alamat domisili</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              {/* Foto Profil */}
              <div className="flex flex-col items-center justify-center gap-2 pb-1">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-emerald-300 flex items-center justify-center bg-emerald-50 text-[#006948] shadow-xs">
                    {editForm.fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editForm.fotoPreview}
                        alt="Foto Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 stroke-[1.8]" />
                    )}
                  </div>
                  <label
                    htmlFor="nasabah-foto-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="nasabah-foto-upload"
                    className="text-xs font-bold text-[#006948] hover:underline cursor-pointer"
                  >
                    Pilih Foto Baru
                  </label>
                  {editForm.fotoPreview && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    </>
                  )}
                </div>
                <input
                  id="nasabah-foto-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#006948]" />
                  Nama Lengkap Nasabah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap Anda..."
                  value={editForm.namaNasabah}
                  onChange={(e) => setEditForm({ ...editForm, namaNasabah: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#006948]" />
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={editForm.telp}
                  onChange={(e) => setEditForm({ ...editForm, telp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
                />
              </div>

              {/* Alamat Domisili */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#006948]" />
                  Alamat Domisili
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Alamat lengkap penjemputan sampah..."
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
