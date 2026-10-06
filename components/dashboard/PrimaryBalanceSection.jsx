'use client';

import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Eye, EyeOff, Target } from 'lucide-react';

export function PrimaryBalanceSection({ totalBalance, targetAmount, progressInfo }) {
  const [showBalance, setShowBalance] = useState(true);

  const rawPercentage = progressInfo?.rawPercentage || 0;
  const targetVal = Number(targetAmount) || 50000000;
  const currentVal = Number(totalBalance) || 0;
  const remaining = Math.max(0, targetVal - currentVal);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Tabungan</span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Large Amount Display */}
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {showBalance ? formatCurrency(currentVal) : '••••••••••••'}
          </h3>
        </div>

        {/* Brand Sprout Badge */}
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-2.5 flex-shrink-0">
          <img
            src="/sprout-3d.png"
            alt="Sprout Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Target Progress Section */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-blue-600" />
            <span>Target Utama: <strong className="text-slate-900 tabular-nums">{formatCurrency(targetVal)}</strong></span>
          </span>
          <span className="text-blue-600 font-extrabold tabular-nums">
            {formatPercentage(rawPercentage)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
          />
        </div>

        {/* Sisa & Terkumpul */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Terkumpul: <strong className="text-slate-900 font-bold tabular-nums">{formatCurrency(currentVal)}</strong></span>
          <span>Sisa: <strong className="text-slate-900 font-bold tabular-nums">{formatCurrency(remaining)}</strong></span>
        </div>
      </div>
    </section>
  );
}

