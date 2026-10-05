'use client';

import React from 'react';

export function StatusCard({ financialStatus }) {
  if (!financialStatus) return null;

  const { status, label, badgeColor, dotColor, message } = financialStatus;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-3 w-3 rounded-full ${dotColor} ring-4 ring-slate-100 flex-shrink-0`}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status Tabungan
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${badgeColor}`}
            >
              {label}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 mt-0.5">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
