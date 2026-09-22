'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingOverlayProps {
  /** Whether loading overlay is active */
  loading: boolean;
  /** Component children to render */
  children: React.ReactNode;
  /** Optional loading message text */
  message?: string;
  /** Optional custom container class */
  className?: string;
}

/**
 * LoadingOverlay wraps content and displays a non-destructive spinner overlay
 * Prevents Cumulative Layout Shift (CLS) when fetching updates
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  message = 'Memuat...',
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs rounded-2xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
            <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;
