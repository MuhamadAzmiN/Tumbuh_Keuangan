'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

const EXPENSE_CATEGORIES = [
  'food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense',
  'makanan', 'transportasi', 'rokok', 'tagihan', 'belanja', 'hiburan', 'kesehatan', 'keluarga', 'kebutuhan kerja', 'lainnya'
];

export default function TransactionsPage() {
  const { transactions, expenses, loading, removeTransaction, removeExpense } = useFinance();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'

  // Combine both transactions & expenses into one unified normalized list
  const combinedAllTransactions = useMemo(() => {
    const list = [];

    // 1. Map transactions array
    (transactions || []).forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const typeStr = String(tx.type || '').toLowerCase();
      const isExpenseCat = EXPENSE_CATEGORIES.includes(typeStr);
      const isExpense = amt < 0 || isExpenseCat;

      list.push({
        id: tx.id,
        rawId: tx.id,
        sourceType: 'transaction',
        description: tx.description || (isExpense ? 'Pengeluaran' : 'Pemasukan'),
        amount: isExpense ? -Math.abs(amt) : Math.abs(amt),
        transaction_date: tx.transaction_date || '2026-10-10',
        type: tx.type || (isExpense ? 'food' : 'salary'),
        isExpense,
      });
    });

    // 2. Map expenses array
    (expenses || []).forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      const expId = `exp-${exp.id}`;
      if (!list.some((t) => t.id === expId || t.rawId === exp.id)) {
        list.push({
          id: expId,
          rawId: exp.id,
          sourceType: 'expense',
          description: exp.description || exp.category || 'Pengeluaran',
          amount: -Math.abs(amt),
          transaction_date: exp.expense_date || '2026-10-10',
          type: exp.category || 'other_expense',
          isExpense: true,
        });
      }
    });

    // Sort newest date first
    return list.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transactions, expenses]);

  // Filtered list based on Search & Filter Tabs
  const displayList = useMemo(() => {
    return combinedAllTransactions.filter((tx) => {
      if (filterType === 'income' && tx.isExpense) return false;
      if (filterType === 'expense' && !tx.isExpense) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const amtMatch = String(Math.abs(tx.amount)).includes(q);
        if (!descMatch && !amtMatch) return false;
      }

      return true;
    });
  }, [combinedAllTransactions, filterType, searchQuery]);

  const handleDelete = async (txItem) => {
    setIsDeleting(true);
    try {
      if (String(txItem.id).startsWith('mock-')) {
        setDeleteConfirmId(null);
        showToast('Transaksi dihapus!', 'delete');
        return;
      }
      if (txItem.sourceType === 'expense') {
        await removeExpense(txItem.rawId);
      } else {
        await removeTransaction(txItem.rawId || txItem.id);
      }
      setDeleteConfirmId(null);
      showToast('Transaksi berhasil dihapus!', 'delete');
    } catch (err) {
      alert(err.message || 'Gagal menghapus transaksi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
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
      <div className="space-y-4 animate-in pb-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Transaksi
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
          />
        </div>

        {/* Filter Pills: [ Semua | Pemasukan | Pengeluaran ] */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'income'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'expense'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* Group Date Header */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-500 mb-2">Oktober 2026</h3>

          {/* List of items */}
          <div className="rounded-2xl border border-slate-100 bg-white divide-y divide-slate-100 shadow-xs overflow-hidden">
            {displayList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Tidak ada transaksi ditemukan
              </div>
            ) : (
              displayList.map((tx) => {
                const amt = Math.abs(Number(tx.amount) || 0);
                const isPositive = !tx.isExpense;
                const formattedAmt = isPositive ? `+${formatCurrency(amt)}` : `-${formatCurrency(amt)}`;

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon category={tx.type || tx.description} size="md" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {tx.description || 'Transaksi'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {formatDate(tx.transaction_date || '2026-10-10')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className={`text-xs font-bold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {formattedAmt}
                      </span>

                      {/* Action buttons: Edit & Delete */}
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tx)}
                          title="Ubah Transaksi"
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {deleteConfirmId === tx.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1">
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(tx)}
                              className="text-[10px] font-bold text-rose-600 px-1 hover:underline disabled:opacity-50 cursor-pointer"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] text-slate-500 px-1 hover:underline cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(tx.id)}
                            title="Hapus Transaksi"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        transactionToEdit={editingTransaction}
      />
    </AppLayout>
  );
}
