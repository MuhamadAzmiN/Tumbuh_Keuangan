'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Portal } from './Portal';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'sm:max-w-md' }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container / Bottom Sheet Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`relative z-10 w-full ${maxWidth} rounded-t-[32px] sm:rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-5 sm:p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto animate-in duration-200`}
        >
          {/* Drag Handle Bar for mobile */}
          <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto -mt-1 mb-2 flex-shrink-0 sm:hidden" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <h2 id="modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="pt-4">{children}</div>
        </div>
      </div>
    </Portal>
  );
}
