export interface BudgetItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface BudgetFormData {
  /** Set after POST /api/programs/step1/ so Next steps PATCH the same draft program */
  draftProgramId?: string;
  title: string;
  fiscalYear: string;
  departmentId?: string;
  departmentHead?: string;
  phoneNumber?: string;
  emailAddress?: string;
  overview?: string;

  personnel: BudgetItem[];
  programs: BudgetItem[];
  equipment: BudgetItem[];
  training: BudgetItem[];

  // Step 3 - Justification
  strategicObjectives?: string;
  expectedImpact?: string;
  ministryBenefits?: string;
  previousYearComparison?: string;
  numberOfBeneficiaries?: string;
  implementationTimeline?: string;

  justification: string;
  documents: File[];
}

// A submitted budget request that goes through the approval pipeline
export interface BudgetRequest {
  id: string;
  departmentId: string;
  fiscalYear: string;
  title: string;
  departmentHead: string;
  grandTotal: number;
  personnel: BudgetItem[];
  programs: BudgetItem[];
  equipment: BudgetItem[];
  training: BudgetItem[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}
