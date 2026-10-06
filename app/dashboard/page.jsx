'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimaryBalanceSection } from '@/components/dashboard/PrimaryBalanceSection';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { APP_CONFIG } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { getCurrentContractMonthKey } from '@/lib/calculations';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Target,
  Calendar,
  History,
  ArrowRight,
} from 'lucide-react';
import { TransactionModal } from '@/components/transactions/TransactionModal';

export default function DashboardPage() {
  const {
    user,
    profile,
    settings,
    loading,
    totalBalance,
    progressInfo,
    trajectory,
  } = useFinance();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const userName = profile?.name || user?.email?.split('@')[0] || 'Pengguna';
  const targetAmount = settings?.target_amount || APP_CONFIG.targetAmount;
  const initialBalance = settings?.initial_balance || APP_CONFIG.initialBalance;
  const currentBalance = totalBalance || 0;
  const rawPercentage = progressInfo?.rawPercentage || (currentBalance / targetAmount) * 100;

  // Active contract month calculations
  const currentMonthKey = useMemo(() => getCurrentContractMonthKey(), []);
  const currentMonthData = useMemo(() => {
    return trajectory?.find((item) => item.key === currentMonthKey) || trajectory?.[0] || null;
  }, [trajectory, currentMonthKey]);

  const currentMonthlyRemaining = currentMonthData?.monthStats?.remaining || 0;
  const currentMonthlyIsMet = currentMonthData?.monthStats?.isTargetMet || false;

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
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 animate-in pb-8">
        {/* ── 1. CLEAN GREETING HEADER ────────────── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Halo, {userName}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pantau progres tabungan & alokasi keuangan kamu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddTxOpen(true)}
            className="p-2.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer sm:hidden"
            title="Tambah Transaksi"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ── 2. PRIMARY SAVINGS CARD ──────────────── */}
        <PrimaryBalanceSection
          totalBalance={currentBalance}
          targetAmount={targetAmount}
          progressInfo={progressInfo}
        />

        {/* ── 3. CLEAN QUICK ACTIONS (4 Buttons) ───── */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* + Catat Transaksi */}
          <button
            type="button"
            id="quick-add-transaction"
            onClick={() => setIsAddTxOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5 shadow-2xs">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Catat Transaksi
            </span>
          </button>

          {/* Atur Anggaran */}
          <Link
            href="/plan"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5">
              <FileText className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Atur Anggaran
            </span>
          </Link>

          {/* Target Tabungan */}
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5">
              <Target className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Target 50 JT
            </span>
          </Link>

          {/* Riwayat Nabung */}
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5">
              <History className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Riwayat Nabung
            </span>
          </Link>
        </div>

        {/* ── 4. STATUS TABUNGAN BULAN INI ─────────── */}
        {currentMonthData && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Calendar className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Target Nabung Bulan Ini ({currentMonthData.fullLabel})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentMonthlyIsMet
                      ? 'Target nabung bulan ini sudah terpenuhi! 🎉'
                      : `Kurang ${formatCurrency(currentMonthlyRemaining)} lagi untuk target bulan ini`}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${
                  currentMonthlyIsMet
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {currentMonthlyIsMet ? '🟢 Terpenuhi' : `🟡 Kurang ${formatCurrency(currentMonthlyRemaining)}`}
              </span>
            </div>

            {/* Quick Grid per Income Source */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 block">Nabung Gaji</span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {formatCurrency(currentMonthData.monthStats?.salaryActual || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    / {formatCurrency(currentMonthData.monthStats?.salaryTarget || 0)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 block">Freelance</span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {formatCurrency(currentMonthData.monthStats?.freelanceActual || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    / {formatCurrency(currentMonthData.monthStats?.freelanceTarget || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </AppLayout>
  );
}

