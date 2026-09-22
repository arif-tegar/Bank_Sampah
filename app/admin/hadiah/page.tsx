'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { Hadiah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Coins,
  Package,
  AlertTriangle,
  Inbox,
  X,
  Sparkles,
  UploadCloud,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { formatPoin, getFileUrl } from '@/lib/utils';

export default function AdminHadiahPage() {
  const { showToast } = useToast();

  const [hadiahList, setHadiahList] = useState<Hadiah[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedHadiah, setSelectedHadiah] = useState<Hadiah | null>(null);

  // Form State
  const [form, setForm] = useState({
    namaHadiah: '',
    poinDibutuhkan: 50,
    stok: 10,
    foto: null as File | null,
    fotoPreview: '',
  });

  const fetchHadiah = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.hadiah.list();
      if (res.success && res.data) {
        setHadiahList(res.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat katalog hadiah', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHadiah();
  }, [fetchHadiah]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.hadiah.create({
        namaHadiah: form.namaHadiah,
        poinDibutuhkan: Number(form.poinDibutuhkan),
        stok: Number(form.stok),
        foto: form.foto,
      });

      if (res.success) {
        showToast('Hadiah baru berhasil ditambahkan!', 'success');
        setIsCreateOpen(false);
        setForm({
          namaHadiah: '',
          poinDibutuhkan: 50,
          stok: 10,
          foto: null,
          fotoPreview: '',
        });
        fetchHadiah();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menambah hadiah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (h: Hadiah) => {
    setSelectedHadiah(h);
    setForm({
      namaHadiah: h.namaHadiah,
      poinDibutuhkan: h.poinDibutuhkan,
      stok: h.stok,
      foto: null,
      fotoPreview: getFileUrl(h.foto),
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHadiah) return;

    try {
      setIsSubmitting(true);
      const res = await api.hadiah.update(selectedHadiah.id, {
        namaHadiah: form.namaHadiah,
        poinDibutuhkan: Number(form.poinDibutuhkan),
        stok: Number(form.stok),
        foto: form.foto,
      });

      if (res.success) {
        showToast('Hadiah berhasil diperbarui!', 'success');
        setIsEditOpen(false);
        fetchHadiah();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui hadiah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHadiah) return;
    try {
      setIsSubmitting(true);
      const res = await api.hadiah.delete(selectedHadiah.id);
      if (res.success) {
        showToast('Hadiah berhasil dihapus', 'info');
        setIsDeleteOpen(false);
        fetchHadiah();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus hadiah', 'error');
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
      namaHadiah: '',
      poinDibutuhkan: 50,
      stok: 10,
      foto: null,
      fotoPreview: '',
    });
    setIsCreateOpen(true);
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
            Katalog Hadiah & Insentif
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Kelola inventori sembako, merchandise, dan voucher yang dapat ditukarkan nasabah menggunakan akumulasi poin setor sampah.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-6 py-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Hadiah Baru</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Grid Cards Hadiah                                          */}
      {/* ------------------------------------------------------------- */}
      <div>
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-3xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && hadiahList.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 border border-emerald-950/5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Belum Ada Hadiah di Katalog
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan item reward pertama untuk memotivasi nasabah menyetorkan sampah.
              </p>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && hadiahList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hadiahList.map((item) => {
              const fotoUrl = getFileUrl(item.foto);
              const isLowStock = item.stok <= 5 && item.stok > 0;
              const isOutOfStock = item.stok <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-0.5 group"
                >
                  <div className="flex flex-col gap-3">
                    {/* Item Image / Icon */}
                    <div className="w-full h-36 rounded-2xl bg-[#f2f3ff] border border-slate-100 flex items-center justify-center text-amber-500 overflow-hidden relative">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={item.namaHadiah}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Gift className="w-12 h-12 stroke-[1.5]" />
                      )}

                      {/* Stock Pill Badge */}
                      <span
                        className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-xs ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-white/90 backdrop-blur-xs text-slate-700'
                        }`}
                      >
                        {isOutOfStock ? 'Stok Habis' : `Stok: ${item.stok} pcs`}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">
                        {item.namaHadiah}
                      </h3>
                      <div className="flex items-center gap-1 text-[#006948] font-black text-sm mt-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>{formatPoin(item.poinDibutuhkan)} Pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Hadiah"
                      className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedHadiah(item);
                        setIsDeleteOpen(true);
                      }}
                      title="Hapus Hadiah"
                      className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL TAMBAH HADIAH                                        */}
      {/* ------------------------------------------------------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Hadiah Baru
                  </h3>
                  <p className="text-xs text-slate-400">Tentukan nama, foto, poin, dan jumlah stok</p>
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
              {/* Foto Hadiah */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#006948]" />
                    Foto Hadiah
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
                        htmlFor="create-foto-hadiah"
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
                    htmlFor="create-foto-hadiah"
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
                  id="create-foto-hadiah"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nama Hadiah / Reward</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Minyak Goreng 1L, Voucher Belanja 50k..."
                  value={form.namaHadiah}
                  onChange={(e) => setForm({ ...form, namaHadiah: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Poin Dibutuhkan</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.poinDibutuhkan}
                    onChange={(e) => setForm({ ...form, poinDibutuhkan: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Jumlah Stok (Pcs)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Hadiah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL EDIT HADIAH                                          */}
      {/* ------------------------------------------------------------- */}
      {isEditOpen && selectedHadiah && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Hadiah
                  </h3>
                  <p className="text-xs text-slate-400">Perbarui foto, poin, atau jumlah stok</p>
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
              {/* Foto Hadiah */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#006948]" />
                    Foto Hadiah
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
                        htmlFor="edit-foto-hadiah"
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
                    htmlFor="edit-foto-hadiah"
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
                  id="edit-foto-hadiah"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nama Hadiah</label>
                <input
                  type="text"
                  required
                  value={form.namaHadiah}
                  onChange={(e) => setForm({ ...form, namaHadiah: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Poin Dibutuhkan</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.poinDibutuhkan}
                    onChange={(e) => setForm({ ...form, poinDibutuhkan: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Jumlah Stok (Pcs)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
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
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Hadiah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL HAPUS HADIAH                                         */}
      {/* ------------------------------------------------------------- */}
      {isDeleteOpen && selectedHadiah && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Hadiah?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus hadiah{' '}
                <strong className="text-slate-800">{selectedHadiah.namaHadiah}</strong> dari katalog?
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
