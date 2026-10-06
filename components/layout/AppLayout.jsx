'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  LayoutGrid,
  Target,
  User,
  Plus,
  LogOut,
  Info,
  Bell,
} from 'lucide-react';
import { TumbuhLogo } from '@/components/ui/Logo';
import { useFinance } from '@/lib/context/FinanceContext';
import { TransactionModal } from '../transactions/TransactionModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Beranda', icon: Home },
  { href: '/transactions', label: 'Transaksi', icon: FileText },
  { href: '/plan', label: 'Anggaran', icon: LayoutGrid },
  { href: '/progress', label: 'Target', icon: Target },
  { href: '/settings', label: 'Profil', icon: User },
];

export function AppLayout({ children }) {
  const pathname = usePathname();
  const { user, profile, logout } = useFinance();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const userName = profile?.name || user?.email?.split('@')[0] || 'Azmi';
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-800">

      {/* ═══════════════════════════════════════ */}
      {/*  DESKTOP SIDEBAR (lg+)                  */}
      {/* ═══════════════════════════════════════ */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen select-none shadow-sm">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center flex-shrink-0">
              <TumbuhLogo className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">Pencatatan Azmi</h1>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Catat, Kelola, Capai.</p>
            </div>
          </Link>
        </div>

        {/* Quick Add */}
        <div className="px-4 pt-5 pb-2">
          <button
            type="button"
            onClick={() => setIsAddTxOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate">Pencatatan Azmi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Keluar"
            aria-label="Logout"
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════ */}
      {/*  MOBILE TOP HEADER                      */}
      {/*  "Pencatatan Azmi" [bell] [profile]     */}
      {/* ═══════════════════════════════════════ */}
      <header className="lg:hidden pt-3.5 pb-1 px-4 flex items-center justify-between bg-transparent">
        {/* Brand logo */}
        <Link href="/dashboard" aria-label="Beranda" className="flex items-center">
          <TumbuhLogo className="h-7 w-7" />
        </Link>

        {/* Right: Bell + Profile Icon */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifikasi"
            className="h-9 w-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5 stroke-[1.8]" />
          </button>
          <Link
            href="/settings"
            aria-label="Profil"
            className="h-9 w-9 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <User className="h-5 w-5 stroke-[2] text-blue-600 fill-blue-600/10" />
          </Link>
        </div>
      </header>


      {/* ═══════════════════════════════════════ */}
      {/*  MAIN CONTENT                           */}
      {/* ═══════════════════════════════════════ */}
      <main className="flex-1 pb-24 lg:pb-10 w-full max-w-xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-4 lg:pt-6">
        {children}
      </main>

      {/* ═══════════════════════════════════════ */}
      {/*  MOBILE BOTTOM NAV                      */}
      {/* ═══════════════════════════════════════ */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around shadow-lg px-1"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)', pt: '6px' }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 transition-colors ${isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className={`text-[11px] leading-none truncate ${isActive ? 'font-bold text-blue-600' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <TransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
    </div>
  );
}

