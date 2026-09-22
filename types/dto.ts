import { JenisSampah } from './api';

export interface RegisterAppMakerDto {
  email: string;
  password: string;
  namaSiswa: string;
  kelas: string;
  namaApp: string;
}

export interface LoginAppMakerDto {
  email: string;
  password: string;
}

export interface RegisterNasabahBankDto {
  username: string;
  password: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  foto?: File | Blob | null;
}

export interface RegisterAdminBankDto {
  username: string;
  password: string;
  namaUnit: string;
  namaPengelola: string;
  telp: string;
  foto?: File | Blob | null;
}

export interface LoginUserDto {
  username: string;
  password: string;
}

export interface CreateNasabahDto {
  username: string;
  password: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  foto?: File | Blob | null;
}

export interface UpdateNasabahDto {
  namaNasabah?: string;
  namaLengkap?: string;
  telp?: string;
  noTelepon?: string;
  alamat: string;
  tanggalLahir?: string;
  foto?: File | Blob | null;
}

export interface CreateKategoriSampahDto {
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: JenisSampah;
  foto?: File | Blob | null;
}

export interface UpdateKategoriSampahDto {
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: JenisSampah;
  foto?: File | Blob | null;
}

export interface ItemSetorDto {
  kategoriSampahId: string;
  beratKg: number;
}

export interface CreateSetorSampahDto {
  tanggal: string; // ISO 8601 string YYYY-MM-DD or full ISO
  catatan?: string;
  items: ItemSetorDto[];
}

export interface VerifyItemSetorDto {
  kategoriSampahId: string;
  beratKgReal: number;
}

export interface VerifySetorSampahDto {
  status: 'diverifikasi' | 'ditolak' | 'selesai';
  catatanAdmin: string;
  itemsReal?: VerifyItemSetorDto[];
}

export interface CreateHadiahDto {
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: File | Blob | null;
}

export interface UpdateHadiahDto {
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: File | Blob | null;
}

export interface CreatePenukaranPoinDto {
  hadiahId: string;
}

export interface UpdateStatusPenukaranDto {
  status: 'diproses' | 'selesai' | 'ditolak';
}
