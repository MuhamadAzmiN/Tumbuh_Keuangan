'use client';

import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Eye, EyeOff, Target, ShieldCheck } from 'lucide-react';

export function PrimaryBalanceSection({ totalBalance, targetAmount, progressInfo, financialStatus }) {
  const [showBalance, setShowBalance] = useState(true);

  const rawPercentage = progressInfo?.rawPercentage || 22.2;
  const targetVal = Number(targetAmount) || 50000000;
  const currentVal = Number(totalBalance) || 11108000;
  const remaining = Math.max(0, targetVal - currentVal);

  const statusLabel = financialStatus?.label || 'ON TRACK';
  const isBehind = financialStatus?.status === 'BEHIND';

  return (
    <section className="relative overflow-hidden rounded-[16px] bg-[#2563EB] p-3.5 sm:p-4 text-white shadow-sm space-y-3">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-blue-100 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-200" />
              <span>Total Tabungan</span>
            </span>

            {/* Status Pill Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wide uppercase ${isBehind
                ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
                : 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/40'
              }`}>
              <span className={`h-1 w-1 rounded-full ${isBehind ? 'bg-amber-300' : 'bg-emerald-300'}`} />
              <span>{statusLabel}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 transition-colors cursor-pointer ml-0.5"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
          </div>

          {/* Large Amount Display */}
          <h3 className="text-[24px] sm:text-[25px] font-bold tracking-tight text-white tabular-nums mt-0.5 leading-tight">
            {showBalance ? formatCurrency(currentVal) : '••••••••••••'}
          </h3>
        </div>

        {/* Sprout Mascot Icon Container */}
        <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 flex-shrink-0 shadow-2xs">
          <img
            src="/sprout-3d.png"
            alt="Sprout mascot"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-blue-100">
          <span>Target Utama <strong className="text-white font-bold">{formatCurrency(targetVal)}</strong></span>
          <span className="text-white font-bold text-[11px] tabular-nums">
            {formatPercentage(rawPercentage)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-[6px] w-full rounded-full bg-white/20 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
          />
        </div>

        {/* Sisa & Terkumpul */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-blue-100/90 font-medium pt-0.5">
          <span>Terkumpul: <strong className="text-white font-bold tabular-nums">{formatCurrency(currentVal)}</strong></span>
          <span>Sisa: <strong className="text-white font-bold tabular-nums">{formatCurrency(remaining)}</strong></span>
        </div>
      </div>
    </section>
  );
}

