import { test, expect } from '@playwright/test';
import { setupMockApi, createInitialMockStore } from './helpers/mock-api';
import { loginAsNasabah } from './helpers/auth-helper';

test.describe('04. Setor Sampah & Kalkulasi Poin (Nasabah)', () => {
  let mockStore: ReturnType<typeof createInitialMockStore>;

  test.beforeEach(async ({ page }) => {
    mockStore = createInitialMockStore('nasabah');
    await setupMockApi(page, mockStore);
    await loginAsNasabah(page);
    await page.goto('/nasabah/setor');
  });

  test('Formulir setor sampah menampilkan input tanggal dan kategori bawaan', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Ajukan Penyetoran Sampah/i })).toBeVisible();

    // Input tanggal harus terisi tanggal hari ini
    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput).toBeVisible();

    // Baris item sampah pertama harus sudah memuat opsi kategori
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toContainText('Botol Plastik PET');
  });

  test('Kalkulasi dinamis: Perhitungan estimasi poin dan rupiah realtime saat berat diubah', async ({ page }) => {
    // Botol Plastik PET: 10 poin/kg, Rp 3.000/kg
    const weightInput = page.locator('input[type="number"]').first();
    await weightInput.fill('5');

    // Estimasi poin harus menjadi 50 Poin
    await expect(page.getByText(/50 Poin/i).first()).toBeVisible();

    // Estimasi total rupiah harus menjadi Rp 15.000
    await expect(page.getByText(/Rp\s*15\.000/i).first()).toBeVisible();
  });

  test('Multi-item: Tambah baris kategori sampah dan verifikasi akumulasi total', async ({ page }) => {
    // Baris 1: Botol Plastik PET (10 poin/kg, Rp 3.000) -> 3 kg = 30 poin, Rp 9.000
    const weightInput1 = page.locator('input[type="number"]').first();
    await weightInput1.fill('3');

    // Klik tombol Tambah Kategori
    await page.getByRole('button', { name: /Tambah Kategori/i }).click();

    // Baris 2: Pilih Kardus Box Cokelat (5 poin/kg, Rp 2.000) -> 4 kg = 20 poin, Rp 8.000
    const categorySelect2 = page.locator('select').nth(1);
    await categorySelect2.selectOption('kat-02');
    const weightInput2 = page.locator('input[type="number"]').nth(1);
    await weightInput2.fill('4');

    // Total akumulasi: 30 + 20 = 50 Poin, Rp 9.000 + Rp 8.000 = Rp 17.000
    await expect(page.getByText(/50 Poin/i).first()).toBeVisible();
    await expect(page.getByText(/Rp\s*17\.000/i).first()).toBeVisible();
  });

  test('Hapus baris item sampah dan kalkulasi berkurang', async ({ page }) => {
    // Tambah baris kedua
    await page.getByRole('button', { name: /Tambah Kategori/i }).click();
    await expect(page.locator('select')).toHaveCount(2);

    // Hapus baris kedua
    const deleteRowBtn = page.locator('button[title="Hapus baris ini"]').last();
    await deleteRowBtn.click();

    // Sekarang tinggal 1 baris
    await expect(page.locator('select')).toHaveCount(1);
  });

  test('Kirim pengajuan setoran sampah berhasil dan muncul notifikasi sukses', async ({ page }) => {
    const weightInput = page.locator('input[type="number"]').first();
    await weightInput.fill('6');

    const catatanInput = page.getByPlaceholder(/Botol plastik sudah dibilas/i);
    await catatanInput.fill('Sampah botol bersih sudah dipres rapi');

    await page.getByRole('button', { name: /Kirim Pengajuan Setoran/i }).click();

    // Toast sukses harus muncul
    await expect(page.getByText(/Pengajuan penyetoran sampah berhasil dikirim/i)).toBeVisible();
  });
});
