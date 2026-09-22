'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { RekapitulasiBulanan, DashboardStats, SetorSampah, PenukaranPoin } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Scale,
  DollarSign,
  Recycle,
  Gift,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  formatRupiah,
  formatBulanTahun,
  getCurrentMonthStr,
} from '@/lib/utils';

export default function AdminRekapitulasiPage() {
  const { showToast } = useToast();

  const [bulan, setBulan] = useState<string>(() => getCurrentMonthStr());
  const [rekap, setRekap] = useState<RekapitulasiBulanan | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevMonth = () => {
    if (!bulan) return;
    const [year, month] = bulan.split('-').map(Number);
    const date = new Date(year, month - 1 - 1, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setBulan(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    if (!bulan) return;
    const [year, month] = bulan.split('-').map(Number);
    const date = new Date(year, month - 1 + 1, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setBulan(`${newYear}-${newMonth}`);
  };

  const handleCurrentMonth = () => {
    setBulan(getCurrentMonthStr());
  };

  const fetchRekap = useCallback(async () => {
    if (!bulan) return;
    try {
      setIsLoading(true);
      const [rekapRes, statsRes, setorRes, tukarRes, catRes] = await Promise.all([
        api.dashboard.rekapitulasi(bulan).catch(() => null),
        api.dashboard.stats().catch(() => null),
        api.setorSampah.adminList(undefined, bulan).catch(() => null),
        api.penukaranPoin.adminList(bulan).catch(() => null),
        api.kategoriSampah.list().catch(() => null),
      ]);

      const categories = catRes?.success && Array.isArray(catRes.data) ? catRes.data : [];
      const catMap = new Map(categories.map((c) => [c.id, c]));

      const getPricePerKg = (catId?: string, jenis?: string, catObj?: any) => {
        if (catObj?.hargaPerKg && Number(catObj.hargaPerKg) > 0) return Number(catObj.hargaPerKg);
        if (catId && catMap.has(catId)) {
          const c = catMap.get(catId);
          if (c?.hargaPerKg && Number(c.hargaPerKg) > 0) return Number(c.hargaPerKg);
        }
        const j = (jenis || '').toLowerCase();
        if (j.includes('logam') || j.includes('besi') || j.includes('aluminium') || j.includes('kaleng')) return 12000;
        if (j.includes('kertas') || j.includes('kardus') || j.includes('karton')) return 2000;
        if (j.includes('kaca') || j.includes('botol')) return 1500;
        return 3000; // default plastik
      };

      // 1. Check if backend returns valid non-zero rekapitulasi data
      if (
        rekapRes?.success &&
        rekapRes.data &&
        (rekapRes.data.totalTonaseKg > 0 ||
          (rekapRes.data.detailPerJenis &&
            rekapRes.data.detailPerJenis.length > 0 &&
            rekapRes.data.detailPerJenis.some((d) => d.tonaseKg > 0)))
      ) {
        const enrichedDetail = rekapRes.data.detailPerJenis?.map((d) => {
          let rupiah = Number(d.rupiah || 0);
          const tonase = Number(d.tonaseKg || 0);
          if (rupiah === 0 && tonase > 0) {
            const price = getPricePerKg(undefined, d.jenis);
            rupiah = Math.round(tonase * price);
          }
          return { ...d, rupiah };
        }) || [];

        const computedTotalRupiah = enrichedDetail.reduce((acc, curr) => acc + (curr.rupiah || 0), 0);

        setRekap({
          ...rekapRes.data,
          perkiraanPembayaranRupiah:
            Number(rekapRes.data.perkiraanPembayaranRupiah || 0) > 0
              ? Number(rekapRes.data.perkiraanPembayaranRupiah)
              : computedTotalRupiah,
          detailPerJenis: enrichedDetail,
        });
      } else {
        // 2. Aggregate from real transactions in setorSampah & penukaranPoin
        const setoranData: SetorSampah[] =
          setorRes?.success && Array.isArray(setorRes.data) ? setorRes.data : [];
        const penukaranData: PenukaranPoin[] =
          tukarRes?.success && Array.isArray(tukarRes.data) ? tukarRes.data : [];

        const matchingSetoran = setoranData.filter((s) => {
          const tgl = s.tanggal || (s as any).createdAt || '';
          return tgl.startsWith(bulan);
        });
        const matchingPenukaran = penukaranData.filter((p) => {
          const tgl = p.tanggal || (p as any).createdAt || '';
          return tgl.startsWith(bulan);
        });

        if (matchingSetoran.length > 0 || matchingPenukaran.length > 0) {
          let calcTonase = 0;
          let calcRupiah = 0;
          const jenisMap: Record<string, { tonaseKg: number; rupiah: number; poin: number }> = {
            plastik: { tonaseKg: 0, rupiah: 0, poin: 0 },
            kertas: { tonaseKg: 0, rupiah: 0, poin: 0 },
            logam: { tonaseKg: 0, rupiah: 0, poin: 0 },
            kaca: { tonaseKg: 0, rupiah: 0, poin: 0 },
          };

          matchingSetoran.forEach((s) => {
            const berat = Number(s.totalBeratKg || 0);

            if (s.detailSetor && s.detailSetor.length > 0) {
              s.detailSetor.forEach((d) => {
                const dBerat = Number(d.beratKg || 0);
                const rawJenis = (
                  d.kategoriSampah?.jenis ||
                  d.kategoriSampah?.namaKategori ||
                  'plastik'
                ).toLowerCase();
                let matchedJenis = 'plastik';
                if (
                  rawJenis.includes('kertas') ||
                  rawJenis.includes('karton') ||
                  rawJenis.includes('kardus')
                ) {
                  matchedJenis = 'kertas';
                } else if (
                  rawJenis.includes('logam') ||
                  rawJenis.includes('besi') ||
                  rawJenis.includes('kaleng') ||
                  rawJenis.includes('aluminium')
                ) {
                  matchedJenis = 'logam';
                } else if (rawJenis.includes('kaca') || rawJenis.includes('botol')) {
                  matchedJenis = 'kaca';
                }

                const price = getPricePerKg(d.kategoriSampahId, matchedJenis, d.kategoriSampah);
                const dRupiah = Number(d.subtotalRupiah) > 0 ? Number(d.subtotalRupiah) : Math.round(dBerat * price);
                const dPoin = Number(d.subtotalPoin) > 0 ? Number(d.subtotalPoin) : Math.round(dBerat * 10);

                if (!jenisMap[matchedJenis]) {
                  jenisMap[matchedJenis] = { tonaseKg: 0, rupiah: 0, poin: 0 };
                }
                jenisMap[matchedJenis].tonaseKg += dBerat;
                jenisMap[matchedJenis].rupiah += dRupiah;
                jenisMap[matchedJenis].poin += dPoin;
                calcTonase += dBerat;
                calcRupiah += dRupiah;
              });
            } else {
              const price = getPricePerKg((s as any).kategoriSampahId, 'plastik');
              const sRupiah = Number(s.totalRupiah) > 0 ? Number(s.totalRupiah) : Math.round(berat * price);
              const sPoin = Number(s.totalPoin) > 0 ? Number(s.totalPoin) : Math.round(berat * 10);

              jenisMap.plastik.tonaseKg += berat;
              jenisMap.plastik.rupiah += sRupiah;
              jenisMap.plastik.poin += sPoin;
              calcTonase += berat;
              calcRupiah += sRupiah;
            }
          });

          setRekap({
            bulan,
            totalTonaseKg: Math.round(calcTonase * 10) / 10,
            perkiraanPembayaranRupiah: calcRupiah,
            totalTransaksiSetor: matchingSetoran.length,
            totalTransaksiTukar: matchingPenukaran.length,
            detailPerJenis: Object.entries(jenisMap).map(([jenis, data]) => ({
              jenis,
              tonaseKg: Math.round(data.tonaseKg * 10) / 10,
              rupiah: Math.round(data.rupiah),
              poin: Math.round(data.poin),
            })),
          });
        } else {
          // Zero transactions for the selected month
          setRekap({
            bulan,
            totalTonaseKg: 0,
            perkiraanPembayaranRupiah: 0,
            totalTransaksiSetor: 0,
            totalTransaksiTukar: 0,
            detailPerJenis: [
              { jenis: 'plastik', tonaseKg: 0, rupiah: 0, poin: 0 },
              { jenis: 'kertas', tonaseKg: 0, rupiah: 0, poin: 0 },
              { jenis: 'logam', tonaseKg: 0, rupiah: 0, poin: 0 },
              { jenis: 'kaca', tonaseKg: 0, rupiah: 0, poin: 0 },
            ],
          });
        }
      }

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      setRekap({
        bulan,
        totalTonaseKg: 0,
        perkiraanPembayaranRupiah: 0,
        totalTransaksiSetor: 0,
        totalTransaksiTukar: 0,
        detailPerJenis: [
          { jenis: 'plastik', tonaseKg: 0, rupiah: 0, poin: 0 },
          { jenis: 'kertas', tonaseKg: 0, rupiah: 0, poin: 0 },
          { jenis: 'logam', tonaseKg: 0, rupiah: 0, poin: 0 },
          { jenis: 'kaca', tonaseKg: 0, rupiah: 0, poin: 0 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }, [bulan]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const handlePrint = () => {
    window.print();
  };

  const totalTonase = rekap?.totalTonaseKg || 0;
  const totalRupiah =
    rekap?.detailPerJenis && rekap.detailPerJenis.length > 0
      ? rekap.detailPerJenis.reduce((acc, curr) => acc + (curr.rupiah || 0), 0)
      : rekap?.perkiraanPembayaranRupiah || 0;

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rekapitulasi Bulanan
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-bold border border-emerald-200/60 shadow-2xs">
              {formatBulanTahun(bulan)}
            </span>
          </div>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Laporan agregasi total tonase sampah terkumpul, pengeluaran insentif kas rupiah, dan riwayat aktivitas transaksi unit.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Quick Month Navigator */}
          <div className="flex items-center bg-[#f2f3ff] p-1 rounded-full border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006948] hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1">
              <Calendar className="w-4 h-4 text-[#006948]" />
              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006948] hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to current month button if different */}
          {bulan !== getCurrentMonthStr() && (
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="px-3.5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Bulan Ini</span>
            </button>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Print Document Header */}
      <div className="hidden print:block mb-4 p-4 border-b-2 border-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bank Sampah Digital</h1>
            <p className="text-sm text-slate-600">Laporan Rekapitulasi Bulanan Operasional</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">Periode: {formatBulanTahun(bulan)}</p>
            <p>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. 4 Key Metrics Row                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Tonase */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tonase Sampah
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalTonase.toFixed(1)}
              </span>
              <span className="text-base font-bold text-slate-500">Kg</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Limbah masuk bulan ini</p>
          </div>
        </div>

        {/* Card 2: Perkiraan Pembayaran */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nilai Pembelian
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006948] tracking-tight block truncate">
              {formatRupiah(totalRupiah)}
            </span>
            <p className="text-xs text-slate-400 mt-1 font-medium">Estimasi kompensasi kas</p>
          </div>
        </div>

        {/* Card 3: Transaksi Setor */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Aktivitas Setor
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Recycle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {rekap?.totalTransaksiSetor ?? 0}
              </span>
              <span className="text-base font-bold text-slate-500">Tiket</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Penyetoran diproses</p>
          </div>
        </div>

        {/* Card 4: Transaksi Tukar */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Klaim Hadiah
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#e6f9ef] flex items-center justify-center text-[#006948]">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {rekap?.totalTransaksiTukar ?? 0}
              </span>
              <span className="text-base font-bold text-slate-500">Kali</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Penukaran poin sukses</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Detail Breakdown per Jenis Sampah                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Progress visual bars (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 lg:p-7 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f9ef] text-[#006948] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Komposisi Tonase Limbah
              </h3>
              <p className="text-xs text-slate-400">Persentase kontribusi per kategori</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {rekap?.detailPerJenis && rekap.detailPerJenis.length > 0 ? (
              rekap.detailPerJenis.map((item, idx) => {
                const percent = totalTonase > 0 ? Math.round((item.tonaseKg / totalTonase) * 100) : 0;

                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 uppercase tracking-wide">
                        {item.jenis}
                      </span>
                      <span className="font-extrabold text-[#006948]">
                        {item.tonaseKg} Kg ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#006948] transition-all duration-500"
                        style={{ width: `${Math.max(percent, item.tonaseKg > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada data tonase pada bulan ini.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Table breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 lg:p-7 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e6f9ef] text-[#006948] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Tabel Rincian Jenis Sampah
                </h3>
                <p className="text-xs text-slate-400">Data audit tonase dan estimasi rupiah</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Jenis Sampah</th>
                  <th className="pb-3">Tonase</th>
                  <th className="pb-3">Porsi (%)</th>
                  <th className="pb-3 text-right">Nilai Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rekap?.detailPerJenis && rekap.detailPerJenis.length > 0 ? (
                  rekap.detailPerJenis.map((row, idx) => {
                    const percent = totalTonase > 0 ? Math.round((row.tonaseKg / totalTonase) * 100) : 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-bold text-slate-900 uppercase">
                          {row.jenis}
                        </td>
                        <td className="py-3 font-semibold text-[#006948]">
                          {row.tonaseKg} Kg
                        </td>
                        <td className="py-3 font-semibold text-slate-500">
                          {percent}%
                        </td>
                        <td className="py-3 text-right font-extrabold text-slate-900">
                          {formatRupiah(row.rupiah)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Tidak ada catatan transaksi di bulan ini.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-extrabold text-slate-900 text-xs">
                  <td className="pt-3 uppercase">Total Rekapitulasi</td>
                  <td className="pt-3 text-[#006948]">{totalTonase} Kg</td>
                  <td className="pt-3">100%</td>
                  <td className="pt-3 text-right text-[#006948] text-sm">
                    {formatRupiah(totalRupiah)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
