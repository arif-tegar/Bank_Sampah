export function cn(...classes: (string | boolean | number | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPoin(points: number | undefined | null): string {
  if (points === undefined || points === null || isNaN(points)) return '0 Poin';
  const formatted = Number.isInteger(points) ? points.toString() : points.toFixed(2);
  return `${formatted} Poin`;
}

export function formatKg(weight: number | undefined | null): string {
  if (weight === undefined || weight === null || isNaN(weight)) return '0 kg';
  const formatted = Number.isInteger(weight) ? weight.toString() : weight.toFixed(2);
  return `${formatted} kg`;
}

export function formatTanggal(dateStr: string | undefined | null, includeTime: boolean = false): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return dateStr;
  }
}

export function formatBulanTahun(ymStr: string): string {
  if (!ymStr) return '-';
  try {
    const [year, month] = ymStr.split('-');
    if (!year || !month) return ymStr;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  } catch {
    return ymStr;
  }
}

export function getCurrentMonthStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getStatusInfo(status: string) {
  const normalized = (status || '').toLowerCase().trim();
  switch (normalized) {
    case 'menunggu_konfirmasi':
    case 'menunggu':
    case 'belum dikonfirmasi':
      return {
        label: 'Menunggu Konfirmasi',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        dotClass: 'bg-amber-500',
      };
    case 'diverifikasi':
      return {
        label: 'Diverifikasi',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        dotClass: 'bg-blue-500',
      };
    case 'diproses':
      return {
        label: 'Diproses',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
        dotClass: 'bg-indigo-500',
      };
    case 'selesai':
      return {
        label: 'Selesai',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dotClass: 'bg-emerald-500',
      };
    case 'ditolak':
      return {
        label: 'Ditolak',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: status || 'Unknown',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://learn.smktelkom-mlg.sch.id/bank_sampah/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
