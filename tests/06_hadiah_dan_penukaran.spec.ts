import { test, expect } from '@playwright/test';
import { setupMockApi, createInitialMockStore } from './helpers/mock-api';
import { loginAsAdmin, loginAsNasabah } from './helpers/auth-helper';

test.describe('06. Katalog Hadiah & Penukaran Poin (Reward System)', () => {
  let mockStore: ReturnType<typeof createInitialMockStore>;

  test.beforeEach(async ({ page }) => {
    mockStore = createInitialMockStore('nasabah');
    await setupMockApi(page, mockStore);
  });

  test('Admin: Menambah hadiah baru ke dalam katalog reward unit', async ({ page }) => {
    await loginAsAdmin(page, mockStore);
    await page.goto('/admin/hadiah');

    await expect(page.getByRole('heading', { name: /Katalog Hadiah/i })).toBeVisible();

    // Buka modal tambah hadiah
    await page.getByRole('button', { name: /Tambah Hadiah Baru/i }).click();
    await expect(page.getByRole('heading', { name: /Tambah Hadiah Baru/i })).toBeVisible();

    await page.getByPlaceholder(/Minyak Goreng/i).fill('Beras Premium 5 Kg');
    await page.locator('input[type="number"]').first().fill('120'); // poinDibutuhkan
    await page.locator('input[type="number"]').nth(1).fill('15'); // stok

    await page.getByRole('button', { name: /Simpan Hadiah/i }).click();

    await expect(page.getByText(/Hadiah baru berhasil ditambahkan/i)).toBeVisible();
    await expect(page.getByText('Beras Premium 5 Kg')).toBeVisible();
  });

  test('Nasabah: Menampilkan katalog hadiah dan saldo poin yang dimiliki', async ({ page }) => {
    await loginAsNasabah(page, mockStore);
    await page.goto('/nasabah/hadiah');

    await expect(page.getByRole('heading', { name: /Tukar Poin Hadiah/i })).toBeVisible();

    // Verifikasi saldo poin nasabah (150 Poin)
    await expect(page.getByText(/150 Poin/i).first()).toBeVisible();

    // Hadiah terdaftar
    await expect(page.getByText('Minyak Goreng Sawit 1 Liter')).toBeVisible();
    await expect(page.getByText('Sepeda Gunung Eco Trail Premium')).toBeVisible();
  });

  test('Nasabah: Validasi penukaran gagal jika saldo poin tidak mencukupi', async ({ page }) => {
    await loginAsNasabah(page, mockStore);
    await page.goto('/nasabah/hadiah');

    // Saldo poin adalah 150 Poin, sedangkan Sepeda butuh 1000 Poin
    const sepedaCard = page.locator('div.group', { hasText: 'Sepeda Gunung Eco Trail Premium' });
    const tukarBtn = sepedaCard.getByRole('button', { name: 'Poin Kurang' });

    // Tombol non-aktif (disabled) karena poin kurang
    await expect(tukarBtn).toBeVisible();
    await expect(tukarBtn).toBeDisabled();
  });

  test('Nasabah: Penukaran hadiah saat saldo poin cukup berhasil diajukan', async ({ page }) => {
    await loginAsNasabah(page, mockStore);
    await page.goto('/nasabah/hadiah');

    // Minyak goreng butuh 50 poin (Saldo 150 -> Cukup!)
    const minyakCard = page.locator('div.group', { hasText: 'Minyak Goreng Sawit 1 Liter' });
    const tukarBtn = minyakCard.getByRole('button', { name: 'Tukar Sekarang' });
    await tukarBtn.click();

    // Modal konfirmasi harus muncul
    await expect(page.getByRole('heading', { name: /Konfirmasi Penukaran/i })).toBeVisible();
    await expect(page.getByText(/Poin yang Ditukarkan/i)).toBeVisible();

    // Klik Setujui & Tukar
    await page.getByRole('button', { name: /Setujui & Tukar/i }).click();

    // Verifikasi toast sukses dan redirect ke nota
    await expect(page.getByText(/berhasil diajukan/i)).toBeVisible();
    await expect(page).toHaveURL(/.*\/nasabah\/nota\?tab=penukaran/);
  });

  test('Admin: Memverifikasi dan mengubah status penukaran hadiah menjadi selesai', async ({ page }) => {
    await loginAsAdmin(page, mockStore);
    await page.goto('/admin/transaksi');

    // Pindah ke tab Penukaran
    await page.getByRole('button', { name: /Penukaran \(/i }).click();
    await expect(page.getByText('TKR-20260318-001')).toBeVisible();

    // Klik Ubah Status pada item penukaran pertama
    await page.getByRole('button', { name: /Ubah Status/i }).first().click();

    // Modal update status terbuka
    await expect(page.getByRole('heading', { name: /Ubah Status Penukaran/i })).toBeVisible();

    // Pilih status Selesai
    await page.locator('select').selectOption('selesai');
    await page.getByRole('button', { name: /Simpan Status/i }).click();

    await expect(page.getByText(/Status penukaran hadiah berhasil diperbarui/i)).toBeVisible();
  });
});
