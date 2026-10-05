'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';
import { CategoryIcon } from './CategoryIcon';
import { ExpenseModal } from './ExpenseModal';
import { useFinance } from '@/lib/context/FinanceContext';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export function ExpenseList({
  expenses = [],
  monthKey,
  onOpenAdd,
  onToastMessage,
}) {
  const { removeExpense } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter expenses for current selected month and filters
  const filteredList = useMemo(() => {
    return expenses.filter((e) => {
      // Must match current month
      if (monthKey && !e.expense_date.startsWith(monthKey)) return false;

      // Category filter
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

      // Payment method filter
      if (selectedPaymentMethod !== 'all' && e.payment_method !== selectedPaymentMethod) {
        return false;
      }

      // Search query (matches description or category or amount)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catMatch = (e.category || '').toLowerCase().includes(q);
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const amtMatch = String(e.amount).includes(q);
        if (!catMatch && !descMatch && !amtMatch) return false;
      }

      return true;
    });
  }, [expenses, monthKey, selectedCategory, selectedPaymentMethod, searchQuery]);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await removeExpense(id);
      setDeleteConfirmId(null);
      if (onToastMessage) onToastMessage('Pengeluaran berhasil dihapus.');
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengeluaran.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-0">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Pengeluaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Riwayat pengeluaran yang tercatat pada bulan ini
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Kategori filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metode Pembayaran filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Metode Pembayaran</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(selectedCategory !== 'all' || selectedPaymentMethod !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>Menampilkan {filteredList.length} pengeluaran</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPaymentMethod('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* List items or Empty state */}
      {filteredList.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-sm font-semibold text-slate-800">
            Belum ada pengeluaran bulan ini.
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {expenses.some((e) => e.expense_date.startsWith(monthKey))
              ? 'Tidak ada pengeluaran yang sesuai dengan filter yang Anda pilih.'
              : 'Catat pengeluaran harian Anda agar alokasi budget dan sisa uang tetap terkendali.'}
          </p>
          <button
            type="button"
            onClick={onOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Catat Pengeluaran</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="p-2 rounded-lg bg-slate-100 text-slate-700 flex-shrink-0 mt-0.5">
                  <CategoryIcon category={item.category} className="h-4 w-4" />
                </span>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {item.payment_method || 'Cash'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(item.expense_date)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 truncate max-w-xs sm:max-w-md">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                <span className="text-sm sm:text-base font-bold text-red-600 tabular-nums">
                  - {formatCurrency(item.amount)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingExpense(item)}
                    title="Ubah Pengeluaran"
                    aria-label="Edit Pengeluaran"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg p-1">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(item.id)}
                        className="text-[11px] font-bold text-red-600 px-1.5 py-0.5 hover:underline disabled:opacity-50"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[11px] text-slate-500 px-1 py-0.5 hover:underline"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      title="Hapus Pengeluaran"
                      aria-label="Hapus Pengeluaran"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseModal
          isOpen={Boolean(editingExpense)}
          onClose={() => setEditingExpense(null)}
          expenseToEdit={editingExpense}
          onSuccess={onToastMessage}
        />
      )}
    </div>
  );
}
