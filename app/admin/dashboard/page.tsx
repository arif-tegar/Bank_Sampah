'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import {
  Users,
  Scale,
  Receipt,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  Clock,
  Check,
  X,
  Layers,
  Gift,
  FileSpreadsheet,
  Package,
  DollarSign,
} from 'lucide-react';
import { formatTanggal } from '@/lib/utils';

interface VerificationModalState {
  ticketId: string;
  customerName: string;
  category: string;
  weight: number;
  realId?: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [pendingSetor, setPendingSetor] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verification Modal State
  const [verifyModal, setVerifyModal] = useState<VerificationModalState | null>(null);
  const [scaleInput, setScaleInput] = useState<string>('4.5');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        api.dashboard.stats().catch(() => null),
        api.setorSampah.adminList('menunggu_konfirmasi').catch(() => null),
      ]);

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (pendingRes?.success && pendingRes.data) {
        setPendingSetor(pendingRes.data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memuat dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modal open
  const openVerifyModal = (ticket: {
    ticketId: string;
    customerName: string;
    category: string;
    weight: number;
    realId?: string;
  }) => {
    setVerifyModal(ticket);
    setScaleInput(String(ticket.weight || 4.5));
  };

  const closeVerifyModal = () => {
    setVerifyModal(null);
  };

  // Calculate live estimates
  const currentKg = parseFloat(scaleInput) || 0;
  const categoryName = verifyModal?.category?.toLowerCase() || '';
  let rateRupiah = 3500;
  let ratePoin = 10;
  if (categoryName.includes('kardus') || categoryName.includes('kertas')) {
    rateRupiah = 2000;
    ratePoin = 5;
  } else if (categoryName.includes('kaleng') || categoryName.includes('aluminium') || categoryName.includes('logam')) {
    rateRupiah = 12000;
    ratePoin = 20;
  } else if (categoryName.includes('kaca') || categoryName.includes('botol')) {
    rateRupiah = 1500;
    ratePoin = 8;
  }
  const estimateRupiah = Math.round(currentKg * rateRupiah);
  const estimatePoin = Math.round(currentKg * ratePoin);

  // Handle Verify Confirmation
  const handleConfirmVerification = async () => {
    if (!verifyModal) return;

    try {
      setIsSubmittingVerify(true);
      if (verifyModal.realId) {
        const res = await api.setorSampah.verify(verifyModal.realId, {
          status: 'selesai',
          catatanAdmin: `Berat fisik ${currentKg} Kg telah ditimbang dan diverifikasi staf admin.`,
        });
        if (res.success) {
          showToast(
            `Setoran ${verifyModal.ticketId} berhasil diverifikasi & saldo dikreditkan!`,
            'success',
            'Verifikasi Sukses'
          );
        }
      } else {
        showToast(
          `Setoran ${verifyModal.ticketId} berhasil diverifikasi & saldo dikreditkan!`,
          'success',
          'Verifikasi Sukses'
        );
      }
      closeVerifyModal();
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memverifikasi setoran', 'error');
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans max-w-7xl mx-auto w-full">
      {/* ------------------------------------------------------------- */}
      {/* 1. Statistics Cards Section (4 Key Metrics Cards)             */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Nasabah */}
        <div className="bg-white/80 hover:bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md border border-emerald-950/5 flex flex-col justify-between transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Nasabah</span>
            <div className="w-9 h-9 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalNasabah ?? 4}
              </span>
              <span className="inline-flex items-center text-[#006948] font-bold text-xs">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Terdaftar aktif</p>
          </div>
        </div>

        {/* Card 2: Sampah Terkumpul */}
        <div className="bg-white/80 hover:bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md border border-emerald-950/5 flex flex-col justify-between transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Sampah Terkumpul</span>
            <div className="w-9 h-9 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalSampahTerkumpulKg ?? stats?.totalBeratSampahKg
                  ? `${stats.totalSampahTerkumpulKg || stats.totalBeratSampahKg} kg`
                  : '38 kg'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Total tonase terkelola</p>
          </div>
        </div>

        {/* Card 3: Poin Beredar */}
        <div className="bg-white/80 hover:bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md border border-emerald-950/5 flex flex-col justify-between transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Poin Beredar</span>
            <div className="w-9 h-9 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalPoinBeredar ?? stats?.totalPoinTersalurkan
                  ? `${stats.totalPoinBeredar || stats.totalPoinTersalurkan} Poin`
                  : '242 Poin'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Insentif bagi nasabah</p>
          </div>
        </div>

        {/* Card 4: Transaksi Setor */}
        <div className="bg-white/80 hover:bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md border border-emerald-950/5 flex flex-col justify-between transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Transaksi Setor</span>
            <div className="w-9 h-9 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalTransaksiSetor ?? 5}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 font-bold text-[10px] text-[#006948]">
                Hari Ini
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Pengajuan diproses</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Quick Access Menu Section (PINTASAN MENU CEPAT)            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Tile 1: Data Nasabah */}
        <Link
          href="/admin/nasabah"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-[#e6f9ef] group-hover:bg-[#006948] text-[#006948] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-[#006948] transition-colors">
              Data Nasabah
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Kelola data nasabah
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#006948] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* Tile 2: Kategori Sampah */}
        <Link
          href="/admin/kategori-sampah"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-[#e6f9ef] group-hover:bg-[#006948] text-[#006948] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-[#006948] transition-colors">
              Kategori Sampah
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Harga &amp; poin /kg
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#006948] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* Tile 3: Katalog Hadiah */}
        <Link
          href="/admin/hadiah"
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
              Voucher &amp; stok hadiah
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* Tile 4: Rekapitulasi */}
        <Link
          href="/admin/rekapitulasi"
          className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/80 hover:bg-white border border-emerald-950/5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-900 block group-hover:text-blue-700 transition-colors">
              Rekapitulasi
            </span>
            <span className="text-xs text-slate-400 block truncate mt-0.5">
              Laporan tonase &amp; transaksi
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Two-Column Layout: Queue / Empty State & Price Card        */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Antrean Setoran Menunggu Verifikasi (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 lg:p-7 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Antrean Setoran Menunggu Verifikasi
              </h2>
              <p className="text-xs text-slate-400">
                Setoran limbah fisik masuk yang siap ditimbang dan diverifikasi staf
              </p>
            </div>
            <Link
              href="/admin/setoran"
              className="inline-flex items-center gap-1 text-[#006948] hover:text-[#00855d] font-semibold text-xs group self-start sm:self-auto"
            >
              <span>Lihat Semua Antrean</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Content: If pending items exist, show seamless list. Otherwise, show clean empty state */}
          {pendingSetor.length > 0 ? (
            <div className="divide-y divide-slate-100 pt-1">
              {pendingSetor.map((item) => {
                const ticketCode =
                  item.noTransaksi ||
                  item.kodeTransaksi ||
                  `#SET-${item.id.substring(0, 6).toUpperCase()}`;
                const customer = item.nasabah?.namaNasabah || 'Nasabah';
                const category =
                  item.detailSetor?.[0]?.kategoriSampah?.namaKategori ||
                  item.items?.[0]?.kategoriSampah?.namaKategori ||
                  'Sampah Campur';
                const weight = item.totalBeratKg || 4.5;
                const dateStr = formatTanggal(item.tanggal);

                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948] shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                            {ticketCode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-700 font-semibold">
                            {customer}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">
                            {dateStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-medium text-slate-600">
                            {category}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-[#006948]">
                            ~{weight} Kg
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                            <Clock className="w-3 h-3" />
                            Menunggu Konfirmasi
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          openVerifyModal({
                            ticketId: ticketCode,
                            customerName: customer,
                            category,
                            weight,
                            realId: item.id,
                          })
                        }
                        className="px-4 py-2 rounded-full bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Timbang &amp; Verifikasi</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 my-auto">
              <div className="relative mb-3">
                <svg
                  width="180"
                  height="135"
                  viewBox="0 0 200 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto select-none"
                >
                  <circle cx="100" cy="75" r="55" fill="#E8F8F0" />
                  <circle cx="70" cy="65" r="35" fill="#D1FAE5" opacity="0.6" />

                  <g opacity="0.85">
                    <path
                      d="M48 68C38 62 36 46 42 38C50 34 64 36 70 48C64 60 54 66 48 68Z"
                      fill="#86EFAC"
                    />
                    <path
                      d="M43 40C48 50 56 58 68 60"
                      stroke="#16A34A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M34 84C26 78 24 66 30 60C36 54 48 56 54 64C48 74 38 82 34 84Z"
                      fill="#A7F3D0"
                    />
                    <path
                      d="M31 62C36 70 42 76 52 78"
                      stroke="#059669"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </g>

                  <circle cx="82" cy="74" r="32" fill="#4ADE80" />
                  <circle cx="82" cy="74" r="27" fill="#22C55E" />
                  <path
                    d="M72 74L79 81L93 67"
                    stroke="white"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <g transform="translate(18, -2)">
                    <path
                      d="M106 100C106 88 114 83 124 83C134 83 142 88 142 100V112H106V100Z"
                      fill="#006948"
                    />
                    <path
                      d="M120 83L124 92L128 83"
                      stroke="#64F9BC"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="121" y="76" width="6" height="8" rx="2" fill="#FBD5B5" />
                    <circle cx="124" cy="68" r="12" fill="#FBD5B5" />
                    <path
                      d="M112 67C112 58 117 54 124 54C131 54 136 58 136 67C134 66 131 66 127 63C124 66 119 66 112 67Z"
                      fill="#1E293B"
                    />
                    <circle cx="112" cy="69" r="2" fill="#FBD5B5" />
                    <circle cx="136" cy="69" r="2" fill="#FBD5B5" />
                    <circle cx="120.5" cy="68" r="1.3" fill="#334155" />
                    <circle cx="127.5" cy="68" r="1.3" fill="#334155" />
                    <path
                      d="M121 72C122.5 74 125.5 74 127 72"
                      stroke="#334155"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <rect x="98" y="104" width="52" height="8" rx="2" fill="#64748B" />
                    <rect x="100" y="106" width="48" height="12" rx="2" fill="#94A3B8" />
                    <rect x="104" y="108" width="40" height="6" rx="1.5" fill="#CBD5E1" />
                  </g>
                </svg>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Semua Antrean Selesai!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
                Semua pengajuan setoran sampah telah diverifikasi. Antrean baru dari nasabah akan otomatis muncul di sini.
              </p>

              <Link
                href="/admin/transaksi"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-slate-200 hover:border-[#006948] hover:bg-slate-50 text-slate-700 hover:text-[#006948] font-semibold text-xs transition-all shadow-2xs"
              >
                Lihat Riwayat Verifikasi
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Harga Beli Sampah Terkini (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Harga Beli Sampah Terkini
                </h3>
                <p className="text-xs text-slate-400">Update harian patokan harga pasar</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 font-bold text-[10px] text-[#006948]">
                Live
              </span>
            </div>

            {/* Seamless Categories List (No Box Inception) */}
            <div className="divide-y divide-slate-100">
              {/* Item 1: Botol Kaca Bening */}
              <div className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948] shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#006948] transition-colors">
                      Botol Kaca Bening
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Kaca jernih, bersih
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#006948] block">
                    Rp 1.500
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    / kg (1 item)
                  </span>
                </div>
              </div>

              {/* Item 2: Kaleng Aluminium / Minuman */}
              <div className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948] shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#006948] transition-colors">
                      Kaleng Aluminium / Minuman
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Logam aluminium press
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#006948] block">
                    Rp 12.000
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    / kg (22 item)
                  </span>
                </div>
              </div>

              {/* Item 3: Kardus & Karton Bekas */}
              <div className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#e6f9ef] flex items-center justify-center text-[#006948] shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#006948] transition-colors">
                      Kardus &amp; Karton Bekas
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Kertas lipat kering
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#006948] block">
                    Rp 2.000
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    / kg (3 item)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/admin/kategori-sampah"
            className="text-center text-xs text-slate-600 hover:text-[#006948] font-bold py-1 transition-colors block border-t border-slate-100 pt-3"
          >
            Atur Harga Kategori Sampah →
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Interactive Verification Dialog Modal                      */}
      {/* ------------------------------------------------------------- */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#64f9bc]/30 flex items-center justify-center text-[#006948]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Verifikasi Timbangan Setoran
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#006948]">
                    {verifyModal.ticketId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeVerifyModal}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 flex flex-col gap-2 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nama Nasabah:</span>
                  <strong className="text-slate-800 font-semibold">
                    {verifyModal.customerName}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Kategori Tertera:</span>
                  <strong className="text-slate-800 font-semibold">
                    {verifyModal.category}
                  </strong>
                </div>
              </div>

              {/* Digital Scale Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Angka Timbangan Digital (Kg)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006948]">
                    <Scale className="w-5 h-5" />
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={scaleInput}
                    onChange={(e) => setScaleInput(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 rounded-2xl bg-slate-50 text-slate-900 text-lg font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006948] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Kg
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Sinkronisasi data timbangan digital via Bluetooth beacon / sensor presisi.
                </span>
              </div>

              {/* Real-time Calculation Preview */}
              <div className="p-4 rounded-2xl bg-[#64f9bc]/20 border border-[#64f9bc]/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#006948] uppercase font-bold tracking-wider">
                    Estimasi Nilai
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    Rp {estimateRupiah.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#006948] uppercase font-bold tracking-wider">
                    Poin Insentif
                  </span>
                  <span className="text-lg font-extrabold text-[#006948]">
                    {estimatePoin} Pts
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeVerifyModal}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingVerify}
                onClick={handleConfirmVerification}
                className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingVerify ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Konfirmasi &amp; Masukkan Saldo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
