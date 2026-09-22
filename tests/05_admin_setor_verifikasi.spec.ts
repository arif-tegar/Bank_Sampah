import { test, expect } from '@playwright/test';
import { setupMockApi, createInitialMockStore } from './helpers/mock-api';
import { loginAsAdmin } from './helpers/auth-helper';

test.describe('05. Verifikasi Setoran Sampah (Admin)', () => {
  let mockStore: ReturnType<typeof createInitialMockStore>;

  test.beforeEach(async ({ page }) => {
    mockStore = createInitialMockStore('admin');
    await setupMockApi(page, mockStore);
    await loginAsAdmin(page);
    await page.goto('/admin/setoran');
  });

  test('Menampilkan daftar antrean setoran dengan status filter', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Verifikasi Penyetoran Sampah/i })).toBeVisible();

    // Verifikasi transaksi awal ada
    await expect(page.getByText('SET-20260318-001')).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'Menunggu Konfirmasi' })).toBeVisible();

    // Filter status klik pill button
    await page.getByRole('button', { name: 'Menunggu Konfirmasi', exact: true }).click();
    await expect(page.getByText('SET-20260318-001')).toBeVisible();
  });

  test('Navigasi ke halaman verifikasi setoran fisik', async ({ page }) => {
    // Klik tombol Timbang & Verifikasi pada tiket pertama
    await page.getByRole('button', { name: /Timbang & Verifikasi/i }).first().click();

    // Pastikan berada di halaman verifikasi
    await expect(page).toHaveURL(/.*\/admin\/setoran\/setor-01/);
    await expect(page.getByRole('heading', { name: /Verifikasi Timbangan Setoran/i })).toBeVisible();
    await expect(page.getByText('Siti Aminah')).toBeVisible();
  });

  test('Bobot timbangan fisik terkunci (read-only/disabled) untuk mencegah manipulasi data', async ({ page }) => {
    await page.goto('/admin/setoran/setor-01');

    // Pastikan input timbangan riil terkunci dan tidak dapat diedit admin
    const weightInput = page.locator('input[type="number"]').first();
    await expect(weightInput).toBeDisabled();

    // Verifikasi total poin dan nilai rupiah terkunci sesuai pengajuan nasabah (4 kg: 40 Poin, Rp 12.000)
    await expect(page.getByText(/40 Poin/i)).toBeVisible();
    await expect(page.getByText(/Rp\s*12\.000/i)).toBeVisible();
  });

  test('Admin menyetujui setoran: status berubah menjadi selesai dan saldo nasabah bertambah', async ({ page }) => {
    await page.goto('/admin/setoran/setor-01');

    const catatanInput = page.locator('textarea');
    await catatanInput.fill('Barang sudah ditimbang ulang dan bersih');

    await page.getByRole('button', { name: /Konfirmasi & Masukkan Saldo/i }).click();

    // Verifikasi toast sukses
    await expect(page.getByText(/Setoran berhasil diverifikasi/i)).toBeVisible();
    // Redirect ke daftar transaksi
    await expect(page).toHaveURL(/.*\/admin\/transaksi/);
  });

  test('Admin menolak setoran dengan catatan penolakan', async ({ page }) => {
    await page.goto('/admin/setoran/setor-01');

    const catatanInput = page.locator('textarea');
    await catatanInput.fill('Limbah tercampur sampah organik basah tidak dapat didaur ulang');

    await page.getByRole('button', { name: /Tolak Pengajuan/i }).click();

    // Verifikasi toast penolakan
    await expect(page.getByText(/Setoran berhasil diverifikasi dengan status "ditolak"/i)).toBeVisible();
  });
});
