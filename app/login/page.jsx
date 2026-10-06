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
        const loggedUser = await signUpWithEmail(email, password, name || email.split('@')[0]);
        if (isSupabaseConfigured) {
          setSuccessMsg('Pendaftaran berhasil! Kamu dapat langsung masuk.');
        }
        await refreshData(loggedUser);
        router.push('/dashboard');
      } else {
        const loggedUser = await loginWithEmail(email, password);
        await refreshData(loggedUser);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan password kamu.');
    } finally {
      setSubmitting(false);
    }
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Top left shape */}
        <div className="absolute -top-[10%] -left-[20%] w-[70%] h-[40%] rounded-full bg-blue-50/50 blur-3xl"></div>
        {/* Top right shape */}
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-50/50 blur-3xl"></div>
        {/* Bottom waves/shapes */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[120%] h-[40%] rounded-[100%] bg-blue-100/30 blur-2xl"></div>
        <div className="absolute -bottom-[15%] left-[20%] w-[100%] h-[30%] rounded-[100%] bg-emerald-50/40 blur-2xl"></div>
        
        {/* Floating leaves */}
        <svg className="absolute top-[15%] left-[10%] w-6 h-6 text-emerald-200 opacity-60 rotate-45" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,22c-1.3,0-2.8-0.3-4.4-0.9C7.8,19,4,13.7,4,7.8C4,5,5.1,2.8,7.3,1.3c1.6-1.1,3.4-1.2,5-0.1 c1.9,1.3,3.7,3.5,5.3,6.5C20.6,13.5,21.5,17.7,17.5,22z"/></svg>
        <svg className="absolute top-[20%] right-[15%] w-8 h-8 text-emerald-300 opacity-70 -rotate-12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,22c-1.3,0-2.8-0.3-4.4-0.9C7.8,19,4,13.7,4,7.8C4,5,5.1,2.8,7.3,1.3c1.6-1.1,3.4-1.2,5-0.1 c1.9,1.3,3.7,3.5,5.3,6.5C20.6,13.5,21.5,17.7,17.5,22z"/></svg>
        <svg className="absolute bottom-[10%] left-[5%] w-12 h-12 text-emerald-300 opacity-80 rotate-12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,22c-1.3,0-2.8-0.3-4.4-0.9C7.8,19,4,13.7,4,7.8C4,5,5.1,2.8,7.3,1.3c1.6-1.1,3.4-1.2,5-0.1 c1.9,1.3,3.7,3.5,5.3,6.5C20.6,13.5,21.5,17.7,17.5,22z"/></svg>
        <svg className="absolute bottom-[15%] left-[15%] w-8 h-8 text-emerald-200 opacity-60 rotate-45" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,22c-1.3,0-2.8-0.3-4.4-0.9C7.8,19,4,13.7,4,7.8C4,5,5.1,2.8,7.3,1.3c1.6-1.1,3.4-1.2,5-0.1 c1.9,1.3,3.7,3.5,5.3,6.5C20.6,13.5,21.5,17.7,17.5,22z"/></svg>
        <svg className="absolute bottom-[5%] right-[10%] w-10 h-10 text-emerald-300 opacity-80 -rotate-12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,22c-1.3,0-2.8-0.3-4.4-0.9C7.8,19,4,13.7,4,7.8C4,5,5.1,2.8,7.3,1.3c1.6-1.1,3.4-1.2,5-0.1 c1.9,1.3,3.7,3.5,5.3,6.5C20.6,13.5,21.5,17.7,17.5,22z"/></svg>
      </div>

      <div className="w-full max-w-[390px] space-y-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <TumbuhLogo className="h-20 w-20" />
          <div className="space-y-1.5">
            <h1 className="text-[28px] font-extrabold text-[#1E293B] dark:text-slate-100 tracking-tight">
              Tumbuh
            </h1>
            <p className="text-[14px] text-[#64748B] dark:text-slate-400 font-semibold">
              Catat. Kelola. Capai.
            </p>
            <p className="text-[12.5px] text-[#94A3B8] dark:text-slate-400 max-w-[240px] mx-auto mt-2 leading-relaxed">
              Mulai perjalanan finansialmu menuju masa depan yang lebih baik.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-5">
          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-[#F1F5F9] dark:bg-slate-800/50 p-1.5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                !isRegister ? 'bg-white dark:bg-[#0F172A] text-[#2563EB] shadow-sm' : 'text-[#64748B] dark:text-slate-400 hover:text-[#334155]'
              }`}
            >
              <Mail className="h-4 w-4" />
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                isRegister ? 'bg-white dark:bg-[#0F172A] text-[#2563EB] shadow-sm' : 'text-[#64748B] dark:text-slate-400 hover:text-[#334155]'
              }`}
            >
              <User className="h-4 w-4" />
              Daftar
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[12px] font-medium text-rose-700 leading-snug">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[12px] font-medium text-emerald-700 leading-snug">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#1E293B] dark:text-slate-100">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-[18px] w-[18px] text-[#94A3B8] dark:text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Agus Setiawan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-[#E2E8F0] dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#020617] pl-11 pr-4 py-3.5 text-[13px] font-medium text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] dark:text-slate-400 focus:border-[#2563EB] dark:border-slate-800/60 focus:bg-white dark:bg-[#0F172A] focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#1E293B] dark:text-slate-100">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-[18px] w-[18px] text-[#94A3B8] dark:text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="agus.setiawan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#E2E8F0] dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#020617] pl-11 pr-4 py-3.5 text-[13px] font-medium text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] dark:text-slate-400 focus:border-[#2563EB] dark:border-slate-800/60 focus:bg-white dark:bg-[#0F172A] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#1E293B] dark:text-slate-100">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-[18px] w-[18px] text-[#94A3B8] dark:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#E2E8F0] dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#020617] pl-11 pr-11 py-3.5 text-[13px] font-medium text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] dark:text-slate-400 tracking-widest focus:border-[#2563EB] dark:border-slate-800/60 focus:bg-white dark:bg-[#0F172A] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[#94A3B8] dark:text-slate-400 hover:text-[#64748B] dark:text-slate-400 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-[#2563EB] py-4 text-[14px] font-bold text-white hover:bg-[#1D4ED8] transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk ke Akun'}</span>
                <ArrowRight className="h-[18px] w-[18px] stroke-[2.5]" />
              </button>
            </div>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#E2E8F0] dark:border-slate-800/60"></div>
            <span className="flex-shrink-0 mx-4 text-[12px] font-medium text-[#94A3B8] dark:text-slate-400">atau</span>
            <div className="flex-grow border-t border-[#E2E8F0] dark:border-slate-800/60"></div>
          </div>

          <button
            type="button"
            className="w-full rounded-2xl border border-[#E2E8F0] dark:border-slate-800/60 bg-white dark:bg-[#0F172A] py-3.5 text-[13.5px] font-bold text-[#475569] hover:bg-[#F8FAFC] dark:bg-[#020617] transition-colors cursor-pointer flex items-center justify-center gap-2.5"
          >
            <GoogleIcon />
            <span>{isRegister ? 'Daftar' : 'Masuk'} dengan Google</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#94A3B8] dark:text-slate-400 pt-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Keamanan Data Terjamin dengan Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
