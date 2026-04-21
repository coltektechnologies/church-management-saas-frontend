'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/* ─── Treasury Specific Types ─── */

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  fiscalYear: string;
  status: 'Draft' | 'Active' | 'Closed';
}

export interface Fund {
  id: string;
  name: string;
  balance: number;
  purpose: string;
  restricted: boolean;
}

export interface TreasuryAuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

/* ─── Context Shape ─── */

interface TreasuryDataContextType {
  budgets: Budget[];
  funds: Fund[];
  auditLogs: TreasuryAuditLog[];
  isLocked: boolean;

  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  setFunds: React.Dispatch<React.SetStateAction<Fund[]>>;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;

  // Actions
  addBudget: (b: Budget) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  allocateFunds: (fundId: string, amount: number) => void;
  logTreasuryAction: (action: string, details: string) => void;

  // Derived Financial Insights
  totalAllocatedBudget: number;
  totalSpentBudget: number;
  budgetUtilization: number; // Percentage
  availableLiquidity: number;
}

const TreasuryDataContext = createContext<TreasuryDataContextType | undefined>(undefined);

export const TreasuryDataProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [auditLogs, setAuditLogs] = useState<TreasuryAuditLog[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  /* ── Treasury Logger ── */
  const logTreasuryAction = useCallback((action: string, details: string) => {
    const newLog: TreasuryAuditLog = {
      id: `audit-${Date.now()}`,
      action,
      details,
      performedBy: 'Current User', // Replace with Auth context if available
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev].slice(0, 200));
  }, []);

  /* ── Actions ── */
  const addBudget = useCallback(
    (b: Budget) => {
      setBudgets((prev) => [b, ...prev]);
      logTreasuryAction('Budget Created', `Category: ${b.category}`);
    },
    [logTreasuryAction]
  );

  const updateBudget = useCallback(
    (id: string, patch: Partial<Budget>) => {
      setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      logTreasuryAction('Budget Updated', `ID: ${id}`);
    },
    [logTreasuryAction]
  );

  const allocateFunds = useCallback(
    (fundId: string, amount: number) => {
      setFunds((prev) =>
        prev.map((f) => (f.id === fundId ? { ...f, balance: f.balance + amount } : f))
      );
      logTreasuryAction('Funds Allocated', `Amount: ₵${amount.toLocaleString()}`);
    },
    [logTreasuryAction]
  );

  /* ── Derived Stats ── */
  const derived = useMemo(() => {
    const totalAllocatedBudget = budgets.reduce((s, b) => s + b.allocated, 0);
    const totalSpentBudget = budgets.reduce((s, b) => s + b.spent, 0);
    const availableLiquidity = funds.reduce((s, f) => s + f.balance, 0);

    const budgetUtilization =
      totalAllocatedBudget > 0 ? Math.round((totalSpentBudget / totalAllocatedBudget) * 100) : 0;

    return {
      totalAllocatedBudget,
      totalSpentBudget,
      budgetUtilization,
      availableLiquidity,
    };
  }, [budgets, funds]);

  return (
    <TreasuryDataContext.Provider
      value={{
        budgets,
        funds,
        auditLogs,
        isLocked,
        setBudgets,
        setFunds,
        setIsLocked,
        addBudget,
        updateBudget,
        allocateFunds,
        logTreasuryAction,
        ...derived,
      }}
    >
      {children}
    </TreasuryDataContext.Provider>
  );
};

export const useTreasuryData = () => {
  const ctx = useContext(TreasuryDataContext);
  if (!ctx) {
    throw new Error('useTreasuryData must be used within <TreasuryDataProvider>');
  }
  return ctx;
};
