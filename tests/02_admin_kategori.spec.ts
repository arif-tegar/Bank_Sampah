import { test, expect } from '@playwright/test';
import { setupMockApi, createInitialMockStore } from './helpers/mock-api';
import { loginAsAdmin } from './helpers/auth-helper';

test.describe('02. Manajemen Kategori Sampah (Admin)', () => {
  let mockStore: ReturnType<typeof createInitialMockStore>;

  test.beforeEach(async ({ page }) => {
    mockStore = createInitialMockStore('admin');
    await setupMockApi(page, mockStore);
    await loginAsAdmin(page);
    await page.goto('/admin/kategori-sampah');
  });

  test('Menampilkan daftar kategori sampah aktif dengan harga dan poin', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Kategori Sampah & Harga Beli/i })).toBeVisible();

    // Verifikasi data awal dari mock
    await expect(page.getByText('Botol Plastik PET')).toBeVisible();
    await expect(page.getByText('Kardus Box Cokelat')).toBeVisible();
    await expect(page.getByText('Kaleng Aluminium Minuman')).toBeVisible();

    // Verifikasi badge jenis
    await expect(page.getByText('plastik').first()).toBeVisible();
  });

  test('Tambah kategori sampah baru via modal', async ({ page }) => {
    // Buka modal create
    await page.getByRole('button', { name: /Tambah Kategori Baru/i }).click();
    await expect(page.getByRole('heading', { name: /Tambah Kategori Sampah/i })).toBeVisible();

    // Isi formulir
    await page.getByPlaceholder(/Contoh: Kardus Kering/i).fill('Kaca Bening Botol');
    await page.locator('select').selectOption('kaca');
    await page.locator('input[type="number"]').first().fill('1500'); // hargaPerKg
    await page.locator('input[type="number"]').nth(1).fill('4'); // poinPerKg

    // Submit
    await page.getByRole('button', { name: /Simpan Kategori/i }).click();

    // Verifikasi notifikasi toast dan item baru muncul di UI
    await expect(page.getByText(/Kategori sampah baru berhasil disimpan/i)).toBeVisible();
    await expect(page.getByText('Kaca Bening Botol')).toBeVisible();
  });

  test('Edit data kategori sampah dan update harga/poin', async ({ page }) => {
    // Klik tombol edit kategori pertama
    const editBtn = page.locator('button[title="Edit Kategori"]').first();
    await editBtn.click();

    await expect(page.getByRole('heading', { name: /Edit Kategori Sampah/i })).toBeVisible();

    // Ubah nama dan harga
    const namaInput = page.locator('form input[type="text"]').first();
    await namaInput.fill('Botol Plastik PET Super');

    await page.getByRole('button', { name: /Perbarui Kategori/i }).click();

    // Verifikasi sukses
    await expect(page.getByText(/berhasil diperbarui/i)).toBeVisible();
    await expect(page.getByText('Botol Plastik PET Super')).toBeVisible();
  });

  test('Hapus kategori sampah dengan modal konfirmasi', async ({ page }) => {
    // Klik tombol hapus pada kartu kedua (Kardus Box Cokelat)
    const deleteBtn = page.locator('button[title="Hapus Kategori"]').nth(1);
    await deleteBtn.click();

    // Modal konfirmasi harus muncul
    await expect(page.getByRole('heading', { name: /Hapus Kategori\?/i })).toBeVisible();
    await expect(page.getByText(/Apakah Anda yakin ingin menghapus/i)).toBeVisible();

    // Klik Ya, Hapus
    await page.getByRole('button', { name: /Ya, Hapus/i }).click();

    // Verifikasi notifikasi berhasil dihapus dan item hilang dari DOM
    await expect(page.getByText(/berhasil dihapus/i)).toBeVisible();
    await expect(page.getByText('Kardus Box Cokelat')).not.toBeVisible();
  });
});
