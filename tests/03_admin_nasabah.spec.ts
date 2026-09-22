import { test, expect } from '@playwright/test';
import { setupMockApi, createInitialMockStore } from './helpers/mock-api';
import { loginAsAdmin } from './helpers/auth-helper';

test.describe('03. Manajemen Nasabah (Admin)', () => {
  let mockStore: ReturnType<typeof createInitialMockStore>;

  test.beforeEach(async ({ page }) => {
    mockStore = createInitialMockStore('admin');
    await setupMockApi(page, mockStore);
    await loginAsAdmin(page);
    await page.goto('/admin/nasabah');
  });

  test('Menampilkan database nasabah dan daftar warga terdaftar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Data Nasabah/i })).toBeVisible();

    // Verifikasi nasabah awal muncul
    await expect(page.getByText('Siti Aminah')).toBeVisible();
    await expect(page.getByText('Ahmad Supardi')).toBeVisible();
    await expect(page.getByText('Dewi Lestari')).toBeVisible();
  });

  test('Pencarian / filtering nasabah berdasarkan nama', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Cari nasabah berdasarkan nama atau no. telepon...');
    await searchInput.fill('Ahmad');

    // Ahmad harus tetap terlihat, Siti Aminah harus terfilter
    await expect(page.getByText('Ahmad Supardi')).toBeVisible();
    await expect(page.getByText('Siti Aminah')).not.toBeVisible();

    // Reset pencarian
    await searchInput.fill('');
    await expect(page.getByText('Siti Aminah')).toBeVisible();
  });

  test('Tambah akun nasabah baru dari panel admin', async ({ page }) => {
    await page.getByRole('button', { name: /Tambah Nasabah Baru/i }).click();
    await expect(page.getByRole('heading', { name: /Tambah Nasabah Baru/i })).toBeVisible();

    await page.getByPlaceholder('Contoh: Budi Santoso').fill('Rahmat Hidayat');
    await page.getByPlaceholder('budisantoso').fill('rahmathidayat');
    await page.getByPlaceholder('Minimal 6 karakter').fill('password123');
    await page.getByPlaceholder('08123456789').fill('081399887766');
    await page.getByPlaceholder(/RT 02 \/ RW 05/i).fill('Jl. Garuda No. 88');

    await page.getByRole('button', { name: /Simpan Nasabah/i }).click();

    // Verifikasi toast & tampilan nasabah baru
    await expect(page.getByText(/Nasabah baru berhasil didaftarkan/i)).toBeVisible();
    await expect(page.getByText('Rahmat Hidayat')).toBeVisible();
  });

  test('Edit data kontak dan profil nasabah', async ({ page }) => {
    // Filter ke Ahmad Supardi
    await page.getByPlaceholder('Cari nasabah berdasarkan nama atau no. telepon...').fill('Ahmad');
    const editBtn = page.locator('button[title="Edit Data Nasabah"]').first();
    await editBtn.click();

    await expect(page.getByRole('heading', { name: /Edit Data Nasabah/i })).toBeVisible();

    const nameInput = page.locator('form input[type="text"]').first();
    await nameInput.fill('Ahmad Supardi S.T.');

    await page.getByRole('button', { name: /Perbarui Data/i }).click();

    await expect(page.getByText(/Data nasabah berhasil diperbarui/i)).toBeVisible();
    await expect(page.getByText('Ahmad Supardi S.T.')).toBeVisible();
  });

  test('Hapus akun nasabah dengan dialog konfirmasi', async ({ page }) => {
    // Filter ke Dewi Lestari
    await page.getByPlaceholder('Cari nasabah berdasarkan nama atau no. telepon...').fill('Dewi');
    const deleteBtn = page.locator('button[title="Hapus Nasabah"]').first();
    await deleteBtn.click();

    await expect(page.getByRole('heading', { name: /Hapus Nasabah\?/i })).toBeVisible();
    await page.getByRole('button', { name: /Ya, Hapus/i }).click();

    await expect(page.getByText(/Nasabah berhasil dihapus/i)).toBeVisible();
    await expect(page.getByText('Dewi Lestari')).not.toBeVisible();
  });
});
