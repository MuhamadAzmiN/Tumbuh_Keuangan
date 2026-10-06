import { supabase, isSupabaseConfigured } from './client';
import { APP_CONFIG, CONTRACT_MONTHS } from '../constants';

const LOCAL_STORAGE_KEY_PREFIX = 'road_to_50jt_';

const DEFAULT_SETTINGS = {
  target_amount: APP_CONFIG.targetAmount,
  initial_balance: APP_CONFIG.initialBalance,
  monthly_salary_target: APP_CONFIG.monthlySalaryTarget,
  monthly_freelance_target: APP_CONFIG.monthlyFreelanceTarget,
  contract_start: APP_CONFIG.contractStart,
  contract_end: APP_CONFIG.contractEnd,
};

// Initial demo seed transactions (empty array so no dummy data is generated)
const INITIAL_DEMO_TRANSACTIONS = [];
const INITIAL_DEMO_EXPENSES = [];

// Helper to access LocalStorage safely with user-scoping
function getLocalItem(key, fallback = null, userId = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const scopePrefix = userId ? `${userId}_` : '';
    // 1. Try user-scoped key first
    const rawScoped = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${scopePrefix}${key}`);
    if (rawScoped !== null) return JSON.parse(rawScoped);

    // 2. Fall back to global un-scoped key (for backwards compatibility)
    const rawGlobal = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return rawGlobal !== null ? JSON.parse(rawGlobal) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem(key, value, userId = null) {
  if (typeof window === 'undefined') return;
  try {
    const scopePrefix = userId ? `${userId}_` : '';
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${scopePrefix}${key}`, JSON.stringify(value));
    // Also mirror to global key if demo user for legacy fallbacks
    if (!userId || userId === 'demo-user-id') {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
    }
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// ----------------------------------------------------
// AUTO-MIGRATE DEMO/LOCAL DATA TO SUPABASE
// ----------------------------------------------------
export async function syncDemoDataToSupabase(userId) {
  if (!isSupabaseConfigured || !supabase || !userId || userId === 'demo-user-id') return;

  try {
    // 1. Migrate Local Transactions if Supabase DB is empty for this user
    const localTx = getLocalItem('transactions', [], 'demo-user-id');
    if (Array.isArray(localTx) && localTx.length > 0) {
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!existingTx || existingTx.length === 0) {
        const payload = localTx.map((tx) => ({
          user_id: userId,
          transaction_date: tx.transaction_date,
          type: tx.type || 'salary',
          amount: Number(tx.amount),
          description: tx.description || '',
          created_at: tx.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('transactions').insert(payload);
      }
    }

    // 2. Migrate Local Expenses
    const localExp = getLocalItem('expenses', [], 'demo-user-id');
    if (Array.isArray(localExp) && localExp.length > 0) {
      const { data: existingExp } = await supabase
        .from('expenses')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!existingExp || existingExp.length === 0) {
        const payload = localExp.map((exp) => ({
          user_id: userId,
          amount: Number(exp.amount),
          category: exp.category || 'other_expense',
          description: exp.description || '',
          expense_date: exp.expense_date,
          payment_method: exp.payment_method || 'Cash',
          created_at: exp.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('expenses').insert(payload);
      }
    }

    // 3. Migrate Financial Settings
    const localSettings = getLocalItem('financial_settings', null, 'demo-user-id');
    if (localSettings) {
      await supabase.from('financial_settings').upsert({
        user_id: userId,
        target_amount: Number(localSettings.target_amount) || APP_CONFIG.targetAmount,
        initial_balance: Number(localSettings.initial_balance) || APP_CONFIG.initialBalance,
        monthly_salary_target: Number(localSettings.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget,
        monthly_freelance_target: Number(localSettings.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget,
        contract_start: localSettings.contract_start || APP_CONFIG.contractStart,
        contract_end: localSettings.contract_end || APP_CONFIG.contractEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    // 4. Migrate Profile
    const localProfile = getLocalItem('profile', null, 'demo-user-id');
    if (localProfile?.name) {
      await supabase.from('profiles').upsert({
        id: userId,
        name: localProfile.name,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Auto-sync demo data note:', err);
  }
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
export async function getSessionUser() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        // Automatically sync any offline demo data to Supabase
        syncDemoDataToSupabase(user.id);
        return user;
      }
    } catch {
      // ignore
    }
  }

  // Demo user fallback if no active Supabase session
  const defaultDemoUser = {
    id: 'demo-user-id',
    email: 'azmi@example.com',
    user_metadata: { name: 'Azmi' },
  };
  const localDemo = getLocalItem('demo_user', defaultDemoUser, 'demo-user-id');
  if (!localDemo) {
    setLocalItem('demo_user', defaultDemoUser, 'demo-user-id');
    return defaultDemoUser;
  }
  return localDemo;
}

export async function loginWithEmail(email, password) {
  // If explicitly logging in as Demo User
  if (email === 'azmi@example.com' || email === 'demo@example.com') {
    const demoUser = {
      id: 'demo-user-id',
      email: 'azmi@example.com',
      user_metadata: { name: 'Azmi' },
    };
    setLocalItem('demo_user', demoUser, 'demo-user-id');
    return demoUser;
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message?.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Email atau password tidak sesuai.');
      }
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Email belum dikonfirmasi. Silakan buka inbox/spam email Anda atau matikan "Confirm Email" di dashboard Supabase.');
      }
      throw new Error(error.message || 'Gagal masuk. Periksa koneksi internet kamu.');
    }
    if (data?.user) {
      await syncDemoDataToSupabase(data.user.id);
    }
    return data.user;
  }

  // Fallback demo mode login
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi.');
  }
  const demoUser = {
    id: 'demo-user-id',
    email,
    user_metadata: { name: email.split('@')[0] },
  };
  setLocalItem('demo_user', demoUser, 'demo-user-id');
  return demoUser;
}

export async function signUpWithEmail(email, password, name = '') {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim() || email.split('@')[0],
        },
      },
    });
    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        throw new Error('Email ini sudah terdaftar. Silakan login.');
      }
      throw new Error(error.message || 'Pendaftaran gagal. Coba lagi nanti.');
    }
    if (data?.user) {
      await syncDemoDataToSupabase(data.user.id);
    }
    return data.user;
  }

  // Demo mode signup fallback
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi.');
  }
  const demoUser = {
    id: 'demo-user-id',
    email,
    user_metadata: { name: name.trim() || email.split('@')[0] },
  };
  setLocalItem('demo_user', demoUser, 'demo-user-id');
  return demoUser;
}

