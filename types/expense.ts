export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface Expense {
  id: string;
  expenseRef: string; // e.g. EXP-2024-00142 — used by Treasury for reporting
  title: string;
  category?: string;
  description: string;
  submitterName: string;
  items: ExpenseItem[];
  amount: number; // grand total derived from items
  documents: string[]; // file names only (File objects can't be serialized)
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}
