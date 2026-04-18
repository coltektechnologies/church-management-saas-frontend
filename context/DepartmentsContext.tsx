'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Department } from '@/types/Department';
import { Activity } from '@/types/activity';
import { Expense } from '@/types/expense';
import { BudgetRequest } from '@/types/budget';
import {
  assignMemberToDepartment,
  createDepartment,
  createDepartmentActivity,
  deleteDepartmentActivity,
  fetchDepartmentActivities,
  fetchDepartmentDetail,
  fetchDepartmentsList,
  fetchMemberDepartments,
  mapActivityRowToActivity,
  mapListRowToDepartment,
  mapMemberDepartmentRow,
  mergeDepartmentDetail,
  normalizeIconForApi,
  removeMemberFromDepartment,
  setDepartmentHead,
  updateDepartment as updateDepartmentApi,
  type CreateActivityBody,
  type DepartmentDetailResponse,
  type DepartmentMemberUI,
} from '@/lib/departmentsApi';
import {
  createAndSubmitExpenseRequest,
  getDepartmentBudgets,
  getExpenseRequests,
  mapExpenseRequestRowToExpense,
} from '@/lib/treasuryApi';

type DepartmentsContextType = {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  updateDepartment: (updated: Department) => void;
  applyDepartmentDetail: (id: string, detail: DepartmentDetailResponse) => void;
  refreshDepartments: () => Promise<void>;
  createDepartmentRemote: (input: {
    name: string;
    code: string;
    description: string;
    status: 'active' | 'inactive';
    themeColor: string;
    icon: string;
    headMemberId?: string;
    elderInChargeMemberId?: string;
  }) => Promise<Department>;
  updateDepartmentRemote: (
    id: string,
    input: {
      name: string;
      code: string;
      description: string;
      status: 'active' | 'inactive';
      themeColor: string;
      icon: string;
      headMemberId?: string;
      elderInChargeMemberId?: string;
    }
  ) => Promise<Department>;

  departmentMembersMap: Record<string, DepartmentMemberUI[]>;
  setDepartmentMembersMap: React.Dispatch<
    React.SetStateAction<Record<string, DepartmentMemberUI[]>>
  >;
  loadDepartmentMembers: (departmentId: string) => Promise<void>;
  assignMember: (departmentId: string, memberId: string, role: string) => Promise<void>;
  removeMember: (departmentId: string, assignmentId: string) => Promise<void>;

  departmentActivitiesMap: Record<string, Activity[]>;
  loadDepartmentActivities: (departmentId: string) => Promise<void>;
  addActivityRemote: (departmentId: string, body: CreateActivityBody) => Promise<Activity>;
  deleteActivityRemote: (departmentId: string, activityId: string) => Promise<void>;

  departmentExpensesMap: Record<string, Expense[]>;
  loadDepartmentExpenseRequests: (departmentId: string) => Promise<void>;

  /** Refresh annualBudget / budgetUsed for one department from treasury API */
  syncDepartmentBudgetFromApi: (departmentId: string) => Promise<void>;

  submitExpense: (
    departmentId: string,
    expense: Expense,
    options: { categoryId: string }
  ) => Promise<{ requestNumber: string; status: string }>;
  /** @deprecated No backend update flow wired; kept for compatibility */
  updateExpense: (departmentId: string, expenseId: string, updatedExpense: Expense) => void;

  budgetRequests: BudgetRequest[];
  submitBudgetRequest: (request: BudgetRequest) => void;
  approveBudgetRequest: (requestId: string) => void;
  rejectBudgetRequest: (requestId: string) => void;

  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

const DepartmentsContext = createContext<DepartmentsContextType | null>(null);

export function DepartmentsProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentMembersMap, setDepartmentMembersMap] = useState<
    Record<string, DepartmentMemberUI[]>
  >({});
  const [departmentActivitiesMap, setDepartmentActivitiesMap] = useState<
    Record<string, Activity[]>
  >({});
  const [departmentExpensesMap, setDepartmentExpensesMap] = useState<Record<string, Expense[]>>({});
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchDepartmentsList();
      setDepartments(rows.map(mapListRowToDepartment));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshDepartments();
  }, [refreshDepartments]);

  const updateDepartment = (updated: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const applyDepartmentDetail = useCallback((id: string, detail: DepartmentDetailResponse) => {
    setDepartments((prev) => {
      const current = prev.find((d) => d.id === id);
      const base =
        current ??
        mapListRowToDepartment({
          id: detail.id,
          name: detail.name,
          code: detail.code,
          icon: detail.icon,
          color: detail.color,
          is_active: detail.is_active,
          member_count: detail.member_count,
          head_name: detail.heads?.[0]?.name ?? detail.head_name,
          elder_in_charge_name: detail.elder_in_charge_name,
        });
      const merged = mergeDepartmentDetail(base, detail);
      if (current) {
        return prev.map((d) => (d.id === id ? merged : d));
      }
      return [...prev, merged];
    });
  }, []);

  const createDepartmentRemote = useCallback(
    async (input: {
      name: string;
      code: string;
      description: string;
      status: 'active' | 'inactive';
      themeColor: string;
      icon: string;
      headMemberId?: string;
      elderInChargeMemberId?: string;
    }) => {
      let detail = await createDepartment({
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        description: input.description.trim(),
        icon: normalizeIconForApi(input.icon),
        color: input.themeColor,
        is_active: input.status === 'active',
        ...(input.headMemberId ? { head_member_id: input.headMemberId } : {}),
      });
      if (input.elderInChargeMemberId) {
        detail = await updateDepartmentApi(detail.id, {
          elder_in_charge: input.elderInChargeMemberId,
        });
      }
      detail = await fetchDepartmentDetail(detail.id);
      const mapped = mergeDepartmentDetail(
        mapListRowToDepartment({
          id: detail.id,
          name: detail.name,
          code: detail.code,
          icon: detail.icon,
          color: detail.color,
          is_active: detail.is_active,
          member_count: detail.member_count,
          head_name: detail.heads?.[0]?.name ?? detail.head_name,
          elder_in_charge_name: detail.elder_in_charge_name,
        }),
        detail,
        0
      );
      setDepartments((prev) => [...prev, mapped]);
      return mapped;
    },
    []
  );

  const updateDepartmentRemote = useCallback(
    async (
      id: string,
      input: {
        name: string;
        code: string;
        description: string;
        status: 'active' | 'inactive';
        themeColor: string;
        icon: string;
        headMemberId?: string;
        elderInChargeMemberId?: string;
      }
    ) => {
      await updateDepartmentApi(id, {
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        description: input.description.trim(),
        icon: normalizeIconForApi(input.icon),
        color: input.themeColor,
        is_active: input.status === 'active',
      });
      if (input.headMemberId) {
        await setDepartmentHead(id, input.headMemberId);
      }
      if (input.elderInChargeMemberId !== undefined) {
        await updateDepartmentApi(id, {
          elder_in_charge: input.elderInChargeMemberId || null,
        });
      }
      const detail = await fetchDepartmentDetail(id);
      setDepartments((prev) => {
        const existing = prev.find((d) => d.id === id);
        const base =
          existing ??
          mapListRowToDepartment({
            id: detail.id,
            name: detail.name,
            code: detail.code,
            icon: detail.icon,
            color: detail.color,
            is_active: detail.is_active,
            member_count: detail.member_count,
            head_name: detail.heads?.[0]?.name ?? detail.head_name,
            elder_in_charge_name: detail.elder_in_charge_name,
          });
        const mapped = mergeDepartmentDetail(base, detail);
        return prev.map((d) => (d.id === id ? mapped : d));
      });
      return mergeDepartmentDetail(
        mapListRowToDepartment({
          id: detail.id,
          name: detail.name,
          code: detail.code,
          icon: detail.icon,
          color: detail.color,
          is_active: detail.is_active,
          member_count: detail.member_count,
          head_name: detail.heads?.[0]?.name ?? detail.head_name,
          elder_in_charge_name: detail.elder_in_charge_name,
        }),
        detail
      );
    },
    []
  );

  const loadDepartmentMembers = useCallback(async (departmentId: string) => {
    const rows = await fetchMemberDepartments();
    const forDept = rows.filter((r) => String(r.department) === departmentId);
    const mapped = forDept.map(mapMemberDepartmentRow);
    setDepartmentMembersMap((prev) => ({ ...prev, [departmentId]: mapped }));
    setDepartments((prev) =>
      prev.map((d) => (d.id === departmentId ? { ...d, members: mapped.length } : d))
    );
  }, []);

  const assignMember = useCallback(
    async (departmentId: string, memberId: string, role: string) => {
      await assignMemberToDepartment({
        member: memberId,
        department: departmentId,
        role_in_department: role,
      });
      await loadDepartmentMembers(departmentId);
    },
    [loadDepartmentMembers]
  );

  const removeMember = useCallback(async (departmentId: string, assignmentId: string) => {
    await removeMemberFromDepartment(assignmentId);
    setDepartmentMembersMap((prev) => ({
      ...prev,
      [departmentId]: (prev[departmentId] || []).filter((m) => m.assignmentId !== assignmentId),
    }));
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === departmentId ? { ...d, members: Math.max((d.members || 0) - 1, 0) } : d
      )
    );
  }, []);

  const loadDepartmentActivities = useCallback(async (departmentId: string) => {
    const rows = await fetchDepartmentActivities(departmentId);
    const mapped = rows.map(mapActivityRowToActivity);
    setDepartmentActivitiesMap((prev) => ({ ...prev, [departmentId]: mapped }));
    setDepartments((prev) =>
      prev.map((d) => (d.id === departmentId ? { ...d, activities: mapped.length } : d))
    );
  }, []);

  const addActivityRemote = useCallback(async (departmentId: string, body: CreateActivityBody) => {
    const row = await createDepartmentActivity(departmentId, body);
    const activity = mapActivityRowToActivity(row);
    setDepartmentActivitiesMap((prev) => ({
      ...prev,
      [departmentId]: [...(prev[departmentId] || []), activity],
    }));
    setDepartments((prev) =>
      prev.map((d) => (d.id === departmentId ? { ...d, activities: (d.activities || 0) + 1 } : d))
    );
    return activity;
  }, []);

  const deleteActivityRemote = useCallback(async (departmentId: string, activityId: string) => {
    await deleteDepartmentActivity(departmentId, activityId);
    setDepartmentActivitiesMap((prev) => ({
      ...prev,
      [departmentId]: (prev[departmentId] || []).filter((a) => a.id !== activityId),
    }));
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === departmentId ? { ...d, activities: Math.max((d.activities || 0) - 1, 0) } : d
      )
    );
  }, []);

  const loadDepartmentExpenseRequests = useCallback(async (departmentId: string) => {
    const rows = await getExpenseRequests({ department_id: departmentId, page_size: 100 });
    const mapped = rows.map(mapExpenseRequestRowToExpense);
    setDepartmentExpensesMap((prev) => ({ ...prev, [departmentId]: mapped }));
  }, []);

  const syncDepartmentBudgetFromApi = useCallback(async (departmentId: string) => {
    const data = await getDepartmentBudgets();
    const row = data?.departments?.find((d) => String(d.id) === String(departmentId));
    if (!row) {
      return;
    }
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === departmentId ? { ...d, annualBudget: row.allocated, budgetUsed: row.utilized } : d
      )
    );
  }, []);

  const submitExpense = useCallback(
    async (departmentId: string, expense: Expense, options: { categoryId: string }) => {
      const itemsLines = expense.items
        .map(
          (i) =>
            `• ${i.name} × ${i.quantity} @ GHS ${i.unitCost} = GHS ${(i.quantity * i.unitCost).toFixed(2)}`
        )
        .join('\n');
      const submittedBy = expense.submitterName?.trim();
      const justification = [
        submittedBy ? `Submitted by: ${submittedBy}` : null,
        expense.description?.trim() || '',
        '--- Line items ---',
        itemsLines,
      ]
        .filter(Boolean)
        .join('\n\n');

      const result = await createAndSubmitExpenseRequest({
        departmentId,
        categoryId: options.categoryId,
        purpose: expense.title,
        justification,
        amount: expense.amount,
      });

      await loadDepartmentExpenseRequests(departmentId);
      await syncDepartmentBudgetFromApi(departmentId);

      return result;
    },
    [loadDepartmentExpenseRequests, syncDepartmentBudgetFromApi]
  );

  const updateExpense = (_departmentId: string, _expenseId: string, _updatedExpense: Expense) => {
    /* Expense request edits not exposed */
  };

  const submitBudgetRequest = (request: BudgetRequest) => {
    setBudgetRequests((prev) => [...prev, request]);
  };

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
        applyDepartmentDetail,
        refreshDepartments,
        createDepartmentRemote,
        updateDepartmentRemote,
        departmentMembersMap,
        setDepartmentMembersMap,
        loadDepartmentMembers,
        assignMember,
        removeMember,
        departmentActivitiesMap,
        loadDepartmentActivities,
        addActivityRemote,
        deleteActivityRemote,
        departmentExpensesMap,
        loadDepartmentExpenseRequests,
        syncDepartmentBudgetFromApi,
        submitExpense,
        updateExpense,
        budgetRequests,
        submitBudgetRequest,
        approveBudgetRequest,
        rejectBudgetRequest,
        loading,
        error,
        setError,
      }}
    >
      {children}
    </DepartmentsContext.Provider>
  );
}

export function useDepartments() {
  const context = useContext(DepartmentsContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentsProvider');
  }
  return context;
}
