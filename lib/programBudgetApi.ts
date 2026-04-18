/**
 * 5-step program/budget submission (backend Program model).
 * POST /api/programs/step1/ → PATCH step2 → PATCH step3 → POST step4 (per file) → POST step5/submit/
 */

import { getApiBaseUrl, getAccessToken } from './api';
import { messageFromApiErrorJson } from '@/lib/apiMessages';
import type { BudgetFormData } from '@/types/budget';

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAuth<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(), ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(messageFromApiErrorJson(data, `Request failed: ${res.status}`));
  }
  return data as T;
}

export function budgetDocumentKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

type BudgetCategoryApi = 'PERSONNEL_STAFF' | 'PROGRAM_ACTIVITY' | 'EQUIPMENT_SUPPLIES' | 'CUSTOM';

function buildBudgetItems(formData: BudgetFormData): {
  category: BudgetCategoryApi;
  description: string;
  quantity: number;
  amount: string;
}[] {
  const rows: {
    category: BudgetCategoryApi;
    description: string;
    quantity: number;
    amount: string;
  }[] = [];

  for (const i of formData.personnel) {
    const amt = i.quantity * i.unitCost;
    if (amt <= 0) {
      continue;
    }
    rows.push({
      category: 'PERSONNEL_STAFF',
      description: i.name?.trim() || 'Personnel',
      quantity: i.quantity,
      amount: amt.toFixed(2),
    });
  }
  for (const i of formData.programs) {
    const amt = i.quantity * i.unitCost;
    if (amt <= 0) {
      continue;
    }
    rows.push({
      category: 'PROGRAM_ACTIVITY',
      description: i.name?.trim() || 'Program',
      quantity: i.quantity,
      amount: amt.toFixed(2),
    });
  }
  for (const i of formData.equipment) {
    const amt = i.quantity * i.unitCost;
    if (amt <= 0) {
      continue;
    }
    rows.push({
      category: 'EQUIPMENT_SUPPLIES',
      description: i.name?.trim() || 'Equipment',
      quantity: i.quantity,
      amount: amt.toFixed(2),
    });
  }
  for (const i of formData.training) {
    const amt = i.quantity * i.unitCost;
    if (amt <= 0) {
      continue;
    }
    rows.push({
      category: 'CUSTOM',
      description: i.name?.trim() || 'Training',
      quantity: i.quantity,
      amount: amt.toFixed(2),
    });
  }
  return rows;
}

/** Step 1 — create draft program */
export async function postProgramStep1(
  departmentId: string,
  formData: BudgetFormData
): Promise<{ programId: string }> {
  const base = getApiBaseUrl();
  const fy = parseInt(formData.fiscalYear, 10) || new Date().getFullYear();

  const step1 = await fetchAuth<{ program_id?: string }>(`${base}/programs/step1/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      department_id: departmentId,
      fiscal_year: fy,
      budget_title: formData.title.trim(),
      budget_overview: formData.overview?.trim() ?? '',
      department_head_email: formData.emailAddress?.trim() || '',
      department_head_phone: formData.phoneNumber?.trim() || '',
    }),
  });

  const programId = step1.program_id;
  if (!programId) {
    throw new Error('Program step1 did not return program_id');
  }
  return { programId: String(programId) };
}

/** Step 2 — budget line items */
export async function patchProgramStep2(
  programId: string,
  formData: BudgetFormData
): Promise<void> {
  const base = getApiBaseUrl();
  const budgetItems = buildBudgetItems(formData);
  if (budgetItems.length === 0) {
    throw new Error('No budget line items with amount greater than zero');
  }
  await fetchAuth(`${base}/programs/${programId}/step2/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ budget_items: budgetItems }),
  });
}

/** Step 3 — justification */
export async function patchProgramStep3(
  programId: string,
  formData: BudgetFormData
): Promise<void> {
  const base = getApiBaseUrl();
  const nb = parseInt(String(formData.numberOfBeneficiaries ?? '').replace(/\D/g, ''), 10);

  await fetchAuth(`${base}/programs/${programId}/step3/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      strategic_objectives: formData.strategicObjectives?.trim() ?? '',
      expected_impact: formData.expectedImpact?.trim() ?? '',
      ministry_benefits: formData.ministryBenefits?.trim() ?? '',
      previous_year_comparison: formData.previousYearComparison?.trim() ?? '',
      number_of_beneficiaries: Number.isFinite(nb) ? nb : null,
      implementation_timeline: formData.implementationTimeline?.trim() ?? '',
    }),
  });
}

/** Step 4 — one supporting document */
export async function postProgramStep4Document(programId: string, file: File): Promise<void> {
  const base = getApiBaseUrl();
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${base}/programs/${programId}/step4/documents/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: fd,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(messageFromApiErrorJson(err, `Upload failed: ${res.status}`));
  }
}

/** Upload only files whose keys are not already in uploadedKeys; adds keys after each success */
export async function uploadProgramStep4Documents(
  programId: string,
  files: File[],
  uploadedKeys: Set<string>
): Promise<void> {
  for (const file of files) {
    const key = budgetDocumentKey(file);
    if (uploadedKeys.has(key)) {
      continue;
    }
    await postProgramStep4Document(programId, file);
    uploadedKeys.add(key);
  }
}

/** Step 5 — submit for approval */
export async function postProgramStep5Submit(programId: string): Promise<void> {
  const base = getApiBaseUrl();
  await fetchAuth(`${base}/programs/${programId}/step5/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({}),
  });
}

/**
 * Full pipeline: step1 (if needed) → step2 → step3 → step4 (new files only) → step5 submit.
 * Use after progressive saves or as a single-shot submit.
 */
export async function completeBudgetWizardSubmission(
  departmentId: string,
  formData: BudgetFormData,
  existingProgramId: string | undefined,
  uploadedDocKeys: Set<string>
): Promise<{ programId: string }> {
  let programId = existingProgramId?.trim() || '';

  if (!programId) {
    const created = await postProgramStep1(departmentId, formData);
    programId = created.programId;
  }

  await patchProgramStep2(programId, formData);
  await patchProgramStep3(programId, formData);
  await uploadProgramStep4Documents(programId, formData.documents, uploadedDocKeys);
  await postProgramStep5Submit(programId);

  return { programId };
}

/** @deprecated Prefer completeBudgetWizardSubmission + granular step calls */
export async function submitProgramBudgetWizard(
  departmentId: string,
  formData: BudgetFormData
): Promise<{ programId: string }> {
  return completeBudgetWizardSubmission(departmentId, formData, undefined, new Set());
}
