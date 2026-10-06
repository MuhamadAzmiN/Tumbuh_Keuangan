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
    <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#0062FF] to-[#0052EA] p-3.5 sm:p-4 text-white shadow-sm space-y-3">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-medium text-white/90 flex items-center gap-1">
              <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-white">
                <ShieldCheck className="h-2.5 w-2.5" />
              </div>
              <span>Total Tabungan</span>
            </span>

            {/* Green Dot Indicator */}
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D284] ml-1" />

            {/* Status Pill Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${isBehind
                ? 'bg-amber-400 text-amber-950'
                : 'bg-[#00D284] text-[#003B26]'
              }`}>
              <span>{statusLabel}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer ml-0.5"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
          </div>

          {/* Large Amount Display */}
          <h3 className="text-[25px] sm:text-[26px] font-bold tracking-tight text-white tabular-nums mt-1 leading-none">
            {showBalance ? formatCurrency(currentVal) : '••••••••••••'}
          </h3>
        </div>

        {/* Sprout Mascot Icon Container */}
        <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center p-1.5 flex-shrink-0">
          <img
            src="/sprout-3d.png"
            alt="Sprout mascot"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="h-[7px] flex-1 rounded-full bg-black/20 overflow-hidden p-0.5 mr-3">
            <div
              className="h-full rounded-full bg-[#00E5A3] transition-all duration-700 ease-out"
              style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
            />
          </div>
          <span className="text-white font-bold text-xs tabular-nums flex-shrink-0">
            {formatPercentage(rawPercentage)}
          </span>
        </div>

        {/* Target Label under progress bar */}
        <div className="text-[10.5px] font-medium text-white/90 pt-0.5">
          <span>Target Utama</span> <span className="font-bold text-white tabular-nums ml-1">{formatCurrency(targetVal)}</span>
        </div>

        {/* Sisa & Terkumpul */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10.5px]">
          <div>
            <span className="text-white/80 font-normal block">Terkumpul</span>
            <strong className="text-white font-bold text-xs sm:text-[13px] tabular-nums block mt-0.5">{formatCurrency(currentVal)}</strong>
          </div>
          <div className="text-right">
            <span className="text-white/80 font-normal block">Sisa</span>
            <strong className="text-white font-bold text-xs sm:text-[13px] tabular-nums block mt-0.5">{formatCurrency(remaining)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

