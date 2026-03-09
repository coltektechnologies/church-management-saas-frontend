/* ──────────────────────────────────────────────────────────
   Treasury Mock Data
   Replace with real API responses when backend is ready.
   ────────────────────────────────────────────────────────── */

import type {
  TreasurySummary,
  MonthlyTrend,
  Transaction,
  IncomeCategory,
  ExpenseCategory,
  MemberContribution,
  DepartmentBudget,
  ExpenseRequest,
} from './treasuryService';

/* ─── Summary ─── */
export const MOCK_SUMMARY: TreasurySummary = {
  totalIncome: 14500,
  netBalance: 5240,
  totalExpenses: 8340,
  totalIncomeAllTime: 98240,
  incomeChangePercent: 12.5,
  expenseChangePercent: -4.6,
};

/* ─── Income vs Expenses Trend (12 months) ─── */
export const MOCK_MONTHLY_TREND: MonthlyTrend[] = [
  { month: 'Jan', income: 9200, expenses: 7800 },
  { month: 'Feb', income: 10400, expenses: 8200 },
  { month: 'Mar', income: 8600, expenses: 7400 },
  { month: 'Apr', income: 11200, expenses: 9100 },
  { month: 'May', income: 12800, expenses: 8700 },
  { month: 'Jun', income: 9800, expenses: 8400 },
  { month: 'Jul', income: 11500, expenses: 9300 },
  { month: 'Aug', income: 14500, expenses: 8340 },
  { month: 'Sep', income: 10200, expenses: 8800 },
  { month: 'Oct', income: 13100, expenses: 9500 },
  { month: 'Nov', income: 11800, expenses: 8900 },
  { month: 'Dec', income: 15200, expenses: 10100 },
];

/* ─── Recent Transactions ─── */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    description: 'Tithe collection',
    type: 'income',
    amount: 4500,
    date: '2024-08-17',
    category: 'Tithes',
    icon: '💰',
  },
  {
    id: 'txn-2',
    description: 'Electricity Bill',
    type: 'expense',
    amount: 1450,
    date: '2024-08-15',
    category: 'Utilities',
    icon: '⚡',
  },
  {
    id: 'txn-3',
    description: 'Child Offering',
    type: 'income',
    amount: 820,
    date: '2024-08-14',
    category: "Children's Offering",
    icon: '🧒',
  },
  {
    id: 'txn-4',
    description: 'Pastoral Offering',
    type: 'income',
    amount: 2300,
    date: '2024-08-12',
    category: 'Special Offerings',
    icon: '🎯',
  },
  {
    id: 'txn-5',
    description: 'Electricity Bill',
    type: 'expense',
    amount: 1200,
    date: '2024-08-10',
    category: 'Utilities',
    icon: '⚡',
  },
  {
    id: 'txn-6',
    description: 'Building Maintenance',
    type: 'expense',
    amount: 3200,
    date: '2024-08-08',
    category: 'Maintenance',
    icon: '🔧',
  },
  {
    id: 'txn-7',
    description: 'Sunday Offering',
    type: 'income',
    amount: 3100,
    date: '2024-08-06',
    category: 'Offerings',
    icon: '🙏',
  },
  {
    id: 'txn-8',
    description: 'Staff Salaries',
    type: 'expense',
    amount: 4800,
    date: '2024-08-01',
    category: 'Salaries',
    icon: '👔',
  },
];

/* ─── Income Breakdown ─── */
export const MOCK_INCOME_BREAKDOWN: IncomeCategory[] = [
  { name: 'General Offerings', value: 45000, color: '#10b981' },
  { name: 'Tithes', value: 32000, color: '#3b82f6' },
  { name: 'Special Offerings', value: 18000, color: '#f59e0b' },
  { name: 'Harvest/Seeds', value: 12000, color: '#8b5cf6' },
  { name: 'Donations', value: 17830, color: '#ec4899' },
];

/* ─── Expense Breakdown ─── */
export const MOCK_EXPENSE_BREAKDOWN: ExpenseCategory[] = [
  { name: 'Staff Salaries', value: 35000, color: '#ef4444' },
  { name: 'Utilities', value: 8500, color: '#f97316' },
  { name: 'Maintenance', value: 12000, color: '#eab308' },
  { name: 'Programmes', value: 9800, color: '#22c55e' },
  { name: 'Outreach', value: 6200, color: '#06b6d4' },
  { name: 'Miscellaneous', value: 4300, color: '#a855f7' },
];

