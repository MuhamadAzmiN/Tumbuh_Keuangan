'use client';

import React from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { CategoryIcon } from './CategoryIcon';

export function CategoryBreakdown({ categoryBreakdown = [], totalExpense = 0 }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-5 shadow-sm space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Pengeluaran Berdasarkan Kategori
        </h4>
        <span className="text-xs text-slate-500 font-medium">
          {categoryBreakdown.length} kategori aktif
        </span>
      </div>

      <div className="space-y-3.5">
        {categoryBreakdown.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                  <CategoryIcon category={item.category} className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.category}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({item.count}x)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-[11px] font-medium text-slate-500 tabular-nums w-12 text-right">
                  {formatPercentage(item.percentage)}
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
