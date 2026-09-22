import { test, expect } from '@playwright/test';
import { setupMockApi } from './helpers/mock-api';
import { loginAsNasabah, clearAuthSession } from './helpers/auth-helper';

test.describe('01. Autentikasi & Akses Pengguna', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page);
  });

  test('Landing page menampilkan branding EcoPayard dan navigasi utama', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bank Sampah/i);
    await expect(page.getByText('EcoPayard').first()).toBeVisible();
    
    // Pastikan tombol login dan register ada
    const loginLink = page.getByRole('link', { name: /Masuk/i }).first();
    await expect(loginLink).toBeVisible();
  });

  test('Validasi form login: Field kosong memicu validasi HTML5/Toast', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Selamat Datang/i })).toBeVisible();

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Input identifier harus required
    const identifierInput = page.locator('#identifier');
    await expect(identifierInput).toHaveAttribute('required', '');
  });

  test('Toggle password visibility bekerja dengan benar', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('#password');
    const toggleBtn = page.locator('button[title="Lihat Sandi"]');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Login gagal dengan kredensial salah memunculkan Toast Error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#identifier').fill('salah');
    await page.locator('#password').fill('salah');
    await page.locator('button[type="submit"]').click();

    // Muncul toast notification
    await expect(page.getByText(/Login gagal|tidak valid/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Login sukses sebagai Nasabah diarahkan ke /nasabah/dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#identifier').fill('sitiaminah');
    await page.locator('#password').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Harus diarahkan ke dashboard nasabah
    await expect(page).toHaveURL(/.*\/nasabah\/dashboard/);
    await expect(page.getByText('Siti Aminah').first()).toBeVisible();
  });

  test('Login sukses sebagai Admin diarahkan ke /admin/dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#identifier').fill('admin');
    await page.locator('#password').fill('admin123');
    await page.locator('button[type="submit"]').click();

    // Harus diarahkan ke dashboard admin
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.getByText(/Bank Sampah Unit|Admin/i).first()).toBeVisible();
  });

  test('Registrasi Nasabah: Validasi password konfirmasi tidak cocok', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#nasabah-nama').fill('Dewi Sartika');
    await page.locator('#nasabah-telp').fill('08123456789');
    await page.locator('#nasabah-alamat').fill('Jl. Melati No. 10');
    await page.locator('#nasabah-username').fill('dewisartika');
    await page.getByPlaceholder('Kata Sandi', { exact: true }).fill('rahasia123');
    await page.getByPlaceholder('Ulangi Sandi').fill('berbeda123');
    await page.locator('input[type="checkbox"]').check();

    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/Konfirmasi kata sandi tidak cocok/i)).toBeVisible();
  });

  test('Registrasi Nasabah: Berhasil mendaftar dan dialihkan ke login', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#nasabah-nama').fill('Dewi Sartika');
    await page.locator('#nasabah-telp').fill('08123456789');
    await page.locator('#nasabah-alamat').fill('Jl. Melati No. 10');
    await page.locator('#nasabah-username').fill('dewisartika');
    await page.getByPlaceholder('Kata Sandi', { exact: true }).fill('rahasia123');
    await page.getByPlaceholder('Ulangi Sandi').fill('rahasia123');
    await page.locator('input[type="checkbox"]').check();

    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Logout dari dashboard membersihkan session dan kembali ke login', async ({ page }) => {
    await loginAsNasabah(page);
    await page.goto('/nasabah/akun');
    
    // Klik tombol keluar akun
    const logoutBtn = page.getByRole('button', { name: /Keluar Akun/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/.*\/login/);
  });
});
