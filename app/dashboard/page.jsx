'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimaryBalanceSection } from '@/components/dashboard/PrimaryBalanceSection';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { APP_CONFIG, CONTRACT_MONTHS } from '@/lib/constants';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { getCurrentContractMonthKey } from '@/lib/calculations';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Target,
  BarChart2,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  History,
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
    currentMonthStats,
  } = useFinance();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const userName = profile?.name || user?.email?.split('@')[0] || 'Azmi';
  const targetAmount = settings?.target_amount || APP_CONFIG.targetAmount;
  const initialBalance = settings?.initial_balance || APP_CONFIG.initialBalance;
  const currentBalance = totalBalance || 10950000;
  const rawPercentage = progressInfo?.rawPercentage || (currentBalance / targetAmount) * 100;

  // Active contract month calculations
  const currentMonthKey = useMemo(() => getCurrentContractMonthKey(), []);
  const currentMonthData = useMemo(() => {
    return trajectory?.find((item) => item.key === currentMonthKey) || trajectory?.[0] || null;
  }, [trajectory, currentMonthKey]);

  const currentMonthlyTarget = currentMonthData?.monthStats?.totalTarget || 3300000;
  const currentMonthlyActual = currentMonthData?.monthStats?.totalActual || 0;
  const currentMonthlyRemaining = currentMonthData?.monthStats?.remaining || 0;
  const currentMonthlyIsMet = currentMonthData?.monthStats?.isTargetMet || false;

  // Dynamic Time-of-Day Greeting
  const greetingInfo = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      return { label: 'Selamat Pagi', icon: '☀️', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (hour >= 11 && hour < 15) {
      return { label: 'Selamat Siang', icon: '🌤️', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
    if (hour >= 15 && hour < 18) {
      return { label: 'Selamat Sore', icon: '🌆', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    }
    return { label: 'Selamat Malam', icon: '🌙', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  }, []);

  // Gamified Sprout Growth Stage
  const growthStage = useMemo(() => {
    const pct = rawPercentage;
    if (pct >= 100) return { title: '👑 Puncak Impian!', desc: 'Target 50 JT berhasil diraih! Selamat!', icon: '🎉' };
    if (pct >= 75) return { title: '🍎 Pohon Berbuah (75%)', desc: 'Sebentar lagi panen 50 juta! Tetap semangat!', icon: '🍎' };
    if (pct >= 50) return { title: '🌳 Pohon Rindang (50%)', desc: 'Sudah separuh jalan! Kamu luar biasa!', icon: '🌳' };
    if (pct >= 25) return { title: '🌿 Tunas Hijau (25%)', desc: 'Terus sirami tabunganmu setiap bulan!', icon: '🌿' };
    return { title: '🌱 Kecambah Kecil', desc: 'Langkah awal yang hebat! Semakin hari semakin tumbuh.', icon: '🌱' };
  }, [rawPercentage]);

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
        {/* ── 1. CUTE GREETING HEADER ─────────────── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-1 backdrop-blur-xs shadow-2xs ${greetingInfo.bg}">
              <span>{greetingInfo.icon}</span>
              <span>{greetingInfo.label}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Halo, {userName} <span className="inline-block animate-bounce">👋</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Setiap langkah kecil membawamu lebih dekat ke 50 juta! 🌱
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddTxOpen(true)}
            className="p-2.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-transform active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer sm:hidden"
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

        {/* ── 3. CUTE PASTEL QUICK ACTIONS (4 Buttons) ── */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* + Tambah Transaksi */}
          <button
            type="button"
            id="quick-add-transaction"
            onClick={() => setIsAddTxOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group active:scale-95"
          >
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all mb-1.5 shadow-2xs">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Catat Transaksi
            </span>
          </button>

          {/* Atur Anggaran */}
          <Link
            href="/plan"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group active:scale-95"
          >
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all mb-1.5 shadow-2xs">
              <FileText className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Atur Anggaran
            </span>
          </Link>

          {/* Target Tabungan */}
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group active:scale-95"
          >
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all mb-1.5 shadow-2xs">
              <Target className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Target 50 JT
            </span>
          </Link>

          {/* Riwayat Nabung */}
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group active:scale-95"
          >
            <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all mb-1.5 shadow-2xs">
              <History className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Riwayat Nabung
            </span>
          </Link>
        </div>

        {/* ── 4. STATUS TABUNGAN BULAN INI (CURRENT MONTH SHORTFALL) ── */}
        {currentMonthData && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  currentMonthlyIsMet ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  <Calendar className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Status Nabung ({currentMonthData.fullLabel})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentMonthlyIsMet
                      ? 'Selamat! Target nabung bulan ini TERPENUHI! 🎉'
                      : `Kurang ${formatCurrency(currentMonthlyRemaining)} lagi untuk target bulan ini`}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${
                currentMonthlyIsMet
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
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

        {/* ── 5. GAMIFIED SPROUT GROWTH BANNER ─────── */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-200/80 p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-white shadow-2xs border border-emerald-100 flex-shrink-0">
              {growthStage.icon}
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1">
                <span>{growthStage.title}</span>
              </h4>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5 leading-relaxed">
                {growthStage.desc}
              </p>
            </div>
          </div>

          <Link
            href="/progress"
            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
            title="Lihat Progres Complete"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </AppLayout>
  );
}

