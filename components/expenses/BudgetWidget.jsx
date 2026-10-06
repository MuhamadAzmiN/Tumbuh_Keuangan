'use client';

import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Settings2 } from 'lucide-react';
import { BudgetModal } from './BudgetModal';

export function BudgetWidget({ expenseStats, monthKey, monthLabel }) {
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  const {
    budget = 2000000,
    totalExpense = 0,
    remainingBudget = 0,
    budgetUsedPercentage = 0,
    budgetStatusLabel = 'Aman',
    budgetBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200',
  } = expenseStats || {};

  const clampedProgress = Math.min(Math.max(budgetUsedPercentage, 0), 100);

  // Status progress bar color
  let barColor = 'bg-emerald-600';
  if (budgetUsedPercentage > 100) {
    barColor = 'bg-red-600';
  } else if (budgetUsedPercentage >= 70) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Batas Budget {monthLabel}
          </span>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${budgetBadgeColor}`}>
            {budgetStatusLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsEditBudgetOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 p-1 cursor-pointer"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>Atur Budget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <span className="text-xs text-slate-500 block">Batas Budget</span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(budget)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Terpakai</span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(totalExpense)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Sisa Budget</span>
          <span
            className={`text-base font-bold tabular-nums ${budgetUsedPercentage > 100 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'
              }`}
          >
            {budgetUsedPercentage > 100
              ? `- ${formatCurrency(totalExpense - budget)}`
              : formatCurrency(remainingBudget)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pt-1 space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{formatPercentage(budgetUsedPercentage)} digunakan</span>
          <span>{budgetUsedPercentage > 100 ? 'Melebihi budget' : `${formatPercentage(100 - clampedProgress)} tersisa`}</span>
        </div>
      </div>

      <BudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        monthKey={monthKey}
        currentBudget={budget}
        monthLabel={monthLabel}
      />
    </div>
  );
}
