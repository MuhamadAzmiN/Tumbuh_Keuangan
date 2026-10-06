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
      desc: 'Modal awal memulai perjalanan tabungan',
      amount: initial,
      icon: Rocket,
      tag: 'Start',
    },
    {
      title: 'Langkah 1: Fondasi Tabungan (25%)',
      desc: 'Mencapai 1/4 perjalanan target tabungan',
      amount: Math.round(initial + range * 0.25),
      icon: Flag,
      tag: '25%',
    },
    {
      title: 'Langkah 2: Separuh Jalan (50%)',
      desc: 'Titik tengah 50% perjalanan financial goal',
      amount: Math.round(initial + range * 0.50),
      icon: Target,
      tag: '50%',
    },
    {
      title: 'Langkah 3: Zona Akhir (75%)',
      desc: 'Mendekati garis finish target tabungan',
      amount: Math.round(initial + range * 0.75),
      icon: Sparkles,
      tag: '75%',
    },
    {
      title: 'Puncak Target Utama (100%)',
      desc: 'Target tabungan utama berhasil diraih!',
      amount: target,
      icon: Trophy,
      tag: 'Finish',
    },
  ];

  const [selectedMilestone, setSelectedMilestone] = useState(null);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Peta Timeline Milestone</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Tingkat pencapaian progres menuju {formatCurrency(target)}
          </p>
        </div>
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          {milestones.filter((m) => balance >= m.amount).length} / {milestones.length} Tercapai
        </span>
      </div>

      {/* Vertical Timeline Stepper Line Container */}
      <div className="relative pl-3 sm:pl-4 space-y-6 pt-1 pb-1">
        {/* Continuous Connecting Line */}
        <div className="absolute left-[23px] sm:left-[27px] top-3 bottom-3 w-0.5 bg-slate-200" />

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

          const IconComp = milestone.icon;

          return (
            <div
              key={milestone.amount}
              onClick={() => setSelectedMilestone({ ...milestone, isCompleted, isNext, progressVal, idx })}
              className={`relative flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                isCompleted
                  ? 'border-emerald-200/80 bg-emerald-50/30 hover:border-emerald-300 hover:shadow-xs'
                  : isNext
                  ? 'border-blue-300 bg-blue-50/40 ring-2 ring-blue-500/15 shadow-sm'
                  : 'border-slate-100 bg-slate-50/40 hover:border-slate-200'
              }`}
            >
              {/* Stepper Node Circle */}
              <div
                className={`relative z-10 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-transform group-hover:scale-105 shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : isNext
                    ? 'bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-100 animate-pulse'
                    : 'bg-white border border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isNext ? (
                  <Play className="h-3.5 w-3.5 fill-white translate-x-0.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-400 stroke-[2]" />
                )}
              </div>

              {/* Content Body */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {milestone.title}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0 tabular-nums ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : isNext
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {formatCurrency(milestone.amount)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  {milestone.desc}
                </p>

                {/* Progress bar if current next step */}
                {isNext && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
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

              <div className="text-slate-300 group-hover:text-blue-600 transition-colors self-center flex-shrink-0">
                <ChevronRight className="h-4 w-4" />
              </div>
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
            <div className="relative z-10 w-full max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-white ${
                    selectedMilestone.isCompleted ? 'bg-emerald-500' : selectedMilestone.isNext ? 'bg-blue-600' : 'bg-slate-400'
                  }`}>
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedMilestone.title}</h4>
                    <span className="text-xs text-slate-400 font-medium block">
                      Target: {formatCurrency(selectedMilestone.amount)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Saldo Terkumpul Saat Ini:</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(balance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Target Milestone:</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(selectedMilestone.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Sisa Kekurangan:</span>
                    <span className={`font-bold tabular-nums ${
                      balance >= selectedMilestone.amount ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
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
                    <span>Kumpulkan <strong>{formatCurrency(selectedMilestone.amount - balance)}</strong> lagi untuk membuka milestone ini.</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 font-medium">
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