'use client';

import React from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { CONTRACT_MONTHS } from '@/lib/constants';

export function MonthTargetSection({ currentMonthStats, activeMonthKey }) {
  const currentMonthInfo = CONTRACT_MONTHS.find((m) => m.key === activeMonthKey) || {
    label: 'Bulan Ini',
  };

  const {
    totalTarget = 3300000,
    totalActual = 0,
    salaryTarget = 2000000,
    salaryActual = 0,
    freelanceTarget = 1300000,
    freelanceActual = 0,
    salaryProgress = 0,
    freelanceProgress = 0,
    progress = 0,
  } = currentMonthStats || {};

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Bulan Ini ({currentMonthInfo.label})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Target bulanan gabungan gaji dan freelance
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Total Target</span>
          <span className="text-base font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalTarget)}
          </span>
        </div>
      </div>

      {/* Target & Actual Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        {/* Gaji Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Nabung Gaji
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              Target: {formatCurrency(salaryTarget)}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(salaryActual)}
            </span>
            <span className="text-xs font-semibold text-blue-600 tabular-nums">
              {formatPercentage(salaryProgress)}
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(salaryProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Freelance Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Freelance
            </span>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              Target: {formatCurrency(freelanceTarget)}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(freelanceActual)}
            </span>
            <span className="text-xs font-semibold text-emerald-600 tabular-nums">
              {formatPercentage(freelanceProgress)}
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${Math.min(freelanceProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Monthly Total Progress Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          <span>Terkumpul bulan ini: </span>
          <span className="font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalActual)}
          </span>
          <span className="text-slate-400"> / {formatCurrency(totalTarget)}</span>
        </div>
        <div className="font-medium">
          Sisa target bulan ini:{' '}
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrency(Math.max(0, totalTarget - totalActual))}
          </span>
        </div>
      </div>
    </section>
  );
}
