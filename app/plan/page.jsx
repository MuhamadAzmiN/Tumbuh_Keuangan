'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { CONTRACT_MONTHS } from '@/lib/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Portal } from '@/components/ui/Portal';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  PieChart,
  Receipt,
  Plus,
  Trash2,
} from 'lucide-react';

const CATEGORY_DEFINITIONS = [
  {
    id: 'food',
    name: 'Makan & Minum',
    aliases: ['food', 'makanan', 'makan & minum', 'makan siang', 'kuliner'],
    defaultLimit: 400000,
    icon: 'food',
  },
  {
    id: 'transport',
    name: 'Transportasi',
    aliases: ['transport', 'transportasi', 'ojek', 'bensin', 'parkir'],
    defaultLimit: 200000,
    icon: 'transport',
  },
  {
    id: 'shopping',
    name: 'Belanja Harian',
    aliases: ['shopping', 'belanja', 'belanja harian', 'supermarket'],
    defaultLimit: 200000,
    icon: 'shopping',
  },
  {
    id: 'entertainment',
    name: 'Hiburan',
    aliases: ['entertainment', 'hiburan', 'nonton', 'game', 'rekreasi'],
    defaultLimit: 100000,
    icon: 'entertainment',
  },
  {
    id: 'bills',
    name: 'Tagihan & Internet',
    aliases: ['bills', 'tagihan', 'tagihan & internet', 'internet', 'pulsa', 'listrik'],
    defaultLimit: 100000,
    icon: 'bills',
  },
  {
    id: 'other_expense',
    name: 'Lainnya',
    aliases: ['other_expense', 'lainnya', 'kebutuhan kerja', 'keluarga', 'kesehatan', 'rokok'],
    defaultLimit: 0,
    icon: 'other_expense',
  },
];

function normalizeCategoryKey(rawKey = '', description = '') {
  const k = String(rawKey).toLowerCase().trim();
  const desc = String(description).toLowerCase().trim();

  for (const def of CATEGORY_DEFINITIONS) {
    if (def.aliases.some((alias) => k.includes(alias) || alias.includes(k))) {
      return def.id;
    }
  }

  // Secondary check on description
  for (const def of CATEGORY_DEFINITIONS) {
    if (def.aliases.some((alias) => desc.includes(alias))) {
      return def.id;
    }
  }

  return 'other_expense';
}

