import { Page, Route } from '@playwright/test';
import {
  MOCK_NASABAH_USER,
  MOCK_ADMIN_USER,
  INITIAL_KATEGORI,
  INITIAL_NASABAH_LIST,
  INITIAL_HADIAH_LIST,
  INITIAL_SETORAN_LIST,
  INITIAL_PENUKARAN_LIST,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_DASHBOARD_STATS,
  MOCK_REKAPITULASI,
} from './mock-data';
import { KategoriSampah, Nasabah, Hadiah, SetorSampah, PenukaranPoin } from '@/types/api';

export interface MockStore {
  kategori: KategoriSampah[];
  nasabah: Nasabah[];
  hadiah: Hadiah[];
  setoran: SetorSampah[];
  penukaran: PenukaranPoin[];
  currentUser: typeof MOCK_NASABAH_USER | typeof MOCK_ADMIN_USER;
}

export function createInitialMockStore(initialUser: 'nasabah' | 'admin' = 'nasabah'): MockStore {
  return {
    kategori: JSON.parse(JSON.stringify(INITIAL_KATEGORI)),
    nasabah: JSON.parse(JSON.stringify(INITIAL_NASABAH_LIST)),
    hadiah: JSON.parse(JSON.stringify(INITIAL_HADIAH_LIST)),
    setoran: JSON.parse(JSON.stringify(INITIAL_SETORAN_LIST)),
    penukaran: JSON.parse(JSON.stringify(INITIAL_PENUKARAN_LIST)),
    currentUser: initialUser === 'admin' ? MOCK_ADMIN_USER : MOCK_NASABAH_USER,
  };
}

