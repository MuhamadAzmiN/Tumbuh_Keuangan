'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  getSessionUser,
  getProfile,
  updateProfile,
  getFinancialSettings,
  saveFinancialSettings,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyTargets,
  toggleMonthlyTargetStatus,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyBudgets,
  saveMonthlyBudget,
  getCategoryBudgets,
  saveCategoryBudgets,
  logoutUser,
  exportBackupData,
  importBackupData,
} from '../supabase/data-service';
import { isSupabaseConfigured, supabase } from '../supabase/client';
import {
  calculateTotalBalance,
  calculateTargetProgress,
  calculateMonthStats,
  calculateFinancialStatus,
  calculateTrajectory,
  getCurrentContractMonthKey,
  calculateMonthlyExpenseStats,
} from '../calculations';
import { APP_CONFIG, CONTRACT_MONTHS } from '../constants';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyTargets, setMonthlyTargets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState({});
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all finance data
  const loadFinanceData = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setSettings(null);
      setTransactions([]);
      setMonthlyTargets([]);
      setExpenses([]);
      setMonthlyBudgets({});
      setCategoryBudgets({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [profData, settsData, txData, targetsData, expData, budgetData, catBudgetData] = await Promise.all([
        getProfile(currentUser.id).catch(() => null),
        getFinancialSettings(currentUser.id).catch(() => null),
        getTransactions(currentUser.id).catch(() => []),
        getMonthlyTargets(currentUser.id).catch(() => []),
        getExpenses(currentUser.id).catch(() => []),
        getMonthlyBudgets(currentUser.id).catch(() => ({})),
        getCategoryBudgets(currentUser.id).catch(() => ({})),
      ]);

      setUser(currentUser);
      const defaultName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Pengguna';
      setProfile(profData?.name ? profData : { id: currentUser.id, name: defaultName });
      setSettings(
        settsData || {
          target_amount: APP_CONFIG.targetAmount,
          initial_balance: APP_CONFIG.initialBalance,
          monthly_salary_target: APP_CONFIG.monthlySalaryTarget,
          monthly_freelance_target: APP_CONFIG.monthlyFreelanceTarget,
          contract_start: APP_CONFIG.contractStart,
          contract_end: APP_CONFIG.contractEnd,
        }
      );
      setTransactions(txData || []);
      setMonthlyTargets(targetsData || []);
      setExpenses(expData || []);
      setMonthlyBudgets(budgetData || {});
      setCategoryBudgets(catBudgetData || {});
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentUser = await getSessionUser();
        if (mounted) {
          await loadFinanceData(currentUser);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        if (mounted) {
          await loadFinanceData(null);
        }
      }
    }

    initAuth();

    // Supabase auth subscription if available
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          await loadFinanceData(session.user);
        } else if (event === 'SIGNED_OUT') {
          await loadFinanceData(null);
        }
      });
      authListener = listener;
    }

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [loadFinanceData]);

  // Handle route protection
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === '/login';
    if (!user && !isAuthRoute) {
      router.push('/login');
    } else if (user && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  // Derived financial metrics
  const activeMonthKey = useMemo(() => getCurrentContractMonthKey(), []);

  const totalBalance = useMemo(() => {
    return calculateTotalBalance(settings?.initial_balance, transactions);
  }, [settings?.initial_balance, transactions]);

  const progressInfo = useMemo(() => {
    return calculateTargetProgress(totalBalance, settings?.target_amount);
  }, [totalBalance, settings?.target_amount]);

  const currentMonthStats = useMemo(() => {
    return calculateMonthStats(activeMonthKey, transactions, settings || {});
  }, [activeMonthKey, transactions, settings]);

  const financialStatus = useMemo(() => {
    return calculateFinancialStatus(
      totalBalance,
      settings?.target_amount,
      settings?.initial_balance,
      transactions,
      settings || {}
    );
  }, [totalBalance, settings, transactions]);

  const trajectory = useMemo(() => {
    return calculateTrajectory(settings?.initial_balance, settings || {}, transactions);
  }, [settings, transactions]);

  // Derived expense & cash flow metrics for active month
  const currentMonthBudget = useMemo(() => {
    return monthlyBudgets[activeMonthKey] ?? 2000000;
  }, [monthlyBudgets, activeMonthKey]);

  const currentMonthExpenseStats = useMemo(() => {
    return calculateMonthlyExpenseStats(activeMonthKey, expenses, currentMonthBudget);
  }, [activeMonthKey, expenses, currentMonthBudget]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthStats.totalActual;
  }, [currentMonthStats]);

  const currentMonthCashFlow = useMemo(() => {
    return currentMonthIncome - currentMonthExpenseStats.totalExpense;
  }, [currentMonthIncome, currentMonthExpenseStats.totalExpense]);

  // Action methods
  const addTransaction = useCallback(
    async (txData) => {
      const activeUserId = user?.id || 'demo-user-id';
      const newTx = await createTransaction(activeUserId, txData);
      setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);
      return newTx;
    },
    [user]
  );

  const editTransaction = useCallback(
    async (txId, txData) => {
      const activeUserId = user?.id || 'demo-user-id';
      const updated = await updateTransaction(activeUserId, txId, txData);
      setTransactions((prev) => prev.map((tx) => (tx.id === txId ? updated : tx)));
      return updated;
    },
    [user]
  );

  const removeTransaction = useCallback(
    async (txId) => {
      const activeUserId = user?.id || 'demo-user-id';
      await deleteTransaction(activeUserId, txId);
      setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
    },
    [user]
  );

  const toggleTarget = useCallback(
    async (monthDateStr, fieldName, isCompleted) => {
      const activeUserId = user?.id || 'demo-user-id';
      // Optimistic update
      setMonthlyTargets((prev) => {
        const idx = prev.findIndex((m) => m.month === monthDateStr);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], [fieldName]: isCompleted };
          return updated;
        }
        return [
          ...prev,
          {
            month: monthDateStr,
            salary_completed: fieldName === 'salary_completed' ? isCompleted : false,
            freelance_completed: fieldName === 'freelance_completed' ? isCompleted : false,
          },
        ];
      });

      await toggleMonthlyTargetStatus(activeUserId, monthDateStr, fieldName, isCompleted, settings || {});
    },
    [user, settings]
  );

  // Expense action methods
  const addExpense = useCallback(
    async (expData) => {
      const activeUserId = user?.id || 'demo-user-id';
      const newExp = await createExpense(activeUserId, expData);
      setExpenses((prev) => [newExp, ...prev.filter((e) => e.id !== newExp.id)]);
      return newExp;
    },
    [user]
  );

  const editExpense = useCallback(
    async (expId, expData) => {
      const activeUserId = user?.id || 'demo-user-id';
      const updated = await updateExpense(activeUserId, expId, expData);
      setExpenses((prev) => prev.map((e) => (e.id === expId ? updated : e)));
      return updated;
    },
    [user]
  );

  const removeExpense = useCallback(
    async (expId) => {
      const activeUserId = user?.id || 'demo-user-id';
      await deleteExpense(activeUserId, expId);
      setExpenses((prev) => prev.filter((e) => e.id !== expId));
    },
    [user]
  );

  const updateBudget = useCallback(
    async (month, amount) => {
      const activeUserId = user?.id || 'demo-user-id';
      const saved = await saveMonthlyBudget(activeUserId, month, amount);
      setMonthlyBudgets((prev) => ({ ...prev, [month]: saved }));
      return saved;
    },
    [user]
  );

  const updateCategoryBudgets = useCallback(
    async (month, categoryLimits) => {
      const activeUserId = user?.id || 'demo-user-id';
      const saved = await saveCategoryBudgets(activeUserId, month, categoryLimits);
      setCategoryBudgets((prev) => ({ ...prev, [month]: { ...(prev[month] || {}), ...saved } }));
      return saved;
    },
    [user]
  );

  const updateSettings = useCallback(
    async (newSettings) => {
      const activeUserId = user?.id || 'demo-user-id';
      const updated = await saveFinancialSettings(activeUserId, newSettings);
      setSettings(updated);
      return updated;
    },
    [user]
  );

  const updateUserProfile = useCallback(
    async (name) => {
      const activeUserId = user?.id || 'demo-user-id';
      const updated = await updateProfile(activeUserId, { name });
      setProfile(updated);
      return updated;
    },
    [user]
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    setSettings(null);
    setTransactions([]);
    setMonthlyTargets([]);
    setExpenses([]);
    setMonthlyBudgets({});
    setCategoryBudgets({});
    router.push('/login');
  }, [router]);

  const exportData = useCallback(async () => {
    if (!user) return null;
    return await exportBackupData(user.id);
  }, [user]);

  const importData = useCallback(
    async (backupJson) => {
      if (!user) throw new Error('Silakan login terlebih dahulu');
      await importBackupData(user.id, backupJson);
      await loadFinanceData(user);
    },
    [user, loadFinanceData]
  );

  const value = {
    user,
    profile,
    settings,
    transactions,
    monthlyTargets,
    expenses,
    monthlyBudgets,
    categoryBudgets,
    currentMonthBudget,
    currentMonthExpenseStats,
    currentMonthIncome,
    currentMonthCashFlow,
    loading,
    isSupabaseConfigured,
    totalBalance,
    progressInfo,
    currentMonthStats,
    financialStatus,
    trajectory,
    activeMonthKey,
    addTransaction,
    editTransaction,
    removeTransaction,
    toggleTarget,
    addExpense,
    editExpense,
    removeExpense,
    updateBudget,
    updateCategoryBudgets,
    updateSettings,
    updateUserProfile,
    logout,
    exportData,
    importData,
    refreshData: (overrideUser) => loadFinanceData(overrideUser || user),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
