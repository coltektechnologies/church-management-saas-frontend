import { ThemeColor } from '@/constants/departments';

export interface DepartmentSettings {
  autoApprovalThreshold: number;
  requiresElderApproval: boolean;
  weeklySummary: boolean;
  canSubmitAnnouncements: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  members: number;
  activities: number;
  budgetUsed: number;
  annualBudget: number;
  status: 'active' | 'inactive';
  themeColor: ThemeColor;
  icon: string;
  dateEstablished: string;

  settings: DepartmentSettings;

  /** From API after detail load / merge */
  headMemberId?: string | null;
  headDisplayName?: string | null;
  assistantHeadMemberId?: string | null;
  assistantHeadDisplayName?: string | null;
  elderInChargeMemberId?: string | null;
  elderInChargeDisplayName?: string | null;
}
