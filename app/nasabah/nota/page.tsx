'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SetorSampah, PenukaranPoin } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Receipt,
  Printer,
  Recycle,
  Gift,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Download,
} from 'lucide-react';
import {
  formatTanggal,
  formatPoin,
  formatKg,
  formatRupiah,
} from '@/lib/utils';
import { downloadReceiptPdf } from '@/lib/pdf-receipt';

function NotaPageInner() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'penukaran' ? 'penukaran' : 'penyetoran';

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'penyetoran' | 'penukaran'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  const [setorList, setSetorList] = useState<SetorSampah[]>([]);
  const [penukaranList, setPenukaranList] = useState<PenukaranPoin[]>([]);
  const [selectedSetor, setSelectedSetor] = useState<SetorSampah | null>(null);
  const [selectedTukar, setSelectedTukar] = useState<PenukaranPoin | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      api.setorSampah.mySetor().catch(() => null),
      api.penukaranPoin.myPenukaran().catch(() => null),
    ])
      .then(([setRes, tukRes]) => {
        if (isMounted) {
          if (setRes?.success && setRes.data) {
            setSetorList(setRes.data);
            if (setRes.data.length > 0) {
              setSelectedSetor(setRes.data[0]);
            }
          }
          if (tukRes?.success && tukRes.data) {
            setPenukaranList(tukRes.data);
            if (tukRes.data.length > 0) {
              setSelectedTukar(tukRes.data[0]);
            }
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          showToast(err instanceof Error ? err.message : 'Gagal memuat bukti transaksi', 'error');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPenukaran = () => {
    if (!selectedTukar) return;
    const kode = selectedTukar.kodePenukaran || `#TKR-${selectedTukar.id.substring(0, 8).toUpperCase()}`;
    downloadReceiptPdf('penukaran', {
      kode,
      tanggal: formatTanggal(selectedTukar.tanggal, true),
      nasabah: selectedTukar.nasabah?.namaNasabah || selectedTukar.nasabah?.namaLengkap || 'Nasabah',
      status: selectedTukar.status || 'Selesai',
      itemTitle: selectedTukar.hadiah?.namaHadiah || 'Item Hadiah',
      poinText: `-${selectedTukar.poinTerpakai || 0} Poin`,
    });
    showToast(`Bukti penukaran ${kode} berhasil diunduh sebagai PDF!`, 'success', 'Unduh PDF Berhasil');
  };

  const handleDownloadSetor = () => {
    if (!selectedSetor) return;
    const kode =
      selectedSetor.noTransaksi ||
      selectedSetor.kodeTransaksi ||
      `#SET-${selectedSetor.id.substring(0, 8).toUpperCase()}`;
    const category = selectedSetor.detailSetor?.[0]?.kategoriSampah?.namaKategori || 'Penyetoran Sampah Terpilah';
    downloadReceiptPdf('penyetoran', {
      kode,
      tanggal: formatTanggal(selectedSetor.tanggal, true),
      nasabah: selectedSetor.nasabah?.namaNasabah || selectedSetor.nasabah?.namaLengkap || 'Nasabah',
      status: selectedSetor.status || 'Selesai',
      itemTitle: category,
      itemSubtitle: selectedSetor.totalBeratKg ? `Total Bobot: ${formatKg(selectedSetor.totalBeratKg)}` : undefined,
      poinText: `+${selectedSetor.totalPoin || 0} Poin`,
    });
    showToast(`Bukti setoran ${kode} berhasil diunduh sebagai PDF!`, 'success', 'Unduh PDF Berhasil');
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nota & Bukti Transaksi
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Akses dan cetak struk resmi untuk setiap penyetoran sampah daur ulang dan klaim penukaran hadiah Anda.
          </p>
        </div>

       
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Tabs Selector (Penyetoran vs Penukaran)                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-full border border-emerald-950/5 shadow-xs w-fit no-print">
        <button
          type="button"
          onClick={() => setActiveTab('penyetoran')}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'penyetoran'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Recycle className="w-3.5 h-3.5" />
          <span>Penyetoran Sampah ({setorList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('penukaran')}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'penukaran'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Penukaran Hadiah ({penukaranList.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Loading State                                              */}
      {/* ------------------------------------------------------------- */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-100" />
            ))}
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-[480px] w-full rounded-3xl bg-slate-100" />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Empty State                                                */}
      {/* ------------------------------------------------------------- */}
      {!isLoading &&
        ((activeTab === 'penyetoran' && setorList.length === 0) ||
          (activeTab === 'penukaran' && penukaranList.length === 0)) && (
          <div className="bg-white rounded-3xl p-12 text-center border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#64f9bc]/20 flex items-center justify-center text-[#006948] mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Belum Ada Bukti {activeTab === 'penyetoran' ? 'Penyetoran' : 'Penukaran'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mb-6">
              {activeTab === 'penyetoran'
                ? 'Anda belum memiliki riwayat transaksi penyetoran sampah daur ulang.'
                : 'Anda belum pernah melakukan penukaran poin dengan hadiah.'}
            </p>
            <Link href={activeTab === 'penyetoran' ? '/nasabah/setor' : '/nasabah/hadiah'}>
              <button className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md">
                {activeTab === 'penyetoran' ? 'Ajukan Setor Sampah' : 'Katalog Hadiah'}
              </button>
            </Link>
          </div>
        )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Main Split View: Transaction List & Receipt Preview        */}
      {/* ------------------------------------------------------------- */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Transaction Selector List */}
          <div className="lg:col-span-5 space-y-3 no-print">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daftar Dokumen
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {activeTab === 'penyetoran' ? setorList.length : penukaranList.length} Transaksi
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {activeTab === 'penyetoran' &&
                setorList.map((item) => {
                  const isSelected = selectedSetor?.id === item.id;
                  const kode =
                    item.noTransaksi || item.kodeTransaksi || `#SET-${item.id.substring(0, 6).toUpperCase()}`;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedSetor(item)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-[#006948] ring-2 ring-[#006948]/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs text-slate-900 font-mono tracking-tight">
                          {kode}
                        </span>
                        <Badge status={item.status} />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-slate-400 font-medium">{formatTanggal(item.tanggal)}</span>
                        <span className="font-extrabold text-[#006948]">
                          +{formatPoin(item.totalPoin ?? 0)}
                        </span>
                      </div>

                      {item.totalBeratKg ? (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Berat total: {formatKg(item.totalBeratKg)}
                        </p>
                      ) : null}
                    </div>
                  );
                })}

              {activeTab === 'penukaran' &&
                penukaranList.map((item) => {
                  const isSelected = selectedTukar?.id === item.id;
                  const kode =
                    item.kodePenukaran || `#TKR-${item.id.substring(0, 6).toUpperCase()}`;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTukar(item)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-[#006948] ring-2 ring-[#006948]/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs text-slate-900 font-mono tracking-tight">
                          {kode}
                        </span>
                        <Badge status={item.status} />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-slate-400 font-medium">{formatTanggal(item.tanggal)}</span>
                        <span className="font-extrabold text-rose-600">
                          -{formatPoin(item.poinTerpakai ?? 0)}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                        {item.hadiah?.namaHadiah || 'Item Hadiah'}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Receipt Container */}
          <div className="lg:col-span-7">
            {/* 5A. Penyetoran Receipt */}
            {activeTab === 'penyetoran' && selectedSetor && (
              <div className="receipt-card bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 max-w-lg mx-auto">
                {/* Letterhead Header */}
                <div className="text-center space-y-2 pb-5 border-b-2 border-dashed border-slate-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#006948] text-white flex items-center justify-center mx-auto shadow-md">
                    <Recycle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      BANK SAMPAH DIGITAL
                    </h2>
                    <p className="text-xs font-semibold text-[#006948] uppercase tracking-wider mt-0.5">
                      Bukti Resmi Penyetoran Sampah
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Unit Pengelolaan Sampah Terpadu & Berkelanjutan
                    </p>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="p-4 rounded-2xl bg-[#f2f3ff]/50 border border-slate-100 text-xs space-y-2 font-mono text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">NO. TRANSAKSI</span>
                    <span className="font-black text-slate-900 text-sm">
                      {selectedSetor.noTransaksi ||
                        selectedSetor.kodeTransaksi ||
                        `#SET-${selectedSetor.id.substring(0, 8).toUpperCase()}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">TANGGAL & WAKTU</span>
                    <span className="font-semibold text-slate-700">
                      {formatTanggal(selectedSetor.tanggal, true)}
                    </span>
                  </div>

                  {selectedSetor.nasabah && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">NAMA NASABAH</span>
                      <span className="font-bold text-slate-800">
                        {selectedSetor.nasabah.namaNasabah || selectedSetor.nasabah.namaLengkap || 'Nasabah'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-400">STATUS TRANSAKSI</span>
                    <Badge status={selectedSetor.status} />
                  </div>
                </div>

                {/* Waste Category Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span>Rincian Sampah</span>
                    <span>Subtotal Poin</span>
                  </div>

                  <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-1">
                    {selectedSetor.detailSetor && selectedSetor.detailSetor.length > 0 ? (
                      selectedSetor.detailSetor.map((det, idx) => (
                        <div key={det.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">
                              {det.kategoriSampah?.namaKategori || 'Kategori Sampah'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Berat: {formatKg(det.beratKg)}
                            </p>
                          </div>
                          <span className="font-black text-[#006948] font-mono text-sm">
                            +{formatPoin(det.subtotalPoin ?? 0)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 text-xs text-slate-400 italic text-center">
                        {selectedSetor.totalBeratKg
                          ? `Total Penimbangan: ${formatKg(selectedSetor.totalBeratKg)}`
                          : 'Rincian penimbangan sampah'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Calculations */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Total Poin Diperoleh:</span>
                    <span className="text-xl font-black text-[#006948]">
                      +{formatPoin(selectedSetor.totalPoin ?? 0)}
                    </span>
                  </div>

                  {selectedSetor.totalRupiah ? (
                    <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-emerald-200/60">
                      <span>Nilai Kompensasi Tunai:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(selectedSetor.totalRupiah)}</span>
                    </div>
                  ) : null}
                </div>

                {/* Footer Note */}
                <div className="text-center pt-2 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-700">Terima kasih atas kontribusi Anda!</p>
                  <p className="text-[11px]">
                    Dokumen ini adalah bukti transaksi digital resmi yang sah dikeluarkan oleh sistem Bank Sampah.
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 no-print w-full">
                  <Link href={`/nasabah/nota/${selectedSetor.id}`} className="w-full">
                    <button className="w-full h-11 px-2 sm:px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Halaman Penuh</span>
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleDownloadSetor}
                    className="w-full h-11 px-2 sm:px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-200 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full h-11 px-2 sm:px-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>Cetak Nota</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5B. Penukaran Hadiah Receipt */}
            {activeTab === 'penukaran' && selectedTukar && (
              <div className="receipt-card bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 max-w-lg mx-auto">
                {/* Letterhead Header */}
                <div className="text-center space-y-2 pb-5 border-b-2 border-dashed border-slate-200">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Gift className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      BANK SAMPAH DIGITAL
                    </h2>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mt-0.5">
                      Bukti Klaim Penukaran Hadiah
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Voucher / Penukaran Merchandise & Reward
                    </p>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="p-4 rounded-2xl bg-[#f2f3ff]/50 border border-slate-100 text-xs space-y-2 font-mono text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">KODE TIKET</span>
                    <span className="font-black text-slate-900 text-sm">
                      {selectedTukar.kodePenukaran ||
                        `#TKR-${selectedTukar.id.substring(0, 8).toUpperCase()}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">TANGGAL KLAIM</span>
                    <span className="font-semibold text-slate-700">
                      {formatTanggal(selectedTukar.tanggal, true)}
                    </span>
                  </div>

                  {selectedTukar.nasabah && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">NAMA NASABAH</span>
                      <span className="font-bold text-slate-800">
                        {selectedTukar.nasabah.namaNasabah || selectedTukar.nasabah.namaLengkap || 'Nasabah'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-400">STATUS PENGAMBILAN</span>
                    <Badge status={selectedTukar.status} />
                  </div>
                </div>

                {/* Detail Reward Claim */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Barang / Voucher yang Diklaim
                  </p>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {selectedTukar.hadiah?.namaHadiah || 'Item Hadiah'}
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Tunjukkan nota ini pada petugas operasional
                      </p>
                    </div>
                    <span className="font-black text-rose-600 font-mono text-sm">
                      -{formatPoin(selectedTukar.poinTerpakai)}
                    </span>
                  </div>
                </div>

                {/* Point deduction summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Poin Terpakai:</span>
                  <span className="text-lg font-black text-rose-600 font-mono">
                    -{formatPoin(selectedTukar.poinTerpakai)}
                  </span>
                </div>

                {/* Footer instructions */}
                <div className="text-center pt-2 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-700">Selamat atas hadiah Anda!</p>
                  <p className="text-[11px]">
                    Bawa bukti ini ke loket bank sampah untuk verifikasi dan serah terima fisik reward.
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 no-print grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleDownloadPenukaran}
                    className="w-full h-11 px-3 sm:px-4 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap hover:scale-[1.01] active:scale-95"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full h-11 px-3 sm:px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Cetak Bukti</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotaNasabahPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Memuat nota...</div>}>
      <NotaPageInner />
    </Suspense>
  );
}
