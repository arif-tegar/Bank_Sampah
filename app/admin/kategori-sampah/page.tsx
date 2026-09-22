'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { KategoriSampah, JenisSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Coins,
  Scale,
  DollarSign,
  AlertTriangle,
  Inbox,
  X,
  Sparkles,
  Package,
  CheckCircle2,
  UploadCloud,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { formatRupiah, formatPoin, getFileUrl } from '@/lib/utils';

export default function AdminKategoriSampahPage() {
  const { showToast } = useToast();

  const [kategoriList, setKategoriList] = useState<KategoriSampah[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedKategori, setSelectedKategori] = useState<KategoriSampah | null>(null);

  // Form State
  const [form, setForm] = useState({
    namaKategori: '',
    hargaPerKg: 2000,
    poinPerKg: 2,
    jenis: 'plastik' as JenisSampah,
    foto: null as File | null,
    fotoPreview: '',
  });

  const fetchKategori = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.kategoriSampah.list();
      if (res.success && res.data) {
        setKategoriList(res.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat kategori sampah', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.kategoriSampah.create({
        namaKategori: form.namaKategori,
        hargaPerKg: Number(form.hargaPerKg),
        poinPerKg: Number(form.poinPerKg),
        jenis: form.jenis,
        foto: form.foto,
      });

      if (res.success) {
        showToast('Kategori sampah baru berhasil disimpan!', 'success');
        setIsCreateOpen(false);
        setForm({
          namaKategori: '',
          hargaPerKg: 2000,
          poinPerKg: 2,
          jenis: 'plastik',
          foto: null,
          fotoPreview: '',
        });
        fetchKategori();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menambah kategori', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (kat: KategoriSampah) => {
    setSelectedKategori(kat);
    setForm({
      namaKategori: kat.namaKategori,
      hargaPerKg: kat.hargaPerKg,
      poinPerKg: kat.poinPerKg,
      jenis: kat.jenis,
      foto: null,
      fotoPreview: getFileUrl(kat.foto),
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKategori) return;

    try {
      setIsSubmitting(true);
      const res = await api.kategoriSampah.update(selectedKategori.id, {
        namaKategori: form.namaKategori,
        hargaPerKg: Number(form.hargaPerKg),
        poinPerKg: Number(form.poinPerKg),
        jenis: form.jenis,
        foto: form.foto,
      });

      if (res.success) {
        showToast('Kategori sampah berhasil diperbarui!', 'success');
        setIsEditOpen(false);
        fetchKategori();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui kategori', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedKategori) return;
    try {
      setIsSubmitting(true);
      const res = await api.kategoriSampah.delete(selectedKategori.id);
      if (res.success) {
        showToast('Kategori sampah berhasil dihapus', 'info');
        setIsDeleteOpen(false);
        fetchKategori();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus kategori', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 2MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar (PNG, JPG, WEBP)', 'error');
        return;
      }
      setForm((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveFile = () => {
    setForm((prev) => ({
      ...prev,
      foto: null,
      fotoPreview: '',
    }));
  };

  const handleOpenCreate = () => {
    setForm({
      namaKategori: '',
      hargaPerKg: 2000,
      poinPerKg: 2,
      jenis: 'plastik',
      foto: null,
      fotoPreview: '',
    });
    setIsCreateOpen(true);
  };

  const getJenisBadgeColor = (jenis: string) => {
    switch (jenis) {
      case 'plastik':
        return 'bg-blue-100 text-blue-800';
      case 'kertas':
        return 'bg-amber-100 text-amber-800';
      case 'logam':
        return 'bg-purple-100 text-purple-800';
      case 'kaca':
        return 'bg-teal-100 text-teal-800';
      case 'elektronik':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kategori Sampah & Harga Beli
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Atur patokan harga beli rupiah serta konversi reward poin per kilogram untuk setiap jenis sampah daur ulang.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-6 py-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Grid Cards Kategori                                        */}
      {/* ------------------------------------------------------------- */}
      <div>
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-3xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && kategoriList.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 border border-emerald-950/5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Belum Ada Kategori Sampah
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan kategori sampah pertama untuk mulai menerima setoran limbah nasabah.
              </p>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && kategoriList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kategoriList.map((kat) => {
              const fotoUrl = getFileUrl(kat.foto);

              return (
                <div
                  key={kat.id}
                  className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between gap-5 transition-transform hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-[#006948] shrink-0 overflow-hidden shadow-xs border border-emerald-100">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={kat.namaKategori}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-base text-slate-900 truncate">
                          {kat.namaKategori}
                        </span>
                        <span
                          className={`inline-block w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5 ${getJenisBadgeColor(
                            kat.jenis
                          )}`}
                        >
                          {kat.jenis}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(kat)}
                        title="Edit Kategori"
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedKategori(kat);
                          setIsDeleteOpen(true);
                        }}
                        title="Hapus Kategori"
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f2f3ff]/60 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Harga Beli / Kg
                      </span>
                      <span className="text-base font-black text-[#006948]">
                        {formatRupiah(kat.hargaPerKg)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Reward Poin / Kg
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        +{formatPoin(kat.poinPerKg)} Pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL TAMBAH KATEGORI                                      */}
      {/* ------------------------------------------------------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Kategori Sampah
                  </h3>
                  <p className="text-xs text-slate-400">Tentukan foto, harga beli, dan perolehan poin</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              {/* Foto Kategori */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#006948]" />
                    Foto Kategori Sampah
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Opsional (Maks. 2MB)</span>
                </label>

                {form.fotoPreview ? (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                    <img
                      src={form.fotoPreview}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="create-foto-kategori"
                        className="px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Ganti</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="create-foto-kategori"
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#006948] bg-slate-50/70 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-100 group-hover:border-emerald-200 text-slate-400 group-hover:text-[#006948] flex items-center justify-center transition-colors">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#006948] block">
                        Pilih atau Tarik Foto ke Sini
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        PNG, JPG, JPEG atau WEBP
                      </span>
                    </div>
                  </label>
                )}
                <input
                  id="create-foto-kategori"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nama Kategori Sampah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kardus Kering, PET Botol Bening..."
                  value={form.namaKategori}
                  onChange={(e) => setForm({ ...form, namaKategori: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Jenis / Golongan Limbah</label>
                <select
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value as JenisSampah })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                >
                  <option value="plastik">Plastik</option>
                  <option value="kertas">Kertas / Karton</option>
                  <option value="logam">Logam / Besi</option>
                  <option value="kaca">Kaca / Beling</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Harga Beli / Kg (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={form.hargaPerKg}
                    onChange={(e) => setForm({ ...form, hargaPerKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Poin / Kg (Pts)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={form.poinPerKg}
                    onChange={(e) => setForm({ ...form, poinPerKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL EDIT KATEGORI                                        */}
      {/* ------------------------------------------------------------- */}
      {isEditOpen && selectedKategori && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Kategori Sampah
                  </h3>
                  <p className="text-xs text-slate-400">Perbarui foto, harga, dan rasio poin</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              {/* Foto Kategori */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#006948]" />
                    Foto Kategori Sampah
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Opsional (Maks. 2MB)</span>
                </label>

                {form.fotoPreview ? (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                    <img
                      src={form.fotoPreview}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="edit-foto-kategori"
                        className="px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Ganti</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="edit-foto-kategori"
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#006948] bg-slate-50/70 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-100 group-hover:border-emerald-200 text-slate-400 group-hover:text-[#006948] flex items-center justify-center transition-colors">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#006948] block">
                        Pilih atau Tarik Foto ke Sini
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        PNG, JPG, JPEG atau WEBP
                      </span>
                    </div>
                  </label>
                )}
                <input
                  id="edit-foto-kategori"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={form.namaKategori}
                  onChange={(e) => setForm({ ...form, namaKategori: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Jenis Limbah</label>
                <select
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value as JenisSampah })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                >
                  <option value="plastik">Plastik</option>
                  <option value="kertas">Kertas / Karton</option>
                  <option value="logam">Logam / Besi</option>
                  <option value="kaca">Kaca / Beling</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Harga Beli / Kg (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={form.hargaPerKg}
                    onChange={(e) => setForm({ ...form, hargaPerKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Poin / Kg (Pts)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={form.poinPerKg}
                    onChange={(e) => setForm({ ...form, poinPerKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
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
                  className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL HAPUS KATEGORI                                       */}
      {/* ------------------------------------------------------------- */}
      {isDeleteOpen && selectedKategori && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Kategori?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus kategori{' '}
                <strong className="text-slate-800">{selectedKategori.namaKategori}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
