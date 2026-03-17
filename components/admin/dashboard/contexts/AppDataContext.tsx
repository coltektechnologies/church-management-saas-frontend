'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/* ─── Shared types — canonical, match mockData.ts exactly ─── */

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  joinedDate: string; // "YYYY-MM-DD"
  status: 'Active' | 'Inactive';
  attendance?: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Income' | 'Expense'; // Capital — matches Lovable
  category: string;
  amount: number;
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Published' | 'Draft';
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  department?: string;
  type?: 'Minutes' | 'Letter' | 'Report' | 'Certificate' | 'Event';
  status?: 'Draft' | 'Final';
  location?: string;
  attendees?: number;
}

export interface Dept {
  id: string;
  name: string;
  leader: string;
  members: number;
  meetingDay: string;
  status: 'Active' | 'Inactive';
}

export interface Approval {
  id: string;
  name: string;
  description: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  linkedPage?: string;
  amount?: number;
}

export interface ActivityLogItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: 'member' | 'transaction' | 'approval' | 'announcement' | 'event' | 'department' | 'system';
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/* ─── Context shape ─── */

interface AppDataContextType {
  // Raw data
  members: Member[];
  transactions: Transaction[];
  announcements: Announcement[];
  events: EventItem[];
  departments: Dept[];
  approvals: Approval[];
  activityLog: ActivityLogItem[];
  dateRange: DateRange;
  useMockData: boolean;

  // Setters — used by MockDataToggle and sidebar pages
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  setDepartments: React.Dispatch<React.SetStateAction<Dept[]>>;
  setApprovals: React.Dispatch<React.SetStateAction<Approval[]>>;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  setUseMockData: React.Dispatch<React.SetStateAction<boolean>>;

  // Add-helpers — sidebar pages call these to push individual records
  // and auto-log to Activity Feed
  addMember: (m: Member) => void;
  addTransaction: (t: Transaction) => void;
  addEvent: (e: EventItem) => void;
  addAnnouncement: (a: Announcement) => void;
  addDepartment: (d: Dept) => void;
  addApproval: (a: Approval) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteMember: (id: string) => void;
  deleteTransaction: (id: string) => void;

  // Approval workflow
  approveItem: (id: string) => void;
  rejectItem: (id: string) => void;

