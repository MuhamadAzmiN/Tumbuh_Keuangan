'use client';

import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { calculateMonthStats } from '@/lib/calculations';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';

export function MonthPlanCard({ month, transactions, settings, targetData }) {
  const { toggleTarget } = useFinance();
  const { showToast } = useToast();

  const stats = calculateMonthStats(month.key, transactions, settings || {});

  const isSalaryDone = Boolean(targetData?.salary_completed);
  const isFreelanceDone = Boolean(targetData?.freelance_completed);
  const isAllDone = isSalaryDone && isFreelanceDone;

  const handleSalaryToggle = (e) => {
    toggleTarget(month.dateStr, 'salary_completed', e.target.checked);
    showToast(e.target.checked ? 'Target Nabung Gaji ditandai selesai! 🎯' : 'Status target diperbarui', 'info');
  };

  const handleFreelanceToggle = (e) => {
    toggleTarget(month.dateStr, 'freelance_completed', e.target.checked);
    showToast(e.target.checked ? 'Target Freelance ditandai selesai! 🎯' : 'Status target diperbarui', 'info');
  };

  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-[#0F172A] p-5 sm:p-6 transition-all shadow-sm ${isAllDone
        ? 'border-emerald-200 bg-emerald-50/10'
        : 'border-slate-200 dark:border-slate-800/60'
        }`}
    >
      {/* Month Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <span className="text-xs font-semibold text-slate-400">
            Bulan {month.index} dari 12
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {month.label}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isAllDone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <Check className="h-3 w-3 stroke-[3]" />
              <span>Target Selesai</span>
            </span>
          )}
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Target</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(stats.totalTarget)}
            </span>
          </div>
        </div>
      </div>

      {/* Target Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {/* 1. Nabung Gaji */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Nabung Gaji
              </span>
              <span className="text-[11px] text-slate-500">
                Target: {formatCurrency(stats.salaryTarget)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums block">
                {formatCurrency(stats.salaryActual)}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 tabular-nums">
                {formatPercentage(stats.salaryProgress)}
              </span>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(stats.salaryProgress, 100)}%` }}
            />
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSalaryDone}
              onChange={handleSalaryToggle}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={isSalaryDone ? 'line-through text-slate-400' : ''}>
              Tandai Gaji Ditabung
            </span>
          </label>
        </div>

        {/* 2. Freelance */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Freelance
              </span>
              <span className="text-[11px] text-slate-500">
                Target: {formatCurrency(stats.freelanceTarget)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums block">
                {formatCurrency(stats.freelanceActual)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">
                {formatPercentage(stats.freelanceProgress)}
              </span>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${Math.min(stats.freelanceProgress, 100)}%` }}
            />
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreelanceDone}
              onChange={handleFreelanceToggle}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className={isFreelanceDone ? 'line-through text-slate-400' : ''}>
              Tandai Freelance Masuk
            </span>
          </label>
        </div>
      </div>

      {/* Month Card Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span>Aktual: </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(stats.totalActual)}
          </span>
        </div>
        <div>
          <span>Kurang: </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(stats.remaining)}
          </span>
          <span className="text-slate-400 ml-1">
            ({formatPercentage(stats.progress)})
          </span>
        </div>
      </div>
    </div>
  );
}
