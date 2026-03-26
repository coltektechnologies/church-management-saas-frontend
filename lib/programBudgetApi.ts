/**
 * 5-step program/budget submission (backend Program model).
 * POST /api/programs/step1/ → PATCH steps 2–3 → POST step4 (per file) → POST step5/submit/
 */

import { getApiBaseUrl, getAccessToken } from './api';
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
    const msg =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      (data?.error as string) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
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

/** Submit full wizard to API in one sequence (draft → items → justification → docs → submit). */
export async function submitProgramBudgetWizard(
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

  const budgetItems = buildBudgetItems(formData);
  if (budgetItems.length === 0) {
    throw new Error('No budget line items with amount greater than zero');
  }

  await fetchAuth(`${base}/programs/${programId}/step2/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ budget_items: budgetItems }),
  });

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

  for (const file of formData.documents) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${base}/programs/${programId}/step4/documents/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: fd,
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      throw new Error(
        (typeof err?.detail === 'string' ? err.detail : null) || `Upload failed: ${res.status}`
      );
    }
  }

  await fetchAuth(`${base}/programs/${programId}/step5/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({}),
  });

  return { programId: String(programId) };
}
