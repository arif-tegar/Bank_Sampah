'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { SetorSampah, DashboardSummary, KategoriSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowUpRight,
  Gift,
  Layers,
  Receipt,
  Leaf,
  History,
  Calendar,
  Scale,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Inbox,
  Sparkles,
  DollarSign,
  Award,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { formatPoin, formatTanggal, formatKg } from '@/lib/utils';

export default function NasabahDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<SetorSampah[]>([]);
  const [categories, setCategories] = useState<KategoriSampah[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [sumRes, histRes, catRes] = await Promise.all([
          api.dashboard.summary().catch(() => null),
          api.setorSampah.mySetor(selectedBulan || undefined).catch(() => null),
          api.kategoriSampah.list().catch(() => null),
        ]);

        if (isMounted) {
          if (sumRes?.success && sumRes.data) {
            setSummary(sumRes.data);
          }
          if (histRes?.success && histRes.data) {
            setHistory(histRes.data);
          }
          if (catRes?.success && catRes.data) {
            setCategories(catRes.data);
          }
        }
      } catch (err) {
        if (isMounted) {
          showToast(err instanceof Error ? err.message : 'Gagal memuat data dashboard', 'error');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedBulan, showToast]);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const saldoPoin = useMemo(() => {
    return (
      summary?.saldoPoin ??
      user?.nasabah?.saldoPoin ??
      user?.nasabah?.saldo_poin ??
      0
    );
  }, [summary?.saldoPoin, user?.nasabah?.saldoPoin, user?.nasabah?.saldo_poin]);

  const nasabahNama = user?.nasabah?.namaNasabah || user?.nasabah?.namaLengkap || user?.username || 'Nasabah';
  const nasabahId = user?.nasabah?.id ? `#NAS-${user.nasabah.id.substring(0, 6).toUpperCase()}` : '#NAS-001';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu_konfirmasi':
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-bold">
            <Clock className="w-3 h-3 text-amber-500" />
            Menunggu
          </span>
        );
      case 'diverifikasi':
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-bold">
            <Clock className="w-3 h-3 text-blue-500" />
            Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#00714e] text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 text-[11px] font-bold">
            <XCircle className="w-3 h-3 text-rose-500" />
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
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans max-w-7xl mx-auto w-full">
      {/* ------------------------------------------------------------- */}
      {/* 1. Hero Saldo & Welcome Showcase (Clean & Seamless)           */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-lg shadow-emerald-950/10 border border-emerald-800/20 transition-all duration-300">
        {/* Fluid Background Gradient */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #005a3e 0%, #00704d 40%, #008058 75%, #005237 100%)',
          }}
        />
        {/* Soft Ambient Glow Orbs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#64f9bc]/10 rounded-full blur-2xl pointer-events-none" />
        <Leaf className="absolute -right-6 -bottom-10 w-52 h-52 text-white/5 pointer-events-none rotate-12" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Bar: Greeting & Quick CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-200 shadow-inner">
                <Leaf className="w-5 h-5 text-emerald-300 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-200/90 font-medium">
                    {greetingTime},
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Nasabah Aktif
                  </span>
                </div>
                <h1
                  className="text-xl sm:text-2xl font-black text-white tracking-tight"
                  suppressHydrationWarning
                >
                  {nasabahNama}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-emerald-200 font-mono text-xs font-semibold border border-white/10">
                {nasabahId}
              </span>
              <Link
                href="/nasabah/setor"
                className="px-4 py-2 rounded-full bg-[#64f9bc] hover:bg-emerald-300 text-[#004d34] font-extrabold text-xs transition-all duration-200 shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Setor Sekarang</span>
              </Link>
            </div>
          </div>

          {/* Center: Saldo Poin Display */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-200/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#64f9bc]" />
                Saldo Poin Reward Anda
              </span>
              <div
                className="flex items-baseline gap-2.5 mt-1"
                suppressHydrationWarning
              >
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-sm">
                  {Number(saldoPoin).toLocaleString('id-ID')}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-200">
                  Poin
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-lg leading-relaxed">
                Tiap kilogram sampah terpilah yang Anda setorkan memberikan poin untuk ditukarkan dengan berbagai kebutuhan harian.
              </p>
            </div>

            <Link
              href="/nasabah/hadiah"
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-bold text-xs transition-all duration-200 flex items-center gap-2 shrink-0 self-start sm:self-end hover:translate-x-0.5 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-emerald-200" />
              <span>Tukar Hadiah &amp; Reward</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
            </Link>
          </div>

          {/* Bottom: Cohesive Mini Stats Strip (No Box Inception) */}
          <div className="grid grid-cols-3 divide-x divide-white/15 pt-4 border-t border-white/15">
            <div className="flex flex-col items-center sm:items-start px-2 sm:px-4 first:pl-0">
              <span className="text-[11px] text-emerald-200/80 font-medium">
                Total Sampah Disetor
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-0.5">
                {formatKg(summary?.totalSampahKg ?? 0)}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start px-2 sm:px-4">
              <span className="text-[11px] text-emerald-200/80 font-medium">
                Frekuensi Setoran
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-0.5">
                {summary?.totalPenyetoran ?? history.length} Kali
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start px-2 sm:px-4 last:pr-0">
              <span className="text-[11px] text-emerald-200/80 font-medium">
                Hadiah Diklaim
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-0.5">
                {summary?.totalPenukaran ?? 0} Item
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Quick Action Toolbar (Minimalist, Clean & Uncluttered)       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Action 1: Ajukan Setor */}
        <Link
          href="/nasabah/setor"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-[#e6f9ef] group-hover:bg-[#006948] text-[#006948] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-[#006948] transition-colors">
              Ajukan Setor
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Kirim limbah daur ulang
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#006948] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* Action 2: Katalog Hadiah */}
        <Link
          href="/nasabah/hadiah"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Gift className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-amber-700 transition-colors">
              Katalog Hadiah
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Voucher &amp; sembako
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* Action 3: Jenis Sampah */}
        <Link
          href="/nasabah/kategori-sampah"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-teal-700 transition-colors">
              Jenis Sampah
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Tarif &amp; poin per kg
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* Action 4: Bukti & Nota */}
        <Link
          href="/nasabah/nota"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-blue-700 transition-colors">
              Bukti &amp; Nota
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Riwayat struk transaksi
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Main Content: History & Rates (Minimalist, Seamless Lists) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Histori Penyetoran (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 lg:p-7 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Histori Penyetoran Terakhir
              </h2>
              <p className="text-xs text-slate-400">
                Riwayat pengajuan limbah daur ulang Anda
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="month"
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
              {selectedBulan && (
                <button
                  type="button"
                  onClick={() => setSelectedBulan('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer px-2 py-0.5 rounded-full hover:bg-rose-50 transition-colors"
                >
                  Reset
                </button>
              )}
              <Link
                href="/nasabah/setor/riwayat"
                className="text-xs font-bold text-[#006948] hover:text-[#00855d] flex items-center gap-1 ml-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-3 pt-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && history.length === 0 && (
            <div className="py-12 px-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#e6f9ef] flex items-center justify-center text-[#006948] shadow-xs">
                <Inbox className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  Belum Ada Riwayat Penyetoran
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Kumpulkan sampah botol plastik, kardus, atau kaleng di rumah Anda lalu ajukan setoran pertama!
                </p>
              </div>
              <Link href="/nasabah/setor" className="mt-2">
                <button className="px-5 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer">
                  Ajukan Penyetoran Pertama
                </button>
              </Link>
            </div>
          )}

          {/* Minimalist History Rows (No Box Inception) */}
          {!isLoading && history.length > 0 && (
            <div className="divide-y divide-slate-100">
              {history.slice(0, 6).map((item) => {
                const kode =
                  item.noTransaksi ||
                  item.kodeTransaksi ||
                  `#SET-${item.id.substring(0, 6).toUpperCase()}`;

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                            {kode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">
                            {formatTanggal(item.tanggal)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          {item.totalBeratKg ? (
                            <>
                              <span className="font-bold text-[#006948]">
                                {formatKg(item.totalBeratKg)}
                              </span>
                              <span className="text-slate-300">•</span>
                            </>
                          ) : null}
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                          Perolehan
                        </span>
                        <span className="text-sm font-black text-[#006948] mt-0.5 block">
                          +{item.totalPoin ?? 0} Poin
                        </span>
                      </div>

                      <Link href={`/nasabah/nota/${item.id}`}>
                        <button
                          title="Lihat Struk Nota"
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#006948] hover:text-white border border-slate-200/80 flex items-center justify-center text-slate-400 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Rates & Eco Tips (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Card: Tarif Sampah Terkini (Minimalist List) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Tarif Sampah Terkini
                </h3>
                <p className="text-xs text-slate-400">Patokan estimasi per kg</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 font-bold text-[10px] text-[#006948]">
                Live
              </span>
            </div>

            {/* Seamless Categories List (No Box Inception) */}
            <div className="divide-y divide-slate-100">
              {categories.length > 0 ? (
                categories.slice(0, 4).map((cat) => (
                  <div
                    key={cat.id}
                    className="py-3 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948] shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#006948] transition-colors">
                          {cat.namaKategori}
                        </span>
                        <span className="text-[11px] text-slate-400 capitalize truncate">
                          {cat.jenis ? `Jenis: ${cat.jenis}` : 'Kategori aktif'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#006948] block">
                        Rp {Number(cat.hargaPerKg || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        / kg ({cat.poinPerKg || 10} Poin)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Botol Kaca Bening
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Kaca jernih, bersih
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#006948] block">
                        Rp 1.500
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        / kg (8 Poin)
                      </span>
                    </div>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Kaleng Aluminium
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Logam press
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#006948] block">
                        Rp 12.000
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        / kg (20 Poin)
                      </span>
                    </div>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Kardus &amp; Karton
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Kertas kering
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#006948] block">
                        Rp 2.000
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        / kg (5 Poin)
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/nasabah/kategori-sampah"
              className="text-center text-xs text-slate-600 hover:text-[#006948] font-bold py-1 transition-colors block border-t border-slate-100 pt-3"
            >
              Lihat Semua Jenis Sampah →
            </Link>
          </div>

          {/* Minimalist Eco Tips Strip */}
          <div className="rounded-2xl p-4 bg-emerald-50/70 border border-emerald-100/70 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#006948] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lightbulb className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800">
                Tips Pilah Sampah Optimal
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pastikan botol plastik dan kardus dalam kondisi bersih &amp; kering sebelum disetor agar mendapatkan poin maksimal!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
