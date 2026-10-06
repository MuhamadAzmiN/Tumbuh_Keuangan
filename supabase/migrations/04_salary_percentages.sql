-- Migration: Add percentage allocation columns to financial_settings
ALTER TABLE public.financial_settings 
ADD COLUMN IF NOT EXISTS savings_percentage NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS needs_percentage NUMERIC DEFAULT 50;
