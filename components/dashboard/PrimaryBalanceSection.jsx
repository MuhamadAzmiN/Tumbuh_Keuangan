'use client';

import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Eye, EyeOff, Sparkles, Target, TrendingUp, ShieldCheck } from 'lucide-react';

export function PrimaryBalanceSection({ totalBalance, targetAmount, progressInfo }) {
  const [showBalance, setShowBalance] = useState(true);

  const rawPercentage = progressInfo?.rawPercentage || 31;
  const remaining = progressInfo?.remaining || Math.max(0, (targetAmount || 50000000) - (totalBalance || 0));
  const currentVal = Number(totalBalance) || 0;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-5 text-white shadow-xl shadow-blue-500/15 border border-blue-400/30 space-y-4">
      {/* Background Decorative Circles */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-blue-100 backdrop-blur-md border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Total Tabungan Kamu</span>
            </span>

            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 transition-colors cursor-pointer"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Large Amount Display */}
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums mt-1 drop-shadow-xs">
            {showBalance ? formatCurrency(currentVal) : '••••••••••••'}
          </h3>
        </div>

        {/* Cute 3D Sprout Badge Container */}
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center p-2 flex-shrink-0 shadow-inner group hover:scale-105 transition-transform">
          <img
            src="/sprout-3d.png"
            alt="Cute Sprout Mascot"
            className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform"
          />
        </div>
      </div>

      {/* Target Progress Bar & Subtext */}
      <div className="relative z-10 space-y-2 pt-1 border-t border-white/15">
        <div className="flex items-center justify-between text-xs font-bold text-blue-100">
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-amber-300" />
            <span>Target Utama: <strong className="text-white">{formatCurrency(targetAmount || 50000000)}</strong></span>
          </span>
          <span className="text-amber-300 font-extrabold text-sm tabular-nums">
            {formatPercentage(rawPercentage)}
          </span>
        </div>

        {/* Cute Gradient Progress Bar */}
        <div className="h-3 w-full rounded-full bg-black/20 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
          />
        </div>

        {/* Sisa Kekurangan Pill */}
        <div className="flex items-center justify-between text-[11px] text-blue-100/90 font-medium">
          <span>Terkumpul: <strong className="text-white font-bold tabular-nums">{formatCurrency(currentVal)}</strong></span>
          <span>Sisa: <strong className="text-amber-200 font-bold tabular-nums">{formatCurrency(remaining)}</strong></span>
        </div>
      </div>
    </section>
  );
}