export default function PlanPage() {
  const {
    loading,
    transactions,
    expenses,
    monthlyBudgets,
    categoryBudgets,
    settings,
    updateBudget,
    updateCategoryBudgets,
    removeTransaction,
    removeExpense,
    activeMonthKey,
  } = useFinance();
  const { showToast } = useToast();

  // Selected Month state
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(() => {
    const idx = CONTRACT_MONTHS.findIndex((m) => m.key === activeMonthKey);
    return idx >= 0 ? idx : 0;
  });

  const selectedMonth = CONTRACT_MONTHS[selectedMonthIdx] || CONTRACT_MONTHS[0];
  const monthKey = selectedMonth.key;

  // UI States for Modals and Detail Accordions
  const [editingCategory, setEditingCategory] = useState(null); // Category item being edited
  const [editingCategoryAmount, setEditingCategoryAmount] = useState(0);
  const [editingTotalModal, setEditingTotalModal] = useState(false);
  const [editingTotalAmount, setEditingTotalAmount] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isAnyOpen = Boolean(editingCategory || editingTotalModal);
    if (isAnyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingCategory, editingTotalModal]);

  const handleDeleteItem = async (item) => {
    try {
      if (item.type === 'transaction') {
        await removeTransaction(item.rawId);
      } else {
        await removeExpense(item.rawId);
      }
      setDeletingRecordId(null);
      showToast('Pengeluaran berhasil dihapus', 'delete');
    } catch (err) {
      alert(err.message || 'Gagal menghapus item.');
    }
  };

  // Calculate default budget from user settings
  const defaultNeedsBudget = useMemo(() => {
    const salary = Number(settings?.monthly_salary_target) || 2000000;
    const needsPct = Number(settings?.needs_percentage ?? 50);
    return Math.round((salary * needsPct) / 100);
  }, [settings?.monthly_salary_target, settings?.needs_percentage]);

  const totalBudget = useMemo(() => {
    const custom = monthlyBudgets[monthKey];
    if (custom !== undefined && custom !== null && custom !== 2000000) {
      return custom;
    }
    return defaultNeedsBudget;
  }, [monthlyBudgets, monthKey, defaultNeedsBudget]);

  // Filter transactions and expenses for selected month
  const monthExpenseRecords = useMemo(() => {
    const records = [];

    // 1. From transactions array (where amount < 0 or expense type)
    (transactions || []).forEach((tx) => {
      if (tx.transaction_date && tx.transaction_date.startsWith(monthKey)) {
        const isExpense = tx.amount < 0 || tx.type?.includes('expense') || ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense'].includes(tx.type);
        if (isExpense) {
          const amt = Math.abs(Number(tx.amount)) || 0;
          if (amt > 0) {
            const catId = normalizeCategoryKey(tx.type, tx.description);
            records.push({
              id: `tx-${tx.id}`,
              rawId: tx.id,
              type: 'transaction',
              catId,
              amount: amt,
              description: tx.description || 'Transaksi pengeluaran',
              date: tx.transaction_date,
              source: 'Transaksi',
            });
          }
        }
      }
    });

    // 2. From expenses array
    (expenses || []).forEach((e) => {
      if (e.expense_date && e.expense_date.startsWith(monthKey)) {
        const amt = Number(e.amount) || 0;
        if (amt > 0) {
          const catId = normalizeCategoryKey(e.category, e.description);
          records.push({
            id: `exp-${e.id}`,
            rawId: e.id,
            type: 'expense',
            catId,
            amount: amt,
            description: e.description || e.category || 'Pengeluaran harian',
            date: e.expense_date,
            source: 'Catatan Pengeluaran',
          });
        }
      }
    });

    return records;
  }, [transactions, expenses, monthKey]);

  // Aggregate Category Data: limits, spent, percentages
  const categoriesData = useMemo(() => {
    const savedLimits = categoryBudgets[monthKey] || {};

    const getDynamicCategoryDefaultLimit = (catId, totalBgt) => {
      switch (catId) {
        case 'food': return Math.round(totalBgt * 0.4);
        case 'transport': return Math.round(totalBgt * 0.2);
        case 'shopping': return Math.round(totalBgt * 0.2);
        case 'entertainment': return Math.round(totalBgt * 0.1);
        case 'bills': return Math.round(totalBgt * 0.1);
        default: return 0;
      }
    };

    return CATEGORY_DEFINITIONS.map((def) => {
      const dynamicLimit = getDynamicCategoryDefaultLimit(def.id, totalBudget);
      const hasCustomUserLimit = savedLimits[def.id] !== undefined && savedLimits[def.id] !== def.defaultLimit;
      const limit = hasCustomUserLimit ? savedLimits[def.id] : dynamicLimit;
      const categoryRecords = monthExpenseRecords.filter((r) => r.catId === def.id);
      const spent = categoryRecords.reduce((acc, curr) => acc + curr.amount, 0);
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : spent > 0 ? 100 : 0;

      let status = 'AMAN';
      let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
      let progressColor = 'bg-blue-600';

      if (percent >= 100) {
        status = 'OVER';
        badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
        progressColor = 'bg-rose-600';
      } else if (percent >= 75) {
        status = 'WARNING';
        badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
        progressColor = 'bg-amber-500';
      }

      return {
        ...def,
        limit,
        spent,
        percent,
        status,
        badgeBg,
        progressColor,
        records: categoryRecords,
      };
    });
  }, [categoryBudgets, monthKey, monthExpenseRecords, totalBudget]);

  // Total Calculations
  const calculatedTotalCategoryLimit = useMemo(() => {
    return categoriesData.reduce((acc, cat) => acc + cat.limit, 0);
  }, [categoriesData]);

  const totalSpent = useMemo(() => {
    return categoriesData.reduce((acc, cat) => acc + cat.spent, 0);
  }, [categoriesData]);

  const remainingBudget = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedMonthIdx((prev) => Math.max(0, prev - 1));
    setExpandedCategory(null);
  };

  const handleNextMonth = () => {
    setSelectedMonthIdx((prev) => Math.min(CONTRACT_MONTHS.length - 1, prev + 1));
    setExpandedCategory(null);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat, e) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setEditingCategoryAmount(cat.limit);
  };

  // Save Category Limit
  const handleSaveCategoryLimit = async () => {
    if (!editingCategory) return;
    setIsSaving(true);
    try {
      const newLimits = {
        ...(categoryBudgets[monthKey] || {}),
        [editingCategory.id]: Number(editingCategoryAmount) || 0,
      };
      await updateCategoryBudgets(monthKey, newLimits);

      // Also update total monthly budget to keep synced
      const newTotal = CATEGORY_DEFINITIONS.reduce((acc, def) => {
        const lim = newLimits[def.id] !== undefined ? newLimits[def.id] : def.defaultLimit;
        return acc + lim;
      }, 0);
      await updateBudget(monthKey, newTotal);

      setEditingCategory(null);
      showToast('Limit anggaran kategori diperbarui! 📊', 'success');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan anggaran kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Total Budget Modal
  const handleOpenEditTotal = () => {
    setEditingTotalAmount(totalBudget);
    setEditingTotalModal(true);
  };

  // Save Total Budget (distributes proportionally to categories)
  const handleSaveTotalBudget = async () => {
    setIsSaving(true);
    try {
      const newTotal = Number(editingTotalAmount) || 0;
      await updateBudget(monthKey, newTotal);

      // Proportionally update category limits
      if (calculatedTotalCategoryLimit > 0) {
        const ratio = newTotal / calculatedTotalCategoryLimit;
        const newCatLimits = {};
        categoriesData.forEach((cat) => {
          newCatLimits[cat.id] = Math.round(cat.limit * ratio);
        });
        await updateCategoryBudgets(monthKey, newCatLimits);
      }

      setEditingTotalModal(false);
      showToast('Total anggaran bulanan diperbarui! 💰', 'success');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan total anggaran.');
    } finally {
      setIsSaving(false);
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

  return (
    <AppLayout>
      <div className="space-y-4 animate-in pb-8">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Anggaran Bulanan
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Alokasi dan batas pengeluaran bulan ini
            </p>
          </div>
          <div className="p-2 rounded-2xl bg-blue-50 text-blue-600">
            <PieChart className="h-5 w-5" />
          </div>
        </div>

        {/* Month Navigation: < Oktober 2026 > */}
        <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 p-2 shadow-xs">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={selectedMonthIdx === 0}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <span className="text-xs text-slate-400 font-medium block">Periode Anggaran</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {selectedMonth.label}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={selectedMonthIdx === CONTRACT_MONTHS.length - 1}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Card: Total Anggaran & Sisa */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1">
                Total Batas Anggaran
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(totalBudget)}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleOpenEditTotal}
              className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer border border-slate-100 dark:border-slate-800/60"
              title="Ubah Total Anggaran"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          {/* Breakdown Grid: Terpakai vs Sisa */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Total Pengeluaran</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Sisa Anggaran</span>
              <span
                className={`text-sm font-bold tabular-nums ${remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
              >
                {formatCurrency(remainingBudget)}
              </span>
            </div>
          </div>

          {/* Overall Month Budget Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Penggunaan Anggaran</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{overallPercent}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${totalSpent > totalBudget ? 'bg-rose-600' : 'bg-blue-600'
                  }`}
                style={{ width: `${Math.min(overallPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Budget Breakdown List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Anggaran Per Kategori
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {categoriesData.length} Kategori
            </span>
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-4 shadow-xs space-y-4">
            {categoriesData.map((cat) => {
              const isExpanded = expandedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-2.5 transition-all hover:border-slate-200 dark:border-slate-800/60"
                >
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      className="flex items-center gap-3 min-w-0 text-left flex-1 cursor-pointer"
                    >
                      <CategoryIcon category={cat.icon || cat.name} size="sm" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {cat.records.length} transaksi
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {formatCurrency(cat.spent)}
                          <span className="text-[11px] font-normal text-slate-400"> / {formatCurrency(cat.limit)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${cat.badgeBg}`}>
                            {cat.percent}%
                          </span>
                        </div>
                      </div>

                      {/* Edit Limit Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditCategory(cat, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Ubah Limit Kategori"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Expand Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${cat.progressColor}`}
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    />
                  </div>

                  {/* Expandable Transaction Breakdown */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                        <span>Rincian Pengeluaran</span>
                        <span>{cat.records.length} Item</span>
                      </div>

                      {cat.records.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center bg-white dark:bg-[#0F172A] rounded-lg border border-dashed border-slate-200 dark:border-slate-800/60">
                          Belum ada pengeluaran dicatat di kategori ini bulan ini.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {cat.records.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                  {item.description}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {formatDate(item.date)} • {item.source}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                  - {formatCurrency(item.amount)}
                                </span>

                                {deletingRecordId === item.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item)}
                                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                                    >
                                      Hapus
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingRecordId(null)}
                                      className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingRecordId(item.id)}
                                    title="Hapus Item Ini"
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Notification Banner at Bottom */}
        {remainingBudget >= 0 ? (
          <div className="rounded-2xl bg-[#ECFDF5] border border-emerald-100 p-4 flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-900 font-medium leading-snug">
              Masih ada <strong className="font-bold">{formatCurrency(remainingBudget)}</strong> dari total anggaran <strong className="font-bold">{formatCurrency(totalBudget)}</strong> untuk bulan ini. Tetap hemat!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <p className="text-xs text-rose-900 font-medium leading-snug">
              Pengeluaran bulan ini sudah melebihi anggaran sebesar <strong className="font-bold text-rose-700">{formatCurrency(Math.abs(remainingBudget))}</strong>! Periksa rincian kategori di atas.
            </p>
          </div>
        )}
      </div>

      {/* Edit Category Limit Modal (Mobile Bottom Sheet Drawer) */}
      {editingCategory && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setEditingCategory(null)}
            />
            <div className="relative z-10 w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-[#0F172A] p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              {/* Drag Handle Bar for mobile */}
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon category={editingCategory.icon || editingCategory.name} size="sm" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Batas {editingCategory.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Batas Anggaran Kategori
                </label>
                <CurrencyInput
                  value={editingCategoryAmount}
                  onChange={(val) => setEditingCategoryAmount(val)}
                  placeholder="Rp 0"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800/60 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCategoryLimit}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Memproses...' : 'Simpan Limit'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Total Budget Modal (Mobile Bottom Sheet Drawer) */}
      {editingTotalModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setEditingTotalModal(false)}
            />
            <div className="relative z-10 w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-[#0F172A] p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              {/* Drag Handle Bar for mobile */}
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ubah Total Anggaran Bulan Ini
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTotalModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nominal Total Anggaran
                </label>
                <CurrencyInput
                  value={editingTotalAmount}
                  onChange={(val) => setEditingTotalAmount(val)}
                  placeholder="Rp 0"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Nominal ini akan didistribusikan secara proporsional ke semua kategori anggaran.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setEditingTotalModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800/60 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveTotalBudget}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Memproses...' : 'Simpan Total'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </AppLayout>
  );
}
