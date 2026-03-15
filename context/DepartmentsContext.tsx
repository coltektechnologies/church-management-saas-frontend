'use client';

import { createContext, useContext, useState } from 'react';
import { Department } from '@/types/Department';
import { Activity } from '@/types/activity';
import { Expense } from '@/types/expense';
import { BudgetRequest } from '@/types/budget';

// ─── Types ───────────────────────────────────────────────────────────────────

type DepartmentMember = {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
};

type DepartmentsContextType = {
  // Departments
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  updateDepartment: (updated: Department) => void;

  // Members per department
  departmentMembersMap: Record<string, DepartmentMember[]>;
  setDepartmentMembersMap: React.Dispatch<React.SetStateAction<Record<string, DepartmentMember[]>>>;

  // Activities per department
  departmentActivitiesMap: Record<string, Activity[]>;
  addActivity: (departmentId: string, activity: Activity) => void;
  deleteActivity: (departmentId: string, activityId: string) => void;

  // Expenses per department
  departmentExpensesMap: Record<string, Expense[]>;
  submitExpense: (departmentId: string, expense: Expense) => void;
  updateExpense: (departmentId: string, expenseId: string, updatedExpense: Expense) => void;

  // Budget requests — pending approval pipeline
  budgetRequests: BudgetRequest[];
  submitBudgetRequest: (request: BudgetRequest) => void;
  approveBudgetRequest: (requestId: string) => void;
  rejectBudgetRequest: (requestId: string) => void;

  // Loading/error states — ready for API integration
  loading: boolean;
  error: string | null;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Secretariat',
    code: 'SEC-001',
    description: 'Records, communication, documentation management',
    members: 5,
    activities: 12,
    budgetUsed: 5000,
    annualBudget: 10000,
    status: 'active',
    themeColor: 'navy',
    icon: '📖',
    dateEstablished: '10/01/2022',
    settings: {
      autoApprovalThreshold: 5,
      requiresElderApproval: true,
      weeklySummary: true,
      canSubmitAnnouncements: true,
    },
  },
  {
    id: '2',
    name: 'Treasury',
    code: 'TRD-002',
    description: 'Financial oversight and budget control',
    members: 4,
    activities: 8,
    budgetUsed: 3000,
    annualBudget: 10000,
    status: 'active',
    themeColor: 'green',
    icon: '💰',
    dateEstablished: '10/01/2022',
    settings: {
      autoApprovalThreshold: 5,
      requiresElderApproval: true,
      weeklySummary: true,
      canSubmitAnnouncements: true,
    },
  },
  {
    id: '3',
    name: 'Deaconry',
    code: 'DCN-003',
    description: 'Community welfare and support',
    members: 6,
    activities: 10,
    budgetUsed: 6000,
    annualBudget: 10000,
    status: 'inactive',
    themeColor: 'purple',
    icon: '🤝',
    dateEstablished: '10/01/2022',
    settings: {
      autoApprovalThreshold: 5,
      requiresElderApproval: true,
      weeklySummary: true,
      canSubmitAnnouncements: true,
    },
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const DepartmentsContext = createContext<DepartmentsContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function DepartmentsProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [departmentMembersMap, setDepartmentMembersMap] = useState<
    Record<string, DepartmentMember[]>
  >({});
  const [departmentActivitiesMap, setDepartmentActivitiesMap] = useState<
    Record<string, Activity[]>
  >({});
  const [departmentExpensesMap, setDepartmentExpensesMap] = useState<Record<string, Expense[]>>({});
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);

  const loading = false;
  const error = null;

  // ── Department handlers ──

  const updateDepartment = (updated: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // ── Activity handlers ──

  const addActivity = (departmentId: string, activity: Activity) => {
    setDepartmentActivitiesMap((prev) => ({
      ...prev,
      [departmentId]: [...(prev[departmentId] || []), activity],
    }));
    setDepartments((prev) =>
      prev.map((d) => (d.id === departmentId ? { ...d, activities: d.activities + 1 } : d))
    );
  };

  const deleteActivity = (departmentId: string, activityId: string) => {
    setDepartmentActivitiesMap((prev) => ({
      ...prev,
      [departmentId]: (prev[departmentId] || []).filter((a) => a.id !== activityId),
    }));
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === departmentId ? { ...d, activities: Math.max(d.activities - 1, 0) } : d
      )
    );
  };

  // ── Expense handlers ──

  const submitExpense = (departmentId: string, expense: Expense) => {
    const department = departments.find((d) => d.id === departmentId);
    const threshold = department?.settings.autoApprovalThreshold ?? 0;

    const finalExpense: Expense =
      expense.amount <= threshold
        ? { ...expense, status: 'approved', reviewedAt: new Date().toISOString() }
        : expense;

    setDepartmentExpensesMap((prev) => ({
      ...prev,
      [departmentId]: [...(prev[departmentId] || []), finalExpense],
    }));

    if (finalExpense.status === 'approved') {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === departmentId ? { ...d, budgetUsed: d.budgetUsed + finalExpense.amount } : d
        )
      );
    }
  };

  const updateExpense = (departmentId: string, expenseId: string, updatedExpense: Expense) => {
    setDepartmentExpensesMap((prev) => {
      const updatedList = (prev[departmentId] || []).map((e) =>
        e.id === expenseId ? updatedExpense : e
      );

      const totalApproved = updatedList
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);

      setDepartments((deps) =>
        deps.map((d) => (d.id === departmentId ? { ...d, budgetUsed: totalApproved } : d))
      );

      return { ...prev, [departmentId]: updatedList };
    });
  };

  // ── Budget request handlers ──

  // Submit: creates a pending request
  const submitBudgetRequest = (request: BudgetRequest) => {
    setBudgetRequests((prev) => [...prev, request]);
  };

  // Approve: marks request approved AND updates the department's annualBudget
  const approveBudgetRequest = (requestId: string) => {
    setBudgetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r
      )
    );

    const request = budgetRequests.find((r) => r.id === requestId);
    if (request) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === request.departmentId ? { ...d, annualBudget: request.grandTotal } : d
        )
      );
    }
  };

  // Reject: marks request rejected — annualBudget unchanged
  const rejectBudgetRequest = (requestId: string) => {
    setBudgetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString() } : r
      )
    );
  };

  return (
    <DepartmentsContext.Provider
      value={{
        departments,
        setDepartments,
        updateDepartment,
        departmentMembersMap,
        setDepartmentMembersMap,
        departmentActivitiesMap,
        addActivity,
        deleteActivity,
        departmentExpensesMap,
        submitExpense,
        updateExpense,
        budgetRequests,
        submitBudgetRequest,
        approveBudgetRequest,
        rejectBudgetRequest,
        loading,
        error,
      }}
    >
      {children}
    </DepartmentsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDepartments() {
  const context = useContext(DepartmentsContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentsProvider');
  }
  return context;
}
