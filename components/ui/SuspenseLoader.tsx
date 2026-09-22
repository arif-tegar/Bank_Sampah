'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuspenseLoaderProps {
  /** The children to render when resolved */
  children: React.ReactNode;
  /** Optional custom fallback component */
  fallback?: React.ReactNode;
  /** Optional container class name */
  className?: string;
}

/**
 * Default fallback placeholder to prevent Cumulative Layout Shift (CLS)
 */
export const DefaultLoaderFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'w-full min-h-[240px] flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 animate-in fade-in duration-200',
      className
    )}
  >
    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
      <span className="text-sm font-medium tracking-wide">Memuat komponen...</span>
    </div>
  </div>
);

/**
 * SuspenseLoader wrapper implementing Suspense-first architecture
 * Ensures smooth loading without layout shift
 */
export const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  children,
  fallback,
  className,
}) => {
  return (
    <Suspense fallback={fallback || <DefaultLoaderFallback className={className} />}>
      {children}
    </Suspense>
  );
};

export default SuspenseLoader;
