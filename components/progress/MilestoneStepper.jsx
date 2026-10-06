'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, Play, Lock, Trophy, Sparkles, X, Target, Flag, Rocket } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Portal } from '@/components/ui/Portal';

export function MilestoneStepper({ currentBalance, targetAmount = 50000000, initialBalance = 10950000 }) {
  const balance = Number(currentBalance) || 0;
  const initial = Number(initialBalance) || 10950000;
  const target = Number(targetAmount) || 50000000;
  const range = Math.max(1, target - initial);

  const milestones = [
    {
      title: 'Saldo Awal Start',
      desc: 'Modal awal perjalanan tabungan kamu',
      amount: initial,
      icon: Rocket,
    },
    {
      title: 'Fondasi Tabungan (25%)',
      desc: 'Mencapai 1/4 perjalanan target tabungan',
      amount: Math.round(initial + range * 0.25),
      icon: Flag,
    },
    {
      title: 'Separuh Jalan (50%)',
      desc: 'Titik tengah 50% target tabungan',
      amount: Math.round(initial + range * 0.50),
      icon: Target,
    },
    {
      title: 'Zona Akhir (75%)',
      desc: 'Mendekati garis finish target tabungan',
      amount: Math.round(initial + range * 0.75),
      icon: Sparkles,
    },
    {
      title: 'Puncak Target (100%)',
      desc: 'Target tabungan utama berhasil diraih!',
      amount: target,
      icon: Trophy,
    },
  ];

  const [selectedMilestone, setSelectedMilestone] = useState(null);

  return (
    <div className="rounded-[16px] border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-3.5 sm:p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
        <div>
          <h3 className="text-[13px] sm:text-sm font-bold text-[#172033] dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Milestone Target Tabungan</span>
          </h3>
          <p className="text-[10.5px] text-slate-500 font-normal">
            Tahapan capaian dari {formatCurrency(initial)} ke {formatCurrency(target)}
          </p>
        </div>
        <span className="text-[9.5px] font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
          {milestones.filter((m) => balance >= m.amount).length} / {milestones.length} Terbuka
        </span>
      </div>

      {/* Clean Milestone Cards List */}
      <div className="space-y-2">
        {milestones.map((milestone, idx) => {
          const isCompleted = balance >= milestone.amount;
          const isNext = !isCompleted && (idx === 0 || balance >= milestones[idx - 1].amount);

          let progressVal = 0;
          if (isNext) {
            const prevAmount = idx > 0 ? milestones[idx - 1].amount : 0;
            const rangeVal = milestone.amount - prevAmount;
            const progressInRange = balance - prevAmount;
            progressVal = Math.min(Math.max(Math.round((progressInRange / rangeVal) * 100), 0), 100);
          }

          const IconComponent = milestone.icon;

          return (
            <div
              key={milestone.amount}
              onClick={() => setSelectedMilestone({ ...milestone, isCompleted, isNext, progressVal, idx })}
              className={`p-3 rounded-xl border transition-all cursor-pointer group active:scale-[0.99] ${
                isCompleted
                  ? 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0F172A] hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs'
                  : isNext
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/20 ring-2 ring-blue-500/15 dark:ring-blue-500/30 shadow-2xs'
                  : 'border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:border-slate-200 dark:hover:border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Icon Badge */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-transform group-hover:scale-105 ${
                      isCompleted
                        ? 'bg-[#00A86B] text-white shadow-2xs'
                        : isNext
                        ? 'bg-[#2563EB] text-white shadow-2xs ring-2 ring-blue-100 dark:ring-blue-900'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : isNext ? (
                      <Play className="h-3 w-3 fill-white translate-x-[1px]" />
                    ) : (
                      <Lock className="h-3 w-3 text-slate-400 stroke-[2]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] sm:text-xs font-semibold text-[#172033] dark:text-slate-100 leading-snug">
                        {milestone.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                      {milestone.desc}
                    </p>
                  </div>
                </div>

                {/* Amount Badge & Status Pill */}
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border inline-block tabular-nums ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60'
                        : isNext
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-800/60'
                    }`}
                  >
                    {formatCurrency(milestone.amount)}
                  </span>

                  {isCompleted && (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-end gap-0.5">
                      ✓ Terpenuhi
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[9.5px] font-semibold text-blue-600 block tabular-nums">
                      ⚡ Progres {progressVal}%
                    </span>
                  )}
                  {!isCompleted && !isNext && (
                    <span className="text-[9.5px] font-normal text-slate-400 block">
                      🔒 Belum Terbuka
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar for Active Step */}
              {isNext && (
                <div className="mt-2.5 pt-2 border-t border-blue-100/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span>Progres ke milestone ini</span>
                    <span className="text-blue-600 font-bold tabular-nums">{progressVal}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedMilestone && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedMilestone(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-[#0F172A] p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl text-white ${
                      selectedMilestone.isCompleted ? 'bg-emerald-500' : selectedMilestone.isNext ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                  >
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedMilestone.title}</h4>
                    <span className="text-xs text-slate-400 font-medium block">
                      Target: {formatCurrency(selectedMilestone.amount)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Saldo Terkumpul Saat Ini:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(balance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Target Milestone:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(selectedMilestone.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="text-slate-500 font-medium">Sisa Kekurangan:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        balance >= selectedMilestone.amount ? 'text-emerald-600' : 'text-blue-600'
                      }`}
                    >
                      {balance >= selectedMilestone.amount ? 'Tercapai 100%' : formatCurrency(selectedMilestone.amount - balance)}
                    </span>
                  </div>
                </div>

                {selectedMilestone.isCompleted ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-900 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Hebat! Milestone ini telah berhasil kamu capai! 🎉</span>
                  </div>
                ) : selectedMilestone.isNext ? (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>
                      Kumpulkan <strong>{formatCurrency(selectedMilestone.amount - balance)}</strong> lagi untuk membuka milestone ini.
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    🔒 Capai milestone sebelumnya terlebih dahulu.
                  </div>
                )}
              </div>

              <div className="pt-2 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}