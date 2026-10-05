'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import { APP_CONFIG } from '@/lib/constants';

export function OnboardingModal({ isOpen, onClose }) {
  const { updateSettings } = useFinance();
  const [targetAmount, setTargetAmount] = useState(APP_CONFIG.targetAmount);
  const [initialBalance, setInitialBalance] = useState(APP_CONFIG.initialBalance);
  const [salaryTarget, setSalaryTarget] = useState(APP_CONFIG.monthlySalaryTarget);
  const [freelanceTarget, setFreelanceTarget] = useState(APP_CONFIG.monthlyFreelanceTarget);
  const [saving, setSaving] = useState(false);

  const handleStart = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        target_amount: targetAmount,
        initial_balance: initialBalance,
        monthly_salary_target: salaryTarget,
        monthly_freelance_target: freelanceTarget,
        contract_start: APP_CONFIG.contractStart,
        contract_end: APP_CONFIG.contractEnd,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mulai dengan Tumbuh 🌱"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-slate-700">
        <p className="text-xs text-slate-500 leading-relaxed">
          Selamat datang! Konfigurasikan target tabungan kontrak kerja Anda. Nilai di bawah telah diisi dengan rencana awal Anda dan dapat disesuaikan.
        </p>

        <form onSubmit={handleStart} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Akhir
              </label>
              <CurrencyInput
                value={targetAmount}
                onChange={(val) => setTargetAmount(val)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saldo Awal Saat Ini
              </label>
              <CurrencyInput
                value={initialBalance}
                onChange={(val) => setInitialBalance(val)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Nabung Gaji / Bulan
              </label>
              <CurrencyInput
                value={salaryTarget}
                onChange={(val) => setSalaryTarget(val)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Freelance / Bulan
              </label>
              <CurrencyInput
                value={freelanceTarget}
                onChange={(val) => setFreelanceTarget(val)}
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Periode Kontrak: </span>
            <span>Oktober 2026 – September 2027 (12 Bulan)</span>
            <div className="mt-1 text-[11px] text-slate-500">
              Total target bulanan: {formatCurrency(salaryTarget + freelanceTarget)}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyiapkan...' : 'Mulai Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
