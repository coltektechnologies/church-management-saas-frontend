'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

/* ─── 1. TYPES & INTERFACES ─── */
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  joinedDate: string;
  status: 'Active' | 'Inactive';
  attendance?: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Income' | 'Expense';
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
}

/* ─── 2. CONTEXT DEFINITION ─── */
interface AppDataContextType {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  departments: Dept[];
  setDepartments: React.Dispatch<React.SetStateAction<Dept[]>>;
  approvals: Approval[];
  setApprovals: React.Dispatch<React.SetStateAction<Approval[]>>;

  // Helpers
  addMember: (member: Omit<Member, 'id'>) => void;
  updateApprovalStatus: (id: string, status: 'Approved' | 'Rejected') => void;

  // Stats & Dashboard Fields (Matches your DashboardPage.tsx requirements)
  totalMembers: number;
  totalIncome: number;
  monthlyIncome: number;
  totalExpense: number;
  publishedAnnouncements: number;
  pendingAnnouncements: number;
  averageAttendance: number;

  // These prefixed properties fix the specific TS errors from your DashboardPage
  _newMembersThisWeek: number;
  _recentActivities: { id: string; title: string; subtitle: string; time?: string }[];
  _approvals: Approval[];
  _departments: Dept[];
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

/* ─── 3. PROVIDER COMPONENT ─── */
export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);

  const addMember = (m: Omit<Member, 'id'>) => {
    const newMember = { ...m, id: Math.random().toString(36).substring(2, 9) };
    setMembers((prev) => [newMember, ...prev]);
  };

  const updateApprovalStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // Derived Stats
  const stats = useMemo(() => {
    const totalInc = transactions
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExp = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + t.amount, 0);

    return {
      totalMembers: members.length,
      totalIncome: totalInc,
      monthlyIncome: totalInc, // Simplified for now
      totalExpense: totalExp,
      publishedAnnouncements: announcements.filter((a) => a.status === 'Published').length,
      pendingAnnouncements: announcements.filter((a) => a.status === 'Draft').length,
      averageAttendance:
        members.length > 0
          ? Math.round(members.reduce((acc, m) => acc + (m.attendance || 0), 0) / members.length)
          : 0,
      _newMembersThisWeek: 0, // Logic can be expanded with date-fns/dayjs
    };
  }, [members, transactions, announcements]);

  // Map activities for the dashboard feed
  const recentActivitiesList = useMemo(
    () => [
      ...members.slice(-2).map((m) => ({
        id: `m-${m.id}`,
        title: 'New Member',
        subtitle: m.name,
        time: 'Just now',
      })),
      ...transactions.slice(-2).map((t) => ({
        id: `t-${t.id}`,
        title: t.type === 'Income' ? 'Donation Received' : 'Expense Logged',
        subtitle: `${t.description} - GHS ${t.amount}`,
        time: 'Today',
      })),
    ],
    [members, transactions]
  );

  return (
    <AppDataContext.Provider
      value={{
        members,
        setMembers,
        transactions,
        setTransactions,
        announcements,
        setAnnouncements,
        events,
        setEvents,
        departments,
        setDepartments,
        approvals,
        setApprovals,
        addMember,
        updateApprovalStatus,
        ...stats,
        _recentActivities: recentActivitiesList,
        _approvals: approvals,
        _departments: departments,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
