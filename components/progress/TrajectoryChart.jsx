'use client';

import React, { useState } from 'react';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';

export function TrajectoryChart({ trajectory = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trajectory || trajectory.length === 0) return null;

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Y-Scale: Min 0, Max 55.000.000
  const maxY = 55000000;
  const minY = 0;

  const getX = (idx) => {
    return padding.left + (idx / (trajectory.length - 1)) * innerWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(minY, Math.min(val, maxY));
    return padding.top + innerHeight - (clamped / maxY) * innerHeight;
  };

  // Build SVG path for Ideal Pace
  const idealPath = trajectory.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point.idealCumulative);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build SVG path for Actual
  const actualPath = trajectory.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point.actualCumulative);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Y Axis ticks
  const yTicks = [0, 15000000, 30000000, 45000000, 50000000];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Grafik Perkembangan Saldo
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbandingan saldo riil terhadap target ideal setiap bulan
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span>Saldo Aktual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 border-t-2 border-dashed border-slate-400" />
            <span>Target Ideal</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px] h-auto select-none overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={tick === 50000000 ? '4 4' : 'none'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-medium tabular-nums"
                >
                  {formatCompactCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* Ideal line */}
          <path
            d={idealPath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Actual line */}
          <path
            d={actualPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels & Interactive Points */}
          {trajectory.map((point, idx) => {
            const x = getX(idx);
            const yActual = getY(point.actualCumulative);
            const isHovered = hoveredPoint?.index === point.index;

            return (
              <g key={point.key}>
                {/* Month label */}
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-medium"
                >
                  {point.shortLabel}
                </text>

                {/* Actual data circle */}
                <circle
                  cx={x}
                  cy={yActual}
                  r={isHovered ? 6 : 4}
                  className="fill-white stroke-blue-600 cursor-pointer transition-all"
                  strokeWidth={isHovered ? 3 : 2}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredPoint && (
          <div className="mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 text-xs flex flex-wrap items-center justify-between gap-4">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {hoveredPoint.label}
            </span>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
              <span>
                Target Ideal:{' '}
                <strong className="text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatCurrency(hoveredPoint.idealCumulative)}
                </strong>
              </span>
              <span>
                Saldo Riil:{' '}
                <strong className="text-blue-600 tabular-nums">
                  {formatCurrency(hoveredPoint.actualCumulative)}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
