'use client';

import {
  createContext,
  useContext,
  useCallback,
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

/** Stable reference for SSR — getServerSnapshot must not return a new [] each call. */
const SERVER_ACTIVITY_SNAPSHOT: DeptActivityEntry[] = [];
/** Same-tab updates do not fire `storage`; we dispatch this after writes. */
const INTERNAL_UPDATE = 'department_activity_internal';

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

/** Invalidate memo used by getClientSnapshot after any write or cross-tab change. */
let snapshotCache: DeptActivityEntry[] | null = null;

function invalidateActivitySnapshotCache() {
  snapshotCache = null;
}

function notifyActivityListeners() {
  invalidateActivitySnapshotCache();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(INTERNAL_UPDATE));
  }
}

function subscribeToActivityStore(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      invalidateActivitySnapshotCache();
      onStoreChange();
    }
  };
  const onInternal = () => {
    invalidateActivitySnapshotCache();
    onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(INTERNAL_UPDATE, onInternal);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(INTERNAL_UPDATE, onInternal);
  };
}

function getServerActivitySnapshot(): DeptActivityEntry[] {
  return SERVER_ACTIVITY_SNAPSHOT;
}

function getClientActivitySnapshot(): DeptActivityEntry[] {
  if (typeof window === 'undefined') {
    return SERVER_ACTIVITY_SNAPSHOT;
  }
  if (snapshotCache === null) {
    snapshotCache = load();
  }
  return snapshotCache;
}

const DeptActivityContext = createContext<DeptActivityContextValue | undefined>(undefined);

export function DeptActivityProvider({ children }: { children: ReactNode }) {
  const activities = useSyncExternalStore(
    subscribeToActivityStore,
    getClientActivitySnapshot,
    getServerActivitySnapshot
  );

  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const logActivity = useCallback((entry: Omit<DeptActivityEntry, 'id' | 'timestamp'>) => {
    const prev = load();
    const next = [{ id: crypto.randomUUID(), timestamp: Date.now(), ...entry }, ...prev].slice(
      0,
      MAX_ENTRIES
    );
    save(next);
    notifyActivityListeners();
  }, []);

  const clearActivity = useCallback(() => {
    save([]);
    notifyActivityListeners();
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
