'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';
import { toISODate } from '@/lib/formatters';

export function ExpenseModal({
  isOpen,
  onClose,
  expenseToEdit = null,
  defaultDate = null,
  onSuccess = null,
}) {
  const { addExpense, editExpense } = useFinance();
  const { showToast } = useToast();

  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Makanan');
  const [date, setDate] = useState(defaultDate || toISODate(new Date()));
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(Number(expenseToEdit.amount) || 0);
      setCategory(expenseToEdit.category || 'Makanan');
      setDate(expenseToEdit.expense_date || toISODate(new Date()));
      setDescription(expenseToEdit.description || '');
      setPaymentMethod(expenseToEdit.payment_method || 'Cash');
    } else {
      setAmount(0);
      setCategory('Makanan');
      setDate(defaultDate || toISODate(new Date()));
      setDescription('');
      setPaymentMethod('Cash');
    }
    setError('');
  }, [expenseToEdit, defaultDate, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Nominal pengeluaran wajib diisi dan harus lebih dari Rp0.');
      return;
    }

    if (!category) {
      setError('Kategori pengeluaran wajib dipilih.');
      return;
    }

    if (!date) {
      setError('Tanggal pengeluaran wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      if (expenseToEdit) {
        await editExpense(expenseToEdit.id, {
          amount: numericAmount,
          category,
          expense_date: date,
          description: description.trim(),
          payment_method: paymentMethod,
        });
      } else {
        await addExpense({
          amount: numericAmount,
          category,
          expense_date: date,
          description: description.trim(),
          payment_method: paymentMethod,
        });
      }
      showToast(expenseToEdit ? 'Pengeluaran diperbarui! ✨' : 'Pengeluaran berhasil dicatat! 📝', 'success');
      if (onSuccess) onSuccess(expenseToEdit ? 'Pengeluaran berhasil diperbarui.' : 'Pengeluaran berhasil dicatat.');
      onClose();
    } catch (err) {
      setError(err.message || 'Pengeluaran gagal disimpan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Nominal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nominal Pengeluaran
          </label>
          <CurrencyInput
            value={amount}
            onChange={(val) => setAmount(val)}
            placeholder="0"
            required
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white dark:bg-[#0F172A] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Metode Pembayaran */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Metode Pembayaran
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white dark:bg-[#0F172A] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deskripsi (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Makan siang nasi padang / Rokok harian"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
