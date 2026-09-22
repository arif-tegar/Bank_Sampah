import {
  UserAuthData,
  KategoriSampah,
  Nasabah,
  Hadiah,
  SetorSampah,
  PenukaranPoin,
  DashboardStats,
  DashboardSummary,
  RekapitulasiBulanan,
} from '@/types/api';

export const MOCK_NASABAH_USER: UserAuthData = {
  id: 'user-nasabah-01',
  username: 'sitiaminah',
  role: 'nasabah',
  token: 'mock-jwt-token-nasabah',
  nasabah: {
    id: 'nasabah-01',
    namaNasabah: 'Siti Aminah',
    namaLengkap: 'Siti Aminah',
    alamat: 'Jl. Merpati Putih No. 45, RT 02/RW 03',
    telp: '081234567890',
    noTelepon: '081234567890',
    saldoPoin: 150,
    saldo_poin: 150,
  },
};

export const MOCK_ADMIN_USER: UserAuthData = {
  id: 'user-admin-01',
  username: 'adminbank',
  role: 'admin_bank',
  token: 'mock-jwt-token-admin',
  adminBank: {
    id: 'admin-01',
    namaUnit: 'Bank Sampah Unit Melati Bersih',
    namaPengelola: 'Budi Santoso',
    telp: '082198765432',
  },
};

