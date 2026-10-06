'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail, signUpWithEmail } from '@/lib/supabase/data-service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useFinance } from '@/lib/context/FinanceContext';
import { Lock, Mail, User, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { TumbuhLogo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshData } = useFinance();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password, name || 'Azmi');
        if (isSupabaseConfigured) {
          setSuccessMsg('Pendaftaran berhasil! Kamu dapat langsung masuk.');
        }
        await refreshData();
        router.push('/dashboard');
      } else {
        await loginWithEmail(email, password);
        await refreshData();
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan password kamu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center p-2.5 shadow-xs">
            <TumbuhLogo className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pencatatan Keuangan Azmi
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola Transaksi & Target Tabungan
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              !isRegister ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              isRegister ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Azmi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{submitting ? 'Memproses...' : isRegister ? 'Daftar' : 'Masuk'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Keamanan Data Terjamin dengan Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
