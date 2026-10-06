'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrajectoryChart } from '@/components/progress/TrajectoryChart';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Portal } from '@/components/ui/Portal';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { APP_CONFIG } from '@/lib/constants';
import { getCurrentContractMonthKey } from '@/lib/calculations';
import {
  Target, Calendar, Trophy, Check, Lock, Play,
  Sparkles, Gift, History, Plus, X, TrendingUp, Award,
} from 'lucide-react';

const DEFAULT_WISHLISTS = [];
const TABS = [
  { id: 'milestone', label: 'Milestone' },
  { id: 'riwayat',   label: 'Riwayat'   },
  { id: 'wishlist',  label: 'Wishlist'  },
  { id: 'proyeksi',  label: 'Proyeksi'  },
];

function buildMilestones(initial, target) {
  const range = Math.max(1, target - initial);
  return [
    { title: 'Saldo Awal Start',       desc: 'Modal awal perjalanan tabungan',          amount: initial                             },
    { title: 'Fondasi Tabungan (25%)', desc: 'Mencapai 1/4 perjalanan target tabungan', amount: Math.round(initial + range * 0.25) },
    { title: 'Separuh Jalan (50%)',    desc: 'Titik tengah 50% target tabungan',        amount: Math.round(initial + range * 0.50) },
    { title: 'Zona Akhir (75%)',       desc: 'Mendekati garis finish target tabungan',  amount: Math.round(initial + range * 0.75) },
    { title: 'Puncak Target (100%)',   desc: 'Target tabungan utama berhasil diraih!',  amount: target                             },
  ];
}

