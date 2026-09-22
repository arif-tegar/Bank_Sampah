import { UserAuthData, UserRole } from '@/types/api';

export const DEFAULT_APP_KEY = 'a1a1cf0d-beb4-4eba-a1c6-cd917232f65a';
const APP_KEY_STORAGE = 'bank_sampah_app_key';
const TOKEN_STORAGE = 'bank_sampah_token';
const USER_STORAGE = 'bank_sampah_user';

export function getAppKey(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_KEY || DEFAULT_APP_KEY;
  }
  const stored = localStorage.getItem(APP_KEY_STORAGE);
  if (stored && stored.trim()) return stored.trim();
  try {
    localStorage.setItem(APP_KEY_STORAGE, DEFAULT_APP_KEY);
  } catch {
    // Ignore storage quota/permission error
  }
  return process.env.NEXT_PUBLIC_APP_KEY || DEFAULT_APP_KEY;
}

export function setAppKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_KEY_STORAGE, key.trim());
}

export function removeAppKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(APP_KEY_STORAGE);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE, token.trim());
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE);
}

export function normalizeUserData(rawData: unknown, tokenFallback?: string | null): UserAuthData | null {
  if (!rawData || typeof rawData !== 'object') return null;

  const raw = rawData as Record<string, unknown>;
  const innerUser = raw.user && typeof raw.user === 'object' ? (raw.user as Record<string, unknown>) : {};

  const token = (raw.token || innerUser.token || tokenFallback || getToken() || '').toString();
  const id = String(raw.id || innerUser.id || raw.userId || innerUser.userId || '');
  const username = String(raw.username || innerUser.username || '');

  // Extract raw role from all possible fields and levels
  let rawRole = String(raw.role || innerUser.role || '').toLowerCase().trim();

  // If role is still not found, try reading JWT payload if token exists
  if (!rawRole && token && token.includes('.')) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(atob(parts[1]));
        if (decoded.role) {
          rawRole = String(decoded.role).toLowerCase().trim();
        }
      }
    } catch {
      // ignore
    }
  }

  // Detect related profiles
  const nasabahData = (raw.nasabah || innerUser.nasabah) as UserAuthData['nasabah'];
  const adminBankData = (raw.adminBank || raw.admin_bank || innerUser.adminBank || innerUser.admin_bank) as UserAuthData['adminBank'];

  let role: UserRole = 'nasabah';
  if (rawRole === 'admin' || rawRole === 'admin_bank' || rawRole.includes('admin') || adminBankData) {
    role = 'admin_bank';
  } else if (rawRole === 'nasabah' || rawRole.includes('nasabah') || nasabahData) {
    role = 'nasabah';
  }

  return {
    id,
    username,
    role,
    token,
    nasabah: nasabahData || undefined,
    adminBank: adminBankData || undefined,
  };
}

export function getUser(): UserAuthData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeUserData(parsed);
    // If normalized fixes the role or structure, heal localStorage immediately
    if (normalized && JSON.stringify(normalized) !== raw) {
      localStorage.setItem(USER_STORAGE, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return null;
  }
}

export function setUser(user: UserAuthData): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeUserData(user);
  if (normalized) {
    localStorage.setItem(USER_STORAGE, JSON.stringify(normalized));
  } else {
    localStorage.setItem(USER_STORAGE, JSON.stringify(user));
  }
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE);
}

export function logout(): void {
  removeToken();
  removeUser();
}

export function clearAll(): void {
  removeAppKey();
  removeToken();
  removeUser();
}

export function getRole(): UserRole | null {
  const user = getUser();
  return user?.role || null;
}
