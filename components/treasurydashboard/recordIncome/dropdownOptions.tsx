/**
 * dropdownOptions.ts
 * Shared types, storage, and helpers for user-managed dropdown options.
 * Users can add, edit, and remove options from any dropdown in the income form.
 */

import { appendActivity } from './activityHistory';

export interface DropdownOption {
  value: string;   // stable key (slugified)
  label: string;   // display text
  isDefault: boolean; // default options can be hidden but not truly deleted
  isHidden?: boolean; // soft-delete for default items
}

export type DropdownKey =
  | 'income_types'
  | 'currencies';

const DROPDOWNS_KEY = 'treasury_dropdowns_v1';

// ── Default option sets ───────────────────────────────────────────────────────
export const DEFAULT_OPTIONS: Record<DropdownKey, DropdownOption[]> = {
  income_types: [
    { value: 'tithe',        label: 'Tithe',            isDefault: true },
    { value: 'offering',     label: 'Offering',         isDefault: true },
    { value: 'thanksgiving', label: 'Thanksgiving',     isDefault: true },
    { value: 'harvest',      label: 'Harvest & Pledge', isDefault: true },
    { value: 'welfare',      label: 'Welfare',          isDefault: true },
    { value: 'other',        label: 'Other',            isDefault: true },
  ],
  currencies: [
    { value: 'GHS', label: '₵ GHS — Ghana Cedis',   isDefault: true },
    { value: 'USD', label: '$ USD — US Dollar',       isDefault: true },
    { value: 'EUR', label: '€ EUR — Euro',            isDefault: true },
    { value: 'GBP', label: '£ GBP — British Pound',  isDefault: true },
  ],
};

// ── Storage ───────────────────────────────────────────────────────────────────
function loadAll(): Record<DropdownKey, DropdownOption[]> {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_OPTIONS };
  }
  try {
    const raw = localStorage.getItem(DROPDOWNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<DropdownKey, DropdownOption[]>>;
      const result = {} as Record<DropdownKey, DropdownOption[]>;
      (Object.keys(DEFAULT_OPTIONS) as DropdownKey[]).forEach((key) => {
        result[key] = parsed[key] ?? [...DEFAULT_OPTIONS[key]];
      });
      return result;
    }
  } catch {
    // corrupt — fall through
  }
  return {
    income_types:        [...DEFAULT_OPTIONS.income_types],
    currencies:          [...DEFAULT_OPTIONS.currencies],
  };
}

function saveAll(data: Record<DropdownKey, DropdownOption[]>): void {
  try {
    localStorage.setItem(DROPDOWNS_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export function getOptions(key: DropdownKey): DropdownOption[] {
  const all = loadAll();
  return all[key].filter((o) => !o.isHidden);
}

export function getAllOptionsIncludingHidden(key: DropdownKey): DropdownOption[] {
  return loadAll()[key];
}

export function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function addOption(
  key: DropdownKey,
  label: string,
  actor: string,
): DropdownOption | null {
  const all  = loadAll();
  const list = all[key];
  const slug = slugify(label);

  if (list.some((o) => o.value === slug || o.label.toLowerCase() === label.toLowerCase())) {
    return null;
  }

  const newOpt: DropdownOption = { value: slug, label: label.trim(), isDefault: false };
  all[key] = [...list, newOpt];
  saveAll(all);

  appendActivity({
    action:    'dropdown_option_added',
    category:  'dropdown',
    actor,
    summary:   `Added "${label}" to ${key.replace(/_/g, ' ')}`,
    relatedId: key,
    meta:      { key, option: newOpt },
  });

  return newOpt;
}

export function editOption(
  key: DropdownKey,
  value: string,
  newLabel: string,
  actor: string,
): boolean {
  const all  = loadAll();
  const list = all[key];
  const idx  = list.findIndex((o) => o.value === value);
  if (idx === -1) {
    return false;
  }
  const oldLabel = list[idx].label;
  list[idx] = { ...list[idx], label: newLabel.trim() };
  all[key]  = list;
  saveAll(all);

  appendActivity({
    action:    'dropdown_option_edited',
    category:  'dropdown',
    actor,
    summary:   `Renamed "${oldLabel}" → "${newLabel}" in ${key.replace(/_/g, ' ')}`,
    detail:    `${oldLabel} → ${newLabel}`,
    relatedId: key,
    meta:      { key, value, oldLabel, newLabel },
  });

  return true;
}

export function removeOption(
  key: DropdownKey,
  value: string,
  actor: string,
): boolean {
  const all  = loadAll();
  const list = all[key];
  const item = list.find((o) => o.value === value);
  if (!item) {
    return false;
  }

  if (item.isDefault) {
    const idx = list.findIndex((o) => o.value === value);
    list[idx] = { ...list[idx], isHidden: true };
    all[key]  = list;
  } else {
    all[key] = list.filter((o) => o.value !== value);
  }
  saveAll(all);

  appendActivity({
    action:    'dropdown_option_removed',
    category:  'dropdown',
    actor,
    summary:   `Removed "${item.label}" from ${key.replace(/_/g, ' ')}`,
    relatedId: key,
    meta:      { key, value, label: item.label },
  });

  return true;
}

export function restoreOption(key: DropdownKey, value: string): boolean {
  const all  = loadAll();
  const list = all[key];
  const idx  = list.findIndex((o) => o.value === value);
  if (idx === -1) {
    return false;
  }
  list[idx] = { ...list[idx], isHidden: false };
  all[key]  = list;
  saveAll(all);
  return true;
}

export function reorderOptions(key: DropdownKey, ordered: DropdownOption[]): void {
  const all = loadAll();
  all[key]  = ordered;
  saveAll(all);
}