'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyInput } from '../ui/CurrencyInput';
import { CategoryIcon } from '../ui/CategoryIcon';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { useFinance } from '@/lib/context/FinanceContext';
import { useToast } from '@/lib/context/ToastContext';
import { toISODate } from '@/lib/formatters';
import { ArrowLeft, Calendar, ChevronDown, Check } from 'lucide-react';
import { Portal } from '../ui/Portal';

const CATEGORIES_PEMASUKAN = [
  { id: 'salary', label: 'Gaji / Penghasilan' },
  { id: 'freelance', label: 'Freelance / Sampingan' },
  { id: 'investment', label: 'Investasi / Dividen' },
  { id: 'other_income', label: 'Lainnya (Pemasukan)' },
];

const CATEGORIES_PENGELUARAN = [
  { id: 'food', label: 'Makan & Minum' },
  { id: 'transport', label: 'Transportasi' },
  { id: 'shopping', label: 'Belanja Harian' },
  { id: 'entertainment', label: 'Hiburan' },
  { id: 'bills', label: 'Tagihan & Internet' },
  { id: 'other_expense', label: 'Lainnya (Pengeluaran)' },
];

function CustomCategorySelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 hover:bg-white dark:hover:bg-[#0F172A] hover:border-blue-500 transition-all cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-3 min-w-0">
          <CategoryIcon category={selectedOption.id || selectedOption.label} size="sm" />
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xl p-1.5 space-y-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-150">
            {options.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon category={opt.id || opt.label} size="sm" />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function TransactionModal({ isOpen, onClose, transactionToEdit = null }) {
  const { addTransaction, editTransaction } = useFinance();
  const { showToast } = useToast();

  const [flowType, setFlowType] = useState('income'); // 'income' | 'expense'
  const [category, setCategory] = useState('salary');
  const [amount, setAmount] = useState(2000000);
  const [date, setDate] = useState('2026-10-10');
  const [description, setDescription] = useState('Gaji bulanan');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      const isExpense = transactionToEdit.type?.includes('expense') || transactionToEdit.amount < 0;
      setFlowType(isExpense ? 'expense' : 'income');
      setCategory(transactionToEdit.type || 'salary');
      setAmount(Math.abs(Number(transactionToEdit.amount)) || 0);
      setDate(transactionToEdit.transaction_date || toISODate(new Date()));
      setDescription(transactionToEdit.description || '');
    } else {
      setFlowType('income');
      setCategory('salary');
      setAmount(2000000);
      setDate('2026-10-10');
      setDescription('Gaji bulanan');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Masukkan nominal transaksi yang valid.');
      return;
    }

    setSubmitting(true);
    try {
      const finalAmount = flowType === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);
      if (transactionToEdit) {
        await editTransaction(transactionToEdit.id, {
          transaction_date: date,
          type: category,
          amount: finalAmount,
          description: description.trim(),
        });
        showToast('Transaksi berhasil diperbarui! ✨', 'success');
      } else {
        await addTransaction({
          transaction_date: date,
          type: category,
          amount: finalAmount,
          description: description.trim(),
        });
        showToast(flowType === 'expense' ? 'Pengeluaran dicatat! 💸' : 'Pemasukan ditambahkan! 🎉', 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCategories = flowType === 'income' ? CATEGORIES_PEMASUKAN : CATEGORIES_PENGELUARAN;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Bottom Sheet Drawer on Mobile / Centered Modal on Desktop */}
        <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-[#0F172A] rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in duration-300 max-h-[90vh] flex flex-col">

          {/* Drag Handle Bar */}
          <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mt-3 mb-1 flex-shrink-0 sm:hidden" />

          {/* Modal Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {transactionToEdit ? 'Ubah Transaksi' : 'Tambah Transaksi'}
            </h2>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 pt-3 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Segmented Switcher: [ Pemasukan | Pengeluaran ] */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => {
                  setFlowType('income');
                  setCategory('salary');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  flowType === 'income'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-100'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlowType('expense');
                  setCategory('food');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  flowType === 'expense'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-100'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            {/* Pilih Kategori Custom Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Kategori
              </label>
              <CustomCategorySelect
                value={category}
                onChange={(newCat) => setCategory(newCat)}
                options={activeCategories}
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Jumlah
              </label>
              <CurrencyInput
                value={amount}
                onChange={(val) => setAmount(val)}
                placeholder="Rp 0"
                required
              />
            </div>

            {/* Tanggal Custom DatePicker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal
              </label>
              <CustomDatePicker
                value={date}
                onChange={(newDate) => setDate(newDate)}
              />
            </div>

            {/* Catatan (opsional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan (opsional)
              </label>
              <input
                type="text"
                placeholder="Catatan transaksi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 px-4 py-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white dark:bg-[#0F172A] focus:outline-none"
              />
            </div>

            {/* Full Width Primary Blue Button: Simpan */}
            <div className="pt-2 pb-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Memproses...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