export async function logoutUser() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}demo-user-id_demo_user`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}demo_user`);
    }
  }
}

// ----------------------------------------------------
// PROFILE
// ----------------------------------------------------
export async function getProfile(userId) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeId)
        .maybeSingle();

      if (data) {
        setLocalItem('profile', data, activeId);
        return data;
      }
    } catch {
      // fallback
    }
  }

  return getLocalItem('profile', { id: activeId, name: 'Azmi' }, activeId);
}

export async function updateProfile(userId, { name }) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: activeId, name, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (!error && data) {
        setLocalItem('profile', data, activeId);
        return data;
      }
    } catch {
      // fallback
    }
  }

  const profile = { id: activeId, name, updated_at: new Date().toISOString() };
  setLocalItem('profile', profile, activeId);
  return profile;
}

// ----------------------------------------------------
// FINANCIAL SETTINGS
// ----------------------------------------------------
export async function getFinancialSettings(userId) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('user_id', activeId)
        .maybeSingle();

      if (data) {
        setLocalItem('financial_settings', data, activeId);
        return data;
      }
    } catch {
      // fallback
    }
  }

  const existing = getLocalItem('financial_settings', null, activeId);
  if (!existing) {
    const defaultData = {
      id: 'local-settings',
      user_id: activeId,
      ...DEFAULT_SETTINGS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalItem('financial_settings', defaultData, activeId);
    return defaultData;
  }
  return existing;
}

