/**
 * activityHistory.ts
 * Shared types, storage helpers, and event-logging for the treasury activity log.
 */

export type ActivityCategory =
  | 'income'      // record, edit, delete, print
  | 'dropdown'    // add, edit, remove option
  | 'export'      // csv, pdf, word, json, excel
  | 'filter'      // search/filter applied
  | 'settings';   // theme, profile changes

export type ActivityAction =
  // Income record actions
  | 'income_recorded'
  | 'income_edited'
  | 'income_deleted'
  | 'income_printed'
  // Dropdown management
  | 'dropdown_option_added'
  | 'dropdown_option_edited'
  | 'dropdown_option_removed'
  // Export actions
  | 'export_csv'
  | 'export_excel'
  | 'export_word'
  | 'export_json'
  | 'export_print'
  // Settings
  | 'settings_updated'
  | 'theme_changed';

export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  category: ActivityCategory;
  timestamp: string;           // ISO string
  actor: string;               // recorder/user name
  summary: string;             // human-readable one-line description
  detail?: string;             // optional extra detail (old→new values, etc.)
  relatedId?: string;          // income record ID or dropdown key
  meta?: Record<string, unknown>;
}

const HISTORY_KEY = 'treasury_activity_history_v1';
const MAX_ENTRIES = 500;

export function loadHistory(): ActivityEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: ActivityEntry[]): void {
  try {
    // Keep only the most recent MAX_ENTRIES
    const trimmed = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded — ignore
  }
}

export function appendActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): ActivityEntry {
  const full: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const existing = loadHistory();
  saveHistory([full, ...existing]);
  return full;
}

/** Human-readable timestamp — always shows date AND time */
export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date} at ${time}`;
  } catch {
    return iso;
  }
}

/** Icon mapping for action types */
export function actionIcon(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    income_recorded:        '💰',
    income_edited:          '✏️',
    income_deleted:         '🗑️',
    income_printed:         '🖨️',
    dropdown_option_added:  '➕',
    dropdown_option_edited: '🔄',
    dropdown_option_removed:'➖',
    export_csv:             '📄',
    export_excel:           '📊',
    export_word:            '📝',
    export_json:            '🗂️',
    export_print:           '🖨️',
    settings_updated:       '⚙️',
    theme_changed:          '🎨',
  };
  return map[action] ?? '📋';
}

export function actionColor(action: ActivityAction): string {
  if (action.startsWith('income_recorded')) { return '#15803D'; }
  if (action.startsWith('income_edited'))   { return '#D97706'; }
  if (action.startsWith('income_deleted'))  { return '#DC2626'; }
  if (action.startsWith('income_printed'))  { return '#2563EB'; }
  if (action.startsWith('dropdown_option_added'))   { return '#15803D'; }
  if (action.startsWith('dropdown_option_edited'))  { return '#D97706'; }
  if (action.startsWith('dropdown_option_removed')) { return '#DC2626'; }
  if (action.startsWith('export_'))         { return '#7C3AED'; }
  if (action.startsWith('theme_'))          { return '#0891B2'; }
  return '#475569';
}