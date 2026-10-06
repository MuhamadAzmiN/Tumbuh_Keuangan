-- 📊 CATEGORY BUDGETS SCHEMA & RLS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS public.category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
  category_id VARCHAR(50) NOT NULL,
  limit_amount NUMERIC NOT NULL DEFAULT 0 CHECK (limit_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_month_category UNIQUE (user_id, month, category_id)
);

CREATE INDEX IF NOT EXISTS idx_category_budgets_user_month ON public.category_budgets(user_id, month);

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own category budgets"
  ON public.category_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category budgets"
  ON public.category_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category budgets"
  ON public.category_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own category budgets"
  ON public.category_budgets FOR DELETE
  USING (auth.uid() = user_id);
