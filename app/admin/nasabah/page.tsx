'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { Nasabah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Coins,
  MapPin,
  Camera,
  User,
  X,
  AlertTriangle,
  Inbox,
  ShieldCheck,
} from 'lucide-react';
import { formatPoin, getFileUrl } from '@/lib/utils';

export default function AdminNasabahPage() {
  const { showToast } = useToast();

  const [nasabahList, setNasabahList] = useState<Nasabah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedNasabah, setSelectedNasabah] = useState<Nasabah | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    namaNasabah: '',
    alamat: '',
    telp: '',
    foto: null as File | null,
    fotoPreview: '',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    namaNasabah: '',
    telp: '',
    alamat: '',
    foto: null as File | null,
    fotoPreview: '',
  });

  const fetchNasabah = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.adminNasabah.list();
      if (res.success && res.data) {
        setNasabahList(res.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat data nasabah', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNasabah();
  }, [fetchNasabah]);

  const filteredList = nasabahList.filter((n) => {
    const q = searchQuery.toLowerCase();
    const nama = (n.namaNasabah || n.namaLengkap || '').toLowerCase();
    const telp = (n.telp || n.noTelepon || '').toLowerCase();
    return nama.includes(q) || telp.includes(q);
  });

  // Handle Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.adminNasabah.create({
        username: createForm.username,
        password: createForm.password,
        namaNasabah: createForm.namaNasabah,
        alamat: createForm.alamat,
        telp: createForm.telp,
        foto: createForm.foto,
      });

      if (res.success) {
        showToast('Nasabah baru berhasil didaftarkan!', 'success');
        setIsCreateOpen(false);
        setCreateForm({
          username: '',
          password: '',
          namaNasabah: '',
          alamat: '',
          telp: '',
          foto: null,
          fotoPreview: '',
        });
        fetchNasabah();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menambah nasabah', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (nasabah: Nasabah) => {
    setSelectedNasabah(nasabah);
    setEditForm({
      namaNasabah: nasabah.namaNasabah || nasabah.namaLengkap || '',
      telp: nasabah.telp || nasabah.noTelepon || '',
      alamat: nasabah.alamat || '',
      foto: null,
      fotoPreview: getFileUrl(nasabah.foto),
    });
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabah) return;

    try {
      setIsSubmitting(true);
      const res = await api.adminNasabah.update(selectedNasabah.id, {
        namaNasabah: editForm.namaNasabah,
        namaLengkap: editForm.namaNasabah,
        telp: editForm.telp,
        noTelepon: editForm.telp,
        alamat: editForm.alamat,
        foto: editForm.foto,
      });

      if (res.success) {
        showToast('Data nasabah berhasil diperbarui!', 'success');
        setIsEditOpen(false);
        fetchNasabah();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedNasabah) return;
    try {
      setIsSubmitting(true);
      const res = await api.adminNasabah.delete(selectedNasabah.id);
      if (res.success) {
        showToast('Nasabah berhasil dihapus', 'info');
        setIsDeleteOpen(false);
        fetchNasabah();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus nasabah', 'error');
    } finally {
      setIsSubmitting(false);
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
            Data Nasabah
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Kelola data registrasi warga, riwayat kepemilikan saldo poin, alamat, dan kontak resmi nasabah bank sampah.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Nasabah Baru</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Search Pill Input                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nasabah berdasarkan nama atau no. telepon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] shadow-xs transition-all"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Nasabah List Container                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Nasabah Aktif</h2>
              <p className="text-xs text-slate-500">Nasabah yang terdaftar dalam unit bank sampah ini</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredList.length} Ditemukan
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredList.length === 0 && (
          <div className="p-10 rounded-2xl bg-[#f2f3ff]/40 text-center flex flex-col items-center justify-center gap-3 my-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-xs border border-slate-100">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Nasabah Tidak Ditemukan
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery
                  ? `Tidak ada nasabah yang cocok dengan kata kunci "${searchQuery}".`
                  : 'Belum ada nasabah terdaftar di unit bank sampah ini.'}
              </p>
            </div>
          </div>
        )}

        {/* Nasabah Cards */}
        {!isLoading && filteredList.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            {filteredList.map((nasabah) => {
              const nama = nasabah.namaNasabah || nasabah.namaLengkap || 'Nasabah';
              const telp = nasabah.telp || nasabah.noTelepon || '-';
              const alamat = nasabah.alamat || 'Alamat belum diatur';
              const fotoUrl = getFileUrl(nasabah.foto);

              return (
                <div
                  key={nasabah.id}
                  className="p-5 rounded-2xl bg-[#f2f3ff]/50 hover:bg-[#eaedff]/70 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#006948] shrink-0 overflow-hidden shadow-xs">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-[#006948] font-bold text-lg">
                          {nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 gap-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-extrabold text-base text-slate-900 tracking-tight">
                          {nama}
                        </span>
                        {nasabah.user?.username && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono">
                            @{nasabah.user.username}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#006948]" />
                          {telp}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-xs">{alamat}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/80 text-right">
                      <span className="text-[10px] uppercase font-bold text-[#00714e] block">
                        Saldo Poin
                      </span>
                      <span className="text-sm font-black text-[#006948]">
                        {formatPoin(nasabah.saldoPoin ?? 0)} Pts
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(nasabah)}
                        title="Edit Data Nasabah"
                        className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedNasabah(nasabah);
                          setIsDeleteOpen(true);
                        }}
                        title="Hapus Nasabah"
                        className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL TAMBAH NASABAH                                       */}
      {/* ------------------------------------------------------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Nasabah Baru
                  </h3>
                  <p className="text-xs text-slate-400">Pendaftaran akun warga nasabah baru</p>
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Nasabah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={createForm.namaNasabah}
                  onChange={(e) => setCreateForm({ ...createForm, namaNasabah: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="budisantoso"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nomor Telepon / WA</label>
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={createForm.telp}
                  onChange={(e) => setCreateForm({ ...createForm, telp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  placeholder="RT 02 / RW 05, Kelurahan Asri..."
                  value={createForm.alamat}
                  onChange={(e) => setCreateForm({ ...createForm, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
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
                  {isSubmitting ? 'Mendaftarkan...' : 'Simpan Nasabah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL EDIT NASABAH                                         */}
      {/* ------------------------------------------------------------- */}
      {isEditOpen && selectedNasabah && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Data Nasabah
                  </h3>
                  <p className="text-xs text-slate-400">Perbarui profil dan kontak warga</p>
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editForm.namaNasabah}
                  onChange={(e) => setEditForm({ ...editForm, namaNasabah: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nomor Telepon</label>
                <input
                  type="tel"
                  value={editForm.telp}
                  onChange={(e) => setEditForm({ ...editForm, telp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Alamat</label>
                <textarea
                  rows={2}
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
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
                  className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL HAPUS NASABAH                                        */}
      {/* ------------------------------------------------------------- */}
      {isDeleteOpen && selectedNasabah && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Nasabah?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data nasabah{' '}
                <strong className="text-slate-800">
                  {selectedNasabah.namaNasabah || selectedNasabah.namaLengkap}
                </strong>
                ? Riwayat transaksi terkait mungkin ikut terpengaruh.
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
