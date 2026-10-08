'use client';

import React, { useMemo } from 'react';
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export function SmartInsightsWidget({ transactions = [], expenses = [] }) {
  // Simple logic to generate a dynamic insight based on recent data
  const insight = useMemo(() => {
    if (!transactions.length && !expenses.length) {
      return {
        type: 'neutral',
        icon: Sparkles,
        title: 'Spill Pengeluaran Lo Dong! 👀',
        message: 'Masih kosong nih bestie. Yuk catat pengeluaran lo hari ini biar gue bisa kasih insight ala-ala cenayang.',
        bg: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20',
        border: 'border-blue-100 dark:border-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    }

    // Combine all expenses
    const allExpenses = [];
    transactions.forEach(t => {
      if (t.amount < 0 || t.type === 'expense' || ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense'].includes(t.type)) {
        allExpenses.push({ ...t, normalizedDate: new Date(t.transaction_date), amt: Math.abs(t.amount) });
      }
    });
    expenses.forEach(e => {
      allExpenses.push({ ...e, normalizedDate: new Date(e.expense_date), amt: Math.abs(e.amount) });
    });

    // Calculate this week vs last week spending (simplified)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    
    // Find highest category this week
    const categoryTotals = {};

    allExpenses.forEach(exp => {
      if (exp.normalizedDate >= oneWeekAgo) {
        thisWeekTotal += exp.amt;
        const cat = exp.category || exp.type || 'lainnya';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amt;
      } else if (exp.normalizedDate >= twoWeeksAgo && exp.normalizedDate < oneWeekAgo) {
        lastWeekTotal += exp.amt;
      }
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    // Insight Logic
    if (thisWeekTotal > lastWeekTotal && lastWeekTotal > 0) {
      const diffPercent = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
      return {
        type: 'warning',
        icon: TrendingUp,
        title: 'Waduh, Agak Fomo Nih! 💸',
        message: `Pengeluaran lo minggu ini meroket ${diffPercent}% dari minggu kemaren cuy.${topCategory ? ` Ngerem dikit lah pengeluaran buat ${topCategory[0].replace(/_/g, ' ')}!` : ''}`,
        bg: 'from-rose-500/10 to-orange-500/10 dark:from-rose-900/20 dark:to-orange-900/20',
        border: 'border-rose-100 dark:border-rose-900/30',
        text: 'text-rose-700 dark:text-rose-300',
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    } else if (thisWeekTotal < lastWeekTotal && lastWeekTotal > 0) {
      return {
        type: 'success',
        icon: TrendingDown,
        title: 'Slay Banget! ✨',
        message: 'Lo berhasil ngerem pengeluaran minggu ini. Pertahanin terus gaya frugal living ini biar wishlist lo cepet kebeli!',
        bg: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
      };
    } else {
      // Default / Not enough historical data for comparison but has some data
      return {
        type: 'info',
        icon: Sparkles,
        title: 'Spill Dikit 🤖',
        message: topCategory 
          ? `Sejauh ini, lo paling boncos di urusan ${topCategory[0].replace(/_/g, ' ')}. Jangan sampe overbudget ygy!`
          : 'Rajin-rajin nyatet ya bestie, biar gue bisa kasih lu insight yang lebih valid.',
        bg: 'from-violet-500/10 to-fuchsia-500/10 dark:from-violet-900/20 dark:to-fuchsia-900/20',
        border: 'border-violet-100 dark:border-violet-900/30',
        text: 'text-violet-700 dark:text-violet-300',
        iconColor: 'text-violet-600 dark:text-violet-400'
      };
    }
  }, [transactions, expenses]);

  const Icon = insight.icon;

  return (
    <div className={`relative overflow-hidden rounded-[16px] border ${insight.border} bg-gradient-to-br ${insight.bg} p-4 shadow-2xs transition-all duration-300 hover:shadow-sm`}>
      {/* Decorative Blur Background Element */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex gap-3.5">
        <div className={`flex items-center justify-center h-10 w-10 rounded-2xl bg-white/60 dark:bg-slate-800/60 shadow-sm backdrop-blur-md flex-shrink-0 ${insight.iconColor}`}>
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-[13px] font-extrabold ${insight.text} tracking-tight`}>
              {insight.title}
            </h4>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${insight.bg.split(' ')[0].replace('from-', 'bg-').replace('/10', '').replace('/20', '')}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${insight.bg.split(' ')[0].replace('from-', 'bg-').replace('/10', '').replace('/20', '')}`} />
            </span>
          </div>
          <p className={`text-[11px] leading-[1.6] font-medium opacity-90 ${insight.text}`}>
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}
