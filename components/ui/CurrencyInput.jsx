'use client';

import React, { useState, useEffect } from 'react';

/**
 * Format raw number or string into thousand-separated Indonesian dots (e.g. 10.950.000)
 */
function formatNumberWithDots(val) {
  if (val === null || val === undefined || val === '') return '';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '';
  return Number(clean).toLocaleString('id-ID');
}

/**
 * Clean thousand-separated string back to numeric
 */
function parseDotsToNumber(str) {
  if (!str) return 0;
  const clean = String(str).replace(/\D/g, '');
  return clean ? Number(clean) : 0;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  required = false,
  disabled = false,
  className = '',
  id,
  name,
}) {
  const [displayValue, setDisplayValue] = useState(() => formatNumberWithDots(value));

  useEffect(() => {
    setDisplayValue(formatNumberWithDots(value));
  }, [value]);

  const handleChange = (e) => {
    const rawInput = e.target.value;
    const cleanDigits = rawInput.replace(/\D/g, '');

    if (!cleanDigits) {
      setDisplayValue('');
      if (onChange) onChange(0);
      return;
    }

    const formatted = Number(cleanDigits).toLocaleString('id-ID');
    setDisplayValue(formatted);

    if (onChange) {
      onChange(Number(cleanDigits));
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-xs sm:text-sm font-bold text-slate-500 select-none">
          Rp
        </span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        className={`w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 tabular-nums ${className}`}
      />
    </div>
  );
}
