'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { SetorSampah, KategoriSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Scale,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  Layers,
  FileText,
  Clock,
  Lock,
} from 'lucide-react';
import { formatTanggal, formatPoin, formatKg, formatRupiah } from '@/lib/utils';

export default function KonfirmasiPenyetoranPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();

  const [setor, setSetor] = useState<SetorSampah | null>(null);
  const [availableCategories, setAvailableCategories] = useState<KategoriSampah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification Form State
  const [catatanAdmin, setCatatanAdmin] = useState('Berat sesuai penimbangan fisik');
  const [itemsReal, setItemsReal] = useState<
    {
      kategoriSampahId: string;
      namaKategori: string;
      beratEstimasi: number;
      beratKgReal: number;
      poinPerKg: number;
      hargaPerKg: number;
    }[]
  >([]);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setIsLoading(true);
      Promise.all([
        api.setorSampah.detail(id),
        api.kategoriSampah.list().catch(() => ({ success: false, data: [] as KategoriSampah[] })),
      ])
        .then(([resSetor, resKat]) => {
          if (!isMounted) return;

          let katList: KategoriSampah[] = [];
          if (resKat.success && Array.isArray(resKat.data)) {
            katList = resKat.data;
            setAvailableCategories(resKat.data);
          }

          if (resSetor.success && resSetor.data) {
            const s = resSetor.data as any;
            setSetor(s);

            if (s.catatanAdmin) {
              setCatatanAdmin(s.catatanAdmin);
            }

            // Check all possible field names for items (camelCase and snake_case)
            const rawItems = s.detailSetor || s.detail_setor || s.items || s.details || s.rincian || [];
            let mapped = rawItems.map((item: any) => {
              const kat =
                item.kategoriSampah ||
                item.kategori_sampah ||
                item.kategori ||
                katList.find((k) => k.id === (item.kategoriSampahId || item.kategori_sampah_id));
              const berat = Number(item.beratKg ?? item.berat_kg ?? item.berat ?? 0);
              const poin = Number(kat?.poinPerKg ?? kat?.poin_per_kg ?? 10);
              const harga = Number(kat?.hargaPerKg ?? kat?.harga_per_kg ?? 3000);
              const nama =
                kat?.namaKategori ||
                kat?.nama_kategori ||
                kat?.nama ||
                item.namaKategori ||
                item.nama_kategori ||
                'Kategori Sampah';

              return {
                kategoriSampahId: item.kategoriSampahId || item.kategori_sampah_id || kat?.id || '',
                namaKategori: nama,
                beratEstimasi: berat,
                beratKgReal: berat,
                poinPerKg: poin,
                hargaPerKg: harga,
              };
            });

            // If mapped items are still empty (e.g. backend saved total values on parent without detail rows):
            if (mapped.length === 0) {
              const fallbackKat = katList[0] || {
                id: 'cat-default',
                namaKategori: 'Sampah Terpilah',
                poinPerKg: 10,
                hargaPerKg: 3000,
              };
              const defaultBerat = Number(s.totalBeratKg ?? s.total_berat_kg ?? 1);

              mapped = [
                {
                  kategoriSampahId: fallbackKat.id,
                  namaKategori: fallbackKat.namaKategori,
                  beratEstimasi: defaultBerat,
                  beratKgReal: defaultBerat,
                  poinPerKg: fallbackKat.poinPerKg || 10,
                  hargaPerKg: fallbackKat.hargaPerKg || 3000,
                },
              ];
            }

            setItemsReal(mapped);
          }
        })
        .catch((err) => {
          if (isMounted) {
            showToast(err instanceof Error ? err.message : 'Gagal memuat detail setoran', 'error');
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

  const handleBeratRealChange = (index: number, val: number) => {
    setItemsReal((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, beratKgReal: val } : it))
    );
  };

  const totalItemRupiah = itemsReal.reduce(
    (acc, curr) => acc + (curr.beratKgReal || 0) * (curr.hargaPerKg || 0),
    0
  );
  const totalItemPoin = itemsReal.reduce(
    (acc, curr) => acc + (curr.beratKgReal || 0) * (curr.poinPerKg || 0),
    0
  );

  const calculatedTotalRupiah =
    totalItemRupiah > 0
      ? totalItemRupiah
      : (setor?.totalRupiah ?? (setor as any)?.total_rupiah ?? 0);

  const calculatedTotalPoin =
    totalItemPoin > 0
      ? totalItemPoin
      : (setor?.totalPoin ?? (setor as any)?.total_poin ?? 0);

  const handleVerify = async (selectedStatus: 'diverifikasi' | 'selesai' | 'ditolak') => {
    if (!catatanAdmin.trim()) {
      showToast('Harap masukkan catatan admin', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.setorSampah.verify(id, {
        status: selectedStatus,
        catatanAdmin: catatanAdmin.trim(),
        itemsReal: itemsReal.map((it) => ({
          kategoriSampahId: it.kategoriSampahId,
          beratKgReal: Number(it.beratKgReal),
        })),
      });

      if (res.success) {
        showToast(
          `Setoran berhasil diverifikasi dengan status "${selectedStatus}"!`,
          'success',
          'Verifikasi Berhasil'
        );
        router.push('/admin/transaksi');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memverifikasi setoran', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu_konfirmasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Konfirmasi
          </span>
        );
      case 'diverifikasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Diverifikasi
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#64f9bc]/40 text-[#00714e] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-4">
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!setor) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-500">Data setoran tidak ditemukan.</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-full bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-all cursor-pointer"
        >
          Kembali ke Antrean
        </button>
      </div>
    );
  }

  const kode =
    setor.noTransaksi || setor.kodeTransaksi || `#SET-${setor.id.substring(0, 8).toUpperCase()}`;

  const isCompleted = setor.status === 'selesai';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* Top Back & Status Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {getStatusBadge(setor.status)}
      </div>

      {/* Main Verification Card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-6">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Verifikasi Timbangan Setoran
              </h2>
              <span className="font-mono text-xs font-bold text-[#006948]">
                {kode}
              </span>
            </div>
          </div>
        </div>

        {/* Nasabah Info Sub-card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f2f3ff]/60 border border-slate-100 flex flex-col gap-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Nama Nasabah:</span>
            <strong className="text-slate-900 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#006948]" />
              {setor.nasabah?.namaNasabah || setor.nasabah?.namaLengkap || 'Nasabah'}
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Tanggal Pengajuan:</span>
            <span className="text-slate-800 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatTanggal(setor.tanggal, true)}
            </span>
          </div>
          {setor.catatan && (
            <div className="pt-2 border-t border-slate-200/70">
              <span className="text-slate-400 block mb-0.5 text-xs">Catatan Nasabah:</span>
              <p className="italic text-slate-700 text-xs">
                &ldquo;{setor.catatan}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Digital Scale Items Input */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#006948]" />
              Verifikasi Timbangan Fisik per Kategori
            </label>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <Lock className="w-3 h-3 text-slate-500" />
              Terkunci sesuai pengajuan nasabah
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {itemsReal.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#f2f3ff] text-[#006948] flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm block truncate">
                        {item.namaKategori}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        Estimasi Nasabah: {formatKg(item.beratEstimasi)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Tarif: {item.poinPerKg} Poin/Kg • {formatRupiah(item.hargaPerKg)}/Kg
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      Hasil Timbang Riil (Terkunci)
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        readOnly
                        disabled
                        value={item.beratKgReal}
                        className="w-28 h-10 pl-3 pr-8 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-slate-700 text-sm focus:outline-none transition-all text-right cursor-not-allowed select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#64f9bc]/20 border border-[#64f9bc]/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#00714e] uppercase tracking-wider">
              Estimasi Nilai Rupiah
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {formatRupiah(calculatedTotalRupiah)}
            </span>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[11px] font-bold text-[#00714e] uppercase tracking-wider">
              Total Poin Nasabah
            </span>
            <span className="text-lg sm:text-xl font-black text-[#006948]">
              +{formatPoin(calculatedTotalPoin)}
            </span>
          </div>
        </div>

        {/* Catatan Admin */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#006948]" />
            Catatan Petugas / Staf Timbangan
          </label>
          <textarea
            rows={2}
            value={catatanAdmin}
            onChange={(e) => setCatatanAdmin(e.target.value)}
            placeholder="Masukkan catatan verifikasi atau kondisi fisik limbah..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleVerify('ditolak')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Tolak Pengajuan</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVerify('selesai')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#006948] text-white hover:bg-[#00855d] text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi & Masukkan Saldo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
