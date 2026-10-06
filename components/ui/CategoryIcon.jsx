'use client';

import React from 'react';
import {
  Briefcase,
  Laptop,
  TrendingUp,
  CircleDollarSign,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Wifi,
  Wrench,
  HeartPulse,
  Users,
  Cigarette,
  Receipt,
  MoreHorizontal,
  DollarSign,
} from 'lucide-react';

const CATEGORY_CONFIG = {
  // Pemasukan
  salary: { icon: Briefcase, bg: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  freelance: { icon: Laptop, bg: 'bg-blue-100 text-blue-600 border-blue-200' },
  investment: { icon: TrendingUp, bg: 'bg-teal-100 text-teal-600 border-teal-200' },
  other_income: { icon: CircleDollarSign, bg: 'bg-indigo-100 text-indigo-600 border-indigo-200' },

  // Pengeluaran
  food: { icon: Utensils, bg: 'bg-amber-100 text-amber-600 border-amber-200' },
  transport: { icon: Car, bg: 'bg-sky-100 text-sky-600 border-sky-200' },
  shopping: { icon: ShoppingBag, bg: 'bg-rose-100 text-rose-600 border-rose-200' },
  entertainment: { icon: Film, bg: 'bg-purple-100 text-purple-600 border-purple-200' },
  bills: { icon: Wifi, bg: 'bg-violet-100 text-violet-600 border-violet-200' },
  other_expense: { icon: Wrench, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/60' },

  // Label Keys
  Gaji: { icon: Briefcase, bg: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  Freelance: { icon: Laptop, bg: 'bg-blue-100 text-blue-600 border-blue-200' },
  'Makan Siang': { icon: Utensils, bg: 'bg-amber-100 text-amber-600 border-amber-200' },
  'Makan & Minum': { icon: Utensils, bg: 'bg-amber-100 text-amber-600 border-amber-200' },
  Transportasi: { icon: Car, bg: 'bg-sky-100 text-sky-600 border-sky-200' },
  'Belanja Harian': { icon: ShoppingBag, bg: 'bg-rose-100 text-rose-600 border-rose-200' },
  Hiburan: { icon: Film, bg: 'bg-purple-100 text-purple-600 border-purple-200' },
  Internet: { icon: Wifi, bg: 'bg-violet-100 text-violet-600 border-violet-200' },
  Makanan: { icon: Utensils, bg: 'bg-amber-100 text-amber-600 border-amber-200' },
  Rokok: { icon: Cigarette, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/60' },
  Tagihan: { icon: Receipt, bg: 'bg-violet-100 text-violet-600 border-violet-200' },
  Belanja: { icon: ShoppingBag, bg: 'bg-rose-100 text-rose-600 border-rose-200' },
  Kesehatan: { icon: HeartPulse, bg: 'bg-red-100 text-red-600 border-red-200' },
  Keluarga: { icon: Users, bg: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  Lainnya: { icon: MoreHorizontal, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/60' },
};

export function CategoryIcon({ category, size = 'md', className = '' }) {
  const cfg = CATEGORY_CONFIG[category] || {
    icon: MoreHorizontal,
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/60',
  };
  const IconComponent = cfg.icon;

  const sizeClasses = {
    sm: 'h-7 w-7 rounded-lg p-1.5',
    md: 'h-9 w-9 rounded-xl p-2',
    lg: 'h-11 w-11 rounded-2xl p-2.5',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 border ${cfg.bg} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      <IconComponent className={`${iconSizes[size] || iconSizes.md} stroke-[2.2]`} />
    </div>
  );
}
