'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { KategoriSampah, JenisSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Search,
  ArrowRight,
  Layers,
  Coins,
  Scale,
  Sparkles,
  Package,
  Inbox,
  ArrowUpRight,
} from 'lucide-react';
import { formatRupiah, formatPoin, getFileUrl } from '@/lib/utils';

export default function DaftarJenisSampahPage() {
  const { showToast } = useToast();
  const [kategoriList, setKategoriList] = useState<KategoriSampah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('semua');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    setIsLoading(true);
    api.kategoriSampah
      .list()
      .then((res) => {
        if (res.success && res.data) {
          setKategoriList(res.data);
        }
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : 'Gagal memuat kategori sampah', 'error');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredList = kategoriList.filter((item) => {
    const matchesSearch = item.namaKategori.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = filterJenis === 'semua' || item.jenis === filterJenis;
    return matchesSearch && matchesJenis;
  });

  const getJenisBadgeColor = (jenis: JenisSampah | string) => {
    switch (jenis) {
      case 'plastik':
        return 'bg-blue-100 text-blue-800';
      case 'kertas':
        return 'bg-amber-100 text-amber-800';
      case 'logam':
        return 'bg-purple-100 text-purple-800';
      case 'kaca':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-slate-100 text-slate-700';
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
            Jenis & Harga Beli Sampah
          </h1>

          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Daftar kategori sampah daur ulang yang diterima oleh unit bank sampah beserta patokan nilai kompensasi rupiah dan perolehan poin per kilogram.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/nasabah/setor">
            <button className="px-6 py-3 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer">
              <ArrowUpRight className="w-4 h-4" />
              <span>Ajukan Setor Sekarang</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Filter and Search Pill Bar                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari jenis sampah (misal: Kardus, Botol PET)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] shadow-xs transition-all"
          />
        </div>

        {/* Category Pill Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['semua', 'plastik', 'kertas', 'logam', 'kaca'].map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => setFilterJenis(j)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                filterJenis === j
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {j}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Category Cards Grid                                        */}
      {/* ------------------------------------------------------------- */}
      <div>
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredList.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 border border-emerald-950/5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Jenis Sampah Tidak Ditemukan
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery
                  ? `Tidak ada jenis sampah yang cocok dengan kata kunci "${searchQuery}".`
                  : 'Belum ada data kategori sampah pada sistem ini.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-1 px-4 py-2 rounded-full bg-[#f2f3ff] text-[#006948] text-xs font-bold hover:bg-[#eaedff] transition-all cursor-pointer"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && filteredList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((kat) => {
              const fotoUrl = getFileUrl(kat.foto);

              return (
                <div
                  key={kat.id}
                  className="bg-white rounded-3xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-[#006948] shrink-0 overflow-hidden shadow-xs border border-emerald-100">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={kat.namaKategori}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-base text-slate-900 truncate">
                          {kat.namaKategori}
                        </span>
                        <span
                          className={`inline-block w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5 ${getJenisBadgeColor(
                            kat.jenis
                          )}`}
                        >
                          {kat.jenis}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f2f3ff]/60 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Harga Beli / Kg
                      </span>
                      <span className="text-base font-black text-[#006948]">
                        {formatRupiah(kat.hargaPerKg)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Reward Poin / Kg
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        +{formatPoin(kat.poinPerKg)} Pts
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Siap disetorkan</span>
                    <Link
                      href={`/nasabah/setor?kategoriId=${kat.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#006948] hover:text-[#00855d] transition-colors group-hover:translate-x-0.5"
                    >
                      <span>Pilih Sampah Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
