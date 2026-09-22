'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SetorSampah, PenukaranPoin, StatusPenukaran } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  CreditCard,
  Calendar,
  User,
  Gift,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Recycle,
  Layers,
  Inbox,
  X,
} from 'lucide-react';
import { formatTanggal, formatPoin, formatKg } from '@/lib/utils';

export default function AdminTransaksiPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'penyetoran' | 'penukaran'>('penyetoran');
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [setorList, setSetorList] = useState<SetorSampah[]>([]);
  const [penukaranList, setPenukaranList] = useState<PenukaranPoin[]>([]);

  // Update Status Penukaran Modal
  const [selectedPenukaran, setSelectedPenukaran] = useState<PenukaranPoin | null>(null);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<StatusPenukaran>('selesai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [setorRes, tukarRes] = await Promise.all([
        api.setorSampah.adminList(undefined, selectedBulan || undefined).catch(() => null),
        api.penukaranPoin.adminList(selectedBulan || undefined).catch(() => null),
      ]);

      if (setorRes?.success && setorRes.data) {
        setSetorList(setorRes.data);
      }
      if (tukarRes?.success && tukarRes.data) {
        setPenukaranList(tukarRes.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat data transaksi', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBulan, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenStatusModal = (item: PenukaranPoin) => {
    setSelectedPenukaran(item);
    setNewStatus(item.status);
    setIsUpdateStatusOpen(true);
  };

  const handleUpdateStatusSubmit = async () => {
    if (!selectedPenukaran) return;
    try {
      setIsSubmitting(true);
      const res = await api.penukaranPoin.updateStatus(selectedPenukaran.id, {
        status: newStatus,
      });

      if (res.success) {
        showToast('Status penukaran hadiah berhasil diperbarui!', 'success');
        setIsUpdateStatusOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu_konfirmasi':
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 'diverifikasi':
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#64f9bc]/40 text-[#00714e] text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
            {status}
          </span>
        );
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
            Data Transaksi
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Rekap seluruh transaksi mutasi penyetoran sampah fisik dan penukaran poin hadiah nasabah dalam unit pengelola.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-[#f2f3ff]/80 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#006948] flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Total Transaksi
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {setorList.length + penukaranList.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Tabs & Month Filter Row                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Pill Tab Switcher */}
        <div className="flex p-1.5 bg-white rounded-full border border-slate-200 shadow-xs max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('penyetoran')}
            className={`flex-1 py-2 px-4 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'penyetoran'
                ? 'bg-[#006948] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Recycle className="w-3.5 h-3.5" />
            <span>Penyetoran ({setorList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('penukaran')}
            className={`flex-1 py-2 px-4 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'penukaran'
                ? 'bg-[#006948] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Penukaran ({penukaranList.length})</span>
          </button>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-[#006948]" />
          <span className="text-xs font-semibold text-slate-500">Filter Bulan:</span>
          <input
            type="month"
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          />
          {selectedBulan && (
            <button
              type="button"
              onClick={() => setSelectedBulan('')}
              className="text-xs text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Transaction Items List                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              {activeTab === 'penyetoran' ? (
                <Recycle className="w-5 h-5" />
              ) : (
                <Gift className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeTab === 'penyetoran'
                  ? 'Riwayat Transaksi Penyetoran'
                  : 'Riwayat Transaksi Penukaran Hadiah'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'penyetoran'
                  ? 'Catatan setoran sampah fisik dan kredit poin nasabah'
                  : 'Catatan penyerahan voucher & klaim hadiah dari saldo poin'}
              </p>
            </div>
          </div>
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
        {!isLoading &&
          ((activeTab === 'penyetoran' && setorList.length === 0) ||
            (activeTab === 'penukaran' && penukaranList.length === 0)) && (
            <div className="p-10 rounded-2xl bg-[#f2f3ff]/40 text-center flex flex-col items-center justify-center gap-3 my-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-xs border border-slate-100">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Tidak Ada Transaksi {activeTab === 'penyetoran' ? 'Penyetoran' : 'Penukaran'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Belum ada catatan transaksi pada filter yang Anda tentukan.
                </p>
              </div>
            </div>
          )}

        {/* TAB 1: Penyetoran List */}
        {!isLoading && activeTab === 'penyetoran' && setorList.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            {setorList.map((item) => {
              const kode =
                item.noTransaksi ||
                item.kodeTransaksi ||
                `#SET-${item.id.substring(0, 6).toUpperCase()}`;
              const nasabahNama = item.nasabah?.namaNasabah || 'Nasabah';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#f2f3ff]/50 hover:bg-[#eaedff]/70 border border-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#006948] shrink-0 shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
                      <Recycle className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col min-w-0 gap-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-extrabold text-base text-slate-900 font-mono tracking-tight">
                          {kode}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-[#006948]" />
                          {nasabahNama}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatTanggal(item.tanggal)}
                        </span>
                        {item.totalBeratKg ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-[#006948]">
                              {formatKg(item.totalBeratKg)}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Kredit Poin
                      </span>
                      <span className="text-base font-black text-[#006948]">
                        + {formatPoin(item.totalPoin ?? 0)} Pts
                      </span>
                    </div>

                    <Link href={`/admin/setoran/${item.id}`}>
                      <button className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
                        <span>Periksa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Penukaran List */}
        {!isLoading && activeTab === 'penukaran' && penukaranList.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            {penukaranList.map((item) => {
              const kode =
                item.kodePenukaran || `#TKR-${item.id.substring(0, 6).toUpperCase()}`;
              const nasabahNama = item.nasabah?.namaNasabah || 'Nasabah';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#f2f3ff]/50 hover:bg-[#eaedff]/70 border border-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-600 shrink-0 shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
                      <Gift className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col min-w-0 gap-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-extrabold text-base text-slate-900 font-mono tracking-tight">
                          {kode}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-[#006948]" />
                          {nasabahNama}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatTanggal(item.tanggal)}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        Item: {item.hadiah?.namaHadiah || 'Item Hadiah'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Poin Didebit
                      </span>
                      <span className="text-base font-black text-rose-600">
                        - {formatPoin(item.poinTerpakai)} Pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenStatusModal(item)}
                      className="px-4 py-2 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      Ubah Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL UPDATE STATUS PENUKARAN                              */}
      {/* ------------------------------------------------------------- */}
      {isUpdateStatusOpen && selectedPenukaran && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 relative border border-emerald-950/5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ubah Status Penukaran
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedPenukaran.kodePenukaran || selectedPenukaran.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsUpdateStatusOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#f2f3ff]/60 border border-slate-100 flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nasabah:</span>
                <span className="font-bold text-slate-900">
                  {selectedPenukaran.nasabah?.namaNasabah}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hadiah:</span>
                <span className="font-bold text-amber-700">
                  {selectedPenukaran.hadiah?.namaHadiah}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Poin Didebit:</span>
                <span className="font-bold text-rose-600">
                  {formatPoin(selectedPenukaran.poinTerpakai)} Pts
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Pilih Status Penyerahan Hadiah
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as StatusPenukaran)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
              >
                <option value="selesai">Selesai (Hadiah Sudah Diserahkan)</option>
                <option value="diproses">Diproses (Sedang Disiapkan)</option>
                <option value="ditolak">Ditolak (Kembalikan Saldo)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsUpdateStatusOpen(false)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleUpdateStatusSubmit}
                className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
