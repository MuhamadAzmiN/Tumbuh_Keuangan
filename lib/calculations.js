import { APP_CONFIG, CONTRACT_MONTHS } from './constants';
import { formatCurrency } from './formatters';

/**
 * Calculate total current balance:
 * initialBalance + sum of all transactions.
 * (Checklists do NOT affect balance).
 */
export function calculateTotalBalance(initialBalance = APP_CONFIG.initialBalance, transactions = []) {
  const base = Number(initialBalance) || 0;
  const txSum = transactions.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  return base + txSum;
}

/**
 * Calculate target progress details
 */
export function calculateTargetProgress(currentBalance, targetAmount = APP_CONFIG.targetAmount) {
  const target = Number(targetAmount) || APP_CONFIG.targetAmount;
  const current = Number(currentBalance) || 0;
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);
  const isReached = current >= target;

  return {
    current,
    target,
    percentage: Math.min(percentage, 100),
    rawPercentage: percentage,
    remaining,
    isReached,
  };
}

/**
 * Extract YYYY-MM from a date string (YYYY-MM-DD)
 */
export function getMonthKey(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 7);
}

/**
 * Calculate stats for a specific month
 */
export function calculateMonthStats(monthKey, transactions = [], settings = {}) {
  const salaryTarget = Number(settings.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget;
  const freelanceTarget = Number(settings.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget;
  const totalTarget = salaryTarget + freelanceTarget;

  const monthTx = transactions.filter((tx) => getMonthKey(tx.transaction_date) === monthKey);

  let salaryActual = 0;
  let freelanceActual = 0;
  let savingActual = 0;
  let otherActual = 0;

  monthTx.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'salary') salaryActual += amt;
    else if (tx.type === 'freelance') freelanceActual += amt;
    else if (tx.type === 'saving') savingActual += amt;
    else otherActual += amt;
  });

  const totalActual = salaryActual + freelanceActual + savingActual + otherActual;
  const remaining = Math.max(0, totalTarget - totalActual);
  const progress = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
  const salaryProgress = salaryTarget > 0 ? (salaryActual / salaryTarget) * 100 : 0;
  const freelanceProgress = freelanceTarget > 0 ? (freelanceActual / freelanceTarget) * 100 : 0;

  return {
    monthKey,
    salaryTarget,
    freelanceTarget,
    totalTarget,
    salaryActual,
    freelanceActual,
    savingActual,
    otherActual,
    totalActual,
    remaining,
    progress: Math.min(progress, 100),
    rawProgress: progress,
    salaryProgress: Math.min(salaryProgress, 100),
    freelanceProgress: Math.min(freelanceProgress, 100),
    transactionCount: monthTx.length,
    isTargetMet: totalActual >= totalTarget,
  };
}

/**
 * Get current active month key based on real or simulated system time
 */
export function getCurrentContractMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const key = `${year}-${month}`;

  // If before contract start, clamp to first month
  if (key < '2026-10') return '2026-10';
  // If after contract end, clamp to last month
  if (key > '2027-09') return '2027-09';
  return key;
}

/**
 * Determine financial status:
 * 🟢 On Track
 * 🟡 Behind
 * 🏆 Target Reached
 */
