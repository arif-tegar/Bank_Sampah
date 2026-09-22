import { test, expect } from '@playwright/test';
import { setupMockApi, createInitialMockStore } from './helpers/mock-api';
import { loginAsAdmin, loginAsNasabah } from './helpers/auth-helper';

test.describe('07. Rekapitulasi Bulanan, Nota Digital & Profil', () => {
  let mockStore: ReturnType<typeof createInitialMockStore>;

  test.beforeEach(async ({ page }) => {
    mockStore = createInitialMockStore('admin');
    await setupMockApi(page, mockStore);
  });

  test('Admin: Menampilkan agregasi data rekapitulasi bulanan dan rincian jenis limbah', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/rekapitulasi');

    await expect(page.getByRole('heading', { name: /Rekapitulasi Bulanan/i })).toBeVisible();

    // Verifikasi metrik KPI
    await expect(page.getByText('145.5').first()).toBeVisible(); // Tonase
    await expect(page.getByText(/Rp\s*485\.000/i).first()).toBeVisible(); // Nilai rupiah

    // Verifikasi detail per jenis limbah
    await expect(page.getByText(/plastik/i).first()).toBeVisible();
    await expect(page.getByText(/kertas/i).first()).toBeVisible();
    await expect(page.getByText(/logam/i).first()).toBeVisible();

    // Tombol Cetak Rekap tersedia
    const printBtn = page.getByRole('button', { name: /Cetak Rekap/i });
    await expect(printBtn).toBeVisible();
  });

  test('Nasabah: Melihat nota digital bukti penyetoran sampah', async ({ page }) => {
    await loginAsNasabah(page, mockStore);
    await page.goto('/nasabah/nota');

    await expect(page.getByRole('heading', { name: /Nota & Bukti Transaksi/i })).toBeVisible();

    // Verifikasi tab Penyetoran aktif dan struk menampilkan transaksi
    await expect(page.getByText('SET-20260318-001').first()).toBeVisible();
    await expect(page.getByText('Siti Aminah').first()).toBeVisible();

    // Tombol Cetak Struk / Bukti Transaksi
    const printBtn = page.getByRole('button', { name: /Cetak/i }).first();
    await expect(printBtn).toBeVisible();
  });

  test('Nasabah: Switch ke tab Penukaran dan melihat struk tiket klaim hadiah', async ({ page }) => {
    await loginAsNasabah(page, mockStore);
    await page.goto('/nasabah/nota?tab=penukaran');

    // Tab Penukaran aktif
    await expect(page.getByText('TKR-20260318-001').first()).toBeVisible();
    await expect(page.getByText('Minyak Goreng Sawit 1 Liter').first()).toBeVisible();
  });

  test('Profil Admin Unit: Menampilkan info pengelola dan menyimpan pembaruan', async ({ page }) => {
    await loginAsAdmin(page, mockStore);
    await page.goto('/admin/profil');

    await expect(page.getByRole('heading', { name: /Profil Unit Bank Sampah/i })).toBeVisible();
    await expect(page.locator('form input').first()).toHaveValue(/Bank Sampah Unit Melati/i);

    // Klik simpan perubahan
    await page.getByRole('button', { name: /Simpan Perubahan Profil/i }).click();
    await expect(page.getByText(/Profil unit bank sampah berhasil diperbarui/i)).toBeVisible();
  });

  test('Profil Nasabah: Menampilkan data keanggotaan dan saldo poin', async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER_LOG:', msg.text()));
    await loginAsNasabah(page, mockStore);
    await page.goto('/nasabah/akun');

    await expect(page.getByRole('heading', { name: /Akun & Keanggotaan/i })).toBeVisible();
    await expect(page.getByText('Siti Aminah').first()).toBeVisible();
    await expect(page.getByText(/150 Poin/i).first()).toBeVisible();
    await expect(page.getByText('081234567890')).toBeVisible();
  });
});
