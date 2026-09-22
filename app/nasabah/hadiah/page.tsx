'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import { Hadiah } from '@/types/api';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Gift,
  Coins,
  Sparkles,
  ArrowRight,
  Receipt,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  ChevronRight,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { formatPoin, getFileUrl } from '@/lib/utils';

export default function TukarPoinPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [hadiahList, setHadiahList] = useState<Hadiah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal confirm state
  const [selectedHadiah, setSelectedHadiah] = useState<Hadiah | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nasabah = mounted ? user?.nasabah : null;
  const saldoPoin = nasabah?.saldoPoin ?? nasabah?.saldo_poin ?? 0;

  useEffect(() => {
    let isMounted = true;
    api.hadiah
      .list()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setHadiahList(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          showToast(err instanceof Error ? err.message : 'Gagal memuat katalog hadiah', 'error');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleOpenConfirm = (item: Hadiah) => {
    if (saldoPoin < item.poinDibutuhkan) {
      showToast('Saldo poin Anda belum mencukupi untuk menukar hadiah ini', 'error', 'Poin Tidak Cukup');
      return;
    }
    if (item.stok <= 0) {
      showToast('Maaf, stok hadiah ini sedang habis', 'error', 'Stok Habis');
      return;
    }
    setSelectedHadiah(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmTukar = async () => {
    if (!selectedHadiah) return;

    try {
      setIsSubmitting(true);
      const res = await api.penukaranPoin.tukar({ hadiahId: selectedHadiah.id });
      if (res.success && res.data) {
        showToast(
          `Penukaran hadiah "${selectedHadiah.namaHadiah}" berhasil diajukan!`,
          'success',
          'Penukaran Sukses'
        );
        setIsConfirmOpen(false);
        await refreshUser();
        // Redirect to Nota / Bukti Penukaran
        router.push(`/nasabah/nota?tab=penukaran`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menukarkan poin';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHadiah = hadiahList.filter((item) =>
    item.namaHadiah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tukar Poin Hadiah
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Tukarkan akumulasi poin setoran sampah Anda dengan berbagai voucher belanja, perlengkapan sembako, atau merchandise eksklusif.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/nasabah/nota?tab=penukaran">
            <button className="px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Penukaran</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Saldo Poin Display Card                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#006948] via-[#005238] to-[#043324] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-950/20">
        <div className="absolute -right-16 -bottom-16 w-60 h-60 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Gift className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-[#64f9bc]" />
              <span>Saldo Poin Nasabah Aktif</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-[#64f9bc]">
                {formatPoin(saldoPoin)}
              </span>
              <span className="text-sm sm:text-base font-semibold text-emerald-200">
                Poin Terkumpul
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 max-w-md">
              Poin diperoleh dari setiap transaksi penimbangan sampah daur ulang. Poin tidak memiliki masa kedaluwarsa selama akun Anda aktif.
            </p>
          </div>

          
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Search Bar & Filters                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari hadiah atau reward..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#f2f3ff]/50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#006948] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
          <span>Menampilkan <strong className="text-slate-800">{filteredHadiah.length}</strong> pilihan reward</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Loading Skeletons                                          */}
      {/* ------------------------------------------------------------- */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-xs space-y-4">
              <Skeleton className="h-44 w-full rounded-2xl bg-slate-100" />
              <Skeleton className="h-5 w-3/4 rounded-full bg-slate-100" />
              <Skeleton className="h-4 w-1/2 rounded-full bg-slate-100" />
              <div className="pt-2 flex justify-between items-center">
                <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
                <Skeleton className="h-10 w-24 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Empty State                                                */}
      {/* ------------------------------------------------------------- */}
      {!isLoading && filteredHadiah.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#64f9bc]/20 flex items-center justify-center text-[#006948] mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {searchQuery ? 'Hadiah Tidak Ditemukan' : 'Katalog Hadiah Belum Tersedia'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-6">
            {searchQuery
              ? `Tidak ada hadiah yang cocok dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
              : 'Belum ada hadiah yang ditambahkan oleh pengelola bank sampah saat ini. Silakan cek kembali nanti.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-slate-700 text-xs font-bold transition-all"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. Rewards Grid                                               */}
      {/* ------------------------------------------------------------- */}
      {!isLoading && filteredHadiah.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHadiah.map((item) => {
            const isAffordable = saldoPoin >= item.poinDibutuhkan;
            const isAvailable = item.stok > 0;
            const canRedeem = isAffordable && isAvailable;
            const fotoUrl = getFileUrl(item.foto);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#006948]/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-[#f2f3ff] to-[#e4e7ff] overflow-hidden flex items-center justify-center mb-4 border border-slate-100">
                    {fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fotoUrl}
                        alt={item.namaHadiah}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-emerald-600">
                        <Gift className="w-8 h-8" />
                      </div>
                    )}

                    {/* Stock badge overlay */}
                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-emerald-700 text-[11px] font-bold shadow-xs border border-emerald-100 flex items-center gap-1">
                          <PackageCheck className="w-3 h-3 text-emerald-600" />
                          Stok: {item.stok}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold shadow-xs border border-rose-200">
                          Stok Habis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-[#006948] transition-colors">
                    {item.namaHadiah}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                    {(item as Record<string, any>).deskripsi || 'Reward ramah lingkungan resmi dari Bank Sampah.'}
                  </p>
                </div>

                {/* Points & Redeem Button */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Nilai Tukar
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      <span className="text-base font-black text-[#006948]">
                        {formatPoin(item.poinDibutuhkan)}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!canRedeem}
                    onClick={() => handleOpenConfirm(item)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                      canRedeem
                        ? 'bg-[#006948] hover:bg-[#00855d] text-white hover:scale-[1.02] shadow-emerald-900/10'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <span>{canRedeem ? 'Tukar Sekarang' : !isAvailable ? 'Habis' : 'Poin Kurang'}</span>
                    {canRedeem && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. Confirmation Modal (Rounded 3XL Emerald)                   */}
      {/* ------------------------------------------------------------- */}
      {isConfirmOpen && selectedHadiah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-emerald-950/10 flex flex-col gap-5 scale-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#64f9bc]/30 flex items-center justify-center text-[#006948]">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Konfirmasi Penukaran
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pastikan rincian penukaran poin sudah sesuai
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reward Item Preview */}
            <div className="p-4 rounded-2xl bg-[#f2f3ff]/60 border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
                {selectedHadiah.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFileUrl(selectedHadiah.foto)}
                    alt={selectedHadiah.namaHadiah}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gift className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {selectedHadiah.namaHadiah}
                </h4>
                <p className="text-xs font-extrabold text-[#006948] mt-0.5">
                  {formatPoin(selectedHadiah.poinDibutuhkan)} Poin
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sisa stok tersedia: {selectedHadiah.stok} unit
                </p>
              </div>
            </div>

            {/* Poin Calculation Summary */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Saldo Poin Anda:</span>
                <span className="font-bold text-slate-800">{formatPoin(saldoPoin)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span className="font-medium">Poin yang Ditukarkan:</span>
                <span className="font-bold">- {formatPoin(selectedHadiah.poinDibutuhkan)}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center font-extrabold text-emerald-800">
                <span>Sisa Saldo Poin:</span>
                <span className="text-sm text-[#006948]">
                  {formatPoin(saldoPoin - selectedHadiah.poinDibutuhkan)}
                </span>
              </div>
            </div>

            {/* Note alert */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Tiket penukaran akan otomatis diterbitkan di menu Nota & Bukti untuk diambil di kantor bank sampah.</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmTukar}
                className="px-6 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>Setujui & Tukar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
