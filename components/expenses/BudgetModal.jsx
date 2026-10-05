'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useFinance } from '@/lib/context/FinanceContext';

export function BudgetModal({ isOpen, onClose, monthKey, currentBudget = 2000000, monthLabel = '' }) {
  const { updateBudget } = useFinance();
  const [budgetAmount, setBudgetAmount] = useState(currentBudget);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBudgetAmount(currentBudget);
    setError('');
  }, [currentBudget, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (budgetAmount < 0) {
      setError('Budget tidak boleh bernilai negatif.');
      return;
    }

    setSubmitting(true);
    try {
      await updateBudget(monthKey, budgetAmount);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan budget.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Atur Batas Budget ${monthLabel}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Batas Maksimal Pengeluaran
          </label>
          <CurrencyInput
            value={budgetAmount}
            onChange={(val) => setBudgetAmount(val)}
            placeholder="2.000.000"
            required
          />
          <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
            Menentukan batas pengeluaran membantu Anda memantau status keamanan pengeluaran bulanan (Aman, Mendekati batas, atau Melewati budget).
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