  // Activity log
  logActivity: (entry: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;

  // Derived stats — auto-recomputed from live data
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  monthlyIncome: number;
  pendingAnnouncements: number;
  publishedAnnouncements: number;
  totalEvents: number;
  pendingApprovals: number;
  averageAttendance: number;
  newMembersThisWeek: number;
  departmentCount: number;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [useMockData, setUseMockData] = useState(false);

  /* ── Activity logger ── */
  const logActivity = useCallback((entry: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    setActivityLog((prev) =>
      [
        {
          ...entry,
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 100)
    );
  }, []);

  /* ── Add helpers ── */
  const addMember = useCallback(
    (m: Member) => {
      setMembers((prev) => [m, ...prev]);
      logActivity({
        title: 'New Member Added',
        subtitle: `${m.name} joined as ${m.role}`,
        type: 'member',
      });
    },
    [logActivity]
  );

  const addTransaction = useCallback(
    (t: Transaction) => {
      setTransactions((prev) => [t, ...prev]);
      logActivity({
        title: t.type === 'Income' ? 'Income Recorded' : 'Expense Recorded',
        subtitle: `${t.description} — ₵${t.amount.toLocaleString()}`,
        type: 'transaction',
      });
    },
    [logActivity]
  );

  const addEvent = useCallback(
    (e: EventItem) => {
      setEvents((prev) => [e, ...prev]);
      logActivity({ title: 'Event Scheduled', subtitle: `${e.title} on ${e.date}`, type: 'event' });
    },
    [logActivity]
  );

  const addAnnouncement = useCallback(
    (a: Announcement) => {
      setAnnouncements((prev) => [a, ...prev]);
      logActivity({ title: 'Announcement Posted', subtitle: a.title, type: 'announcement' });
    },
    [logActivity]
  );

  const addDepartment = useCallback(
    (d: Dept) => {
      setDepartments((prev) => [d, ...prev]);
      logActivity({ title: 'Department Created', subtitle: d.name, type: 'department' });
    },
    [logActivity]
  );

  const addApproval = useCallback(
    (a: Approval) => {
      setApprovals((prev) => [a, ...prev]);
      logActivity({ title: 'Approval Requested', subtitle: a.name, type: 'approval' });
    },
    [logActivity]
  );

  const updateMember = useCallback(
    (id: string, patch: Partial<Member>) => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      logActivity({ title: 'Member Updated', subtitle: `Member record updated`, type: 'member' });
    },
    [logActivity]
  );

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      logActivity({
        title: 'Transaction Updated',
        subtitle: `Transaction record updated`,
        type: 'transaction',
      });
    },
    [logActivity]
  );

  const deleteMember = useCallback(
    (id: string) => {
      setMembers((prev) => {
        const m = prev.find((x) => x.id === id);
        if (m) {
          logActivity({ title: 'Member Removed', subtitle: m.name, type: 'member' });
        }
        return prev.filter((x) => x.id !== id);
      });
    },
    [logActivity]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const t = prev.find((x) => x.id === id);
        if (t) {
          logActivity({
            title: 'Transaction Deleted',
            subtitle: t.description,
            type: 'transaction',
          });
        }
        return prev.filter((x) => x.id !== id);
      });
    },
    [logActivity]
  );

  /* ── Approval actions ── */
  const approveItem = useCallback(
    (id: string) => {
      setApprovals((prev) => {
        const item = prev.find((a) => a.id === id);
        if (item) {
          logActivity({
            title: 'Approval Granted',
            subtitle: `${item.name} — approved`,
            type: 'approval',
          });
        }
        return prev.map((a) => (a.id === id ? { ...a, status: 'Approved' as const } : a));
      });
    },
    [logActivity]
  );

  const rejectItem = useCallback(
    (id: string) => {
      setApprovals((prev) => {
        const item = prev.find((a) => a.id === id);
        if (item) {
          logActivity({
            title: 'Approval Rejected',
            subtitle: `${item.name} — rejected`,
            type: 'approval',
          });
        }
        return prev.map((a) => (a.id === id ? { ...a, status: 'Rejected' as const } : a));
      });
    },
    [logActivity]
  );

  /* ── Date-range filter helper ── */
  const inRange = useCallback(
    (dateStr: string) => {
      if (!dateRange.from && !dateRange.to) {
        return true;
      }
      const d = new Date(dateStr);
      if (dateRange.from && d < dateRange.from) {
        return false;
      }
      if (dateRange.to) {
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);
        if (d > end) {
          return false;
        }
      }
      return true;
    },
    [dateRange]
  );

  /* ── Derived stats — recomputed whenever source data changes ── */
  const derived = useMemo(() => {
    const filteredTxns = transactions.filter((t) => inRange(t.date));

    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'Active').length;
    const inactiveMembers = members.filter((m) => m.status === 'Inactive').length;

    const totalIncome = filteredTxns
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = filteredTxns
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const monthlyIncome = totalIncome; // scoped by date range

    const pendingAnnouncements = announcements.filter((a) => a.status === 'Draft').length;
    const publishedAnnouncements = announcements.filter((a) => a.status === 'Published').length;

    const totalEvents = events.length;
    const pendingApprovals = approvals.filter((a) => a.status === 'Pending').length;

    // Fixed strict equality for ESLint
    const withAttendance = members.filter(
      (m) => m.attendance !== null && m.attendance !== undefined
    );
    const averageAttendance =
      withAttendance.length > 0
        ? Math.round(
            withAttendance.reduce((s, m) => s + (m.attendance ?? 0), 0) / withAttendance.length
          )
        : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newMembersThisWeek = members.filter((m) => new Date(m.joinedDate) >= weekAgo).length;

    const departmentCount = departments.filter((d) => d.status === 'Active').length;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      totalIncome,
      totalExpense,
      netBalance,
      monthlyIncome,
      pendingAnnouncements,
      publishedAnnouncements,
      totalEvents,
      pendingApprovals,
      averageAttendance,
      newMembersThisWeek,
      departmentCount,
    };
  }, [members, transactions, announcements, events, approvals, departments, inRange]);

  return (
    <AppDataContext.Provider
      value={{
        members,
        transactions,
        announcements,
        events,
        departments,
        approvals,
        activityLog,
        dateRange,
        useMockData,
        setMembers,
        setTransactions,
        setAnnouncements,
        setEvents,
        setDepartments,
        setApprovals,
        setDateRange,
        setUseMockData,
        addMember,
        addTransaction,
        addEvent,
        addAnnouncement,
        addDepartment,
        addApproval,
        updateMember,
        updateTransaction,
        deleteMember,
        deleteTransaction,
        approveItem,
        rejectItem,
        logActivity,
        ...derived,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within <AppDataProvider>');
  }
  return ctx;
};
