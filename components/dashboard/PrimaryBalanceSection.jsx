'use client';

import React from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Eye } from 'lucide-react';
import { TumbuhLogo } from '@/components/ui/Logo';

export function PrimaryBalanceSection({ totalBalance, targetAmount, progressInfo }) {
  const rawPercentage = progressInfo?.rawPercentage || 31;
  const remaining = progressInfo?.remaining || (targetAmount - totalBalance);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs overflow-hidden">
      {/* Top Row: Label & Sprout Illustration */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Total Tabungan</span>
            <Eye className="h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Large Amount */}
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalBalance)}
          </h3>

          {/* Percentage badge */}
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <span>↑ +12% dari bulan lalu</span>
          </div>
        </div>

        {/* Sprout 3D Illustration for Dashboard */}
        <div className="h-16 w-16 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center p-2 flex-shrink-0 overflow-hidden">
          <img
            src="/sprout-3d.png"
            alt="Sprout 3D Icon"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Target Progress Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Target <span className="font-semibold text-slate-800">{formatCurrency(targetAmount)}</span>
          </span>
          <span className="font-bold text-blue-600 tabular-nums">
            {formatPercentage(rawPercentage)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
          />
        </div>

        {/* Sisa text */}
        <div className="text-xs text-slate-500 font-medium">
          Sisa <span className="font-semibold text-slate-700">{formatCurrency(remaining)}</span>
        </div>
      </div>
    </section>
  );
}

