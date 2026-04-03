'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type ActivityType =
  | 'member_added'
  | 'member_updated'
  | 'member_removed'
  | 'event_added'
  | 'event_updated'
  | 'event_removed'
  | 'event_status'
  | 'announcement_created'
  | 'announcement_updated'
  | 'approval_approved'
  | 'approval_rejected'
  | 'message_sent'
  | 'report_created'
  | 'department_updated'
  | 'settings_updated';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  label: string;
  detail: string;
  icon: string;
  timestamp: number;
}

interface ActivityContextValue {
  activities: ActivityEntry[];
  isReady: boolean;
  logActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  clearActivity: () => void;
}

const STORAGE_KEY = 'secretary_activity_v1';
const MAX_ENTRIES = 100;

function load(): ActivityEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: ActivityEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityEntry[]>(load);

  // isReady = false on server, true on client — gates localStorage-derived renders
  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const logActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
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
    <ActivityContext.Provider value={{ activities, isReady, logActivity, clearActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error('useActivity must be used within <ActivityProvider>');
  }
  return ctx;
}

// ── Helper utilities ──────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
function nowStamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Per-page hooks ────────────────────────────────────────────────────────────
export function useLogMember() {
  const { logActivity } = useActivity();
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
export function useLogEvent() {
  const { logActivity } = useActivity();
  return {
    logAdded: (name: string) =>
      logActivity({
        type: 'event_added',
        label: 'Event Added',
        detail: `${name} · ${nowStamp()}`,
        icon: '📅',
      }),
    logUpdated: (name: string) =>
      logActivity({
        type: 'event_updated',
        label: 'Event Updated',
        detail: `${name} · ${nowStamp()}`,
        icon: '📅',
      }),
    logRemoved: (name: string) =>
      logActivity({
        type: 'event_removed',
        label: 'Event Removed',
        detail: `${name} · ${nowStamp()}`,
        icon: '🗑️',
      }),
    logStatus: (name: string, status: string) =>
      logActivity({
        type: 'event_status',
        label: `Event ${status}`,
        detail: `${name} · ${nowStamp()}`,
        icon: '📅',
      }),
  };
}
export function useLogAnnouncement() {
  const { logActivity } = useActivity();
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
export function useLogApproval() {
  const { logActivity } = useActivity();
  return {
    logApproved: (desc: string) =>
      logActivity({
        type: 'approval_approved',
        label: 'Approval Approved',
        detail: desc,
        icon: '✅',
      }),
    logRejected: (desc: string) =>
      logActivity({
        type: 'approval_rejected',
        label: 'Approval Rejected',
        detail: desc,
        icon: '❌',
      }),
  };
}
export function useLogMessage() {
  const { logActivity } = useActivity();
  return {
    logSent: (to: string) =>
      logActivity({ type: 'message_sent', label: 'Message Sent', detail: `To: ${to}`, icon: '💬' }),
  };
}
export function useLogReport() {
  const { logActivity } = useActivity();
  return {
    logCreated: (title: string) =>
      logActivity({ type: 'report_created', label: 'Report Created', detail: title, icon: '📊' }),
  };
}
export function useLogDepartment() {
  const { logActivity } = useActivity();
  return {
    logUpdated: (name: string) =>
      logActivity({
        type: 'department_updated',
        label: 'Department Updated',
        detail: name,
        icon: '🏛️',
      }),
  };
}
export function useLogSettings() {
  const { logActivity } = useActivity();
  return {
    logUpdated: (section: string) =>
      logActivity({
        type: 'settings_updated',
        label: 'Settings Updated',
        detail: section,
        icon: '⚙️',
      }),
  };
}
