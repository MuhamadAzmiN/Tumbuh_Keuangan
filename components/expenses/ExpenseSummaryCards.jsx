'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';

export function ExpenseSummaryCards({ expenseStats }) {
  const {
    totalExpense = 0,
    transactionCount = 0,
    largestExpense = null,
    dailyAverage = 0,
  } = expenseStats || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Pengeluaran */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs text-slate-500 font-medium">Total Pengeluaran</span>
        <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tabular-nums">
          {formatCurrency(totalExpense)}
        </p>
      </div>

      {/* 2. Jumlah Transaksi */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs text-slate-500 font-medium">Jumlah Transaksi</span>
        <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tabular-nums">
          {transactionCount}{' '}
          <span className="text-xs font-normal text-slate-500">transaksi</span>
        </p>
      </div>

      {/* 3. Pengeluaran Terbesar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs text-slate-500 font-medium">Pengeluaran Terbesar</span>
        <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tabular-nums truncate">
          {largestExpense ? formatCurrency(largestExpense.amount) : 'Rp0'}
        </p>
        {largestExpense && (
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {largestExpense.category}
          </p>
        )}
      </div>

      {/* 4. Rata-rata per Hari */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs text-slate-500 font-medium">Rata-rata / Hari</span>
        <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tabular-nums">
          {formatCurrency(dailyAverage)}
        </p>
      </div>
    </div>
  );
}