export async function saveFinancialSettings(userId, settingsData) {
  const activeId = userId || 'demo-user-id';
  const payload = {
    user_id: activeId,
    target_amount: Number(settingsData.target_amount) || APP_CONFIG.targetAmount,
    initial_balance: Number(settingsData.initial_balance) || APP_CONFIG.initialBalance,
    monthly_salary_target: Number(settingsData.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget,
    monthly_freelance_target: Number(settingsData.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget,
    contract_start: settingsData.contract_start || APP_CONFIG.contractStart,
    contract_end: settingsData.contract_end || APP_CONFIG.contractEnd,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('financial_settings')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (!error && data) {
        setLocalItem('financial_settings', data, activeId);
        return data;
      }
    } catch {
      // fallback
    }
  }

  const saved = { id: 'local-settings', ...payload };
  setLocalItem('financial_settings', saved, activeId);
  return saved;
}

// ----------------------------------------------------
// TRANSACTIONS
// ----------------------------------------------------
export async function getTransactions(userId) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      // Auto-migrate offline demo data to Supabase if any exists
      await syncDemoDataToSupabase(activeId);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', activeId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLocalItem('transactions', data, activeId);
        return data;
      }
      console.warn('Supabase getTransactions error, using local fallback:', error?.message || error);
    } catch (err) {
      console.warn('Supabase getTransactions exception, using local fallback:', err);
    }
  }

  const localTx = getLocalItem('transactions', null, activeId);
  if (!localTx) {
    setLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS, activeId);
    return INITIAL_DEMO_TRANSACTIONS;
  }
  return localTx;
}

export async function createTransaction(userId, { transaction_date, type, amount, description }) {
  const activeId = userId || 'demo-user-id';
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) === 0) {
    throw new Error('Nominal transaksi harus valid dan tidak boleh 0.');
  }
  if (!transaction_date) {
    throw new Error('Tanggal transaksi wajib diisi.');
  }

  const numericAmount = Number(amount);
  const payload = {
    user_id: activeId,
    transaction_date,
    type: type || 'salary',
    amount: numericAmount,
    description: (description || '').trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let resultTx = null;

  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        resultTx = data;
      } else {
        console.warn('Supabase createTransaction DB insert note:', error?.message || error);
      }
    } catch (err) {
      console.warn('Supabase createTransaction exception:', err);
    }

    // Optional sync to expenses table if expense type
    const isExpense = numericAmount < 0 || ['food', 'transport', 'shopping', 'entertainment', 'bills', 'other_expense'].includes(type);
    if (isExpense) {
      try {
        await supabase
          .from('expenses')
          .insert([{
            user_id: activeId,
            amount: Math.abs(numericAmount),
            category: type,
            description: (description || '').trim(),
            expense_date: transaction_date,
            payment_method: 'Cash',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
      } catch (e) {
        // optional table sync
      }
    }
  }

  if (!resultTx) {
    resultTx = {
      ...payload,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
  }

  // Always update LocalStorage cache so state and offline storage remain 100% in sync
  const localTx = getLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS, activeId);
  const updatedList = [resultTx, ...localTx.filter(t => t.id !== resultTx.id)];
  setLocalItem('transactions', updatedList, activeId);

  return resultTx;
}

export async function updateTransaction(userId, transactionId, { transaction_date, type, amount, description }) {
  const activeId = userId || 'demo-user-id';
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) === 0) {
    throw new Error('Nominal transaksi harus valid dan tidak boleh 0.');
  }

  const payload = {
    transaction_date,
    type,
    amount: Number(amount),
    description: (description || '').trim(),
    updated_at: new Date().toISOString(),
  };

  let updatedTx = null;

  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transactionId)
        .eq('user_id', activeId)
        .select()
        .single();

      if (!error && data) {
        updatedTx = data;
      }
    } catch (err) {
      console.warn('Supabase updateTransaction exception:', err);
    }
  }

  if (!updatedTx) {
    updatedTx = { id: transactionId, user_id: activeId, ...payload };
  }

  const localTx = getLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS, activeId);
  const updatedList = localTx.map((tx) =>
    tx.id === transactionId ? { ...tx, ...updatedTx } : tx
  );
  setLocalItem('transactions', updatedList, activeId);
  return updatedTx;
}

export async function deleteTransaction(userId, transactionId) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', activeId);

      if (error) {
        console.warn('Supabase deleteTransaction note:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase deleteTransaction exception:', err);
    }
  }

  const localTx = getLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS, activeId);
  const updatedList = localTx.filter((tx) => tx.id !== transactionId);
  setLocalItem('transactions', updatedList, activeId);
  return true;
}

