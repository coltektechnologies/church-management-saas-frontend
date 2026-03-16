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
  totalIncome: 24580,
  netBalance: 16240,
  totalExpenses: 18340,
  totalIncomeAllTime: 8,
  incomeChangePercent: 8.05,
  expenseChangePercent: -1.05,
  totalIncomeAllTimeChangePercent: 5,
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
    description: 'Tithe Collection',
    type: 'income',
    amount: 12500,
    date: '2024-08-05',
    category: 'Sabbath Service',
    icon: '↓',
  },
  {
    id: 'txn-2',
    description: 'Electricity Bill',
    type: 'expense',
    amount: 850,
    date: '2024-08-04',
    category: 'Monthly utility payment',
    icon: '↓',
  },
  {
    id: 'txn-3',
    description: 'General Offering',
    type: 'income',
    amount: 3800,
    date: '2024-08-03',
    category: 'Mid-week Service',
    icon: '↓',
  },
  {
    id: 'txn-4',
    description: 'Pastor Allowance',
    type: 'expense',
    amount: 1200,
    date: '2024-08-02',
    category: 'Monthly stipend',
    icon: '↓',
  },
  {
    id: 'txn-5',
    description: 'Project Offering',
    type: 'income',
    amount: 12500,
    date: '2024-08-04',
    category: 'Monthly utility payment',
    icon: '↓',
  },
  {
    id: 'txn-6',
    description: 'Electricity Bill',
    type: 'expense',
    amount: 12500,
    date: '2024-08-04',
    category: 'Monthly utility payment',
    icon: '↓',
  },
];

/* ─── Income Breakdown ─── */
export const MOCK_INCOME_BREAKDOWN: IncomeCategory[] = [
  { name: 'General Offerings', value: 45000, color: '#31C48D' },
  { name: 'Tithe', value: 32000, color: '#0E9F6E' },
  { name: 'Project Offerings', value: 18000, color: '#84E1BC' },
  { name: 'Sabbath School', value: 12000, color: '#046C4E' },
  { name: 'Donations', value: 17830, color: '#0284C7' },
];

/* ─── Expense Breakdown ─── */
export const MOCK_EXPENSE_BREAKDOWN: ExpenseCategory[] = [
  { name: 'Staff Salaries', value: 35000, color: '#F05252' },
  { name: 'Utilities', value: 8500, color: '#E3A008' },
  { name: 'Ministry Programs', value: 12000, color: '#FF8A4C' },
  { name: 'Maintenance', value: 9800, color: '#9061F9' },
  { name: 'Outreach', value: 6200, color: '#E74694' },
  { name: 'Other Expenses', value: 4300, color: '#A51D2D' },
];

/* ─── Member Contributions ─── */
export const MOCK_MEMBER_CONTRIBUTIONS: MemberContribution[] = [
  {
    id: '10482B-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-15',
    contributions: [{ date: '2024-08-15', amount: 1500, type: 'Tithe' }],
  },
  {
    id: '10482C-OH',
    name: 'David Wilson',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-14',
    contributions: [{ date: '2024-08-14', amount: 1500, type: 'Tithe' }],
  },
  {
    id: '10482D-OH',
    name: 'Jonas Lantam Goati',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-12',
    contributions: [{ date: '2024-08-12', amount: 1500, type: 'Offering' }],
  },
  {
    id: '10482E-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-10',
    contributions: [{ date: '2024-08-10', amount: 1500, type: 'Offering' }],
  },
  {
    id: '10482F-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-09',
    contributions: [{ date: '2024-08-09', amount: 1500, type: 'Tithe' }],
  },
  {
    id: '10482G-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-08',
    contributions: [{ date: '2024-08-08', amount: 1500, type: 'Tithe' }],
  },
  {
    id: '10482H-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-06',
    contributions: [{ date: '2024-08-06', amount: 1500, type: 'Offering' }],
  },
  {
    id: '10482I-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-04',
    contributions: [{ date: '2024-08-04', amount: 1500, type: 'Tithe' }],
  },
  {
    id: '10482J-OH',
    name: 'Owusu William',
    avatar: '',
    phone: '+233596004388',
    status: 'ACTIVE',
    totalAmount: 1500,
    lastDate: '2024-08-02',
    contributions: [{ date: '2024-08-02', amount: 1500, type: 'Offering' }],
  },
];

/* ─── Department Budgets ─── */
export const MOCK_DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  { id: 'dbud-1', name: 'Secretariat', allocated: 4352.0, utilized: 4127.0, color: '#10b981' },
  { id: 'dbud-2', name: 'Treasury', allocated: 4352.0, utilized: 4127.0, color: '#ff8a4c' },
  { id: 'dbud-3', name: 'Deaconry', allocated: 4352.0, utilized: 4127.0, color: '#f59e0b' },
  {
    id: 'dbud-4',
    name: 'Personal Ministry',
    allocated: 4352.0,
    utilized: 4127.0,
    color: '#a855f7',
  },
  { id: 'dbud-5', name: 'Sabbath School', allocated: 4352.0, utilized: 4127.0, color: '#3b82f6' },
  { id: 'dbud-6', name: 'Adventist Youth', allocated: 4352.0, utilized: 4127.0, color: '#ec4899' },
  { id: 'dbud-7', name: 'Secretariat', allocated: 4352.0, utilized: 4127.0, color: '#10b981' },
  { id: 'dbud-8', name: 'Secretariat', allocated: 4352.0, utilized: 4127.0, color: '#10b981' },
];

/* ─── Pending Expense Requests ─── */
export const MOCK_EXPENSE_REQUESTS: ExpenseRequest[] = [
  {
    id: '1580-B001',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Wilson',
    date: '2024-08-05',
    amount: 1250,
    status: 'pending',
  },
  {
    id: '1580-B002',
    title: 'Sound System Repair',
    department: 'Music Ministry',
    requestedBy: 'Bro. Daniel Clark',
    date: '2024-08-05',
    amount: 5050,
    status: 'pending',
  },
  {
    id: '1580-B003',
    title: 'Outreach Materials',
    department: 'Personal Ministry',
    requestedBy: 'Bro. Michael Johnson',
    date: '2024-08-04',
    amount: 1250,
    status: 'pending',
  },
  {
    id: '1580-B004',
    title: 'Quarterly Materials',
    department: 'Sabbath School',
    requestedBy: 'Sis. Sarah Miller',
    date: '2024-08-03',
    amount: 3420,
    status: 'pending',
  },
  {
    id: '1580-B005',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Wilson',
    date: '2024-08-05',
    amount: 1250,
    status: 'pending',
  },
  {
    id: '1580-B006',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Wilson',
    date: '2024-08-05',
    amount: 1250,
    status: 'pending',
  },
];
