export const APP_CONFIG = {
  appName: 'Tumbuh',
  targetAmount: 50000000,
  initialBalance: 10950000,
  monthlySalaryTarget: 2000000,
  monthlyFreelanceTarget: 1300000,
  monthlyTotalTarget: 3300000,
  savingsPercentage: 50,
  needsPercentage: 50,
  contractStart: '2026-10-01',
  contractEnd: '2027-09-30',
  reminders: {
    salaryDay: 1,
    freelanceDay: 25,
    contractEndLabel: '30 September 2027',
  },
};

export const CONTRACT_MONTHS = [
  { key: '2026-10', label: 'Oktober 2026', shortLabel: 'Okt 26', year: 2026, monthIndex: 9, dateStr: '2026-10-01' },
  { key: '2026-11', label: 'November 2026', shortLabel: 'Nov 26', year: 2026, monthIndex: 10, dateStr: '2026-11-01' },
  { key: '2026-12', label: 'Desember 2026', shortLabel: 'Des 26', year: 2026, monthIndex: 11, dateStr: '2026-12-01' },
  { key: '2027-01', label: 'Januari 2027', shortLabel: 'Jan 27', year: 2027, monthIndex: 0, dateStr: '2027-01-01' },
  { key: '2027-02', label: 'Februari 2027', shortLabel: 'Feb 27', year: 2027, monthIndex: 1, dateStr: '2027-02-01' },
  { key: '2027-03', label: 'Maret 2027', shortLabel: 'Mar 27', year: 2027, monthIndex: 2, dateStr: '2027-03-01' },
  { key: '2027-04', label: 'April 2027', shortLabel: 'Apr 27', year: 2027, monthIndex: 3, dateStr: '2027-04-01' },
  { key: '2027-05', label: 'Mei 2027', shortLabel: 'Mei 27', year: 2027, monthIndex: 4, dateStr: '2027-05-01' },
  { key: '2027-06', label: 'Juni 2027', shortLabel: 'Jun 27', year: 2027, monthIndex: 5, dateStr: '2027-06-01' },
  { key: '2027-07', label: 'Juli 2027', shortLabel: 'Jul 27', year: 2027, monthIndex: 6, dateStr: '2027-07-01' },
  { key: '2027-08', label: 'Agustus 2027', shortLabel: 'Agu 27', year: 2027, monthIndex: 7, dateStr: '2027-08-01' },
  { key: '2027-09', label: 'September 2027', shortLabel: 'Sep 27', year: 2027, monthIndex: 8, dateStr: '2027-09-01' },
];

export const TRANSACTION_TYPES = [
  { value: 'salary', label: 'Nabung Gaji', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'freelance', label: 'Freelance', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'saving', label: 'Tabungan', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'other', label: 'Lainnya', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export const MILESTONES = [
  { amount: 10950000, label: 'Rp10,95 JT', desc: 'Saldo Awal' },
  { amount: 20000000, label: 'Rp20 JT', desc: 'Milestone 1' },
  { amount: 30000000, label: 'Rp30 JT', desc: 'Milestone 2' },
  { amount: 40000000, label: 'Rp40 JT', desc: 'Milestone 3' },
  { amount: 50000000, label: 'Rp50 JT', desc: 'Target Akhir' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'Makanan', label: 'Makanan', icon: 'Utensils' },
  { value: 'Transportasi', label: 'Transportasi', icon: 'Car' },
  { value: 'Rokok', label: 'Rokok', icon: 'Cigarette' },
  { value: 'Tagihan', label: 'Tagihan', icon: 'Receipt' },
  { value: 'Belanja', label: 'Belanja', icon: 'ShoppingBag' },
  { value: 'Hiburan', label: 'Hiburan', icon: 'Film' },
  { value: 'Kesehatan', label: 'Kesehatan', icon: 'HeartPulse' },
  { value: 'Keluarga', label: 'Keluarga', icon: 'Users' },
  { value: 'Kebutuhan kerja', label: 'Kebutuhan kerja', icon: 'Briefcase' },
  { value: 'Lainnya', label: 'Lainnya', icon: 'MoreHorizontal' },
];

export const PAYMENT_METHODS = [
  'Cash',
  'Bank',
  'E-Wallet',
  'Debit',
  'Credit',
];

