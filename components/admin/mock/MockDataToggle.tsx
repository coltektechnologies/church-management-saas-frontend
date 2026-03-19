'use client';

import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import {
  MOCK_MEMBERS,
  MOCK_TRANSACTIONS,
  MOCK_ANNOUNCEMENTS,
  MOCK_EVENTS,
  MOCK_DEPARTMENTS,
  MOCK_APPROVALS,
} from '@/components/admin/mock/mockData';
import { Database, DatabaseZap } from 'lucide-react';

export default function MockDataToggle() {
  const {
    useMockData,
    setUseMockData,
    setMembers,
    setTransactions,
    setAnnouncements,
    setEvents,
    setDepartments,
    setApprovals,
    logActivity,
  } = useAppData();

  const toggle = () => {
    if (!useMockData) {
      setMembers(MOCK_MEMBERS);
      setTransactions(MOCK_TRANSACTIONS);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      setEvents(MOCK_EVENTS);
      setDepartments(MOCK_DEPARTMENTS);
      setApprovals(MOCK_APPROVALS);
      setUseMockData(true);
      logActivity({
        title: 'Mock Data Loaded',
        subtitle: 'Test data populated across all modules',
        type: 'system',
      });
    } else {
      setMembers([]);
      setTransactions([]);
      setAnnouncements([]);
      setEvents([]);
      setDepartments([]);
      setApprovals([]);
      setUseMockData(false);
      logActivity({
        title: 'Mock Data Cleared',
        subtitle: 'All test data removed',
        type: 'system',
      });
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full border transition-all ${
        useMockData
          ? 'bg-primary/10 border-primary text-primary'
          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
      }`}
    >
      {useMockData ? <DatabaseZap size={13} /> : <Database size={13} />}
      <span className="hidden sm:inline">{useMockData ? 'Mock Data ON' : 'Load Test Data'}</span>
      <span className="sm:hidden">{useMockData ? 'ON' : 'Test'}</span>
    </button>
  );
}