/* ─── Member Contributions ─── */
export const MOCK_MEMBER_CONTRIBUTIONS: MemberContribution[] = [
  {
    id: 'mc-1',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 2400,
    lastDate: '2024-08-15',
    contributions: [
      { date: '2024-08-15', amount: 800, type: 'Tithe' },
      { date: '2024-07-12', amount: 1600, type: 'Offering' },
    ],
  },
  {
    id: 'mc-2',
    name: 'David Wilson',
    avatar: '',
    totalAmount: 1700,
    lastDate: '2024-08-14',
    contributions: [{ date: '2024-08-14', amount: 1700, type: 'Tithe' }],
  },
  {
    id: 'mc-3',
    name: 'James Lamptey Boat',
    avatar: '',
    totalAmount: 3200,
    lastDate: '2024-08-12',
    contributions: [
      { date: '2024-08-12', amount: 1200, type: 'Tithe' },
      { date: '2024-07-20', amount: 2000, type: 'Offering' },
    ],
  },
  {
    id: 'mc-4',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 1950,
    lastDate: '2024-08-10',
    contributions: [{ date: '2024-08-10', amount: 1950, type: 'Offering' }],
  },
  {
    id: 'mc-5',
    name: 'Grace Williams',
    avatar: '',
    totalAmount: 1400,
    lastDate: '2024-08-09',
    contributions: [{ date: '2024-08-09', amount: 1400, type: 'Tithe' }],
  },
  {
    id: 'mc-6',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 4500,
    lastDate: '2024-08-08',
    contributions: [
      { date: '2024-08-08', amount: 2500, type: 'Tithe' },
      { date: '2024-07-15', amount: 2000, type: 'Harvest/seed' },
    ],
  },
  {
    id: 'mc-7',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 1600,
    lastDate: '2024-08-06',
    contributions: [{ date: '2024-08-06', amount: 1600, type: 'Offering' }],
  },
  {
    id: 'mc-8',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 2100,
    lastDate: '2024-08-04',
    contributions: [{ date: '2024-08-04', amount: 2100, type: 'Tithe' }],
  },
  {
    id: 'mc-9',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 1200,
    lastDate: '2024-08-02',
    contributions: [{ date: '2024-08-02', amount: 1200, type: 'Offering' }],
  },
  {
    id: 'mc-10',
    name: 'Owusu Williams',
    avatar: '',
    totalAmount: 3100,
    lastDate: '2024-08-01',
    contributions: [{ date: '2024-08-01', amount: 3100, type: 'Offering' }],
  },
];

/* ─── Department Budgets ─── */
export const MOCK_DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  { id: 'dbud-1', name: 'Secretariat', allocated: 12500, utilized: 8400, color: '#3b82f6' },
  { id: 'dbud-2', name: 'Youth Min.', allocated: 8000, utilized: 5200, color: '#10b981' },
  { id: 'dbud-3', name: 'Evangelism', allocated: 6500, utilized: 4100, color: '#f59e0b' },
  { id: 'dbud-4', name: 'Pastoral Ministry', allocated: 15000, utilized: 12800, color: '#ef4444' },
  { id: 'dbud-5', name: 'Koforidua Mission', allocated: 4000, utilized: 3200, color: '#a855f7' },
  { id: 'dbud-6', name: 'Admin/ICT Tools', allocated: 9500, utilized: 6400, color: '#06b6d4' },
];

/* ─── Pending Expense Requests ─── */
export const MOCK_EXPENSE_REQUESTS: ExpenseRequest[] = [
  {
    id: 'ereq-1',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Acheaw',
    date: '2024-08-05',
    amount: 4150,
    status: 'pending',
  },
  {
    id: 'ereq-2',
    title: 'Sound System Repair',
    department: 'Media/Sound',
    requestedBy: 'Bro. Daniel Owusu',
    date: '2024-08-03',
    amount: 2800,
    status: 'pending',
  },
  {
    id: 'ereq-3',
    title: 'Outreach Materials',
    department: 'Personal Ministry',
    requestedBy: 'Sis. Michael Johnson',
    date: '2024-07-28',
    amount: 1350,
    status: 'pending',
  },
  {
    id: 'ereq-4',
    title: 'Cleaning Materials',
    department: 'Sabbath School',
    requestedBy: 'Bro. David Miller',
    date: '2024-08-02',
    amount: 620,
    status: 'pending',
  },
  {
    id: 'ereq-5',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Sis. Sandra Mensah',
    date: '2024-08-01',
    amount: 1150,
    status: 'pending',
  },
  {
    id: 'ereq-6',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Acheaw',
    date: '2024-07-30',
    amount: 2450,
    status: 'pending',
  },
];
