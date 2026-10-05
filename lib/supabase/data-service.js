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

// Helper to access LocalStorage safely
function getLocalItem(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
export async function getSessionUser() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) return user;
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
  const localDemo = getLocalItem('demo_user', defaultDemoUser);
  if (!localDemo) {
    setLocalItem('demo_user', defaultDemoUser);
    return defaultDemoUser;
  }
  return localDemo;
}

export async function loginWithEmail(email, password) {
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
    return data.user;
  }

  // Demo mode login
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi.');
  }
  const demoUser = {
    id: 'demo-user-id',
    email,
    user_metadata: { name: email.split('@')[0] },
  };
  setLocalItem('demo_user', demoUser);
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
    return data.user;
  }

  // Demo mode signup
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi.');
  }
  const demoUser = {
    id: 'demo-user-id',
    email,
    user_metadata: { name: name.trim() || email.split('@')[0] },
  };
  setLocalItem('demo_user', demoUser);
  return demoUser;
}

export async function logoutUser() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}demo_user`);
    }
  }
}

// ----------------------------------------------------
// PROFILE
// ----------------------------------------------------
export async function getProfile(userId) {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error('Tidak dapat mengambil data profil.');
    return data;
  }

  return getLocalItem('profile', { id: userId || 'demo-user-id', name: 'Azmi' });
}

export async function updateProfile(userId, { name }) {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, name, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new Error('Tidak dapat menyimpan perubahan profil.');
    return data;
  }

  const profile = { id: userId, name, updated_at: new Date().toISOString() };
  setLocalItem('profile', profile);
  return profile;
}

// ----------------------------------------------------
// FINANCIAL SETTINGS
// ----------------------------------------------------
export async function getFinancialSettings(userId) {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('financial_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error('Tidak dapat memuat pengaturan keuangan.');
    return data;
  }

  const existing = getLocalItem('financial_settings', null);
  if (!existing) {
    const defaultData = {
      id: 'local-settings',
      user_id: userId || 'demo-user-id',
      ...DEFAULT_SETTINGS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalItem('financial_settings', defaultData);
    return defaultData;
  }
  return existing;
}

export async function saveFinancialSettings(userId, settingsData) {
  const payload = {
    user_id: userId,
    target_amount: Number(settingsData.target_amount) || APP_CONFIG.targetAmount,
    initial_balance: Number(settingsData.initial_balance) || APP_CONFIG.initialBalance,
    monthly_salary_target: Number(settingsData.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget,
    monthly_freelance_target: Number(settingsData.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget,
    contract_start: settingsData.contract_start || APP_CONFIG.contractStart,
    contract_end: settingsData.contract_end || APP_CONFIG.contractEnd,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('financial_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new Error('Tidak dapat menyimpan target keuangan.');
    return data;
  }

  const saved = { id: 'local-settings', ...payload };
  setLocalItem('financial_settings', saved);
  return saved;
}

// ----------------------------------------------------
// TRANSACTIONS
// ----------------------------------------------------
export async function getTransactions(userId) {
  if (isSupabaseConfigured && supabase && userId && userId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLocalItem('transactions', data);
        return data;
      }
      console.warn('Supabase getTransactions error, using local fallback:', error?.message || error);
    } catch (err) {
      console.warn('Supabase getTransactions exception, using local fallback:', err);
    }
  }

  const localTx = getLocalItem('transactions', null);
  if (!localTx) {
    setLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS);
    return INITIAL_DEMO_TRANSACTIONS;
  }
  return localTx;
}

export async function createTransaction(userId, { transaction_date, type, amount, description }) {
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) === 0) {
    throw new Error('Nominal transaksi harus valid dan tidak boleh 0.');
  }
  if (!transaction_date) {
    throw new Error('Tanggal transaksi wajib diisi.');
  }

  const numericAmount = Number(amount);
  const payload = {
    user_id: userId || 'demo-user-id',
    transaction_date,
    type: type || 'salary',
    amount: numericAmount,
    description: (description || '').trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let resultTx = null;

  if (isSupabaseConfigured && supabase && userId && userId !== 'demo-user-id') {
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
            user_id: userId,
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
  const localTx = getLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS);
  const updatedList = [resultTx, ...localTx.filter(t => t.id !== resultTx.id)];
  setLocalItem('transactions', updatedList);

  return resultTx;
}

export async function updateTransaction(userId, transactionId, { transaction_date, type, amount, description }) {
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

  if (isSupabaseConfigured && supabase && userId && userId !== 'demo-user-id') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transactionId)
        .eq('user_id', userId)
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
    updatedTx = { id: transactionId, user_id: userId || 'demo-user-id', ...payload };
  }

  const localTx = getLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS);
  const updatedList = localTx.map((tx) =>
    tx.id === transactionId ? { ...tx, ...updatedTx } : tx
  );
  setLocalItem('transactions', updatedList);
  return updatedTx;
}

export async function deleteTransaction(userId, transactionId) {
  if (isSupabaseConfigured && supabase && userId && userId !== 'demo-user-id') {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase deleteTransaction note:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase deleteTransaction exception:', err);
    }
  }

  const localTx = getLocalItem('transactions', INITIAL_DEMO_TRANSACTIONS);
  const updatedList = localTx.filter((tx) => tx.id !== transactionId);
  setLocalItem('transactions', updatedList);
  return true;
}

// ----------------------------------------------------
// MONTHLY TARGETS (Checklist state)
// Note: Checklist DOES NOT alter balance.
// ----------------------------------------------------
export async function getMonthlyTargets(userId) {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error('Tidak dapat memuat target bulanan.');
    return data || [];
  }

  return getLocalItem('monthly_targets', []);
}

export async function toggleMonthlyTargetStatus(userId, monthDateStr, fieldName, isCompleted, settings = {}) {
  // fieldName is 'salary_completed' or 'freelance_completed'
  const salaryTarget = Number(settings.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget;
  const freelanceTarget = Number(settings.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget;

  if (isSupabaseConfigured && supabase && userId) {
    // Check if record exists
    const { data: existing } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', monthDateStr)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('monthly_targets')
        .update({
          [fieldName]: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error('Gagal memperbarui checklist.');
      return data;
    } else {
      const { data, error } = await supabase
        .from('monthly_targets')
        .insert([{
          user_id: userId,
          month: monthDateStr,
          salary_target: salaryTarget,
          freelance_target: freelanceTarget,
          salary_completed: fieldName === 'salary_completed' ? isCompleted : false,
          freelance_completed: fieldName === 'freelance_completed' ? isCompleted : false,
        }])
        .select()
        .single();

      if (error) throw new Error('Gagal menyimpan checklist.');
      return data;
    }
  }

  // Local storage mode
  const list = getLocalItem('monthly_targets', []);
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
      user_id: userId || 'demo-user-id',
      month: monthDateStr,
      salary_target: salaryTarget,
      freelance_target: freelanceTarget,
      salary_completed: fieldName === 'salary_completed' ? isCompleted : false,
      freelance_completed: fieldName === 'freelance_completed' ? isCompleted : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  setLocalItem('monthly_targets', list);
  return list;
}

// ----------------------------------------------------
// EXPENSES
// ----------------------------------------------------
export async function getExpenses(userId, monthKey = null) {
  if (isSupabaseConfigured && supabase && userId) {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (monthKey) {
      // MonthKey is 'YYYY-MM'
      const startOfMonth = `${monthKey}-01`;
      // Calculate end of month
      const [yStr, mStr] = monthKey.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const lastDay = new Date(y, m, 0).getDate();
      const endOfMonth = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

      query = query.gte('expense_date', startOfMonth).lte('expense_date', endOfMonth);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Tabel expenses belum dibuat di Supabase, beralih ke local fallback:', error.message || error);
      // Fallback if table not yet created in Supabase
      const local = getLocalItem('expenses', INITIAL_DEMO_EXPENSES);
      return monthKey ? local.filter((e) => e.expense_date.startsWith(monthKey)) : local;
    }
    return data || [];
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES);
  if (!monthKey) return localExp;
  return localExp.filter((e) => e.expense_date.startsWith(monthKey));
}

export async function createExpense(userId, { amount, category, description, expense_date, payment_method }) {
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
    user_id: userId,
    amount: Number(amount),
    category,
    description: (description || '').trim(),
    expense_date,
    payment_method: payment_method || 'Cash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase createExpense error:', error);
      throw new Error('Pengeluaran gagal disimpan. Silakan coba lagi.');
    }
    return data;
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES);
  const newExp = {
    ...payload,
    id: `local-exp-${Date.now()}`,
  };
  const updatedList = [newExp, ...localExp];
  setLocalItem('expenses', updatedList);
  return newExp;
}

export async function updateExpense(userId, expenseId, { amount, category, description, expense_date, payment_method }) {
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

  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', expenseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error('Pengeluaran gagal diperbarui. Coba lagi.');
    return data;
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES);
  const updatedList = localExp.map((e) => (e.id === expenseId ? { ...e, ...payload } : e));
  setLocalItem('expenses', updatedList);
  return updatedList.find((e) => e.id === expenseId);
}

export async function deleteExpense(userId, expenseId) {
  if (isSupabaseConfigured && supabase && userId) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) throw new Error('Gagal menghapus pengeluaran.');
    return true;
  }

  const localExp = getLocalItem('expenses', INITIAL_DEMO_EXPENSES);
  const updatedList = localExp.filter((e) => e.id !== expenseId);
  setLocalItem('expenses', updatedList);
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

