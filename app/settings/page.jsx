'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Portal } from '@/components/ui/Portal';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { formatCurrency } from '@/lib/formatters';
import { APP_CONFIG } from '@/lib/constants';
import {
  User,
  Target,
  BarChart2,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Edit2,
  Check,
  Download,
  Wrench,
  ShieldCheck,
  Trash2,
  X,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Wallet,
  PiggyBank,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { TumbuhLogo } from '@/components/ui/Logo';

const FAQ_ITEMS = [
  {
    q: 'Bagaimana cara mengatur persentase gaji (Nabung vs Kebutuhan)?',
    a: 'Buka menu "Profil & Pengaturan Financial" di halaman ini. Kamu bisa memasukkan nominal gaji bulanan dan mengatur persentase alokasi untuk Nabung (misal: 50%) dan Kebutuhan (misal: 50%). Sistem akan otomatis menghitung nominal target nabung & batas anggaran kebutuhan per bulan.',
  },
  {
    q: 'Bagaimana jika pengeluaran harian melebihi anggaran bulanan?',
    a: 'Buka menu "Anggaran" (/plan) untuk melihat rincian pengeluaran per kategori (Makan, Transportasi, Hiburan, dll). Jika ada kategori yang melebihi batas (Over), kamu dapat menekan tombol edit limit untuk menyesuaikan atau menghemat di kategori lainnya.',
  },
  {
    q: 'Bagaimana cara mengubah target tabungan 50 juta?',
    a: 'Kamu dapat mengubah target nominal tabungan utama atau saldo awal melalui menu "Profil & Pengaturan Financial" di halaman ini atau melalui tombol edit target di menu Target & Impian.',
  },
  {
    q: 'Apakah data keuangan saya aman di browser ini?',
    a: 'Ya! Semua data tersimpan aman secara lokal di browser kamu (LocalStorage & Supabase Cache). Data tidak akan hilang saat kamu menutup browser.',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    profile,
    settings,
    updateUserProfile,
    updateSettings,
    updateBudget,
    updateCategoryBudgets,
    activeMonthKey,
    logout,
    exportData,
    loading,
  } = useFinance();
  const { showToast } = useToast();

  // Active Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [activeFaqIdx, setActiveFaqIdx] = useState(null);

  // Form state for profile modal
  const defaultUserName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Pengguna';
  const [nameInput, setNameInput] = useState(defaultUserName);
  const [initialBalanceInput, setInitialBalanceInput] = useState(settings?.initial_balance ?? 0);
  const [targetAmountInput, setTargetAmountInput] = useState(settings?.target_amount || APP_CONFIG.targetAmount);
  const [monthlySalaryInput, setMonthlySalaryInput] = useState(settings?.monthly_salary_target || APP_CONFIG.monthlySalaryTarget);
  const [savingsPctInput, setSavingsPctInput] = useState(settings?.savings_percentage ?? 50);
  const [needsPctInput, setNeedsPctInput] = useState(settings?.needs_percentage ?? 50);
  const [isSaving, setIsSaving] = useState(false);

  const userName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Pengguna';
  const userInitials = userName.slice(0, 2).toUpperCase();

  // Open Edit Profile Modal
  const handleOpenProfileModal = () => {
    setNameInput(userName);
    setInitialBalanceInput(settings?.initial_balance ?? 0);
    setTargetAmountInput(settings?.target_amount || APP_CONFIG.targetAmount);
    setMonthlySalaryInput(settings?.monthly_salary_target || APP_CONFIG.monthlySalaryTarget);
    const savPct = settings?.savings_percentage ?? 50;
    setSavingsPctInput(savPct);
    setNeedsPctInput(settings?.needs_percentage ?? (100 - savPct));
    setProfileModalOpen(true);
  };

  const handleSavingsPctChange = (val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setSavingsPctInput(num);
    setNeedsPctInput(100 - num);
  };

  const handleNeedsPctChange = (val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setNeedsPctInput(num);
    setSavingsPctInput(100 - num);
  };

  // Save Profile & Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSaving(true);
    try {
      const salaryNum = Number(monthlySalaryInput) || APP_CONFIG.monthlySalaryTarget;
      const needsPctNum = Number(needsPctInput) || 50;
      const newNeedsBudget = Math.round((salaryNum * needsPctNum) / 100);

      await updateUserProfile(nameInput.trim());
      await updateSettings({
        ...(settings || {}),
        initial_balance: Number(initialBalanceInput) || 0,
        target_amount: Number(targetAmountInput) || APP_CONFIG.targetAmount,
        monthly_salary_target: salaryNum,
        savings_percentage: Number(savingsPctInput) || 50,
        needs_percentage: needsPctNum,
      });

      if (activeMonthKey && updateBudget && updateCategoryBudgets) {
        await updateBudget(activeMonthKey, newNeedsBudget);
        await updateCategoryBudgets(activeMonthKey, {
          food: Math.round(newNeedsBudget * 0.4),
          transport: Math.round(newNeedsBudget * 0.2),
          shopping: Math.round(newNeedsBudget * 0.2),
          entertainment: Math.round(newNeedsBudget * 0.1),
          bills: Math.round(newNeedsBudget * 0.1),
          other_expense: 0,
        });
      }

      setProfileModalOpen(false);
      showToast('Profil & Alokasi Gaji berhasil diperbarui! ✨', 'success');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export Data Download
  const handleExportData = async () => {
    try {
      const data = await exportData();
      if (!data) {
        showToast('Tidak ada data untuk diekspor.', 'delete');
        return;
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `pencatatan_azmi_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('File cadangan data berhasil diunduh! 📁', 'success');
    } catch (err) {
      alert('Gagal mengekspor data: ' + err.message);
    }
  };

  // Reset Application Data
  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      showToast('Data lokal dibersihkan! Memuat ulang...', 'delete');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
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

  const userSalary = Number(settings?.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget;
  const userFreelance = Number(settings?.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget;
  const userTotalIncome = userSalary + userFreelance;
  const savingsPct = settings?.savings_percentage ?? 50;
  const needsPct = settings?.needs_percentage ?? (100 - savingsPct);
  const savingsAmount = Math.round((userSalary * savingsPct) / 100);
  const needsAmount = Math.round((userSalary * needsPct) / 100);

  const MENU_ITEMS = [
    {
      id: 'profile',
      label: 'Profil & Pengaturan Financial',
      sublabel: `Gaji: ${formatCurrency(userSalary)} • Alokasi ${savingsPct}% Nabung / ${needsPct}% Kebutuhan`,
      icon: User,
      action: handleOpenProfileModal,
      badge: null,
    },
    {
      id: 'goals',
      label: 'Tujuan & Milestone Keuangan',
      sublabel: 'Pantau progres tabungan 12 bulan',
      icon: Target,
      action: () => {
        showToast('Buka menu Target & Impian 🎯', 'info');
        router.push('/progress');
      },
      badge: null,
    },
    {
      id: 'budget',
      label: 'Pengaturan Anggaran Bulanan',
      sublabel: 'Kelola limit pengeluaran kebutuhan',
      icon: BarChart2,
      action: () => {
        showToast('Buka menu Anggaran Bulanan 📊', 'info');
        router.push('/plan');
      },
      badge: null,
    },
    {
      id: 'export',
      label: 'Ekspor & Cadangan Data',
      sublabel: 'Unduh file backup JSON transaksi kamu',
      icon: Download,
      action: handleExportData,
      badge: 'Siap',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'notifications',
      label: 'Notifikasi & Pengingat Gajian',
      sublabel: 'Pengingat otomatis gajian & tagihan',
      icon: Bell,
      action: () => setMaintenanceModalOpen(true),
      badge: 'Maintenance',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'help',
      label: 'Bantuan & FAQ Keuangan',
      sublabel: 'Panduan penggunaan & tips alokasi dana',
      icon: HelpCircle,
      action: () => setFaqModalOpen(true),
      badge: null,
    },
    {
      id: 'about',
      label: 'Tentang Aplikasi',
      sublabel: 'Versi v1.2.0 • Status Sistem Normal',
      icon: Info,
      action: () => setAboutModalOpen(true),
      badge: null,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 animate-in pb-8">
        {/* Top Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan & Profil
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola preferensi akun dan target keuangan kamu
          </p>
        </div>

        {/* User Profile Header Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Dark Blue Avatar Circle */}
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-lg shadow-md border border-white/20 flex-shrink-0">
              {userInitials}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                {userName}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Pencatatan Azmi • Road to 50JT</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="h-3 w-3 text-blue-600" />
                  <span>Saldo Awal: {formatCurrency(settings?.initial_balance ?? 0)}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenProfileModal}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border border-slate-100"
            title="Edit Profil & Target"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        {/* Financial Summary Info Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <TumbuhLogo className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">
                Konfigurasi Gaji & Alokasi Bulanan
              </p>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {formatCurrency(userSalary)}/bln
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Nabung ({savingsPct}%): <strong className="text-emerald-600">{formatCurrency(savingsAmount)}</strong> • Kebutuhan ({needsPct}%): <strong className="text-blue-600">{formatCurrency(needsAmount)}</strong>
            </p>
          </div>
        </div>

        {/* Menu Items Card List */}
        <div className="rounded-3xl border border-slate-100 bg-white divide-y divide-slate-100 shadow-xs overflow-hidden">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="p-2.5 rounded-2xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 transition-colors flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block truncate">
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset App Data Danger Zone Button */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-rose-500" />
            <div>
              <span className="text-xs font-bold text-rose-900 block">Reset Data Aplikasi</span>
              <span className="text-[11px] text-rose-600 font-medium block">Bersihkan cache & simpanan lokal</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-rose-600" />
            <span>Keluar dari Aplikasi</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 1. EDIT PROFILE & FINANCIAL SETTINGS MODAL (Portal)          */}
      {/* ════════════════════════════════════════════════════════════ */}
      {profileModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setProfileModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Edit Profil & Config Gaji</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengguna / Pemilik
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="Masukkan nama kamu..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Card Section: Config Gaji & Persentase Alokasi */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Config Gaji & Persentase Alokasi</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Atur nominal gaji & % alokasi (Nabung vs Kebutuhan)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gaji / Pendapatan Bulanan Utama (Rp)
                    </label>
                    <CurrencyInput
                      value={monthlySalaryInput}
                      onChange={(val) => setMonthlySalaryInput(val)}
                      placeholder="2.000.000"
                    />
                  </div>

                  {/* Preset Alokasi Buttons */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                      Pilihan Alokasi Cepat (% Nabung / % Kebutuhan):
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { sav: 50, need: 50, label: '50 / 50' },
                        { sav: 60, need: 40, label: '60 / 40' },
                        { sav: 70, need: 30, label: '70 / 30' },
                        { sav: 80, need: 20, label: '80 / 20' },
                      ].map((preset) => {
                        const isActive = savingsPctInput === preset.sav && needsPctInput === preset.need;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setSavingsPctInput(preset.sav);
                              setNeedsPctInput(preset.need);
                            }}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Sliders */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <PiggyBank className="h-3.5 w-3.5" /> Nabung ({savingsPctInput}%)
                        </span>
                        <span className="text-emerald-800 font-extrabold">
                          {formatCurrency(Math.round(((Number(monthlySalaryInput) || 0) * savingsPctInput) / 100))}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={savingsPctInput}
                        onChange={(e) => handleSavingsPctChange(e.target.value)}
                        className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-blue-700 flex items-center gap-1">
                          <ShoppingBag className="h-3.5 w-3.5" /> Kebutuhan ({needsPctInput}%)
                        </span>
                        <span className="text-blue-800 font-extrabold">
                          {formatCurrency(Math.round(((Number(monthlySalaryInput) || 0) * needsPctInput) / 100))}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={needsPctInput}
                        onChange={(e) => handleNeedsPctChange(e.target.value)}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Dynamic Summary Breakdown */}
                  <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-[11px] space-y-1 font-medium text-slate-600 shadow-2xs">
                    <div className="flex justify-between items-center text-slate-800 font-bold">
                      <span>Rincian Gaji Bulanan:</span>
                      <span className="text-blue-600 font-extrabold">{formatCurrency(Number(monthlySalaryInput) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>• Target Nabung ({savingsPctInput}%):</span>
                      <span className="font-bold">{formatCurrency(Math.round(((Number(monthlySalaryInput) || 0) * savingsPctInput) / 100))}/bln</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-700">
                      <span>• Limit Kebutuhan ({needsPctInput}%):</span>
                      <span className="font-bold">{formatCurrency(Math.round(((Number(monthlySalaryInput) || 0) * needsPctInput) / 100))}/bln</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Saldo Awal Tabungan (Rp)
                  </label>
                  <CurrencyInput
                    value={initialBalanceInput}
                    onChange={(val) => setInitialBalanceInput(val)}
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Saldo awal yang kamu miliki saat pertama kali memulai.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Utama Tabungan (Rp)
                  </label>
                  <CurrencyInput
                    value={targetAmountInput}
                    onChange={(val) => setTargetAmountInput(val)}
                    placeholder="50.000.000"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 pb-2 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Memproses...' : 'Simpan Profil & Config'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2. MAINTENANCE MODAL DRAWER (Portal)                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      {maintenanceModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMaintenanceModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 text-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <Wrench className="h-7 w-7 animate-bounce" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold mb-1.5">
                  🛠️ Sedang Dalam Pemeliharaan (Maintenance)
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Fitur Notifikasi & Pengingat
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                  Fitur Notifikasi Push Web dan Pengingat Otomatis tanggal gajian (setiap tgl 1 & 25) saat ini sedang dalam peningkatan performa.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 text-left space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Yang Sedang Disiapkan:</span>
                </div>
                <p className="text-[11px] text-slate-500">• Pengingat otomatis gajian (Rp 2 JT tgl 1)</p>
                <p className="text-[11px] text-slate-500">• Pengingat freelance (Rp 1.3 JT tgl 25)</p>
                <p className="text-[11px] text-slate-500">• Peringatan saat anggaran kategori hampir habis</p>
              </div>

              <button
                type="button"
                onClick={() => setMaintenanceModalOpen(false)}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Mengerti & Kembali
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 3. BANTUAN & FAQ MODAL DRAWER (Portal)                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      {faqModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setFaqModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Bantuan & FAQ Keuangan</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = activeFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-900 cursor-pointer"
                      >
                        <span className="pr-2">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60 animate-in fade-in duration-150">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Tutup FAQ
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 4. TENTANG APLIKASI MODAL DRAWER (Portal)                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      {aboutModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setAboutModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 text-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <TumbuhLogo className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">Pencatatan Keuangan Azmi</h3>
                <p className="text-xs text-blue-600 font-bold mt-0.5">Road to 50JT • Versi 1.2.0 (Stable)</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                  Aplikasi manajer keuangan pribadi yang dirancang khusus untuk memantau progres tabungan kontrak 12 bulan menuju target Rp 50.000.000.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Penyimpanan:</span>
                  <span className="font-bold text-slate-800">LocalStorage & Supabase</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Sistem:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Normal & Aktif
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 5. RESET DATA CONFIRMATION MODAL (Portal)                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      {resetModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setResetModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-sm rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 text-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Konfirmasi Reset Data</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  Apakah kamu yakin ingin membersihkan seluruh data lokal? Tindakan ini akan menghapus semua riwayat transaksi yang tersimpan di browser.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Ya, Reset Data
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </AppLayout>
  );
}
