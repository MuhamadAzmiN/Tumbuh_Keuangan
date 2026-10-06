'use client';

import React, { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export function WeeklyChart({ transactions = [], expenses = [], showBalance = true }) {
  const chartData = useMemo(() => {
    const data = [];
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let total = 0;
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      
      const txExpense = transactions
        .filter(t => (t.amount < 0 || t.type === 'expense' || ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense'].includes(t.type)) && t.transaction_date && t.transaction_date.startsWith(dateStr))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
      const expExpense = expenses
        .filter(e => e.expense_date && e.expense_date.startsWith(dateStr))
        .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        
      const dayTotal = txExpense + expExpense;
        
      total += dayTotal;
      data.push({
        label: days[d.getDay()],
        val: dayTotal,
        isToday: i === 0,
      });
    }
    
    return { data, total };
  }, [transactions, expenses]);

  const hasData = chartData.total > 0;
  
  // Dummy data just for visual placeholder if empty so it doesn't look flat
  const displayData = hasData ? chartData.data : [
    { label: 'Sen', val: 20000, isToday: false },
    { label: 'Sel', val: 15000, isToday: false },
    { label: 'Rab', val: 40000, isToday: false },
    { label: 'Kam', val: 10000, isToday: false },
    { label: 'Jum', val: 50000, isToday: false },
    { label: 'Sab', val: 30000, isToday: false },
    { label: 'Min', val: 10000, isToday: true },
  ];

  const maxVal = Math.max(...displayData.map(d => d.val)) || 1;

  return (
    <div className="w-full rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-3.5 shadow-2xs space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[13px] sm:text-sm font-bold text-[#172033] dark:text-slate-100">
            Pengeluaran 7 Hari
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-[#64748B] dark:text-slate-400">Total:</span>
            <span className="text-[12px] font-bold text-[#172033] dark:text-slate-100 tabular-nums">
              {showBalance ? formatCurrency(chartData.total) : '••••••••'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-1">
          <TrendingDown className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500">
            Terjaga
          </span>
        </div>
      </div>

      <div className="h-28 flex items-end justify-between gap-1.5 pt-2 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-[1px] rounded-lg">
            <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400">Belum ada pengeluaran</span>
          </div>
        )}
        
        {displayData.map((item, idx) => {
          const heightPercent = Math.max((item.val / maxVal) * 100, 6); // min 6% height
          
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group relative h-full justify-end">
              <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-slate-800 dark:bg-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded transition-opacity pointer-events-none whitespace-nowrap z-20 hidden sm:block">
                {showBalance ? formatCurrency(item.val) : '•••'}
              </div>
              
              <div className="w-full relative h-full flex items-end justify-center rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800/50">
                <div
                  className={`w-full rounded-sm transition-all duration-700 ease-out ${
                    item.isToday 
                      ? (hasData ? 'bg-[#2563EB] dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-600') 
                      : (hasData ? 'bg-blue-200 dark:bg-blue-900/40' : 'bg-slate-200 dark:bg-slate-700/50')
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className={`text-[9px] ${item.isToday ? 'font-bold text-[#172033] dark:text-slate-200' : 'font-medium text-[#94A3B8] dark:text-slate-500'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
