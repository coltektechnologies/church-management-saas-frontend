// ─── Role Definitions ─────────────────────────────────────────────────────────

export type AppRole = 'admin' | 'secretary' | 'treasury' | 'elder' | 'department_head';

export type Permission =
  | 'canCreateDepartment'
  | 'canEditDepartment'
  | 'canAddMember'
  | 'canDeleteActivity'
  | 'canScheduleActivity'
  | 'canSubmitExpense'
  | 'canSubmitDepartmentBudget'
  | 'canAssignBudget'
  | 'canViewSettings'
  | 'canEditSettings'
  | 'canApproveBudget'
  | 'canApproveExpense';

// ─── Permissions Map ──────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<AppRole, Record<Permission, boolean>> = {
  admin: {
    canCreateDepartment: true,
    canEditDepartment: true,
    canAddMember: true,
    canDeleteActivity: true,
    canScheduleActivity: true,
    canSubmitExpense: true,
    canSubmitDepartmentBudget: true,
    canAssignBudget: true,
    canViewSettings: true,
    canEditSettings: true,
    canApproveBudget: true,
    canApproveExpense: true,
  },
  secretary: {
    canCreateDepartment: false,
    canEditDepartment: false,
    canAddMember: false,
    canDeleteActivity: false,
    canScheduleActivity: false,
    canSubmitExpense: false,
    canSubmitDepartmentBudget: false,
    canAssignBudget: false,
    canViewSettings: true,
    canEditSettings: false,
    canApproveBudget: false,
    canApproveExpense: false,
  },
  treasury: {
    canCreateDepartment: false,
    canEditDepartment: false,
    canAddMember: false,
    canDeleteActivity: false,
    canScheduleActivity: false,
    canSubmitExpense: false,
    canSubmitDepartmentBudget: false,
    canAssignBudget: false,
    canViewSettings: false,
    canEditSettings: false,
    canApproveBudget: false,
    canApproveExpense: true,
  },
  elder: {
    canCreateDepartment: false,
    canEditDepartment: false,
    canAddMember: false,
    canDeleteActivity: false,
    canScheduleActivity: false,
    canSubmitExpense: false,
    canSubmitDepartmentBudget: false,
    canAssignBudget: false,
    canViewSettings: true,
    canEditSettings: false,
    canApproveBudget: true,
    canApproveExpense: true,
  },
  department_head: {
    canCreateDepartment: false,
    canEditDepartment: false,
    canAddMember: true,
    canDeleteActivity: true,
    canScheduleActivity: true,
    canSubmitExpense: true,
    canSubmitDepartmentBudget: true,
    canAssignBudget: false,
    canViewSettings: true,
    canEditSettings: false,
    canApproveBudget: false,
    canApproveExpense: false,
  },
};
