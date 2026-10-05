'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimaryBalanceSection } from '@/components/dashboard/PrimaryBalanceSection';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { APP_CONFIG } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import Link from 'next/link';
import { Plus, FileText, Target, BarChart2 } from 'lucide-react';
import { TransactionModal } from '@/components/transactions/TransactionModal';

export default function DashboardPage() {
  const {
    user,
    profile,
    settings,
    loading,
    totalBalance,
    progressInfo,
    currentMonthStats,
  } = useFinance();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const userName = profile?.name || user?.email?.split('@')[0] || 'Azmi';
  const targetAmount = settings?.target_amount || APP_CONFIG.targetAmount;
  const initialBalance = settings?.initial_balance || APP_CONFIG.initialBalance;
  const monthlySavings = (currentMonthStats?.salaryActual || APP_CONFIG.monthlySalaryTarget) + (currentMonthStats?.freelanceActual || APP_CONFIG.monthlyFreelanceTarget);
  const rawPercentage = progressInfo?.rawPercentage || 31;

  useEffect(() => {
    if (!loading && user && !settings) {
      setIsOnboardingOpen(true);
    }
  }, [loading, user, settings]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 pt-2">
          <Skeleton className="h-6 w-48" />
          <CardSkeleton />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 animate-in pb-4">

        {/* ── 1. GREETING ────────────────────────── */}
        <div className="pt-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Halo, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Setiap langkah kecil, membawa kamu lebih dekat ke tujuan besar.
          </p>
        </div>

        {/* ── 2. SAVINGS CARD (Total Tabungan) ───── */}
        <PrimaryBalanceSection
          totalBalance={totalBalance || 15250000}
          targetAmount={targetAmount || 50000000}
          progressInfo={progressInfo}
        />

        {/* ── 3. QUICK ACTIONS — 4 in 1 row ─────── */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {/* + Tambah Transaksi */}
          <button
            type="button"
            id="quick-add-transaction"
            onClick={() => setIsAddTxOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform mb-2">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
              Tambah Transaksi
            </span>
          </button>

          {/* Atur Anggaran */}
          <Link
            href="/plan"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
              Atur Anggaran
            </span>
          </Link>

          {/* Target Tabungan */}
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-2">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
              Target Tabungan
            </span>
          </Link>

          {/* Laporan */}
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-2">
              <BarChart2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
              Laporan
            </span>
          </Link>
        </div>

        {/* ── 4. TWO SIDE-BY-SIDE STAT CARDS ─────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Saldo Awal */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Saldo Awal</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
              {formatCurrency(initialBalance || 10950000)}
            </p>
          </div>

          {/* Tabungan Bulanan */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Tabungan Bulanan</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
              {formatCurrency(monthlySavings || 3300000)}
            </p>
          </div>
        </div>

        {/* ── 5. MOTIVATIONAL BANNER ─────────────── */}
        <div className="rounded-2xl bg-[#ECFDF5] border border-emerald-100 p-4 flex items-start gap-3 shadow-xs">
          <span className="text-lg flex-shrink-0">🌱</span>
          <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
            Kamu sudah berjalan <strong className="font-bold">{formatPercentage(rawPercentage)}</strong> menuju target <strong className="font-bold">{formatCurrency(targetAmount)}</strong>. Tetap konsisten! 💪
          </p>
        </div>

      </div>

      {/* Modals */}
      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </AppLayout>
  );
}

