'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExpenseSummaryCards } from '@/components/expenses/ExpenseSummaryCards';
import { BudgetWidget } from '@/components/expenses/BudgetWidget';
import { CategoryBreakdown } from '@/components/expenses/CategoryBreakdown';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { CONTRACT_MONTHS } from '@/lib/constants';
import { calculateMonthlyExpenseStats } from '@/lib/calculations';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ExpensesPage() {
  const {
    expenses,
    monthlyBudgets,
    activeMonthKey,
    settings,
    loading,
  } = useFinance();

  // Selected month state (defaults to active contract month e.g. '2026-10')
  const [selectedMonthKey, setSelectedMonthKey] = useState(activeMonthKey || '2026-10');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentMonthIdx = CONTRACT_MONTHS.findIndex((m) => m.key === selectedMonthKey);
  const currentMonthInfo = CONTRACT_MONTHS[currentMonthIdx] || CONTRACT_MONTHS[0];

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      setSelectedMonthKey(CONTRACT_MONTHS[currentMonthIdx - 1].key);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < CONTRACT_MONTHS.length - 1) {
      setSelectedMonthKey(CONTRACT_MONTHS[currentMonthIdx + 1].key);
    }
  };

  const handleToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Calculate default budget from settings (% Kebutuhan of Gaji)
  const defaultNeedsBudget = useMemo(() => {
    const salary = Number(settings?.monthly_salary_target) || 2000000;
    const needsPct = Number(settings?.needs_percentage ?? 50);
    return Math.round((salary * needsPct) / 100);
  }, [settings?.monthly_salary_target, settings?.needs_percentage]);

  // Calculate expense statistics for currently selected month
  const currentBudget = useMemo(() => {
    const custom = monthlyBudgets[selectedMonthKey];
    if (custom !== undefined && custom !== null && custom !== 2000000) {
      return custom;
    }
    return defaultNeedsBudget;
  }, [monthlyBudgets, selectedMonthKey, defaultNeedsBudget]);
  const expenseStats = useMemo(() => {
    return calculateMonthlyExpenseStats(selectedMonthKey, expenses, currentBudget);
  }, [selectedMonthKey, expenses, currentBudget]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header & Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Pengeluaran
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pantau ke mana uang kamu digunakan setiap bulan.
            </p>
          </div>

          {/* Month Selector: < Oktober 2026 > */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx <= 0}
              aria-label="Bulan Sebelumnya"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 px-2 py-1 focus:outline-none cursor-pointer"
            >
              {CONTRACT_MONTHS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx >= CONTRACT_MONTHS.length - 1}
              aria-label="Bulan Berikutnya"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 1. Monthly Summary Cards (Total, Count, Largest, Daily Avg) */}
        <ExpenseSummaryCards expenseStats={expenseStats} />

        {/* 2. Monthly Budget Widget */}
        <BudgetWidget
          expenseStats={expenseStats}
          monthKey={selectedMonthKey}
          monthLabel={currentMonthInfo.label}
        />

        {/* 3. Category Breakdown */}
        {expenseStats.categoryBreakdown.length > 0 && (
          <CategoryBreakdown
            categoryBreakdown={expenseStats.categoryBreakdown}
            totalExpense={expenseStats.totalExpense}
          />
        )}

        {/* 4. Filterable Expense List */}
        <ExpenseList
          expenses={expenses}
          monthKey={selectedMonthKey}
          onOpenAdd={() => setIsAddModalOpen(true)}
          onToastMessage={handleToast}
        />

        {/* Add Expense Modal */}
        <ExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          defaultDate={`${selectedMonthKey}-01`}
          onSuccess={handleToast}
        />
      </div>
    </AppLayout>
  );
}
