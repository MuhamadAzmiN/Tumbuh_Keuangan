-- 🎯 ROAD TO 50 JT - SUPABASE DATABASE SCHEMA & RLS
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Financial Settings Table
CREATE TABLE IF NOT EXISTS public.financial_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount NUMERIC NOT NULL DEFAULT 50000000,
  initial_balance NUMERIC NOT NULL DEFAULT 10950000,
  monthly_salary_target NUMERIC NOT NULL DEFAULT 2000000,
  monthly_freelance_target NUMERIC NOT NULL DEFAULT 1300000,
  contract_start DATE NOT NULL DEFAULT '2026-10-01',
  contract_end DATE NOT NULL DEFAULT '2027-09-30',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('salary', 'freelance', 'saving', 'other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Monthly Targets Table
CREATE TABLE IF NOT EXISTS public.monthly_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  salary_target NUMERIC NOT NULL DEFAULT 2000000,
  freelance_target NUMERIC NOT NULL DEFAULT 1300000,
  salary_completed BOOLEAN NOT NULL DEFAULT FALSE,
  freelance_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_month UNIQUE (user_id, month)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_user_month ON public.monthly_targets(user_id, month ASC);

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Financial Settings Policies
CREATE POLICY "Users can view own financial settings"
  ON public.financial_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial settings"
  ON public.financial_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial settings"
  ON public.financial_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial settings"
  ON public.financial_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Monthly Targets Policies
CREATE POLICY "Users can view own monthly targets"
  ON public.monthly_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly targets"
  ON public.monthly_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly targets"
  ON public.monthly_targets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly targets"
  ON public.monthly_targets FOR DELETE
  USING (auth.uid() = user_id);

-- ==================================================
-- Trigger: Auto-create profile on Auth Signup
-- ==================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  -- Also initialize default financial settings for Road to 50 Jt
  INSERT INTO public.financial_settings (
    user_id,
    target_amount,
    initial_balance,
    monthly_salary_target,
    monthly_freelance_target,
    contract_start,
    contract_end
  ) VALUES (
    NEW.id,
    50000000,
    10950000,
    2000000,
    1300000,
    '2026-10-01',
    '2027-09-30'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
