'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SetorSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  History,
  Calendar,
  ArrowRight,
  Receipt,
  Plus,
  Scale,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Recycle,
} from 'lucide-react';
import { formatTanggal, formatPoin, formatKg } from '@/lib/utils';

export default function RiwayatSetorNasabahPage() {
  const { showToast } = useToast();
  const [setorList, setSetorList] = useState<SetorSampah[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<string>('semua');
  const [selectedBulan, setSelectedBulan] = useState<string>('');

  const fetchSetor = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.setorSampah.mySetor(selectedBulan || undefined);
      if (res.success && res.data) {
        setSetorList(res.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat riwayat penyetoran', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBulan, showToast]);

  useEffect(() => {
    fetchSetor();
  }, [fetchSetor]);

  // Status mapping
  const filteredList = setorList.filter((item) => {
    if (activeTab === 'semua') return true;
    const s = (item.status || '').toLowerCase();
    if (activeTab === 'menunggu') {
      return s.includes('menunggu') || s.includes('belum');
    }
    if (activeTab === 'diverifikasi') {
      return s.includes('verifikasi') || s.includes('proses');
    }
    if (activeTab === 'selesai') {
      return s === 'selesai';
    }
    if (activeTab === 'ditolak') {
      return s === 'ditolak';
    }
    return true;
  });

  const tabs = [
    { key: 'semua', label: 'Semua Status' },
    { key: 'menunggu', label: 'Menunggu' },
    { key: 'diverifikasi', label: 'Diverifikasi' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'ditolak', label: 'Ditolak' },
  ];

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
            Diverifikasi
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
            Status & Riwayat Penyetoran
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Pantau proses verifikasi timbangan fisik, catatan petugas unit, dan perolehan poin dari setiap pengajuan sampah Anda.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/nasabah/setor">
            <button className="px-6 py-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Setor Sampah Baru</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Filter Tabs & Month Picker Row                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.key
                ? 'bg-[#006948] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-[#006948]" />
          <span className="text-xs font-semibold text-slate-500">Bulan:</span>
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
      {/* 3. Tickets History List                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Tiket Setoran Anda
              </h2>
              <p className="text-xs text-slate-400">Total {filteredList.length} transaksi pada filter ini</p>
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
        {!isLoading && filteredList.length === 0 && (
          <div className="p-10 rounded-2xl bg-[#f2f3ff]/40 text-center flex flex-col items-center justify-center gap-3 my-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-xs border border-slate-100">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Tidak Ada Riwayat Penyetoran
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab !== 'semua'
                  ? `Tidak ada transaksi dengan status "${activeTab}".`
                  : 'Anda belum pernah melakukan penyetoran sampah.'}
              </p>
            </div>
            <Link href="/nasabah/setor">
              <button className="px-5 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-sm">
                Ajukan Penyetoran Sekarang
              </button>
            </Link>
          </div>
        )}

        {/* Ticket Rows */}
        {!isLoading && filteredList.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            {filteredList.map((item) => {
              const kode =
                item.noTransaksi || item.kodeTransaksi || `#SET-${item.id.substring(0, 6).toUpperCase()}`;
              const totalPoinVal = item.totalPoin ?? 0;
              const rawItems = item.detailSetor || item.items || [];
              const detailCount = rawItems.length;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#f2f3ff]/50 hover:bg-[#eaedff]/70 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
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
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatTanggal(item.tanggal, true)}
                        </span>
                        {detailCount > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-slate-700">
                              {detailCount} kategori sampah
                            </span>
                          </>
                        )}
                        {item.totalBeratKg ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-[#006948]">
                              {formatKg(item.totalBeratKg)}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {item.catatan && (
                        <p className="text-xs italic text-slate-400 mt-0.5">
                          Catatan: &ldquo;{item.catatan}&rdquo;
                        </p>
                      )}

                      {item.catatanAdmin && (
                        <p className="text-xs text-[#00714e] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 mt-0.5 inline-block w-fit">
                          Catatan Admin: {item.catatanAdmin}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Perolehan Poin
                      </span>
                      <span className="text-base font-black text-[#006948]">
                        + {formatPoin(totalPoinVal)} Pts
                      </span>
                    </div>

                    <Link href={`/nasabah/nota/${item.id}`}>
                      <button className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Lihat Nota</span>
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