// ----------------------------------------------------
// MONTHLY TARGETS (Checklist state)
// Note: Checklist DOES NOT alter balance.
// ----------------------------------------------------
export async function getMonthlyTargets(userId) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('monthly_targets')
        .select('*')
        .eq('user_id', activeId);

      if (!error && data) {
        setLocalItem('monthly_targets', data, activeId);
        return data;
      }
    } catch (err) {
      console.warn('Supabase getMonthlyTargets exception:', err);
    }
  }

  return getLocalItem('monthly_targets', [], activeId);
}

export async function toggleMonthlyTargetStatus(userId, monthDateStr, fieldName, isCompleted, settings = {}) {
  const activeId = userId || 'demo-user-id';
  const salaryTarget = Number(settings.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget;
  const freelanceTarget = Number(settings.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget;

  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data: existing } = await supabase
        .from('monthly_targets')
        .select('*')
        .eq('user_id', activeId)
        .eq('month', monthDateStr)
        .maybeSingle();

      if (existing) {
        const { data } = await supabase
          .from('monthly_targets')
          .update({
            [fieldName]: isCompleted,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (data) return data;
      } else {
        const { data } = await supabase
          .from('monthly_targets')
          .insert([{
            user_id: activeId,
            month: monthDateStr,
            salary_target: salaryTarget,
            freelance_target: freelanceTarget,
            salary_completed: fieldName === 'salary_completed' ? isCompleted : false,
            freelance_completed: fieldName === 'freelance_completed' ? isCompleted : false,
          }])
          .select()
          .single();

        if (data) return data;
      }
    } catch (err) {
      console.warn('Supabase toggleMonthlyTargetStatus exception:', err);
    }
  }

  // Local storage fallback
  const list = getLocalItem('monthly_targets', [], activeId);
  const existingIdx = list.findIndex((item) => item.month === monthDateStr);

  if (existingIdx >= 0) {
    list[existingIdx] = {
      ...list[existingIdx],
      [fieldName]: isCompleted,
      updated_at: new Date().toISOString(),
    };
  } else {
    list.push({
      id: `local-target-${Date.now()}`,
      user_id: activeId,
      month: monthDateStr,
      salary_target: salaryTarget,
      freelance_target: freelanceTarget,
      salary_completed: fieldName === 'salary_completed' ? isCompleted : false,
      freelance_completed: fieldName === 'freelance_completed' ? isCompleted : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  setLocalItem('monthly_targets', list, activeId);
  return list;
}

// ----------------------------------------------------
// EXPENSES
// ----------------------------------------------------
export async function getExpenses(userId, monthKey = null) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', activeId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (monthKey) {
        const startOfMonth = `${monthKey}-01`;
        const [yStr, mStr] = monthKey.split('-');
        const y = parseInt(yStr, 10);
        const m = parseInt(mStr, 10);
        const lastDay = new Date(y, m, 0).getDate();
        const endOfMonth = `${monthKey}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('expense_date', startOfMonth).lte('expense_date', endOfMonth);
      }

      const { data, error } = await query;
      if (!error && data) {
        setLocalItem('expenses', data, activeId);
        return data;
      }
    } catch (err) {
      console.warn('Supabase getExpenses exception:', err);
    }
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES, activeId);
  if (!monthKey) return localExp;
  return localExp.filter((e) => e.expense_date.startsWith(monthKey));
}

export async function createExpense(userId, { amount, category, description, expense_date, payment_method }) {
  const activeId = userId || 'demo-user-id';
  if (!amount || Number(amount) <= 0) {
    throw new Error('Nominal pengeluaran harus lebih besar dari Rp0.');
  }
  if (!category) {
    throw new Error('Kategori pengeluaran wajib dipilih.');
  }
  if (!expense_date) {
    throw new Error('Tanggal pengeluaran wajib diisi.');
  }

  const payload = {
    user_id: activeId,
    amount: Number(amount),
    category,
    description: (description || '').trim(),
    expense_date,
    payment_method: payment_method || 'Cash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let newExp = null;

  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        newExp = data;
      }
    } catch (err) {
      console.warn('Supabase createExpense exception:', err);
    }
  }

  if (!newExp) {
    newExp = {
      ...payload,
      id: `local-exp-${Date.now()}`,
    };
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES, activeId);
  const updatedList = [newExp, ...localExp.filter(e => e.id !== newExp.id)];
  setLocalItem('expenses', updatedList, activeId);
  return newExp;
}

export async function updateExpense(userId, expenseId, { amount, category, description, expense_date, payment_method }) {
  const activeId = userId || 'demo-user-id';
  if (!amount || Number(amount) <= 0) {
    throw new Error('Nominal pengeluaran harus lebih besar dari Rp0.');
  }

  const payload = {
    amount: Number(amount),
    category,
    description: (description || '').trim(),
    expense_date,
    payment_method: payment_method || 'Cash',
    updated_at: new Date().toISOString(),
  };

  let updated = null;

  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', expenseId)
        .eq('user_id', activeId)
        .select()
        .single();

      if (!error && data) updated = data;
    } catch (err) {
      console.warn('Supabase updateExpense exception:', err);
    }
  }

  if (!updated) {
    updated = { id: expenseId, user_id: activeId, ...payload };
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES, activeId);
  const updatedList = localExp.map((e) => (e.id === expenseId ? { ...e, ...updated } : e));
  setLocalItem('expenses', updatedList, activeId);
  return updated;
}

export async function deleteExpense(userId, expenseId) {
  const activeId = userId || 'demo-user-id';
  if (isSupabaseConfigured && supabase && activeId !== 'demo-user-id') {
    try {
      await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', activeId);
    } catch (err) {
      console.warn('Supabase deleteExpense exception:', err);
    }
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES, activeId);
  const updatedList = localExp.filter((e) => e.id !== expenseId);
  setLocalItem('expenses', updatedList, activeId);
  return true;
}

// ----------------------------------------------------
// MONTHLY BUDGETS
// ----------------------------------------------------
export async function getMonthlyBudgets(userId) {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('monthly_budgets table query error, falling back to local:', error.message);
      return getLocalItem('monthly_budgets', {});
    }
    const budgetMap = {};
    (data || []).forEach((b) => {
      budgetMap[b.month] = Number(b.budget_amount);
    });
    return budgetMap;
  }

  return getLocalItem('monthly_budgets', { '2026-10': 2000000 });
}

export async function saveMonthlyBudget(userId, month, budgetAmount) {
  const amount = Number(budgetAmount) || 0;
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('monthly_budgets')
      .upsert({
        user_id: userId,
        month,
        budget_amount: amount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,month' })
      .select()
      .single();

    if (error) throw new Error('Gagal menyimpan budget bulanan.');
    return amount;
  }

  const localBudgets = getLocalItem('monthly_budgets', {});
  localBudgets[month] = amount;
  setLocalItem('monthly_budgets', localBudgets);
  return amount;
}

export async function getCategoryBudgets(userId) {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        const catMap = {};
        data.forEach((row) => {
          if (!catMap[row.month]) catMap[row.month] = {};
          catMap[row.month][row.category_id] = Number(row.limit_amount);
        });
        return catMap;
      }
    } catch {
      // fallback to local storage
    }
  }

  return getLocalItem('category_budgets', {});
}

export async function saveCategoryBudgets(userId, month, categoryLimits) {
  const payloadMap = categoryLimits || {};
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const rows = Object.entries(payloadMap).map(([catId, limit]) => ({
        user_id: userId,
        month,
        category_id: catId,
        limit_amount: Number(limit) || 0,
        updated_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        await supabase
          .from('category_budgets')
          .upsert(rows, { onConflict: 'user_id,month,category_id' });
      }
    } catch (err) {
      console.warn('Category budgets save fallback to local:', err);
    }
  }

  const localMap = getLocalItem('category_budgets', {});
  localMap[month] = { ...(localMap[month] || {}), ...payloadMap };
  setLocalItem('category_budgets', localMap);
  return localMap[month];
}


// ----------------------------------------------------
// EXPORT & IMPORT BACKUP
// ----------------------------------------------------
export async function exportBackupData(userId) {
  const [settings, transactions, monthly_targets, profile, expenses, monthly_budgets] = await Promise.all([
    getFinancialSettings(userId),
    getTransactions(userId),
    getMonthlyTargets(userId),
    getProfile(userId),
    getExpenses(userId),
    getMonthlyBudgets(userId),
  ]);

  return {
    version: '1.1',
    app: 'PENCATATAN AZMI',
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile,
    settings,
    transactions,
    monthly_targets,
    expenses,
    monthly_budgets,
  };
}

export async function importBackupData(userId, backupJson) {
  if (!backupJson || typeof backupJson !== 'object') {
    throw new Error('Format file backup tidak valid.');
  }

  const { settings, transactions, monthly_targets, profile, expenses, monthly_budgets } = backupJson;

  if (isSupabaseConfigured && supabase && userId) {
    // 1. Settings
    if (settings) {
      await supabase.from('financial_settings').upsert({
        user_id: userId,
        target_amount: settings.target_amount || APP_CONFIG.targetAmount,
        initial_balance: settings.initial_balance || APP_CONFIG.initialBalance,
        monthly_salary_target: settings.monthly_salary_target || APP_CONFIG.monthlySalaryTarget,
        monthly_freelance_target: settings.monthly_freelance_target || APP_CONFIG.monthlyFreelanceTarget,
        contract_start: settings.contract_start || APP_CONFIG.contractStart,
        contract_end: settings.contract_end || APP_CONFIG.contractEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    // 2. Profile
    if (profile && profile.name) {
      await supabase.from('profiles').upsert({
        id: userId,
        name: profile.name,
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Transactions
    if (Array.isArray(transactions)) {
      await supabase.from('transactions').delete().eq('user_id', userId);
      if (transactions.length > 0) {
        const cleanTx = transactions.map((tx) => ({
          user_id: userId,
          transaction_date: tx.transaction_date,
          type: tx.type,
          amount: Number(tx.amount) || 0,
          description: tx.description || '',
          created_at: tx.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('transactions').insert(cleanTx);
      }
    }

    // 4. Monthly targets
    if (Array.isArray(monthly_targets)) {
      await supabase.from('monthly_targets').delete().eq('user_id', userId);
      if (monthly_targets.length > 0) {
        const cleanTargets = monthly_targets.map((mt) => ({
          user_id: userId,
          month: mt.month,
          salary_target: mt.salary_target || APP_CONFIG.monthlySalaryTarget,
          freelance_target: mt.freelance_target || APP_CONFIG.monthlyFreelanceTarget,
          salary_completed: Boolean(mt.salary_completed),
          freelance_completed: Boolean(mt.freelance_completed),
          created_at: mt.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('monthly_targets').insert(cleanTargets);
      }
    }

    // 5. Expenses
    if (Array.isArray(expenses)) {
      await supabase.from('expenses').delete().eq('user_id', userId);
      if (expenses.length > 0) {
        const cleanExp = expenses.map((e) => ({
          user_id: userId,
          amount: Number(e.amount) || 0,
          category: e.category || 'Lainnya',
          description: e.description || '',
          expense_date: e.expense_date,
          payment_method: e.payment_method || 'Cash',
          created_at: e.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('expenses').insert(cleanExp);
      }
    }

    // 6. Monthly Budgets
    if (monthly_budgets && typeof monthly_budgets === 'object') {
      const budgetEntries = Object.entries(monthly_budgets).map(([month, budget_amount]) => ({
        user_id: userId,
        month,
        budget_amount: Number(budget_amount) || 0,
        updated_at: new Date().toISOString(),
      }));
      if (budgetEntries.length > 0) {
        await supabase.from('monthly_budgets').upsert(budgetEntries, { onConflict: 'user_id,month' });
      }
    }

    return true;
  }

  // Local storage mode
  if (settings) setLocalItem('financial_settings', { ...settings, user_id: userId });
  if (profile) setLocalItem('profile', profile);
  if (Array.isArray(transactions)) setLocalItem('transactions', transactions);
  if (Array.isArray(monthly_targets)) setLocalItem('monthly_targets', monthly_targets);
  if (Array.isArray(expenses)) setLocalItem('expenses', expenses);
  return true;
}

