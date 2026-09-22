// Standard API Response structure
export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  timestamp?: string;
}

export type UserRole = 'nasabah' | 'admin_bank' | 'admin';

export interface AppMakerStats {
  totalNasabah: number;
  totalKategoriSampah: number;
  totalTransaksiSetor: number;
  totalHadiah: number;
}

export interface AppMakerData {
  id: string;
  email: string;
  namaSiswa: string;
  kelas: string;
  namaApp: string;
  appKey: string;
  token?: string;
  stats?: AppMakerStats;
  createdAt?: string;
}

export interface UserAuthData {
  id: string;
  username: string;
  role: UserRole;
  token: string;
  nasabah?: Nasabah;
  adminBank?: AdminBank;
}

export interface Nasabah {
  id: string;
  id_user?: string | number;
  userId?: string;
  namaNasabah: string;
  namaLengkap?: string;
  alamat: string;
  telp: string;
  noTelepon?: string;
  saldoPoin?: number;
  saldo_poin?: number;
  foto?: string | null;
  tanggalLahir?: string | null;
  user?: { id?: string; username?: string; role?: string };
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminBank {
  id: string;
  id_user?: string | number;
  userId?: string;
  namaUnit: string;
  namaPengelola: string;
  telp: string;
  foto?: string | null;
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type JenisSampah = 'plastik' | 'kertas' | 'logam' | 'kaca';

export interface KategoriSampah {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: JenisSampah;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusSetor = 'menunggu_konfirmasi' | 'belum dikonfirmasi' | 'diverifikasi' | 'diproses' | 'selesai' | 'ditolak';

export interface DetailSetor {
  id: string;
  setorSampahId?: string;
  kategoriSampahId: string;
  beratKg: number;
  subtotalPoin?: number;
  subtotalRupiah?: number;
  kategoriSampah?: KategoriSampah;
}

export interface SetorSampah {
  id: string;
  kodeTransaksi?: string;
  noTransaksi?: string;
  tanggal: string;
  status: StatusSetor;
  catatan?: string | null;
  catatanAdmin?: string | null;
  totalPoin?: number;
  totalBeratKg?: number;
  totalRupiah?: number;
  nasabahId?: string;
  nasabah?: Nasabah;
  detailSetor?: DetailSetor[];
  items?: DetailSetor[];
  createdAt?: string;
}

export interface Hadiah {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusPenukaran = 'diproses' | 'selesai' | 'ditolak';

export interface PenukaranPoin {
  id: string;
  kodePenukaran?: string;
  tanggal: string;
  poinTerpakai: number;
  status: StatusPenukaran;
  nasabahId?: string;
  hadiahId?: string;
  nasabah?: Nasabah;
  hadiah?: Hadiah;
  createdAt?: string;
}

export interface DashboardSummary {
  saldoPoin: number;
  totalSampahKg: number;
  totalPenyetoran: number;
  totalPenukaran: number;
  transaksiTerakhir?: SetorSampah[];
}

export interface DashboardStats {
  totalNasabah: number;
  totalAdminUnit?: number;
  totalSampahTerkumpulKg?: number;
  totalBeratSampahKg?: number;
  totalPoinBeredar?: number;
  totalPoinTersalurkan?: number;
  totalPoinDitukar?: number;
  totalTransaksiSetor: number;
  totalTransaksiPenukaran?: number;
}

export interface RekapDetailJenis {
  jenis: JenisSampah | string;
  tonaseKg: number;
  rupiah: number;
  poin?: number;
}

export interface RekapitulasiBulanan {
  bulan: string;
  totalTonaseKg: number;
  perkiraanPembayaranRupiah: number;
  totalTransaksiSetor: number;
  totalTransaksiTukar: number;
  detailPerJenis: RekapDetailJenis[];
}
