'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

const COLORS = [
  '#bbf7d0', // pastel green
  '#fbcfe8', // pastel pink
  '#fef08a', // pastel yellow
  '#bfdbfe', // pastel blue
  '#e9d5ff', // pastel purple
  '#fed7aa', // pastel orange
  '#fecdd3', // pastel rose
];

export function AnalyticsChart({ transactions = [], expenses = [], showBalance = true }) {
  const [activeTab, setActiveTab] = useState('expense'); // 'income' | 'expense'

  const chartData = useMemo(() => {
    const dataMap = {};
    let total = 0;

    if (activeTab === 'expense') {
      // Gather expenses from transactions
      transactions.forEach(t => {
        if (t.amount < 0 || t.type === 'expense' || ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense'].includes(t.type)) {
          const cat = t.category || t.type || 'Lainnya';
          const amt = Math.abs(t.amount);
          dataMap[cat] = (dataMap[cat] || 0) + amt;
          total += amt;
        }
      });
      // Gather expenses from expenses table
      expenses.forEach(e => {
        const cat = e.category || 'Lainnya';
        const amt = Math.abs(e.amount);
        dataMap[cat] = (dataMap[cat] || 0) + amt;
        total += amt;
      });
    } else {
      // Gather income from transactions
      transactions.forEach(t => {
        if (t.amount > 0 && t.type !== 'expense' && !['food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense'].includes(t.type)) {
          const cat = t.category || t.type || 'Lainnya';
          const amt = Math.abs(t.amount);
          dataMap[cat] = (dataMap[cat] || 0) + amt;
          total += amt;
        }
      });
    }

    const data = Object.keys(dataMap).map(key => ({
      name: key,
      value: dataMap[key]
    })).sort((a, b) => b.value - a.value);

    // Calculate percentages
    const dataWithPercent = data.map(item => ({
      ...item,
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0
    }));

    return { data: dataWithPercent, total };
  }, [transactions, expenses, activeTab]);

  const hasData = chartData.total > 0;

  // Placeholder data if no data exists
  const displayData = hasData ? chartData.data : [
    { name: 'Food & Beverage', value: 43, percent: 43 },
    { name: 'Shopping', value: 23, percent: 23 },
    { name: 'Fitness', value: 12, percent: 12 },
    { name: 'Other', value: 9, percent: 9 },
    { name: 'Transport', value: 6, percent: 6 },
    { name: 'Bills', value: 7, percent: 7 },
  ];
  
  const displayTotal = hasData ? chartData.total : 5825591.50;

  return (
    <div className="w-full rounded-[16px] border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-4 shadow-2xs space-y-4">
      {/* Toggle */}
      <div className="flex bg-[#F1F5F9] dark:bg-slate-800 rounded-xl p-1 relative">
        <div 
          className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-[#0F172A] rounded-lg shadow-sm transition-all duration-300 ease-out ${
            activeTab === 'income' ? 'left-1' : 'left-[calc(50%+2px)]'
          }`}
        />
        <button
          className={`flex-1 py-1.5 text-[11px] font-semibold relative z-10 transition-colors ${
            activeTab === 'income' ? 'text-[#172033] dark:text-slate-100' : 'text-[#64748B] dark:text-slate-400'
          }`}
          onClick={() => setActiveTab('income')}
        >
          Pemasukan
        </button>
        <button
          className={`flex-1 py-1.5 text-[11px] font-semibold relative z-10 transition-colors ${
            activeTab === 'expense' ? 'text-[#172033] dark:text-slate-100' : 'text-[#64748B] dark:text-slate-400'
          }`}
          onClick={() => setActiveTab('expense')}
        >
          Pengeluaran
        </button>
      </div>

      {/* Chart */}
      <div className="relative h-[220px] w-full flex items-center justify-center">
        {!hasData && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-[1px] rounded-full">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">Belum ada data</span>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-[#64748B] dark:text-slate-400">
            Total {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}
          </span>
          <span className="text-[14px] font-bold text-[#172033] dark:text-slate-100 mt-0.5">
            {showBalance ? formatCurrency(displayTotal) : '••••••••'}
          </span>
        </div>
      </div>

      {/* Legend / List */}
      <div className="space-y-2 pt-2">
        {displayData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-[#172033] dark:text-slate-200 capitalize">
                {item.name.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-[#64748B] dark:text-slate-400 font-semibold">
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
