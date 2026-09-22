import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'emerald',
  className,
}: StatCardProps) {
  const variantStyles = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/20',
    blue: 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-blue-500/20',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20',
    purple: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20',
    slate: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-slate-200/50',
  };

  const isLight = variant === 'slate';

  return (
    <div
      className={cn(
        'relative overflow-hidden p-6 rounded-3xl shadow-lg transition-all duration-200 hover:-translate-y-0.5',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className={cn('text-sm font-medium', isLight ? 'text-slate-500 dark:text-slate-400' : 'text-white/80')}>
            {title}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">{value}</h2>
          {subtitle && (
            <p className={cn('text-xs mt-1', isLight ? 'text-slate-400 dark:text-slate-500' : 'text-white/70')}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-3 rounded-2xl flex items-center justify-center',
              isLight ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-white/15 text-white backdrop-blur-xs'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
