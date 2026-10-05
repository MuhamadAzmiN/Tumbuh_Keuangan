'use client';

import React from 'react';
import { Bell, Calendar, Wallet, Laptop } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export function ReminderCard() {
  const { salaryDay, freelanceDay, contractEndLabel } = APP_CONFIG.reminders;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Bell className="h-4 w-4 text-blue-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Jadwal & Pengingat Rutin
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <Wallet className="h-4 w-4 text-slate-600 mb-1" />
          <div className="mt-1">
            <span className="text-xs font-semibold text-slate-800 block">
              Nabung Gaji
            </span>
            <span className="text-xs text-slate-500">
              Tanggal {salaryDay} setiap bulan
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <Laptop className="h-4 w-4 text-slate-600 mb-1" />
          <div className="mt-1">
            <span className="text-xs font-semibold text-slate-800 block">
              Pemasukan Freelance
            </span>
            <span className="text-xs text-slate-500">
              Tanggal {freelanceDay} setiap bulan
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <Calendar className="h-4 w-4 text-slate-600 mb-1" />
          <div className="mt-1">
            <span className="text-xs font-semibold text-slate-800 block">
              Target Akhir Rp50 Jt
            </span>
            <span className="text-xs text-slate-500">
              {contractEndLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
