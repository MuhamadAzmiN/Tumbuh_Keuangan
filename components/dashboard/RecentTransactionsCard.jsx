'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Wallet, Car, Utensils, Briefcase, MoreHorizontal } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TRANSACTION_TYPES } from '@/lib/constants';
import { TransactionModal } from '../transactions/TransactionModal';

const TYPE_ICON_MAP = {
  salary: { bg: 'bg-blue-50', color: 'text-blue-600', icon: Wallet },
  freelance: { bg: 'bg-emerald-50', color: 'text-emerald-600', icon: Briefcase },
  saving: { bg: 'bg-slate-100', color: 'text-slate-600', icon: Wallet },
  other: { bg: 'bg-amber-50', color: 'text-amber-600', icon: MoreHorizontal },
};

export function RecentTransactionsCard({ transactions = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recentList = transactions.slice(0, 5);

  const getTypeLabel = (type) => {
    const found = TRANSACTION_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getIconConfig = (type) => TYPE_ICON_MAP[type] || TYPE_ICON_MAP.other;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Aktivitas terbaru</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Tambah</span>
          </button>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 p-1"
          >
            <span>Semua</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {recentList.length === 0 ? (
        <div className="py-10 px-5 text-center">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Belum ada transaksi</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Tambahkan transaksi pertama untuk mulai mencatat perjalananmu menuju{' '}
            {formatCurrency(50000000)}.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 pb-2">
          {recentList.map((tx) => {
            const cfg = getIconConfig(tx.type);
            const Icon = cfg.icon;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
              >
                {/* Icon */}
                <div className={`h-9 w-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>

                {/* Label & date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {getTypeLabel(tx.type)}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-slate-500 truncate">{tx.description}</p>
                  )}
                </div>

                {/* Amount */}
                <span className="text-sm font-bold text-emerald-600 tabular-nums flex-shrink-0">
                  +{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
