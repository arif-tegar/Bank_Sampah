'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SetorSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Calendar,
  User,
  Scale,
  ArrowRight,
  Recycle,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { formatTanggal, formatPoin, formatKg } from '@/lib/utils';

export default function AdminSetoranListPage() {
  const { showToast } = useToast();
  const [list, setList] = useState<SetorSampah[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [bulanFilter, setBulanFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.setorSampah.adminList(statusFilter || undefined, bulanFilter || undefined);
      if (res.success && res.data) {
        setList(res.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat daftar setoran', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, bulanFilter, showToast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
    { value: 'diverifikasi', label: 'Diverifikasi' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'ditolak', label: 'Ditolak' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu_konfirmasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Konfirmasi
          </span>
        );
      case 'diverifikasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Diverifikasi
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#64f9bc]/40 text-[#00714e] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner Section                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verifikasi Penyetoran Sampah
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Konfirmasi pengajuan setoran dari nasabah, lakukan penimbangan fisik ulang, dan validasi perolehan poin serta nilai rupiah secara akurat.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-[#f2f3ff]/80 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#006948] flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Total Antrean
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {list.length} Tiket
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Filter Bar (Pill Buttons)                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-[#006948]" />
          <span className="text-xs font-semibold text-slate-500">Bulan:</span>
          <input
            type="month"
            value={bulanFilter}
            onChange={(e) => setBulanFilter(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          />
          {bulanFilter && (
            <button
              type="button"
              onClick={() => setBulanFilter('')}
              className="text-xs text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Tickets List Container                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Pengajuan Setoran</h2>
              <p className="text-xs text-slate-500">Pilih tiket untuk melakukan penimbangan fisik</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Menampilkan {list.length} data
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && list.length === 0 && (
          <div className="p-10 rounded-2xl bg-[#f2f3ff]/40 text-center flex flex-col items-center justify-center gap-3 my-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-xs border border-slate-100">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Tidak Ada Pengajuan Setoran
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tidak ada tiket yang cocok dengan filter yang dipilih saat ini.
              </p>
            </div>
          </div>
        )}

        {/* Tickets */}
        {!isLoading && list.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            {list.map((item) => {
              const kode =
                item.noTransaksi ||
                item.kodeTransaksi ||
                `#SET-${item.id.substring(0, 6).toUpperCase()}`;
              const nasabahNama = item.nasabah?.namaNasabah || 'Nasabah';
              const rawItems = item.detailSetor || item.items || [];
              const categoryName =
                rawItems[0]?.kategoriSampah?.namaKategori || 'Campuran / Umum';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#f2f3ff]/50 hover:bg-[#eaedff]/70 border border-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#006948] shrink-0 shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
                      <Recycle className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col min-w-0 gap-1.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
                          {kode}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-[#006948]" />
                          Nasabah: <strong className="text-slate-900">{nasabahNama}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatTanggal(item.tanggal, true)}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-slate-700 text-xs font-semibold shadow-xs border border-slate-100">
                          <Layers className="w-3.5 h-3.5 text-[#006948]" />
                          {categoryName}
                        </span>
                        {item.totalBeratKg ? (
                          <span className="text-xs font-bold text-[#006948] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            ~{formatKg(item.totalBeratKg)}
                          </span>
                        ) : null}
                      </div>

                      {item.catatan && (
                        <p className="text-xs italic text-slate-400 mt-0.5">
                          Catatan: &ldquo;{item.catatan}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="md:text-right">
                      <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                        Estimasi Poin
                      </span>
                      <span className="text-base font-black text-[#006948]">
                        + {formatPoin(item.totalPoin ?? 0)} Pts
                      </span>
                    </div>

                    <Link href={`/admin/setoran/${item.id}`}>
                      <button className="px-5 py-2.5 rounded-full bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] cursor-pointer">
                        <Scale className="w-4 h-4" />
                        <span>Timbang & Verifikasi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
