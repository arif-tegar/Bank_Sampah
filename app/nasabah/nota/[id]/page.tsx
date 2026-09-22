'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SetorSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Printer,
  Recycle,
  ArrowLeft,
  Calendar,
  Sparkles,
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import {
  formatTanggal,
  formatPoin,
  formatKg,
  formatRupiah,
} from '@/lib/utils';
import { downloadReceiptPdf } from '@/lib/pdf-receipt';

export default function DetailNotaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();

  const [setor, setSetor] = useState<SetorSampah | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      api.setorSampah
        .detail(id)
        .then((res) => {
          if (isMounted && res.success && res.data) {
            setSetor(res.data);
          }
        })
        .catch((err) => {
          if (isMounted) {
            showToast(err instanceof Error ? err.message : 'Gagal memuat nota transaksi', 'error');
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, showToast]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSetor = () => {
    if (!setor) return;
    const kode = setor.noTransaksi || setor.kodeTransaksi || `#SET-${setor.id.substring(0, 8).toUpperCase()}`;
    const category = setor.detailSetor?.[0]?.kategoriSampah?.namaKategori || 'Penyetoran Sampah Terpilah';
    downloadReceiptPdf('penyetoran', {
      kode,
      tanggal: formatTanggal(setor.tanggal, true),
      nasabah: setor.nasabah?.namaNasabah || setor.nasabah?.namaLengkap || 'Nasabah',
      status: setor.status || 'Selesai',
      itemTitle: category,
      itemSubtitle: setor.totalBeratKg ? `Total Bobot: ${formatKg(setor.totalBeratKg)}` : undefined,
      poinText: `+${formatPoin(setor.totalPoin ?? 0)}`,
    });
    showToast(`Bukti setoran ${kode} berhasil diunduh sebagai PDF!`, 'success', 'Unduh PDF Berhasil');
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-8 space-y-4">
        <Skeleton className="h-10 w-48 rounded-full bg-slate-100" />
        <Skeleton className="h-[520px] w-full rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (!setor) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 bg-white rounded-3xl p-8 border border-emerald-950/5 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800">Nota Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500">
          Transaksi penyetoran dengan ID ini tidak dapat ditemukan atau telah dihapus.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-all"
        >
          Kembali
        </button>
      </div>
    );
  }

  const kode = setor.noTransaksi || setor.kodeTransaksi || `#SET-${setor.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="max-w-md mx-auto pb-6 space-y-5 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Navigation & Actions Bar (Hidden on Print)                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between no-print gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSetor}
            className="px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Nota</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Official Receipt Card                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="receipt-card bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
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
            <span className="font-black text-slate-900 text-sm">{kode}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">TANGGAL & WAKTU</span>
            <span className="font-semibold text-slate-700">
              {formatTanggal(setor.tanggal, true)}
            </span>
          </div>

          {setor.nasabah && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">NAMA NASABAH</span>
              <span className="font-bold text-slate-800">
                {setor.nasabah.namaNasabah || setor.nasabah.namaLengkap || 'Nasabah'}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="text-slate-400">STATUS TRANSAKSI</span>
            <Badge status={setor.status} />
          </div>
        </div>

        {/* Waste Category Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Rincian Sampah</span>
            <span>Subtotal Poin</span>
          </div>

          <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-1">
            {setor.detailSetor && setor.detailSetor.length > 0 ? (
              setor.detailSetor.map((det, idx) => (
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
                {setor.totalBeratKg
                  ? `Total Penimbangan: ${formatKg(setor.totalBeratKg)}`
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
              +{formatPoin(setor.totalPoin ?? 0)}
            </span>
          </div>

          {setor.totalRupiah ? (
            <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-emerald-200/60">
              <span>Nilai Kompensasi Tunai:</span>
              <span className="font-bold text-slate-800">{formatRupiah(setor.totalRupiah)}</span>
            </div>
          ) : null}
        </div>

        {/* Footer note */}
        <div className="text-center pt-2 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-700">Terima kasih atas kontribusi Anda!</p>
          <p className="text-[11px]">
            Dokumen ini adalah bukti transaksi digital resmi yang sah dikeluarkan oleh sistem Bank Sampah.
          </p>
        </div>

        {/* Quick action at bottom */}
        <div className="pt-2 no-print grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={handleDownloadSetor}
            className="w-full h-11 px-3 sm:px-4 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full h-11 px-3 sm:px-4 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
