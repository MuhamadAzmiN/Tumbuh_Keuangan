'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Global Floating Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm sm:max-w-md space-y-2 pointer-events-none">
        {toasts.map((t) => {
          let bgStyle = 'bg-slate-900/90 text-white border-slate-700/50';
          let icon = <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />;

          if (t.type === 'success') {
            bgStyle = 'bg-emerald-900/95 text-emerald-50 border-emerald-700/60 shadow-xl shadow-emerald-950/20';
            icon = <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
          } else if (t.type === 'error' || t.type === 'delete') {
            bgStyle = 'bg-rose-900/95 text-rose-50 border-rose-700/60 shadow-xl shadow-rose-950/20';
            icon = <AlertCircle className="h-4 w-4 text-rose-300 flex-shrink-0" />;
          } else if (t.type === 'info') {
            bgStyle = 'bg-blue-900/95 text-blue-50 border-blue-700/60 shadow-xl shadow-blue-950/20';
            icon = <Sparkles className="h-4 w-4 text-blue-300 flex-shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top-4 fade-in duration-200 ${bgStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <span className="truncate">{t.message}</span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Safe fallback if used outside provider
    return { showToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
