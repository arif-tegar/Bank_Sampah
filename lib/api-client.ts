import { getAppKey, getToken } from './auth';
import { ApiResponse, AppMakerData, UserAuthData, KategoriSampah, SetorSampah, Hadiah, PenukaranPoin, DashboardSummary, DashboardStats, RekapitulasiBulanan, Nasabah } from '@/types/api';
import {
  RegisterAppMakerDto,
  LoginAppMakerDto,
  RegisterNasabahBankDto,
  RegisterAdminBankDto,
  LoginUserDto,
  CreateNasabahDto,
  UpdateNasabahDto,
  CreateKategoriSampahDto,
  UpdateKategoriSampahDto,
  CreateSetorSampahDto,
  VerifySetorSampahDto,
  CreateHadiahDto,
  UpdateHadiahDto,
  CreatePenukaranPoinDto,
  UpdateStatusPenukaranDto,
} from '@/types/dto';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://learn.smktelkom-mlg.sch.id/bank_sampah/';

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  skipAppKey?: boolean;
}

export async function apiClient<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let url = `${cleanBase}${cleanEndpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(options.headers || {});

  // Add x-app-key
  if (!options.skipAppKey) {
    const appKey = getAppKey();
    if (appKey) {
      headers.set('x-app-key', appKey);
    }
  }

  // Add Bearer token
  if (!options.skipAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let body: BodyInit | undefined = undefined;
  if (options.body) {
    if (options.body instanceof FormData) {
      body = options.body;
      // Don't set Content-Type, let browser set boundary
    } else if (typeof options.body === 'object') {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    } else {
      body = options.body as BodyInit;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body,
    });

    const data: ApiResponse<T> = await res.json().catch(() => ({
      statusCode: res.status,
      success: false,
      message: res.statusText || 'Terjadi kesalahan sistem',
      data: null as unknown as T,
    }));

    if (!res.ok || data.success === false) {
      let message = data.message || `Request failed with status ${res.status}`;
      if (data.errors) {
        if (typeof data.errors === 'string') {
          message = `${message}: ${data.errors}`;
        } else if (Array.isArray(data.errors)) {
          message = `${message}: ${data.errors.join(', ')}`;
        } else if (typeof data.errors === 'object') {
          const details = Object.entries(data.errors as Record<string, unknown>)
            .map(([field, err]) => {
              const errStr = Array.isArray(err) ? err.join(', ') : String(err);
              return `${field}: ${errStr}`;
            })
            .join('; ');
          if (details) {
            message = `${message} (${details})`;
          }
        }
      }
      throw new ApiError(
        message,
        data.statusCode || res.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Koneksi ke server gagal',
      500
    );
  }
}

// Helper to convert object with optional File to FormData
export function toFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
}

// -------------------------------------------------------------
// SPECIFIC API ENDPOINT HELPERS
// -------------------------------------------------------------

export const api = {
  // A. APP MAKER
  maker: {
    register: (dto: RegisterAppMakerDto) =>
      apiClient<AppMakerData>('/api/v1/maker/register', {
        method: 'POST',
        body: dto as unknown as Record<string, unknown>,
        skipAppKey: true,
        skipAuth: true,
      }),
    login: (dto: LoginAppMakerDto) =>
      apiClient<AppMakerData>('/api/v1/maker/login', {
        method: 'POST',
        body: dto as unknown as Record<string, unknown>,
        skipAppKey: true,
        skipAuth: true,
      }),
    profile: () =>
      apiClient<AppMakerData>('/api/v1/maker/profile', {
        method: 'GET',
      }),
    checkKey: (email: string) =>
      apiClient<{ appKey: string; email: string; namaSiswa?: string }>('/api/v1/maker/check-key', {
        method: 'GET',
        params: { email },
        skipAppKey: true,
        skipAuth: true,
      }),
  },

  // B. AUTENTIKASI USER
  auth: {
    registerNasabah: (dto: RegisterNasabahBankDto) => {
      let body: BodyInit | Record<string, unknown>;
      if (dto.foto && (dto.foto instanceof File || dto.foto instanceof Blob)) {
        body = toFormData(dto as unknown as Record<string, unknown>);
      } else {
        const cleanDto: Record<string, unknown> = {
          username: dto.username,
          password: dto.password,
          namaNasabah: dto.namaNasabah,
          alamat: dto.alamat,
          telp: dto.telp,
        };
        body = cleanDto;
      }
      return apiClient<{ user: UserAuthData; nasabah: Nasabah }>('/api/v1/auth/nasabah/register', {
        method: 'POST',
        body,
        skipAuth: true,
      });
    },
    registerAdmin: (dto: RegisterAdminBankDto) => {
      let body: Record<string, unknown> | FormData;
      if (dto.foto) {
        body = toFormData(dto as unknown as Record<string, unknown>);
      } else {
        body = dto as unknown as Record<string, unknown>;
      }
      return apiClient<{ user: UserAuthData }>('/api/v1/auth/admin/register', {
        method: 'POST',
        body,
        skipAuth: true,
      });
    },
    login: (dto: LoginUserDto) =>
      apiClient<UserAuthData>('/api/v1/auth/login', {
        method: 'POST',
        body: dto as unknown as Record<string, unknown>,
        skipAuth: true,
      }),
    me: () =>
      apiClient<UserAuthData>('/api/v1/auth/me', {
        method: 'GET',
      }),
  },

  // C. ADMIN — CRUD NASABAH
  adminNasabah: {
    list: () =>
      apiClient<Nasabah[]>('/api/v1/admin/nasabah', {
        method: 'GET',
      }),
    create: (dto: CreateNasabahDto) => {
      const body = dto.foto ? toFormData(dto as unknown as Record<string, unknown>) : (dto as unknown as Record<string, unknown>);
      return apiClient<Nasabah>('/api/v1/admin/nasabah', {
        method: 'POST',
        body,
      });
    },
    detail: (id: string) =>
      apiClient<Nasabah>(`/api/v1/admin/nasabah/${id}`, {
        method: 'GET',
      }),
    update: (id: string, dto: UpdateNasabahDto) => {
      const body = dto.foto ? toFormData(dto as unknown as Record<string, unknown>) : (dto as unknown as Record<string, unknown>);
      return apiClient<Nasabah>(`/api/v1/admin/nasabah/${id}`, {
        method: 'PUT',
        body,
      });
    },
    delete: (id: string) =>
      apiClient(`/api/v1/admin/nasabah/${id}`, {
        method: 'DELETE',
      }),
  },

  // D. KATEGORI SAMPAH
  kategoriSampah: {
    list: () =>
      apiClient<KategoriSampah[]>('/api/v1/kategori-sampah', {
        method: 'GET',
      }),
    create: (dto: CreateKategoriSampahDto) => {
      const body = dto.foto ? toFormData(dto as unknown as Record<string, unknown>) : (dto as unknown as Record<string, unknown>);
      return apiClient<KategoriSampah>('/api/v1/kategori-sampah', {
        method: 'POST',
        body,
      });
    },
    detail: (id: string) =>
      apiClient<KategoriSampah>(`/api/v1/kategori-sampah/${id}`, {
        method: 'GET',
      }),
    update: (id: string, dto: UpdateKategoriSampahDto) => {
      const body = dto.foto ? toFormData(dto as unknown as Record<string, unknown>) : (dto as unknown as Record<string, unknown>);
      return apiClient<KategoriSampah>(`/api/v1/kategori-sampah/${id}`, {
        method: 'PUT',
        body,
      });
    },
    delete: (id: string) =>
      apiClient(`/api/v1/kategori-sampah/${id}`, {
        method: 'DELETE',
      }),
  },

  // E. PENYETORAN SAMPAH
  setorSampah: {
    pengajuan: (dto: CreateSetorSampahDto) =>
      apiClient<SetorSampah>('/api/v1/setor-sampah/pengajuan', {
        method: 'POST',
        body: dto as unknown as Record<string, unknown>,
      }),
    mySetor: (bulan?: string) =>
      apiClient<SetorSampah[]>('/api/v1/setor-sampah/my-setor', {
        method: 'GET',
        params: { bulan },
      }),
    adminList: (status?: string, bulan?: string) =>
      apiClient<SetorSampah[]>('/api/v1/setor-sampah/admin/list', {
        method: 'GET',
        params: { status, bulan },
      }),
    detail: (id: string) =>
      apiClient<SetorSampah>(`/api/v1/setor-sampah/${id}`, {
        method: 'GET',
      }),
    verify: (id: string, dto: VerifySetorSampahDto) =>
      apiClient<SetorSampah>(`/api/v1/setor-sampah/admin/verify/${id}`, {
        method: 'PUT',
        body: dto as unknown as Record<string, unknown>,
      }),
  },

  // F. KATALOG HADIAH
  hadiah: {
    list: () =>
      apiClient<Hadiah[]>('/api/v1/hadiah', {
        method: 'GET',
      }),
    create: (dto: CreateHadiahDto) => {
      const body = dto.foto ? toFormData(dto as unknown as Record<string, unknown>) : (dto as unknown as Record<string, unknown>);
      return apiClient<Hadiah>('/api/v1/hadiah', {
        method: 'POST',
        body,
      });
    },
    detail: (id: string) =>
      apiClient<Hadiah>(`/api/v1/hadiah/${id}`, {
        method: 'GET',
      }),
    update: (id: string, dto: UpdateHadiahDto) => {
      const body = dto.foto ? toFormData(dto as unknown as Record<string, unknown>) : (dto as unknown as Record<string, unknown>);
      return apiClient<Hadiah>(`/api/v1/hadiah/${id}`, {
        method: 'PUT',
        body,
      });
    },
    delete: (id: string) =>
      apiClient(`/api/v1/hadiah/${id}`, {
        method: 'DELETE',
      }),
  },

  // G. PENUKARAN POIN
  penukaranPoin: {
    tukar: (dto: CreatePenukaranPoinDto) =>
      apiClient<PenukaranPoin>('/api/v1/penukaran-poin/tukar', {
        method: 'POST',
        body: dto as unknown as Record<string, unknown>,
      }),
    myPenukaran: () =>
      apiClient<PenukaranPoin[]>('/api/v1/penukaran-poin/my-penukaran', {
        method: 'GET',
      }),
    adminList: (bulan?: string) =>
      apiClient<PenukaranPoin[]>('/api/v1/penukaran-poin/admin/list', {
        method: 'GET',
        params: { bulan },
      }),
    updateStatus: (id: string, dto: UpdateStatusPenukaranDto) =>
      apiClient<PenukaranPoin>(`/api/v1/penukaran-poin/admin/status/${id}`, {
        method: 'PUT',
        body: dto as unknown as Record<string, unknown>,
      }),
    nota: (id: string) =>
      apiClient<PenukaranPoin>(`/api/v1/penukaran-poin/nota/${id}`, {
        method: 'GET',
      }),
  },

  // H. REKAPITULASI & DASHBOARD
  dashboard: {
    summary: () =>
      apiClient<DashboardSummary>('/api/v1/dashboard/summary', {
        method: 'GET',
      }),
    stats: () =>
      apiClient<DashboardStats>('/api/v1/dashboard/stats', {
        method: 'GET',
      }),
    rekapitulasi: (bulan: string) =>
      apiClient<RekapitulasiBulanan>('/api/v1/rekapitulasi/bulanan', {
        method: 'GET',
        params: { bulan },
      }),
  },

  // I. UTILITY
  seed: () =>
    apiClient<{ message: string }>('/api/v1/seed', {
      method: 'POST',
    }),
};
