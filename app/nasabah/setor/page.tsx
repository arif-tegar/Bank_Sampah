'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { KategoriSampah } from '@/types/api';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Coins,
  ArrowRight,
  Info,
  Scale,
  DollarSign,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { formatPoin, formatRupiah } from '@/lib/utils';

interface SetorItemRow {
  kategoriSampahId: string;
  beratKg: number | string;
}

function SetorFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKatId = searchParams.get('kategoriId') || '';

  const { showToast } = useToast();

  const [kategoriList, setKategoriList] = useState<KategoriSampah[]>([]);
  const [isLoadingKategori, setIsLoadingKategori] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date formatted as YYYY-MM-DD in local time
  const todayStr = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Form states
  const [tanggal, setTanggal] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState<SetorItemRow[]>([
    { kategoriSampahId: initialKatId, beratKg: 1 },
  ]);

  useEffect(() => {
    let isMounted = true;
    api.kategoriSampah
      .list()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setKategoriList(res.data);
          if (res.data.length > 0) {
            setItems((prev) =>
              prev.map((row) => ({
                ...row,
                kategoriSampahId: row.kategoriSampahId || initialKatId || res.data[0].id,
              }))
            );
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          showToast(err instanceof Error ? err.message : 'Gagal memuat kategori sampah', 'error');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingKategori(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialKatId, showToast]);

  const handleAddItem = () => {
    const defaultId = kategoriList.length > 0 ? kategoriList[0].id : '';
    setItems((prev) => [...prev, { kategoriSampahId: defaultId, beratKg: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('Minimal harus ada 1 item sampah', 'info');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof SetorItemRow,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Calculations
  const calculations = items.map((item) => {
    const kat = kategoriList.find((k) => k.id === item.kategoriSampahId);
    const berat = Number(item.beratKg) || 0;
    const poinPerKg = kat ? kat.poinPerKg : 0;
    const hargaPerKg = kat ? kat.hargaPerKg : 0;
    return {
      subtotalPoin: berat * poinPerKg,
      subtotalRupiah: berat * hargaPerKg,
    };
  });

  const totalEstimasiPoin = calculations.reduce((acc, curr) => acc + curr.subtotalPoin, 0);
  const totalEstimasiRupiah = calculations.reduce((acc, curr) => acc + curr.subtotalRupiah, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast('Pilih minimal 1 jenis sampah', 'error');
      return;
    }

    if (tanggal < todayStr) {
      showToast('Tanggal penyetoran tidak boleh di hari kemarin atau lampau', 'error');
      return;
    }

    // Validate rows
    for (let i = 0; i < items.length; i++) {
      if (!items[i].kategoriSampahId) {
        showToast(`Pilih kategori sampah pada item #${i + 1}`, 'error');
        return;
      }
      if (Number(items[i].beratKg) <= 0) {
        showToast(`Berat sampah pada item #${i + 1} harus lebih dari 0 kg`, 'error');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await api.setorSampah.pengajuan({
        tanggal: new Date(tanggal).toISOString(),
        catatan: catatan.trim() || undefined,
        items: items.map((it) => ({
          kategoriSampahId: it.kategoriSampahId,
          beratKg: Number(it.beratKg),
        })),
      });

      if (res.success && res.data) {
        showToast(
          'Pengajuan penyetoran sampah berhasil dikirim! Bawa limbah Anda ke unit bank sampah.',
          'success',
          'Berhasil Diajukan'
        );
        router.push('/nasabah/setor/riwayat');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengajukan penyetoran';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 text-slate-800 antialiased font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-2">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">
          Ajukan Penyetoran Sampah
        </h1>

        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed relative z-10">
          Tentukan tanggal dan masukkan estimasi berat limbah Anda. Petugas unit bank sampah akan melakukan penimbangan fisik ulang secara akurat saat barang diserahkan.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Form Card                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-emerald-950/5 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Tanggal Penyetoran */}
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#006948]" />
              Rencana Tanggal Penyetoran
            </label>
            <input
              type="date"
              required
              min={todayStr}
              value={tanggal}
              onChange={(e) => {
                const val = e.target.value;
                if (val && val < todayStr) {
                  showToast('Tidak dapat memilih tanggal di hari kemarin. Silakan pilih hari ini atau hari berikutnya.', 'error');
                  setTanggal(todayStr);
                  return;
                }
                setTanggal(val);
              }}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Penyetoran hanya dapat dijadwalkan untuk hari ini atau hari berikutnya.
            </p>
          </div>

          {/* Dynamic Items Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#006948]" />
                Rincian Jenis Sampah & Estimasi Berat
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[#006948] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-3">
              {items.map((item, index) => {
                const subtotal = calculations[index] || { subtotalPoin: 0, subtotalRupiah: 0 };
                return (
                  <div
                    key={index}
                    className="p-4 sm:p-5 rounded-2xl bg-[#f2f3ff]/50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Kategori Sampah #{index + 1}
                      </label>
                      <select
                        value={item.kategoriSampahId}
                        onChange={(e) => handleItemChange(index, 'kategoriSampahId', e.target.value)}
                        disabled={isLoadingKategori}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                      >
                        {kategoriList.map((kat) => (
                          <option key={kat.id} value={kat.id}>
                            {kat.namaKategori} ({kat.poinPerKg} poin/kg • {formatRupiah(kat.hargaPerKg)}/kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Berat (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.beratKg}
                        ref={(el) => {
                          if (el && !el.dataset.wheelDisabled) {
                            el.dataset.wheelDisabled = 'true';
                            el.addEventListener(
                              'wheel',
                              (e) => {
                                e.preventDefault();
                              },
                              { passive: false }
                            );
                          }
                        }}
                        onWheel={(e) => {
                          (e.target as HTMLInputElement).blur();
                        }}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                            val = val.replace(/^0+/, '');
                          }
                          handleItemChange(index, 'beratKg', val);
                        }}
                        onBlur={() => {
                          if (item.beratKg === '' || Number(item.beratKg) <= 0) {
                            handleItemChange(index, 'beratKg', 1);
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948]"
                      />
                    </div>

                    <div className="w-full sm:w-32 pt-1 sm:pt-0">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Estimasi Poin
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100/80 text-[#006948] font-black text-sm">
                        +{formatPoin(subtotal.subtotalPoin)} Pts
                      </div>
                    </div>

                    <div className="sm:pt-5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        title="Hapus baris ini"
                        className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Calculation Banner */}
          <div className="p-5 rounded-2xl bg-[#64f9bc]/20 border border-[#64f9bc]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#00714e] uppercase tracking-wider block">
                  Estimasi Total Perolehan
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#006948]">
                  +{formatPoin(totalEstimasiPoin)} Pts
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">
                Estimasi Nilai Rupiah
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatRupiah(totalEstimasiRupiah)}
              </span>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Catatan Nasabah (Opsional)</label>
            <textarea
              rows={3}
              placeholder="Contoh: Botol plastik sudah dibilas bersih dan dipres rapi..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] transition-all"
            />
          </div>

          {/* Info Banner */}
          <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-[#f2f3ff]/60 p-3.5 rounded-2xl border border-slate-100">
            <Info className="w-4 h-4 text-[#006948] shrink-0" />
            <span>
              Poin aktual dan kompensasi kas akan dikonfirmasi berdasarkan hasil penimbangan fisik ulang oleh petugas unit saat limbah diserahkan.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Setoran'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AjukanSetorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat formulir...</div>}>
      <SetorFormInner />
    </Suspense>
  );
}
