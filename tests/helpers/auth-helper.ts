import { Page } from '@playwright/test';
import { MOCK_NASABAH_USER, MOCK_ADMIN_USER } from './mock-data';
import { DEFAULT_APP_KEY } from '@/lib/auth';
import type { MockStore } from './mock-api';

export async function loginAsNasabah(page: Page, store?: MockStore) {
  const user = JSON.parse(JSON.stringify(MOCK_NASABAH_USER));
  if (store) {
    store.currentUser = user;
  }
  await page.addInitScript(
    ({ user, appKey }) => {
      try {
        window.localStorage.clear();
        window.localStorage.setItem('bank_sampah_app_key', appKey);
        window.localStorage.setItem('bank_sampah_token', user.token);
        window.localStorage.setItem('bank_sampah_user', JSON.stringify(user));
      } catch {}
    },
    { user, appKey: DEFAULT_APP_KEY }
  );
  try {
    await page.evaluate(
      ({ user, appKey }) => {
        window.localStorage.clear();
        window.localStorage.setItem('bank_sampah_app_key', appKey);
        window.localStorage.setItem('bank_sampah_token', user.token);
        window.localStorage.setItem('bank_sampah_user', JSON.stringify(user));
      },
      { user, appKey: DEFAULT_APP_KEY }
    );
  } catch {}
}

export async function loginAsAdmin(page: Page, store?: MockStore) {
  const user = JSON.parse(JSON.stringify(MOCK_ADMIN_USER));
  if (store) {
    store.currentUser = user;
  }
  await page.addInitScript(
    ({ user, appKey }) => {
      try {
        window.localStorage.clear();
        window.localStorage.setItem('bank_sampah_app_key', appKey);
        window.localStorage.setItem('bank_sampah_token', user.token);
        window.localStorage.setItem('bank_sampah_user', JSON.stringify(user));
      } catch {}
    },
    { user, appKey: DEFAULT_APP_KEY }
  );
  try {
    await page.evaluate(
      ({ user, appKey }) => {
        window.localStorage.clear();
        window.localStorage.setItem('bank_sampah_app_key', appKey);
        window.localStorage.setItem('bank_sampah_token', user.token);
        window.localStorage.setItem('bank_sampah_user', JSON.stringify(user));
      },
      { user, appKey: DEFAULT_APP_KEY }
    );
  } catch {}
}

export async function clearAuthSession(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem('bank_sampah_token');
    window.localStorage.removeItem('bank_sampah_user');
  });
}
