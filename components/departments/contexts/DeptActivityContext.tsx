'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type DeptActivityType =
  | 'member_added'
  | 'member_updated'
  | 'member_removed'
  | 'activity_added'
  | 'activity_updated'
  | 'activity_removed'
  | 'announcement_created'
  | 'announcement_updated'
  | 'budget_updated'
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'report_created'
  | 'message_sent'
  | 'settings_updated';

export interface DeptActivityEntry {
  id: string;
  type: DeptActivityType;
  label: string;
  detail: string;
  icon: string;
  timestamp: number;
}

interface DeptActivityContextValue {
  activities: DeptActivityEntry[];
  isReady: boolean;
  logActivity: (entry: Omit<DeptActivityEntry, 'id' | 'timestamp'>) => void;
  clearActivity: () => void;
}

const STORAGE_KEY = 'department_activity_v1';
const MAX_ENTRIES = 100;

function load(): DeptActivityEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeptActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: DeptActivityEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

const DeptActivityContext = createContext<DeptActivityContextValue | undefined>(undefined);

export function DeptActivityProvider({ children }: { children: ReactNode }) {
  // Do not use useState(load): the initializer runs on the server and returns [].
  // Hydration reuses that snapshot, so localStorage is never read on the client.
  const [activities, setActivities] = useState<DeptActivityEntry[]>([]);

  useLayoutEffect(() => {
    setActivities(load());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setActivities(load());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const logActivity = useCallback((entry: Omit<DeptActivityEntry, 'id' | 'timestamp'>) => {
    setActivities((prev) => {
      const next = [{ id: crypto.randomUUID(), timestamp: Date.now(), ...entry }, ...prev].slice(
        0,
        MAX_ENTRIES
      );
      save(next);
      return next;
    });
  }, []);

  const clearActivity = useCallback(() => {
    setActivities([]);
    save([]);
  }, []);

  return (
    <DeptActivityContext.Provider value={{ activities, isReady, logActivity, clearActivity }}>
      {children}
    </DeptActivityContext.Provider>
  );
}

export function useDeptActivity() {
  const ctx = useContext(DeptActivityContext);
  if (!ctx) {
    throw new Error('useDeptActivity must be used within <DeptActivityProvider>');
  }
  return ctx;
}

// ── Per-page helper hooks ─────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function useLogDeptMember() {
  const { logActivity } = useDeptActivity();
  return {
    logAdded: (name: string) =>
      logActivity({
        type: 'member_added',
        label: 'Member Added',
        detail: name,
        icon: initials(name),
      }),
    logUpdated: (name: string) =>
      logActivity({
        type: 'member_updated',
        label: 'Member Updated',
        detail: name,
        icon: initials(name),
      }),
    logRemoved: (name: string) =>
      logActivity({
        type: 'member_removed',
        label: 'Member Removed',
        detail: name,
        icon: initials(name),
      }),
  };
}

export function useLogDeptActivity() {
  const { logActivity } = useDeptActivity();
  return {
    logAdded: (name: string) =>
      logActivity({ type: 'activity_added', label: 'Activity Added', detail: name, icon: '📅' }),
    logUpdated: (name: string) =>
      logActivity({
        type: 'activity_updated',
        label: 'Activity Updated',
        detail: name,
        icon: '📅',
      }),
    logRemoved: (name: string) =>
      logActivity({
        type: 'activity_removed',
        label: 'Activity Removed',
        detail: name,
        icon: '🗑️',
      }),
  };
}

export function useLogDeptExpense() {
  const { logActivity } = useDeptActivity();
  return {
    logSubmitted: (desc: string) =>
      logActivity({
        type: 'expense_submitted',
        label: 'Expense Submitted',
        detail: desc,
        icon: '💰',
      }),
    logApproved: (desc: string) =>
      logActivity({
        type: 'expense_approved',
        label: 'Expense Approved',
        detail: desc,
        icon: '✅',
      }),
    logRejected: (desc: string) =>
      logActivity({
        type: 'expense_rejected',
        label: 'Expense Rejected',
        detail: desc,
        icon: '❌',
      }),
  };
}

export function useLogDeptAnnouncement() {
  const { logActivity } = useDeptActivity();
  return {
    logCreated: (title: string) =>
      logActivity({
        type: 'announcement_created',
        label: 'Announcement Created',
        detail: title,
        icon: '📢',
      }),
    logUpdated: (title: string) =>
      logActivity({
        type: 'announcement_updated',
        label: 'Announcement Updated',
        detail: title,
        icon: '📢',
      }),
  };
}
