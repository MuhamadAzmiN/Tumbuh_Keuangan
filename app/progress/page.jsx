'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MilestoneStepper } from '@/components/progress/MilestoneStepper';
import { TrajectoryChart } from '@/components/progress/TrajectoryChart';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Portal } from '@/components/ui/Portal';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { APP_CONFIG, CONTRACT_MONTHS } from '@/lib/constants';
import { getCurrentContractMonthKey } from '@/lib/calculations';
import {
  Target,
  Calendar,
  ArrowLeft,
  Edit2,
  Plus,
  Trophy,
  Sparkles,
  CheckCircle2,
  Flame,
  Award,
  Zap,
  Gift,
  X,
  Heart,
  ChevronRight,
  History,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_WISHLISTS = [];

const BADGES = [
  { id: 'b-1', minAmount: 10950000, title: 'Langkah Pertama', desc: 'Saldo awal Rp 10.95 JT', icon: '🚀', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { id: 'b-2', minAmount: 20000000, title: 'Quarter Master', desc: 'Tercapai Rp 20 JT', icon: '⚡', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { id: 'b-3', minAmount: 30000000, title: 'Halfway Hero', desc: 'Tercapai Rp 30 JT', icon: '🔥', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  { id: 'b-4', minAmount: 40000000, title: 'Final Countdown', desc: 'Tercapai Rp 40 JT', icon: '🌟', color: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  { id: 'b-5', minAmount: 50000000, title: 'Master Tabungan', desc: 'Target Rp 50 JT tercapai!', icon: '👑', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
];

export default function ProgressPage() {
  const { totalBalance, settings, progressInfo, trajectory, updateSettings, monthlyTargets, loading } = useFinance();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('target'); // 'target' | 'riwayat' | 'wishlist' | 'proyeksi'
  const [editingTargetModal, setEditingTargetModal] = useState(false);
  const [newTargetAmount, setNewTargetAmount] = useState(settings?.target_amount || APP_CONFIG.targetAmount);

  // Custom Wishlists state
  const [wishlists, setWishlists] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('road_to_50jt_wishlists');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_WISHLISTS;
  });

  const [addingWishlistModal, setAddingWishlistModal] = useState(false);
  const [wishlistName, setWishlistName] = useState('');
  const [wishlistAmount, setWishlistAmount] = useState(5000000);
  const [isSaving, setIsSaving] = useState(false);

  const targetAmount = settings?.target_amount || APP_CONFIG.targetAmount;
  const initialBalance = settings?.initial_balance || APP_CONFIG.initialBalance;
  const currentBalance = totalBalance || 10950000;
  const remaining = Math.max(0, targetAmount - currentBalance);
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

  // Save Main Target
  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        ...(settings || {}),
        target_amount: Number(newTargetAmount) || APP_CONFIG.targetAmount,
      });
      setEditingTargetModal(false);
      showToast('Target utama tabungan diperbarui! 🎯', 'success');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan target.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save New Wishlist Goal
  const handleAddWishlist = (e) => {
    e.preventDefault();
    if (!wishlistName.trim() || Number(wishlistAmount) <= 0) return;

    const newGoal = {
      id: `w-${Date.now()}`,
      name: wishlistName.trim(),
      targetAmount: Number(wishlistAmount),
      category: 'Impian',
      icon: '🎁',
    };

    const updated = [...wishlists, newGoal];
    setWishlists(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('road_to_50jt_wishlists', JSON.stringify(updated));
    }

    setWishlistName('');
    setWishlistAmount(5000000);
    setAddingWishlistModal(false);
    showToast('Impian baru berhasil ditambahkan! 🌟', 'success');
  };

  // Delete Wishlist Goal
  const handleDeleteWishlist = (id) => {
    const updated = wishlists.filter((w) => w.id !== id);
    setWishlists(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('road_to_50jt_wishlists', JSON.stringify(updated));
    }
    showToast('Impian dihapus', 'delete');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 pt-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 animate-in pb-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Target & Impian
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pantau progres dan milestone 50 juta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewTargetAmount(targetAmount);
              setEditingTargetModal(true);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer border border-slate-200/80 shadow-xs"
            title="Edit Target Utama"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        {/* Top Main Goal Hero Card */}
        <div className="rounded-3xl border border-blue-700 bg-blue-600 p-5 text-white shadow-md space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-blue-100 backdrop-blur-xs mb-1.5 border border-white/10">
                <Target className="h-3.5 w-3.5 text-amber-300" />
                <span>Target Utama 12 Bulan</span>
              </span>
              <h3 className="text-2xl font-extrabold text-white tabular-nums tracking-tight">
                {formatCurrency(targetAmount)}
              </h3>
              <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                Periode: Oktober 2026 – September 2027
              </p>
            </div>

            <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 flex-shrink-0">
              <Trophy className="h-6 w-6 stroke-[2.2]" />
            </div>
          </div>

          {/* Progress Bar & Subtext */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-blue-100">
              <span>Progres Capaian</span>
              <span className="text-amber-300 font-extrabold text-sm tabular-nums">{formatPercentage(rawPercentage)}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/20 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700 shadow-xs"
                style={{ width: `${Math.min(Math.max(rawPercentage, 0), 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 text-blue-100/90 font-medium">
              <span>Terkumpul: <strong className="font-bold text-white tabular-nums">{formatCurrency(currentBalance)}</strong></span>
              <span>Sisa: <strong className="font-bold text-amber-200 tabular-nums">{formatCurrency(remaining)}</strong></span>
            </div>
          </div>
        </div>

        {/* Current Month Savings Status Card */}
        {currentMonthData && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  currentMonthlyIsMet ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  <Calendar className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Target Nabung Bulan Ini ({currentMonthData.fullLabel})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentMonthlyIsMet
                      ? 'Selamat! Target nabung bulan ini sudah TERPENUHI! 🎉'
                      : `Bulan ini masih KURANG ${formatCurrency(currentMonthlyRemaining)} lagi untuk nabung.`}
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

            {/* Monthly Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Terkumpul: <strong className="text-slate-900 tabular-nums">{formatCurrency(currentMonthlyActual)}</strong></span>
                <span>Target: <strong className="text-slate-900 tabular-nums">{formatCurrency(currentMonthlyTarget)}</strong></span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentMonthlyIsMet ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(currentMonthData.monthStats?.progress || 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Shortfall Breakdown per Source */}
            <div className="grid grid-cols-2 gap-2 pt-1">
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
                {Math.max(0, (currentMonthData.monthStats?.salaryTarget || 0) - (currentMonthData.monthStats?.salaryActual || 0)) > 0 ? (
                  <span className="text-[10px] font-semibold text-amber-600 mt-1 block">
                    Kurang {formatCurrency(Math.max(0, (currentMonthData.monthStats?.salaryTarget || 0) - (currentMonthData.monthStats?.salaryActual || 0)))}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">✓ Terpenuhi</span>
                )}
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
                {Math.max(0, (currentMonthData.monthStats?.freelanceTarget || 0) - (currentMonthData.monthStats?.freelanceActual || 0)) > 0 ? (
                  <span className="text-[10px] font-semibold text-amber-600 mt-1 block">
                    Kurang {formatCurrency(Math.max(0, (currentMonthData.monthStats?.freelanceTarget || 0) - (currentMonthData.monthStats?.freelanceActual || 0)))}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">✓ Terpenuhi</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-slate-200/70 p-1 border border-slate-200 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'target'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Milestone
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`flex-1 min-w-[95px] py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'riwayat'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Nabung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 min-w-[85px] py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wishlist ({wishlists.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proyeksi')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'proyeksi'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Proyeksi
          </button>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 1: MILESTONE STEPPER & CHECKLIST     */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'target' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Milestone Stepper */}
            <MilestoneStepper currentBalance={currentBalance} />

            {/* Achievement Badges Rack */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Pencapaian & Lencana</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {BADGES.filter((b) => currentBalance >= b.minAmount).length} / {BADGES.length} Terbuka
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BADGES.map((badge) => {
                  const isUnlocked = currentBalance >= badge.minAmount;

                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isUnlocked
                          ? `${badge.color} shadow-xs`
                          : 'border-slate-100 bg-slate-50/50 opacity-40 grayscale'
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{badge.title}</span>
                        <span className="text-[10px] opacity-80 block truncate">{badge.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 2: RIWAYAT TARGET & KEKURANGAN BULANAN*/}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-1">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Riwayat Target Nabung 12 Bulan</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Rincian ketercapaian dan sisa kekurangan nominal yang perlu ditabung setiap bulan.
              </p>
            </div>

            <div className="space-y-3">
              {trajectory?.map((m) => {
                const isCurrent = m.key === currentMonthKey;
                const isPast = m.key < currentMonthKey;
                const isFuture = m.key > currentMonthKey;
                const isMet = m.monthStats?.isTargetMet;
                const remainingMonth = m.monthStats?.remaining || 0;
                const salaryRemaining = Math.max(0, (m.monthStats?.salaryTarget || 0) - (m.monthStats?.salaryActual || 0));
                const freelanceRemaining = Math.max(0, (m.monthStats?.freelanceTarget || 0) - (m.monthStats?.freelanceActual || 0));

                return (
                  <div
                    key={m.key}
                    className={`rounded-2xl border p-4 shadow-xs space-y-3 transition-all ${
                      isCurrent
                        ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">{m.fullLabel}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                            Bulan Ini
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${
                          isMet
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPast
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isCurrent
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {isMet
                          ? '🟢 Terpenuhi'
                          : isFuture
                          ? '⚪ Belum Dimulai'
                          : `🟡 Kurang ${formatCurrency(remainingMonth)}`}
                      </span>
                    </div>

                    {/* Progress Bar per month */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Terkumpul: <strong className="text-slate-900 tabular-nums">{formatCurrency(m.monthStats?.totalActual || 0)}</strong></span>
                        <span>Target: <strong className="text-slate-900 tabular-nums">{formatCurrency(m.monthStats?.totalTarget || 0)}</strong></span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isMet ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500' : isPast ? 'bg-rose-400' : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.min(m.monthStats?.progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Shortfall Breakdown Alert Box */}
                    {!isFuture && (
                      <div
                        className={`rounded-xl p-3 text-xs space-y-1.5 ${
                          isMet
                            ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-900'
                            : 'bg-amber-50/70 border border-amber-100 text-amber-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{isMet ? '✅ Target Nabung Terpenuhi' : '⚠️ Sisa Kekurangan Nabung:'}</span>
                          <span className="tabular-nums font-extrabold">
                            {isMet ? formatCurrency(m.monthStats?.totalActual || 0) : formatCurrency(remainingMonth)}
                          </span>
                        </div>

                        {!isMet && (
                          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-amber-200/60 text-[11px]">
                            <div>
                              <span className="text-slate-600 font-medium">Gaji: </span>
                              <strong className={salaryRemaining > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                                {salaryRemaining > 0 ? `Kurang ${formatCurrency(salaryRemaining)}` : 'Terpenuhi'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-600 font-medium">Freelance: </span>
                              <strong className={freelanceRemaining > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                                {freelanceRemaining > 0 ? `Kurang ${formatCurrency(freelanceRemaining)}` : 'Terpenuhi'}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 2: WISHLIST & CUSTOM GOALS           */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Wishlist Impian Kamu</h3>
                <p className="text-xs text-slate-400 font-medium">Target tabungan khusus & barang impian</p>
              </div>

              <button
                type="button"
                onClick={() => setAddingWishlistModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Tambah Impian</span>
              </button>
            </div>

            {/* List of Wishlists */}
            <div className="space-y-3">
              {wishlists.length === 0 ? (
                <div className="py-8 px-4 text-center bg-white rounded-2xl border border-slate-100">
                  <Gift className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Belum ada wishlist impian</p>
                  <p className="text-xs text-slate-400 mt-1">Tambah barang atau target keuangan spesifik yang ingin kamu capai.</p>
                </div>
              ) : (
                wishlists.map((w) => {
                  const pct = Math.min(Math.round((currentBalance / w.targetAmount) * 100), 100);
                  const isReached = currentBalance >= w.targetAmount;

                  return (
                    <div
                      key={w.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3 hover:border-slate-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-2xl bg-slate-100 flex-shrink-0">
                            {w.icon || '🎁'}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{w.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Target: {formatCurrency(w.targetAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isReached
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isReached ? 'Tercapai! 🎉' : `${pct}%`}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteWishlist(w.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Impian"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isReached ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>Terkumpul: {formatCurrency(Math.min(currentBalance, w.targetAmount))}</span>
                          <span>Kurang: {formatCurrency(Math.max(0, w.targetAmount - currentBalance))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 3: PROYEKSI TABUNGAN                 */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'proyeksi' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Teal/Green Info Box */}
            <div className="rounded-2xl bg-[#E6F4EA] border border-emerald-100 p-4 flex items-start gap-3 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-emerald-800 font-medium">
                  Estimasi Tercapai <strong className="font-bold text-emerald-950">September 2027</strong>
                </p>
                <p className="text-xs text-emerald-900 leading-relaxed font-normal">
                  Dengan konsisten menabung Rp 3.300.000/bulan (Gaji Rp 2 JT + Freelance Rp 1.3 JT), target 50 juta akan tercapai tepat waktu.
                </p>
              </div>
            </div>

            {/* Trajectory Line Chart */}
            <TrajectoryChart trajectory={trajectory} />

            {/* Rincian Perhitungan Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Rincian Perhitungan Target
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Saldo Awal (Awal Kontrak)</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(initialBalance || 10950000)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Target Tabungan Bulanan</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(3300000)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Total Akumulasi 12 Bulan</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(39600000)}
                  </span>
                </div>

                {/* Highlighted box */}
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex items-center justify-between mt-2">
                  <span className="font-bold text-blue-950">Estimasi Total Akhir</span>
                  <span className="font-extrabold text-blue-600 text-sm tabular-nums">
                    {formatCurrency(targetAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Target Amount Modal (Mobile Bottom Sheet Drawer) */}
      {editingTargetModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setEditingTargetModal(false)}
            />
            <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              {/* Drag Handle Bar for mobile */}
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Ubah Target Utama Tabungan</h3>
                <button
                  type="button"
                  onClick={() => setEditingTargetModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nominal Target Akhir (Rp)
                </label>
                <CurrencyInput
                  value={newTargetAmount}
                  onChange={(val) => setNewTargetAmount(val)}
                  placeholder="50.000.000"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setEditingTargetModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveTarget}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Memproses...' : 'Simpan Target'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Add Custom Wishlist Modal (Mobile Bottom Sheet Drawer) */}
      {addingWishlistModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setAddingWishlistModal(false)}
            />
            <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              {/* Drag Handle Bar for mobile */}
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Tambah Impian / Wishlist Baru</h3>
                <button
                  type="button"
                  onClick={() => setAddingWishlistModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddWishlist} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Impian / Barang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Beli Laptop / HP Baru / DP Motor"
                    value={wishlistName}
                    onChange={(e) => setWishlistName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Nominal (Rp)
                  </label>
                  <CurrencyInput
                    value={wishlistAmount}
                    onChange={(val) => setWishlistAmount(val)}
                    placeholder="Rp 0"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 pb-2 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setAddingWishlistModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Simpan Impian
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </AppLayout>
  );
}