export async function setupMockApi(page: Page, customStore?: MockStore) {
  const store = customStore || createInitialMockStore('nasabah');

  const jsonResponse = async (route: Route, data: unknown, status = 200) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: status,
        success: status >= 200 && status < 300,
        message: status >= 200 && status < 300 ? 'Success' : 'Error',
        data,
      }),
    });
  };

  const errorResponse = async (route: Route, message: string, status = 400) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: status,
        success: false,
        message,
        data: null,
      }),
    });
  };

  // Intercept all calls targeting SMK Telkom / bank_sampah API
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const pathname = url.pathname;

    // 1. AUTH: Login
    if (pathname.includes('/auth/login') && method === 'POST') {
      try {
        const body = req.postDataJSON() || {};
        const { username, password } = body;

        if (!username || !password) {
          return errorResponse(route, 'Username dan password wajib diisi', 400);
        }

        if (username === 'admin' || username === 'adminbank') {
          store.currentUser = MOCK_ADMIN_USER;
          return jsonResponse(route, MOCK_ADMIN_USER);
        } else if (username === 'sitiaminah' || username === 'nasabah') {
          store.currentUser = MOCK_NASABAH_USER;
          return jsonResponse(route, MOCK_NASABAH_USER);
        } else if (username === 'salah' || password === 'salah') {
          return errorResponse(route, 'Kredensial login tidak valid', 401);
        }

        // Default login success as Nasabah for other custom usernames
        const customNasabah = {
          ...MOCK_NASABAH_USER,
          username,
          nasabah: {
            ...MOCK_NASABAH_USER.nasabah!,
            namaNasabah: username,
          },
        };
        store.currentUser = customNasabah;
        return jsonResponse(route, customNasabah);
      } catch {
        return errorResponse(route, 'Invalid JSON body', 400);
      }
    }

    // 2. AUTH: Register Nasabah
    if (pathname.includes('/auth/nasabah/register') && method === 'POST') {
      return jsonResponse(route, { user: MOCK_NASABAH_USER, nasabah: MOCK_NASABAH_USER.nasabah }, 201);
    }

    // 3. AUTH: Register Admin
    if (pathname.includes('/auth/admin/register') && method === 'POST') {
      return jsonResponse(route, { user: MOCK_ADMIN_USER }, 201);
    }

    // 4. AUTH: Me
    if (pathname.includes('/auth/me') && method === 'GET') {
      const authHeader = req.headers()['authorization'] || '';
      if (authHeader.includes('token-admin')) {
        return jsonResponse(route, MOCK_ADMIN_USER);
      } else if (authHeader.includes('token-nasabah')) {
        return jsonResponse(route, store.currentUser.role === 'nasabah' ? store.currentUser : MOCK_NASABAH_USER);
      }
      return jsonResponse(route, store.currentUser);
    }

    // 5. KATEGORI SAMPAH
    if (pathname.includes('/kategori-sampah')) {
      const parts = pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      const isId = lastPart !== 'kategori-sampah';

      if (method === 'GET') {
        if (isId) {
          const item = store.kategori.find((k) => k.id === lastPart);
          return item ? jsonResponse(route, item) : errorResponse(route, 'Not found', 404);
        }
        return jsonResponse(route, store.kategori);
      }

      if (method === 'POST') {
        let postData: any = {};
        try {
          postData = req.postDataJSON() || {};
        } catch {
          // If FormData
          postData = {
            namaKategori: 'Kategori Baru',
            hargaPerKg: 3000,
            poinPerKg: 5,
            jenis: 'plastik',
          };
        }
        const newCat: KategoriSampah = {
          id: `kat-${Date.now()}`,
          namaKategori: postData.namaKategori || 'Kategori Baru',
          hargaPerKg: Number(postData.hargaPerKg) || 2000,
          poinPerKg: Number(postData.poinPerKg) || 5,
          jenis: postData.jenis || 'plastik',
          foto: null,
          createdAt: new Date().toISOString(),
        };
        store.kategori.push(newCat);
        return jsonResponse(route, newCat, 201);
      }

      if (method === 'PUT' && isId) {
        let postData: any = {};
        try {
          postData = req.postDataJSON() || {};
        } catch {
          postData = {};
        }
        const index = store.kategori.findIndex((k) => k.id === lastPart);
        if (index >= 0) {
          store.kategori[index] = {
            ...store.kategori[index],
            ...postData,
            hargaPerKg: Number(postData.hargaPerKg ?? store.kategori[index].hargaPerKg),
            poinPerKg: Number(postData.poinPerKg ?? store.kategori[index].poinPerKg),
          };
          return jsonResponse(route, store.kategori[index]);
        }
        return errorResponse(route, 'Kategori tidak ditemukan', 404);
      }

      if (method === 'DELETE' && isId) {
        store.kategori = store.kategori.filter((k) => k.id !== lastPart);
        return jsonResponse(route, { success: true });
      }
    }

    // 6. ADMIN NASABAH
    if (pathname.includes('/admin/nasabah')) {
      const parts = pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      const isId = lastPart !== 'nasabah';

      if (method === 'GET') {
        if (isId) {
          const item = store.nasabah.find((n) => n.id === lastPart);
          return item ? jsonResponse(route, item) : errorResponse(route, 'Not found', 404);
        }
        return jsonResponse(route, store.nasabah);
      }

      if (method === 'POST') {
        let postData: any = {};
        try {
          postData = req.postDataJSON() || {};
        } catch {
          postData = {};
        }
        const newNasabah: Nasabah = {
          id: `nasabah-${Date.now()}`,
          namaNasabah: postData.namaNasabah || 'Nasabah Baru',
          telp: postData.telp || '0812345678',
          alamat: postData.alamat || 'Alamat Baru',
          username: postData.username || `user_${Date.now()}`,
          saldoPoin: 0,
          createdAt: new Date().toISOString(),
        };
        store.nasabah.push(newNasabah);
        return jsonResponse(route, newNasabah, 201);
      }

      if (method === 'PUT' && isId) {
        let postData: any = {};
        try {
          postData = req.postDataJSON() || {};
        } catch {
          postData = {};
        }
        const index = store.nasabah.findIndex((n) => n.id === lastPart);
        if (index >= 0) {
          store.nasabah[index] = {
            ...store.nasabah[index],
            ...postData,
          };
          return jsonResponse(route, store.nasabah[index]);
        }
        return errorResponse(route, 'Nasabah tidak ditemukan', 404);
      }

      if (method === 'DELETE' && isId) {
        store.nasabah = store.nasabah.filter((n) => n.id !== lastPart);
        return jsonResponse(route, { success: true });
      }
    }

    // 7. SETOR SAMPAH
    if (pathname.includes('/setor-sampah')) {
      // Detail
      if (pathname.includes('/admin/verify/')) {
        const id = pathname.split('/').pop();
        const postData = req.postDataJSON() || {};
        const index = store.setoran.findIndex((s) => s.id === id);
        if (index >= 0) {
          store.setoran[index].status = postData.status || 'selesai';
          if (postData.catatanAdmin) {
            store.setoran[index].catatanAdmin = postData.catatanAdmin;
          }
          return jsonResponse(route, store.setoran[index]);
        }
        return errorResponse(route, 'Setoran tidak ditemukan', 404);
      }

      if (pathname.includes('/setor-sampah/pengajuan') && method === 'POST') {
        const postData = req.postDataJSON() || {};
        const rawItems = postData.items || [];
        let totalPoin = 0;
        let totalBeratKg = 0;
        let totalRupiah = 0;

        const detailSetor = rawItems.map((it: any, idx: number) => {
          const kat = store.kategori.find((k) => k.id === it.kategoriSampahId) || store.kategori[0];
          const berat = Number(it.beratKg) || 1;
          const poin = berat * (kat?.poinPerKg || 10);
          const rupiah = berat * (kat?.hargaPerKg || 3000);
          totalPoin += poin;
          totalBeratKg += berat;
          totalRupiah += rupiah;

          return {
            id: `det-${Date.now()}-${idx}`,
            kategoriSampahId: it.kategoriSampahId,
            beratKg: berat,
            subtotalPoin: poin,
            subtotalRupiah: rupiah,
            kategoriSampah: kat,
          };
        });

        const newSetor: SetorSampah = {
          id: `setor-${Date.now()}`,
          kodeTransaksi: `SET-${Date.now().toString().slice(-6)}`,
          tanggal: postData.tanggal || new Date().toISOString().split('T')[0],
          status: 'menunggu_konfirmasi',
          totalBeratKg,
          totalPoin,
          totalRupiah,
          catatan: postData.catatan || '',
          nasabahId: 'nasabah-01',
          nasabah: store.currentUser.nasabah,
          detailSetor,
          items: detailSetor,
        };
        store.setoran.unshift(newSetor);
        return jsonResponse(route, newSetor, 201);
      }

      if (pathname.includes('/setor-sampah/my-setor') && method === 'GET') {
        return jsonResponse(route, store.setoran);
      }

      if (pathname.includes('/setor-sampah/admin/list') && method === 'GET') {
        const status = url.searchParams.get('status');
        if (status) {
          return jsonResponse(
            route,
            store.setoran.filter((s) => s.status === status)
          );
        }
        return jsonResponse(route, store.setoran);
      }

      // Single item detail
      const parts = pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (method === 'GET' && lastPart.startsWith('setor-')) {
        const item = store.setoran.find((s) => s.id === lastPart);
        return item ? jsonResponse(route, item) : errorResponse(route, 'Not found', 404);
      }
    }

    // 8. HADIAH
    if (pathname.includes('/hadiah')) {
      const parts = pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      const isId = lastPart !== 'hadiah';

      if (method === 'GET') {
        if (isId) {
          const item = store.hadiah.find((h) => h.id === lastPart);
          return item ? jsonResponse(route, item) : errorResponse(route, 'Not found', 404);
        }
        return jsonResponse(route, store.hadiah);
      }

      if (method === 'POST') {
        let postData: any = {};
        try {
          postData = req.postDataJSON() || {};
        } catch {
          postData = {};
        }
        const newHadiah: Hadiah = {
          id: `hadiah-${Date.now()}`,
          namaHadiah: postData.namaHadiah || 'Hadiah Baru',
          poinDibutuhkan: Number(postData.poinDibutuhkan) || 50,
          stok: Number(postData.stok) || 10,
          foto: null,
          createdAt: new Date().toISOString(),
        };
        store.hadiah.push(newHadiah);
        return jsonResponse(route, newHadiah, 201);
      }

      if (method === 'PUT' && isId) {
        let postData: any = {};
        try {
          postData = req.postDataJSON() || {};
        } catch {
          postData = {};
        }
        const index = store.hadiah.findIndex((h) => h.id === lastPart);
        if (index >= 0) {
          store.hadiah[index] = {
            ...store.hadiah[index],
            ...postData,
            poinDibutuhkan: Number(postData.poinDibutuhkan ?? store.hadiah[index].poinDibutuhkan),
            stok: Number(postData.stok ?? store.hadiah[index].stok),
          };
          return jsonResponse(route, store.hadiah[index]);
        }
        return errorResponse(route, 'Hadiah tidak ditemukan', 404);
      }

      if (method === 'DELETE' && isId) {
        store.hadiah = store.hadiah.filter((h) => h.id !== lastPart);
        return jsonResponse(route, { success: true });
      }
    }

    // 9. PENUKARAN POIN
    if (pathname.includes('/penukaran-poin')) {
      if (pathname.includes('/penukaran-poin/tukar') && method === 'POST') {
        const postData = req.postDataJSON() || {};
        const hadiah = store.hadiah.find((h) => h.id === postData.hadiahId);
        if (!hadiah) {
          return errorResponse(route, 'Hadiah tidak ditemukan', 404);
        }

        const saldoCurrent = store.currentUser.nasabah?.saldoPoin || 0;
        if (saldoCurrent < hadiah.poinDibutuhkan) {
          return errorResponse(route, 'Saldo poin Anda tidak mencukupi', 400);
        }

        // Deduct points and stock
        if (store.currentUser.nasabah) {
          store.currentUser.nasabah.saldoPoin = saldoCurrent - hadiah.poinDibutuhkan;
        }
        hadiah.stok = Math.max(0, hadiah.stok - 1);

        const newPenukaran: PenukaranPoin = {
          id: `tukar-${Date.now()}`,
          kodePenukaran: `TKR-${Date.now().toString().slice(-6)}`,
          tanggal: new Date().toISOString().split('T')[0],
          poinTerpakai: hadiah.poinDibutuhkan,
          status: 'diproses',
          nasabahId: 'nasabah-01',
          hadiahId: hadiah.id,
          hadiah,
          nasabah: store.currentUser.nasabah,
          createdAt: new Date().toISOString(),
        };
        store.penukaran.unshift(newPenukaran);
        return jsonResponse(route, newPenukaran, 201);
      }

      if (pathname.includes('/penukaran-poin/my-penukaran') && method === 'GET') {
        return jsonResponse(route, store.penukaran);
      }

      if (pathname.includes('/penukaran-poin/admin/list') && method === 'GET') {
        return jsonResponse(route, store.penukaran);
      }

      if (pathname.includes('/penukaran-poin/admin/status/') && method === 'PUT') {
        const id = pathname.split('/').pop();
        const postData = req.postDataJSON() || {};
        const index = store.penukaran.findIndex((p) => p.id === id);
        if (index >= 0) {
          store.penukaran[index].status = postData.status || 'selesai';
          return jsonResponse(route, store.penukaran[index]);
        }
        return errorResponse(route, 'Penukaran tidak ditemukan', 404);
      }
    }

    // 10. DASHBOARD & REKAPITULASI
    if (pathname.includes('/dashboard/summary') && method === 'GET') {
      return jsonResponse(route, {
        ...MOCK_DASHBOARD_SUMMARY,
        saldoPoin: store.currentUser.nasabah?.saldoPoin ?? 150,
      });
    }

    if (pathname.includes('/dashboard/stats') && method === 'GET') {
      return jsonResponse(route, MOCK_DASHBOARD_STATS);
    }

    if (pathname.includes('/rekapitulasi') && method === 'GET') {
      return jsonResponse(route, MOCK_REKAPITULASI);
    }

    // Fallback pass-through or safe 200
    return jsonResponse(route, {});
  });

  return store;
}