export default function ProgressPage() {
  const { totalBalance, settings, progressInfo, trajectory, updateSettings, loading } = useFinance();
  const { showToast } = useToast();

  const [activeTab, setActiveTab]               = useState('milestone');
  const [editTargetOpen, setEditTargetOpen]     = useState(false);
  const [newTargetAmount, setNewTargetAmount]   = useState(settings?.target_amount || APP_CONFIG.targetAmount);
  const [isSaving, setIsSaving]                 = useState(false);
  const [wishlists, setWishlists]               = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem('road_to_50jt_wishlists'); if (s) return JSON.parse(s); } catch {}
    }
    return DEFAULT_WISHLISTS;
  });
  const [addWishlistOpen, setAddWishlistOpen]   = useState(false);
  const [wishlistName, setWishlistName]         = useState('');
  const [wishlistAmount, setWishlistAmount]     = useState(5000000);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    const open = editTargetOpen || addWishlistOpen || Boolean(selectedMilestone);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editTargetOpen, addWishlistOpen, selectedMilestone]);

  const targetAmount   = settings?.target_amount  || APP_CONFIG.targetAmount;
  const initialBalance = settings?.initial_balance || APP_CONFIG.initialBalance;
  const currentBalance = totalBalance || 10950000;
  const remaining      = Math.max(0, targetAmount - currentBalance);
  const rawPercentage  = progressInfo?.rawPercentage ?? (currentBalance / targetAmount) * 100;

  const currentMonthKey  = useMemo(() => getCurrentContractMonthKey(), []);
  const currentMonthData = useMemo(
    () => trajectory?.find((m) => m.key === currentMonthKey) || trajectory?.[0] || null,
    [trajectory, currentMonthKey]
  );

  const monthlyTarget   = currentMonthData?.monthStats?.totalTarget  || 3300000;
  const monthlyActual   = currentMonthData?.monthStats?.totalActual  || 0;
  const monthlyRem      = currentMonthData?.monthStats?.remaining    || 0;
  const monthlyIsMet    = currentMonthData?.monthStats?.isTargetMet  || false;
  const monthlyProgress = currentMonthData?.monthStats?.progress     || 0;

  const milestones    = useMemo(() => buildMilestones(Number(initialBalance) || 10950000, Number(targetAmount) || 50000000), [initialBalance, targetAmount]);
  const unlockedCount = milestones.filter((m) => currentBalance >= m.amount).length;

  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ ...(settings || {}), target_amount: Number(newTargetAmount) || APP_CONFIG.targetAmount });
      setEditTargetOpen(false);
      showToast('Target diperbarui!', 'success');
    } catch (err) { alert(err.message || 'Gagal menyimpan.'); }
    finally { setIsSaving(false); }
  };

  const handleAddWishlist = (e) => {
    e.preventDefault();
    if (!wishlistName.trim() || Number(wishlistAmount) <= 0) return;
    const g = { id: `w-${Date.now()}`, name: wishlistName.trim(), targetAmount: Number(wishlistAmount), icon: '🎁' };
    const u = [...wishlists, g];
    setWishlists(u);
    if (typeof window !== 'undefined') localStorage.setItem('road_to_50jt_wishlists', JSON.stringify(u));
    setWishlistName(''); setWishlistAmount(5000000); setAddWishlistOpen(false);
    showToast('Impian ditambahkan!', 'success');
  };

  const handleDeleteWishlist = (id) => {
    const u = wishlists.filter((w) => w.id !== id);
    setWishlists(u);
    if (typeof window !== 'undefined') localStorage.setItem('road_to_50jt_wishlists', JSON.stringify(u));
    showToast('Impian dihapus', 'delete');
  };

  if (loading) return (
    <AppLayout><div className="space-y-3 pt-1"><CardSkeleton /><CardSkeleton /></div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-3 pb-6">

        {/* 1. HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-[#172033] dark:text-slate-100 tracking-tight leading-tight">
              Target &amp; Impian
            </h2>
            <p className="text-[10.5px] text-[#64748B] dark:text-slate-400 font-normal mt-0.5">
              Pantau progres dan milestone tabungan
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setNewTargetAmount(targetAmount); setEditTargetOpen(true); }}
            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-100 px-2.5 py-1.5 text-[10.5px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Trophy className="h-3.5 w-3.5" />
            Edit Target
          </button>
        </div>

        {/* 2. MAIN TARGET SUMMARY CARD */}
        <div className="rounded-[16px] bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] p-4 text-white shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/10 px-2 py-0.5 text-[10px] font-semibold mb-1.5">
                <Target className="h-2.5 w-2.5 text-amber-300" />
                Target Utama 12 Bulan
              </span>
              <p className="text-[26px] font-bold tabular-nums leading-none tracking-tight">
                {formatCurrency(targetAmount)}
              </p>
              <p className="text-[10px] text-blue-100/80 mt-1">
                Oktober 2026 – September 2027
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 ml-3">
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[6px] rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00E5A3] transition-all duration-700"
                  style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums flex-shrink-0">
                {formatPercentage(rawPercentage)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
              <div>
                <span className="text-[10px] text-white/70 block">Terhimpun</span>
                <span className="text-[12px] font-bold tabular-nums block mt-0.5">{formatCurrency(currentBalance)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/70 block">Sisa</span>
                <span className="text-[12px] font-bold tabular-nums block mt-0.5">{formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MONTHLY SAVING TARGET CARD */}
        {currentMonthData && (
          <div className="rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[#FFF8E6] border border-[#FEEBC8] dark:border-slate-800/60 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-[#B7791F]" />
                </div>
                <div>
                  <h3 className="text-[12px] font-bold text-[#172033] dark:text-slate-100">Target Nabung Bulan Ini</h3>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">{currentMonthData.fullLabel}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold border ${monthlyIsMet ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${monthlyIsMet ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {monthlyIsMet ? 'Terpenuhi' : `Kurang ${formatCurrency(monthlyRem)}`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Gaji',      value: currentMonthData.monthStats?.salaryTarget    || 0 },
                { label: 'Freelance', value: currentMonthData.monthStats?.freelanceTarget || 0 },
                { label: 'Total',     value: monthlyTarget, hi: true },
              ].map(({ label, value, hi }) => (
                <div key={label} className={`rounded-xl p-2.5 ${hi ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50' : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60'}`}>
                  <span className={`text-[9.5px] font-semibold block mb-0.5 ${hi ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{label}</span>
                  <span className={`text-[11.5px] font-bold tabular-nums ${hi ? 'text-blue-700 dark:text-blue-300' : 'text-[#172033] dark:text-slate-100'}`}>{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Terkumpul: <strong className="text-[#172033] dark:text-slate-100 tabular-nums">{formatCurrency(monthlyActual)}</strong></span>
                <span>Target: <strong className="text-[#172033] dark:text-slate-100 tabular-nums">{formatCurrency(monthlyTarget)}</strong></span>
              </div>
              <div className="h-[6px] w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${monthlyIsMet ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB SWITCHER */}
        <div
          className="grid gap-1 p-1 rounded-xl bg-[#EAF0F7] dark:bg-[#1E293B]"
          style={{ gridTemplateColumns: `repeat(${TABS.length},1fr)` }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-[7px] px-1 rounded-[10px] text-[10.5px] font-semibold transition-all cursor-pointer truncate ${active ? 'bg-white dark:bg-[#0F172A] text-[#2563EB] dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                {tab.id === 'wishlist' ? `Wishlist (${wishlists.length})` : tab.label}
              </button>
            );
          })}
        </div>

        {/* 5A. MILESTONE TAB */}
        {activeTab === 'milestone' && (
          <div className="space-y-2.5">
            <div className="rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500" />
                    Milestone Target Tabungan
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Tahapan dari {formatCurrency(Number(initialBalance))} ke {formatCurrency(Number(targetAmount))}
                  </p>
                </div>
                <span className="text-[9.5px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  {unlockedCount} / {milestones.length} Terbuka
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[16px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
              <div className="space-y-2">
                {milestones.map((ms, idx) => {
                  const done = currentBalance >= ms.amount;
                  const next = !done && (idx === 0 || currentBalance >= milestones[idx - 1].amount);
                  let pct = 0;
                  if (next) {
                    const prev = idx > 0 ? milestones[idx - 1].amount : 0;
                    pct = Math.min(Math.max(Math.round(((currentBalance - prev) / (ms.amount - prev)) * 100), 0), 100);
                  }
                  return (
                    <div
                      key={ms.amount}
                      className="relative flex items-center gap-3 cursor-pointer group"
                      onClick={() => setSelectedMilestone({ ...ms, isCompleted: done, isNext: next, progressVal: pct, idx })}
                    >
                      <div className={`relative z-10 h-[34px] w-[34px] flex-shrink-0 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-105 ${done ? 'bg-emerald-500 border-emerald-500 text-white' : next ? 'bg-[#2563EB] border-[#2563EB] text-white ring-4 ring-blue-100 dark:ring-blue-900/50' : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800/60 text-slate-400'}`}>
                        {done ? <Check className="h-4 w-4 stroke-[2.5]" /> : next ? <Play className="h-3 w-3 fill-white translate-x-[1px]" /> : <Lock className="h-3 w-3 stroke-[2]" />}
                      </div>
                      <div className={`flex-1 rounded-[14px] border p-3 min-w-0 transition-all ${done ? 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0F172A]' : next ? 'border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 opacity-70'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[11.5px] font-semibold text-[#172033] dark:text-slate-100 block">{ms.title}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{ms.desc}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`text-[11px] font-bold tabular-nums block ${done ? 'text-emerald-700 dark:text-emerald-400' : next ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                              {formatCurrency(ms.amount)}
                            </span>
                            <span className={`text-[9.5px] font-semibold block mt-0.5 ${done ? 'text-emerald-600 dark:text-emerald-500' : next ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                              {done ? '✓ Terpenuhi' : next ? `⚡ ${pct}%` : '🔒 Terkunci'}
                            </span>
                          </div>
                        </div>
                        {next && (
                          <div className="mt-2 pt-2 border-t border-blue-100/80 dark:border-blue-800/50">
                            <div className="h-[5px] w-full rounded-full bg-blue-100 dark:bg-blue-900/40 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5B. RIWAYAT TAB */}
        {activeTab === 'riwayat' && (
          <div className="space-y-2.5">
            <div className="rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <h3 className="text-[13px] font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1.5">
                <History className="h-4 w-4 text-blue-500" />
                Riwayat Target Nabung 12 Bulan
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Rincian ketercapaian dan kekurangan nominal nabung.
              </p>
            </div>
            <div className="space-y-2">
              {trajectory?.map((m) => {
                const isCurrent = m.key === currentMonthKey;
                const isPast    = m.key <  currentMonthKey;
                const isFuture  = m.key >  currentMonthKey;
                const isMet     = m.monthStats?.isTargetMet;
                const remM      = m.monthStats?.remaining || 0;
                const salRem    = Math.max(0, (m.monthStats?.salaryTarget    || 0) - (m.monthStats?.salaryActual    || 0));
                const freRem    = Math.max(0, (m.monthStats?.freelanceTarget || 0) - (m.monthStats?.freelanceActual || 0));
                return (
                  <div key={m.key} className={`rounded-[14px] border p-3.5 space-y-2.5 ${isCurrent ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/20 ring-2 ring-blue-500/15 dark:ring-blue-500/30' : 'border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[#172033] dark:text-slate-100">{m.fullLabel}</span>
                        {isCurrent && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white">Bulan Ini</span>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-semibold border flex-shrink-0 ${isMet ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : isPast ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' : isCurrent ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-800/60'}`}>
                        {isMet ? '🟢 Terpenuhi' : isFuture ? '⚪ Belum' : `🟡 Kurang ${formatCurrency(remM)}`}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Terkumpul: <strong className="text-[#172033] dark:text-slate-100 tabular-nums">{formatCurrency(m.monthStats?.totalActual || 0)}</strong></span>
                        <span>Target: <strong className="text-[#172033] dark:text-slate-100 tabular-nums">{formatCurrency(m.monthStats?.totalTarget || 0)}</strong></span>
                      </div>
                      <div className="h-[5px] w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isMet ? 'bg-emerald-500' : isCurrent ? 'bg-amber-400' : isPast ? 'bg-rose-400' : 'bg-slate-300'}`}
                          style={{ width: `${Math.min(m.monthStats?.progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                    {!isFuture && !isMet && (
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 px-3 py-2 text-[10px] space-y-1">
                        <div className="flex justify-between font-bold text-amber-900 dark:text-amber-400">
                          <span>Sisa Kekurangan</span>
                          <span className="tabular-nums">{formatCurrency(remM)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/60 text-[9.5px]">
                          <span className="text-slate-600 dark:text-slate-300">Gaji: <strong className={salRem > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>{salRem > 0 ? `Kurang ${formatCurrency(salRem)}` : 'OK'}</strong></span>
                          <span className="text-slate-600 dark:text-slate-300">Freelance: <strong className={freRem > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>{freRem > 0 ? `Kurang ${formatCurrency(freRem)}` : 'OK'}</strong></span>
                        </div>
                      </div>
                    )}
                    {!isFuture && isMet && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-3 py-2 text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold">
                        Target nabung bulan ini terpenuhi
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5C. WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-2.5">
            <div className="rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[13px] font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-pink-500" />
                    Wishlist Impian Kamu
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Target tambahan di luar tabungan utama.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddWishlistOpen(true)}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1.5 text-[10.5px] font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer flex-shrink-0"
                >
                  <Plus className="h-3 w-3 stroke-[2.5]" />
                  Tambah
                </button>
              </div>
            </div>
            {wishlists.length === 0 ? (
              <div className="py-10 text-center rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A]">
                <Gift className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Belum ada wishlist</p>
                <p className="text-[10.5px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Tambah barang atau target keuangan yang ingin kamu capai.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {wishlists.map((w) => {
                  const pct = Math.min(Math.round((currentBalance / w.targetAmount) * 100), 100);
                  const hit = currentBalance >= w.targetAmount;
                  return (
                    <div key={w.id} className="rounded-[14px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">🎁</span>
                          <div className="min-w-0">
                            <span className="text-[12px] font-bold text-[#172033] dark:text-slate-100 block truncate">{w.name}</span>
                            <span className="text-[10px] text-slate-500">Target: {formatCurrency(w.targetAmount)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hit ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {hit ? 'Tercapai' : `${pct}%`}
                          </span>
                          <button type="button" onClick={() => handleDeleteWishlist(w.id)} className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer" title="Hapus">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-[5px] w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className={`h-full rounded-full ${hit ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-[9.5px] text-slate-400">
                          <span>Terkumpul: {formatCurrency(Math.min(currentBalance, w.targetAmount))}</span>
                          <span>Kurang: {formatCurrency(Math.max(0, w.targetAmount - currentBalance))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5D. PROYEKSI TAB */}
        {activeTab === 'proyeksi' && (
          <div className="space-y-2.5">
            <div className="rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <h3 className="text-[13px] font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Proyeksi Tabungan
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Estimasi saldo berdasarkan pola nabung saat ini</p>
            </div>
            <div className="rounded-[14px] bg-emerald-50 border border-emerald-100 px-3.5 py-3 flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11.5px] font-bold text-emerald-900">
                  Estimasi Tercapai: <span className="text-emerald-700">September 2027</span>
                </p>
                <p className="text-[10px] text-emerald-800 mt-0.5">
                  Dengan konsisten menabung Rp 3.300.000/bulan (Gaji Rp 2 JT + Freelance Rp 1,3 JT).
                </p>
              </div>
            </div>
            <TrajectoryChart trajectory={trajectory} />
            <div className="rounded-[14px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-2">
              <h4 className="text-[12px] font-bold text-[#172033] dark:text-slate-100 pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
                Rincian Perhitungan
              </h4>
              <div className="space-y-2 text-[11px]">
                {[
                  { label: 'Saldo Awal (Awal Kontrak)', value: formatCurrency(Number(initialBalance) || 10950000) },
                  { label: 'Target Tabungan Bulanan',   value: formatCurrency(3300000)  },
                  { label: 'Total Akumulasi 12 Bulan',  value: formatCurrency(39600000) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-0.5">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-[#172033] dark:text-slate-100 tabular-nums">{value}</span>
                  </div>
                ))}
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 flex justify-between mt-1">
                  <span className="text-[11px] font-bold text-blue-900">Estimasi Total Akhir</span>
                  <span className="text-[13px] font-bold text-blue-600 tabular-nums">{formatCurrency(targetAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MILESTONE DETAIL MODAL */}
      {selectedMilestone && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedMilestone(null)} />
            <div className="relative z-10 w-full sm:max-w-md rounded-t-[28px] sm:rounded-2xl bg-white dark:bg-[#0F172A] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 sm:hidden" />
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-white ${selectedMilestone.isCompleted ? 'bg-emerald-500' : selectedMilestone.isNext ? 'bg-blue-600' : 'bg-slate-400'}`}>
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{selectedMilestone.title}</h4>
                    <span className="text-[10.5px] text-slate-400">Target: {formatCurrency(selectedMilestone.amount)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedMilestone(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-3.5 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo Terkumpul</span>
                  <span className="font-bold tabular-nums">{formatCurrency(currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Milestone</span>
                  <span className="font-bold tabular-nums">{formatCurrency(selectedMilestone.amount)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500">Sisa</span>
                  <span className={`font-bold tabular-nums ${currentBalance >= selectedMilestone.amount ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {currentBalance >= selectedMilestone.amount ? 'Tercapai 100%' : formatCurrency(selectedMilestone.amount - currentBalance)}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-3 text-[11px] flex items-center gap-2 ${selectedMilestone.isCompleted ? 'bg-emerald-50 border border-emerald-100 text-emerald-900' : selectedMilestone.isNext ? 'bg-blue-50 border border-blue-100 text-blue-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                <Sparkles className={`h-4 w-4 flex-shrink-0 ${selectedMilestone.isCompleted ? 'text-emerald-600' : selectedMilestone.isNext ? 'text-blue-600' : 'text-slate-400'}`} />
                {selectedMilestone.isCompleted
                  ? 'Milestone ini telah berhasil kamu capai! 🎉'
                  : selectedMilestone.isNext
                  ? `Kumpulkan ${formatCurrency(selectedMilestone.amount - currentBalance)} lagi untuk membuka milestone ini.`
                  : 'Capai milestone sebelumnya terlebih dahulu.'}
              </div>
              <button type="button" onClick={() => setSelectedMilestone(null)} className="w-full rounded-xl bg-blue-600 py-3 text-[12px] font-bold text-white hover:bg-blue-700 cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* EDIT TARGET MODAL */}
      {editTargetOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditTargetOpen(false)} />
            <div className="relative z-10 w-full sm:max-w-md rounded-t-[28px] sm:rounded-2xl bg-white dark:bg-[#0F172A] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 sm:hidden" />
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Ubah Target Utama</h3>
                <button type="button" onClick={() => setEditTargetOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nominal Target Akhir (Rp)</label>
                <CurrencyInput value={newTargetAmount} onChange={(val) => setNewTargetAmount(val)} placeholder="50.000.000" />
              </div>
              <div className="flex gap-2 pt-1 pb-2 sm:pb-0">
                <button type="button" onClick={() => setEditTargetOpen(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800/60 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">Batal</button>
                <button type="button" disabled={isSaving} onClick={handleSaveTarget} className="flex-1 rounded-xl bg-blue-600 py-3 text-[11px] font-bold text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                  {isSaving ? 'Memproses...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ADD WISHLIST MODAL */}
      {addWishlistOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAddWishlistOpen(false)} />
            <div className="relative z-10 w-full sm:max-w-md rounded-t-[28px] sm:rounded-2xl bg-white dark:bg-[#0F172A] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 sm:hidden" />
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Tambah Impian Baru</h3>
                <button type="button" onClick={() => setAddWishlistOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAddWishlist} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Impian / Barang</label>
                  <input
                    type="text"
                    placeholder="Contoh: Laptop / HP / DP Motor"
                    value={wishlistName}
                    onChange={(e) => setWishlistName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800/60 px-3 py-2.5 text-[12px] font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Nominal (Rp)</label>
                  <CurrencyInput value={wishlistAmount} onChange={(val) => setWishlistAmount(val)} placeholder="Rp 0" required />
                </div>
                <div className="flex gap-2 pt-1 pb-2 sm:pb-0 border-t border-slate-100 dark:border-slate-800/60">
                  <button type="button" onClick={() => setAddWishlistOpen(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800/60 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 rounded-xl bg-blue-600 py-3 text-[11px] font-bold text-white hover:bg-blue-700 cursor-pointer">Simpan Impian</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </AppLayout>
  );
}
