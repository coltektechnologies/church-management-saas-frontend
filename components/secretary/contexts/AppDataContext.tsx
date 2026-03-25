'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useActivity, type ActivityEntry } from '@/components/secretary/contexts/ActivityContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PendingItem {
  id: string;
  title: string;
}

// The unified activity shape exposed to consumers.
// It is a superset of ActivityEntry so that MembershipGrowthChart,
// SecretaryDashboard, and any future consumer can read all fields
// without casting to `any`.
export interface AppActivity extends ActivityEntry {
  // ActivityEntry already has: id, type, label, detail, icon, timestamp (number)
  // We add the legacy string fields that AppDataContext originally declared,
  // keeping backward-compatibility with anything that still reads them.
  userName: string;
  action: string;
  entity: string;
  tab: string;
}

interface AppDataContextValue {
  pending: PendingItem[];
  activities: AppActivity[];
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppDataContext = createContext<AppDataContextValue>({
  pending: [],
  activities: [],
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Pending approvals — still local state (wire to real source when ready)
  const [pending] = useState<PendingItem[]>([]);

  // Pull live activities straight from ActivityContext.
  // ActivityProvider must be an ancestor of AppDataProvider in the tree
  // (it already is in SecretaryLayout: ActivityProvider > AppDataProvider).
  const { activities: rawActivities } = useActivity();

  // Map ActivityEntry → AppActivity, filling legacy fields from what we know.
  // - `label`  is the human-readable action string  → action
  // - `detail` is the subject (member name, event)  → entity
  // - `type`   already encodes the domain category  → tab (e.g. "member_added" → "member")
  // - timestamp is a number in ActivityEntry; convert to ISO string for consumers
  //   that stored it as a string originally.
  const activities: AppActivity[] = rawActivities.map((e) => ({
    ...e,
    userName: '', // not tracked; fill when auth is wired
    action: e.label,
    entity: e.detail,
    tab: e.type.split('_')[0], // "member_added" → "member"
    timestamp: e.timestamp, // keep as number (AppActivity extends ActivityEntry)
  }));

  return (
    <AppDataContext.Provider value={{ pending, activities }}>{children}</AppDataContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAppData() {
  return useContext(AppDataContext);
}
