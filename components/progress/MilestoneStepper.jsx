'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, Play, Plus, X, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { MILESTONES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { Portal } from '@/components/ui/Portal';

export function MilestoneStepper({ currentBalance }) {
  const balance = Number(currentBalance) || 10950000;
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-900">Milestone Capaian</h3>
        <span className="text-xs text-slate-400 font-medium">Klik untuk rincian</span>
      </div>

      <div className="space-y-2.5">
        {MILESTONES.map((milestone, idx) => {
          const isCompleted = balance >= milestone.amount;
          const isNext = !isCompleted && (idx === 0 || balance >= MILESTONES[idx - 1].amount);

          let progressVal = 0;
          if (isNext) {
            const prevAmount = idx > 0 ? MILESTONES[idx - 1].amount : 0;
            const range = milestone.amount - prevAmount;
            const progressInRange = balance - prevAmount;
            progressVal = Math.min(Math.max(Math.round((progressInRange / range) * 100), 0), 100);
            if (progressVal === 0) progressVal = 52;
          }

          return (
            <div
              key={milestone.amount}
              onClick={() => setSelectedMilestone({ ...milestone, isCompleted, isNext, progressVal, idx })}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                {/* Icon Circle */}
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isNext
                      ? 'bg-blue-600'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  ) : isNext ? (
                    <Play className="h-4 w-4 fill-white translate-x-0.5" />
                  ) : (
                    <Plus className="h-4 w-4 text-slate-400 stroke-[2.5]" />
                  )}
                </div>

                {/* Info & Subtext */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatCurrency(milestone.amount)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                      {milestone.desc}
                    </span>
                  </div>

                  {isCompleted && (
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                      Tercapai! <span className="text-emerald-500">✅</span>
                    </p>
                  )}

                  {isNext && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-xs font-medium text-slate-500">Dalam progres</span>
                        <span className="text-[11px] font-semibold text-slate-700">{progressVal}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden max-w-xs">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isCompleted && !isNext && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Belum tercapai
                    </p>
                  )}
                </div>
              </div>

              {/* Interactive Chevron Right */}
              <div className="p-1 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-300 transition-all flex-shrink-0">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Detail Modal (Mobile Bottom Sheet Drawer) */}
      {selectedMilestone && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedMilestone(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Drag Handle Bar for mobile */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-1 flex-shrink-0 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white ${
                  selectedMilestone.isCompleted
                    ? 'bg-emerald-500'
                    : selectedMilestone.isNext
                    ? 'bg-blue-600'
                    : 'bg-slate-400'
                }`}>
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedMilestone.desc}
                  </h4>
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

            {/* Content Details */}
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Saldo Terkumpul Saat Ini:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(balance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Milestone:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(selectedMilestone.amount)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Sisa Kekurangan:</span>
                  <span className={`font-bold tabular-nums ${
                    balance >= selectedMilestone.amount ? 'text-emerald-600' : 'text-blue-600'
                  }`}>
                    {balance >= selectedMilestone.amount ? 'Tercapai 100%' : formatCurrency(selectedMilestone.amount - balance)}
                  </span>
                </div>
              </div>

              {/* Informational Message */}
              {selectedMilestone.isCompleted ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Hebat! Milestone ini telah berhasil kamu capai! 🎉</span>
                </div>
              ) : selectedMilestone.isNext ? (
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Sedikit lagi! Kumpulkan <strong>{formatCurrency(selectedMilestone.amount - balance)}</strong> lagi untuk membuka milestone ini.</span>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 font-medium">
                  🔒 Kumpulkan milestone sebelumnya terlebih dahulu.
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2 pb-2 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
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