export function calculateFinancialStatus(currentBalance, targetAmount = APP_CONFIG.targetAmount, initialBalance = APP_CONFIG.initialBalance, transactions = [], settings = {}) {
  const target = Number(targetAmount) || APP_CONFIG.targetAmount;
  const initial = Number(initialBalance) || APP_CONFIG.initialBalance;
  const balance = Number(currentBalance) || 0;

  if (balance >= target) {
    return {
      status: 'TARGET_REACHED',
      label: 'Target Reached',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      icon: '🏆',
      message: 'Rp50 juta berhasil dicapai!',
      diff: 0,
    };
  }

  // Calculate elapsed months up to current month in contract
  const currentKey = getCurrentContractMonthKey();
  const currentMonthIdx = CONTRACT_MONTHS.findIndex((m) => m.key === currentKey);
  const elapsedMonths = currentMonthIdx >= 0 ? currentMonthIdx + 1 : 1;

  const monthlyTarget = (Number(settings.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget) +
    (Number(settings.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget);

  // Expected balance at the end of current elapsed month
  const expectedPace = initial + elapsedMonths * monthlyTarget;

  if (balance >= expectedPace) {
    return {
      status: 'ON_TRACK',
      label: 'On Track',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      icon: '🟢',
      message: 'Perjalanan kamu masih sesuai target.',
      diff: balance - expectedPace,
    };
  } else {
    const behindAmount = expectedPace - balance;
    return {
      status: 'BEHIND',
      label: 'Behind',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
      icon: '🟡',
      message: `Kamu tertinggal ${formatCurrency(behindAmount)} dari target bulan ini.`,
      diff: behindAmount,
    };
  }
}

/**
 * Build trajectory data points for the 12 months for chart & progress visualization
 */
export function calculateTrajectory(initialBalance = APP_CONFIG.initialBalance, settings = {}, transactions = []) {
  const initial = Number(initialBalance) || APP_CONFIG.initialBalance;
  const salaryTarget = Number(settings.monthly_salary_target) || APP_CONFIG.monthlySalaryTarget;
  const freelanceTarget = Number(settings.monthly_freelance_target) || APP_CONFIG.monthlyFreelanceTarget;
  const monthlyTarget = salaryTarget + freelanceTarget;

  let cumulativeActual = initial;

  return CONTRACT_MONTHS.map((month, idx) => {
    // Ideal cumulative target for this month
    const idealCumulative = initial + (idx + 1) * monthlyTarget;

    // Monthly actual transactions
    const monthStats = calculateMonthStats(month.key, transactions, settings);
    cumulativeActual += monthStats.totalActual;

    return {
      ...month,
      index: idx + 1,
      idealCumulative,
      actualCumulative: cumulativeActual,
      monthlyActual: monthStats.totalActual,
      monthlyTarget,
      monthStats,
    };
  });
}

/**
 * Get previous month key ('YYYY-MM')
 */
export function getPreviousMonthKey(monthKey) {
  if (!monthKey || !monthKey.includes('-')) return '';
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  if (month === 1) {
    year -= 1;
    month = 12;
  } else {
    month -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Calculate comprehensive monthly expense statistics
 */
export function calculateMonthlyExpenseStats(monthKey, expenses = [], budgetAmount = 2000000) {
  const monthExpenses = expenses.filter((e) => getMonthKey(e.expense_date) === monthKey);

  const totalExpense = monthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const transactionCount = monthExpenses.length;

  // Largest single expense
  let largestExpense = null;
  monthExpenses.forEach((e) => {
    const amt = Number(e.amount) || 0;
    if (!largestExpense || amt > largestExpense.amount) {
      largestExpense = { ...e, amount: amt };
    }
  });

  // Calculate days in month for daily average
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  // If calculating for current real-time month, we can divide by elapsed days or total days
  const now = new Date();
  const isCurrentRealMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;
  const daysDivider = isCurrentRealMonth ? Math.max(1, now.getDate()) : daysInMonth;
  const dailyAverage = Math.round(totalExpense / daysDivider);

  // Category breakdown
  const categoryMap = {};
  monthExpenses.forEach((e) => {
    const cat = e.category || 'Lainnya';
    const amt = Number(e.amount) || 0;
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, amount: 0, count: 0 };
    }
    categoryMap[cat].amount += amt;
    categoryMap[cat].count += 1;
  });

  const categoryBreakdown = Object.values(categoryMap)
    .map((item) => ({
      ...item,
      percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const largestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  // Budget calculations
  const budget = Number(budgetAmount) || 0;
  const remainingBudget = Math.max(0, budget - totalExpense);
  const budgetUsedPercentage = budget > 0 ? (totalExpense / budget) * 100 : 0;

  let budgetStatus = 'AMAN';
  let budgetStatusLabel = 'Aman';
  let budgetBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (budgetUsedPercentage > 100) {
    budgetStatus = 'OVER_BUDGET';
    budgetStatusLabel = 'Melewati budget';
    budgetBadgeColor = 'bg-red-50 text-red-700 border-red-200';
  } else if (budgetUsedPercentage >= 70) {
    budgetStatus = 'NEAR_LIMIT';
    budgetStatusLabel = 'Mendekati batas';
    budgetBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  // Previous month comparison
  const prevMonthKey = getPreviousMonthKey(monthKey);
  const prevMonthExpenses = expenses.filter((e) => getMonthKey(e.expense_date) === prevMonthKey);
  const prevTotalExpense = prevMonthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  let comparisonWithPrev = null;
  if (prevTotalExpense > 0) {
    const diff = totalExpense - prevTotalExpense;
    const diffPct = (Math.abs(diff) / prevTotalExpense) * 100;
    comparisonWithPrev = {
      prevTotalExpense,
      diff,
      diffPercentage: diffPct,
      isLower: totalExpense < prevTotalExpense,
      isEqual: totalExpense === prevTotalExpense,
      isHigher: totalExpense > prevTotalExpense,
    };
  }

  return {
    monthKey,
    totalExpense,
    transactionCount,
    largestExpense,
    dailyAverage,
    categoryBreakdown,
    largestCategory,
    budget,
    remainingBudget,
    budgetUsedPercentage,
    budgetStatus,
    budgetStatusLabel,
    budgetBadgeColor,
    comparisonWithPrev,
    filteredExpenses: monthExpenses,
  };
}