export const INITIAL_KATEGORI: KategoriSampah[] = [
  {
    id: 'kat-01',
    namaKategori: 'Botol Plastik PET',
    hargaPerKg: 3000,
    poinPerKg: 10,
    jenis: 'plastik',
    foto: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kat-02',
    namaKategori: 'Kardus Box Cokelat',
    hargaPerKg: 2000,
    poinPerKg: 5,
    jenis: 'kertas',
    foto: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kat-03',
    namaKategori: 'Kaleng Aluminium Minuman',
    hargaPerKg: 8000,
    poinPerKg: 20,
    jenis: 'logam',
    foto: null,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_NASABAH_LIST: Nasabah[] = [
  {
    id: 'nasabah-01',
    namaNasabah: 'Siti Aminah',
    alamat: 'Jl. Merpati Putih No. 45',
    telp: '081234567890',
    saldoPoin: 150,
    username: 'sitiaminah',
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'nasabah-02',
    namaNasabah: 'Ahmad Supardi',
    alamat: 'Jl. Kenanga Indah No. 12',
    telp: '085711223344',
    saldoPoin: 75,
    username: 'ahmads',
    createdAt: '2026-03-05T09:30:00.000Z',
  },
  {
    id: 'nasabah-03',
    namaNasabah: 'Dewi Lestari',
    alamat: 'Komplek Permata Hijau B-8',
    telp: '089988776655',
    saldoPoin: 320,
    username: 'dewilestari',
    createdAt: '2026-03-10T14:15:00.000Z',
  },
];

export const INITIAL_HADIAH_LIST: Hadiah[] = [
  {
    id: 'hadiah-01',
    namaHadiah: 'Minyak Goreng Sawit 1 Liter',
    poinDibutuhkan: 50,
    stok: 12,
    foto: null,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'hadiah-02',
    namaHadiah: 'Gula Pasir Kristal 1 Kg',
    poinDibutuhkan: 30,
    stok: 25,
    foto: null,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'hadiah-03',
    namaHadiah: 'Sepeda Gunung Eco Trail Premium',
    poinDibutuhkan: 1000,
    stok: 3,
    foto: null,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

export const INITIAL_SETORAN_LIST: SetorSampah[] = [
  {
    id: 'setor-01',
    kodeTransaksi: 'SET-20260318-001',
    tanggal: '2026-03-18',
    status: 'menunggu_konfirmasi',
    totalBeratKg: 4,
    totalPoin: 40,
    totalRupiah: 12000,
    catatan: 'Botol plastik bersih siap timbang',
    nasabahId: 'nasabah-01',
    nasabah: {
      id: 'nasabah-01',
      namaNasabah: 'Siti Aminah',
      telp: '081234567890',
      alamat: 'Jl. Merpati Putih No. 45',
      saldoPoin: 150,
    },
    detailSetor: [
      {
        id: 'det-01',
        kategoriSampahId: 'kat-01',
        beratKg: 4,
        subtotalPoin: 40,
        subtotalRupiah: 12000,
        kategoriSampah: INITIAL_KATEGORI[0],
      },
    ],
  },
  {
    id: 'setor-02',
    kodeTransaksi: 'SET-20260317-002',
    tanggal: '2026-03-17',
    status: 'diverifikasi',
    totalBeratKg: 10,
    totalPoin: 50,
    totalRupiah: 20000,
    catatan: 'Kardus box tebal',
    nasabahId: 'nasabah-02',
    nasabah: {
      id: 'nasabah-02',
      namaNasabah: 'Ahmad Supardi',
      telp: '085711223344',
      alamat: 'Jl. Kenanga Indah No. 12',
      saldoPoin: 75,
    },
    detailSetor: [
      {
        id: 'det-02',
        kategoriSampahId: 'kat-02',
        beratKg: 10,
        subtotalPoin: 50,
        subtotalRupiah: 20000,
        kategoriSampah: INITIAL_KATEGORI[1],
      },
    ],
  },
  {
    id: 'setor-03',
    kodeTransaksi: 'SET-20260315-003',
    tanggal: '2026-03-15',
    status: 'selesai',
    totalBeratKg: 5,
    totalPoin: 100,
    totalRupiah: 40000,
    catatan: 'Kaleng aluminium soda',
    nasabahId: 'nasabah-01',
    nasabah: {
      id: 'nasabah-01',
      namaNasabah: 'Siti Aminah',
      telp: '081234567890',
      alamat: 'Jl. Merpati Putih No. 45',
      saldoPoin: 150,
    },
    detailSetor: [
      {
        id: 'det-03',
        kategoriSampahId: 'kat-03',
        beratKg: 5,
        subtotalPoin: 100,
        subtotalRupiah: 40000,
        kategoriSampah: INITIAL_KATEGORI[2],
      },
    ],
  },
];

export const INITIAL_PENUKARAN_LIST: PenukaranPoin[] = [
  {
    id: 'tukar-01',
    kodePenukaran: 'TKR-20260318-001',
    tanggal: '2026-03-18',
    poinTerpakai: 50,
    status: 'diproses',
    nasabahId: 'nasabah-01',
    hadiahId: 'hadiah-01',
    nasabah: {
      id: 'nasabah-01',
      namaNasabah: 'Siti Aminah',
      telp: '081234567890',
      alamat: 'Jl. Merpati Putih No. 45',
    },
    hadiah: INITIAL_HADIAH_LIST[0],
    createdAt: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 'tukar-02',
    kodePenukaran: 'TKR-20260310-002',
    tanggal: '2026-03-10',
    poinTerpakai: 30,
    status: 'selesai',
    nasabahId: 'nasabah-01',
    hadiahId: 'hadiah-02',
    nasabah: {
      id: 'nasabah-01',
      namaNasabah: 'Siti Aminah',
      telp: '081234567890',
      alamat: 'Jl. Merpati Putih No. 45',
    },
    hadiah: INITIAL_HADIAH_LIST[1],
    createdAt: '2026-03-10T09:00:00.000Z',
  },
];

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  saldoPoin: 150,
  totalSampahKg: 19,
  totalPenyetoran: 2,
  totalPenukaran: 2,
  transaksiTerakhir: INITIAL_SETORAN_LIST.slice(0, 2),
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalNasabah: 3,
  totalAdminUnit: 1,
  totalSampahTerkumpulKg: 145.5,
  totalBeratSampahKg: 145.5,
  totalPoinBeredar: 545,
  totalPoinTersalurkan: 1250,
  totalPoinDitukar: 80,
  totalTransaksiSetor: 18,
  totalTransaksiPenukaran: 4,
};

export const MOCK_REKAPITULASI: RekapitulasiBulanan = {
  bulan: '2026-03',
  totalTonaseKg: 145.5,
  perkiraanPembayaranRupiah: 485000,
  totalTransaksiSetor: 18,
  totalTransaksiTukar: 4,
  detailPerJenis: [
    { jenis: 'plastik', tonaseKg: 75.5, rupiah: 226500, poin: 755 },
    { jenis: 'kertas', tonaseKg: 45.0, rupiah: 90000, poin: 225 },
    { jenis: 'logam', tonaseKg: 15.0, rupiah: 120000, poin: 300 },
    { jenis: 'kaca', tonaseKg: 10.0, rupiah: 48500, poin: 50 },
  ],
};
