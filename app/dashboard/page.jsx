'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimaryBalanceSection } from '@/components/dashboard/PrimaryBalanceSection';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { APP_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getCurrentContractMonthKey, calculateFinancialStatus } from '@/lib/calculations';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Target,
  BarChart2,
  Briefcase,
  ArrowRight,
  ChevronRight,
  Sun,
  History,
} from 'lucide-react';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export default function DashboardPage() {
  const {
    user,
    profile,
    settings,
    loading,
    totalBalance,
    progressInfo,
    trajectory,
    transactions,
  } = useFinance();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const userName = profile?.name || 'Muhammad Azmi Naziyulloh';
  const targetAmount = settings?.target_amount || APP_CONFIG.targetAmount;
  const currentBalance = totalBalance || 0;

  // Active contract month calculations
  const currentMonthKey = useMemo(() => getCurrentContractMonthKey(), []);
  const currentMonthData = useMemo(() => {
    return trajectory?.find((item) => item.key === currentMonthKey) || trajectory?.[0] || null;
  }, [trajectory, currentMonthKey]);

  const monthStats = currentMonthData?.monthStats || {
    salaryTarget: 2000000,
    freelanceTarget: 1300000,
    totalTarget: 3300000,
    salaryActual: 0,
    freelanceActual: 0,
    totalActual: 0,
  };

  const financialStatus = useMemo(() => {
    return calculateFinancialStatus(currentBalance, targetAmount, transactions, settings);
  }, [currentBalance, targetAmount, transactions, settings]);

  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  }, [transactions]);

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
      <div className="space-y-4 animate-in pb-6">
        {/* ── 1. GREETING HEADER ──────────────────────── */}
        <div className="space-y-1 pt-0.5 w-full">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF8E6] text-[#B7791F] border border-[#FEEBC8] dark:border-slate-800/60 text-[10px] font-medium shadow-2xs">
            <Sun className="h-3 w-3 fill-[#F6AD55] text-[#D69E2E]" />
            <span>Selamat Pagi</span>
          </div>

          {/* Heading */}
          <h2 className="text-[16px] sm:text-[17px] font-bold text-[#172033] dark:text-slate-100 tracking-tight flex items-center gap-1 mt-0.5">
            Halo, {userName} <span className="inline-block text-base">👋</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[10.5px] sm:text-[11px] text-[#64748B] dark:text-slate-400 font-normal leading-[16px] w-full">
            Setiap langkah kecil membawa kamu lebih dekat ke tujuan besar.
          </p>
        </div>

        {/* ── 2. PRIMARY SAVINGS CARD ────────────────── */}
        <PrimaryBalanceSection
          totalBalance={currentBalance}
          targetAmount={targetAmount}
          progressInfo={progressInfo}
          financialStatus={financialStatus}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
        />

        {/* ── 3. QUICK ACTIONS CARD CONTAINER ───────── */}
        <div className="w-full rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-3 shadow-2xs">
          <div className="grid grid-cols-4 gap-2">
            {/* + Tambah Transaksi */}
            <button
              type="button"
              id="quick-add-transaction"
              onClick={() => setIsAddTxOpen(true)}
              className="flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs mb-1.5">
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-[9.5px] font-semibold text-[#172033] dark:text-slate-100 text-center leading-tight">
                Tambah<br />Transaksi
              </span>
            </button>

            {/* Atur Anggaran */}
            <Link
              href="/plan"
              className="flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#E6F4EA] dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5">
                <FileText className="h-4.5 w-4.5 stroke-[2]" />
              </div>
              <span className="text-[9.5px] font-semibold text-[#172033] dark:text-slate-100 text-center leading-tight">
                Atur<br />Anggaran
              </span>
            </Link>

            {/* Target Tabungan */}
            <Link
              href="/progress"
              className="flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#FEF3C7] dark:bg-amber-950/30 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5">
                <Target className="h-4.5 w-4.5 stroke-[2]" />
              </div>
              <span className="text-[9.5px] font-semibold text-[#172033] dark:text-slate-100 text-center leading-tight">
                Target<br />Tabungan
              </span>
            </Link>

            {/* Lihat Progress */}
            <Link
              href="/progress"
              className="flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F3E8FF] dark:bg-purple-950/30 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-105 mb-1.5">
                <BarChart2 className="h-4.5 w-4.5 stroke-[2]" />
              </div>
              <span className="text-[9.5px] font-semibold text-[#172033] dark:text-slate-100 text-center leading-tight">
                Lihat<br />Progress
              </span>
            </Link>
          </div>
        </div>

        {/* ── 4. TARGET BULAN INI CARD ───────────────── */}
        <div className="w-full rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-3.5 shadow-2xs space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] sm:text-sm font-bold text-[#172033] dark:text-slate-100">
              Target Bulan Ini
            </h3>
            <Link
              href="/progress"
              className="text-[10px] sm:text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
            </Link>
          </div>

          {/* Income Items */}
          <div className="space-y-2.5">
            {/* Gaji */}
            <div className="flex items-center justify-between h-9">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-[#172033] dark:text-slate-100">Gaji</h4>
                  <p className="text-[11px] font-bold text-[#172033] dark:text-slate-100 tabular-nums">
                    {showBalance ? formatCurrency(monthStats.salaryTarget || 2000000) : '••••••••'}
                  </p>
                </div>
              </div>
            </div>

            {/* Freelance */}
            <div className="flex items-center justify-between h-9">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/30 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-4 w-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-[#172033] dark:text-slate-100">Freelance</h4>
                  <p className="text-[11px] font-bold text-[#172033] dark:text-slate-100 tabular-nums">
                    {showBalance ? formatCurrency(monthStats.freelanceTarget || 1300000) : '••••••••'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Box */}
          <div className="rounded-xl border border-blue-100/80 bg-[#EFF6FF] dark:bg-blue-950/30 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="text-[#2563EB]">
                <BarChart2 className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-[#172033] dark:text-slate-100">Total</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#2563EB] tabular-nums">
              {showBalance ? formatCurrency(monthStats.totalTarget || 3300000) : '••••••••'}
            </span>
          </div>
        </div>

        {/* ── 5. TRANSAKSI TERAKHIR ──────────────────── */}
        <div className="w-full rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] sm:text-sm font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1.5">
              <History className="h-4 w-4 text-blue-600" />
              Transaksi Terakhir
            </h3>
            <Link
              href="/dashboard/expenses"
              className="text-[10px] sm:text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5"
            >
              <span>Riwayat</span>
              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[11px] text-[#94A3B8] dark:text-slate-400">Belum ada transaksi bulan ini.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] dark:border-slate-800/60 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={tx.category} />
                    <div>
                      <h4 className="text-[11.5px] font-bold text-[#172033] dark:text-slate-100 leading-tight">
                        {tx.notes || tx.category}
                      </h4>
                      <p className="text-[9.5px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[12px] font-bold tabular-nums ${tx.type === 'income' ? 'text-[#00A86B]' : 'text-[#172033] dark:text-slate-100'}`}>
                    {tx.type === 'income' ? '+' : '-'}{showBalance ? formatCurrency(tx.amount) : '••••••••'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 6. KEBIASAAN MENABUNG BANNER ───────────── */}
        <div className="w-full rounded-[16px] border border-emerald-100 bg-[#E6F4EA] dark:bg-emerald-950/30 p-3 flex items-center justify-between shadow-2xs h-[64px]">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Sprout Icon */}
            <div className="h-8 w-8 rounded-xl bg-white dark:bg-[#0F172A] p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <img
                src="/sprout-3d.png"
                alt="Sprout"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#172033] dark:text-slate-100">
                Kebiasaan Menabung
              </h4>
              <p className="text-[9.5px] sm:text-[10px] text-[#64748B] dark:text-slate-400 font-normal leading-tight mt-0.5 truncate">
                Jangan lupa untuk konsisten menabung setiap bulan, ya!
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/progress"
            className="h-8 w-8 rounded-full bg-[#00A86B] hover:bg-[#00915C] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-2xs flex-shrink-0 ml-2"
            title="Lihat Target Tabungan"
          >
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </AppLayout>
  );
}


