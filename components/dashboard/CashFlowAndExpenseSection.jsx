'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Lightbulb, Wallet } from 'lucide-react';

export function CashFlowAndExpenseSection({
  monthIncome = 0,
  expenseStats,
  activeMonthLabel = 'Bulan Ini',
}) {
  const {
    totalExpense = 0,
    largestCategory = null,
    comparisonWithPrev = null,
  } = expenseStats || {};

  const netCashFlow = monthIncome - totalExpense;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Arus Kas & Pengeluaran ({activeMonthLabel})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbandingan pemasukan, pengeluaran, dan sisa uang kas bulan ini
          </p>
        </div>

        <Link
          href="/dashboard/expenses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <span>Detail Pengeluaran</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 3 Metrics: Pemasukan, Pengeluaran, Sisa Cash Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pemasukan */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Pemasukan Bulan Ini
            </span>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(monthIncome)}
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Pengeluaran Bulan Ini
            </span>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        {/* Sisa Cash Flow */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Sisa Cash Flow
            </span>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <p
            className={`text-lg font-bold mt-2 tabular-nums ${netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
          >
            {formatCurrency(netCashFlow)}
          </p>
        </div>
      </div>

      {/* Insight Section */}
      <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 text-xs text-slate-700 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>Insight Keuangan Bulan Ini</span>
        </div>

        <ul className="space-y-1 text-slate-600 pl-5 list-disc leading-relaxed">
          <li>
            Pengeluaran kamu bulan ini{' '}
            <strong className="text-slate-900 tabular-nums">
              {formatCompactCurrency(totalExpense)}
            </strong>.
          </li>

          {largestCategory && (
            <li>
              Kategori terbesar:{' '}
              <strong className="text-slate-900">{largestCategory.category}</strong>{' '}
              ({formatCurrency(largestCategory.amount)}).
            </li>
          )}

          {comparisonWithPrev && (
            <li>
              Pengeluaran kamu{' '}
              <strong className="text-slate-900">
                {comparisonWithPrev.diffPercentage.toFixed(0)}%{' '}
                {comparisonWithPrev.isLower
                  ? 'lebih rendah'
                  : comparisonWithPrev.isHigher
                    ? 'lebih tinggi'
                    : 'sama'}
              </strong>{' '}
              dibanding bulan lalu.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
