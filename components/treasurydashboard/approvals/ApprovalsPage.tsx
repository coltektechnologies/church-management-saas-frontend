'use client';

// /components/treasurydashboard/approvals/ApprovalsPage.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Users, BookOpen, Layers, Church, Gift, Plus, ChevronLeft } from 'lucide-react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import {
  DUMMY_EXPENSE_REQUESTS,
  DUMMY_DEPARTMENT_BUDGETS,
  TREASURY_SUMMARY,
  type ExpenseRequest,
} from './approvalsData';
import PendingRequestsSection from './PendingRequestsSection';
import DepartmentBudgetSection from './DepartmentBudgetSection';
import AssetRegisterModal from './AssetRegisterModal';

const REQUESTS_STORAGE_KEY = 'church_treasury_expense_requests';

function loadRequests(): ExpenseRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (raw) {
      const saved: { id: string; status: ExpenseRequest['status'] }[] = JSON.parse(raw);
      // Merge saved statuses onto the canonical dummy data so new requests always appear
      const statusMap = new Map(saved.map((s) => [s.id, s.status]));
      return DUMMY_EXPENSE_REQUESTS.map((r) => {
        const st = statusMap.get(r.id);
        return st !== undefined ? { ...r, status: st } : r;
      });
    }
  } catch {}
  return DUMMY_EXPENSE_REQUESTS;
}

function persistRequests(requests: ExpenseRequest[]) {
  try {
    // Only store id + status — keeps storage tiny and avoids duplicating dummy data
    const slim = requests.map(({ id, status }) => ({ id, status }));
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(slim));
  } catch {}
}

function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

export default function ApprovalsPage() {
  const router = useRouter();
  const { profile, isReady } = useTreasuryProfile();
  const isDark = isReady ? profile.darkMode : false;

  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const bgColor = isDark
    ? profile.darkBackgroundColor || '#0A1628'
    : profile.backgroundColor || '#F5F7FA';
  const sidebarColor = isDark
    ? profile.darkSidebarColor || '#0D1F36'
    : profile.sidebarColor || '#FFFFFF';

  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const bodyText = isDark ? 'rgba(255,255,255,0.9)' : '#1F2937';
  const subText = isDark ? 'rgba(255,255,255,0.5)' : '#6B7280';

  // const [requests, setRequests] = useState<ExpenseRequest[]>(DUMMY_EXPENSE_REQUESTS);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Hydrate persisted statuses after mount (avoids SSR mismatch)
  const [requests, setRequests] = useState<ExpenseRequest[]>(() => loadRequests());

  const updateRequests = (updated: ExpenseRequest[]) => {
    setRequests(updated);
    persistRequests(updated);
  };

  const handleApprove = (id: string) =>
    updateRequests(requests.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)));
  const handleReject = (id: string) =>
    updateRequests(requests.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)));

  const quickActions = [
    {
      label: 'Record Income',
      icon: FileText,
      filled: true,
      bg: primaryColor,
      href: '/treasury/record-income',
      modal: false,
    },
    {
      label: 'Record Expense',
      icon: FileText,
      filled: true,
      bg: accentColor,
      href: '/treasury/expenses',
      modal: false,
    },
    {
      label: 'Financial Statement',
      icon: BookOpen,
      filled: false,
      textColor: '#2C5F2D',
      borderColor: '#2C5F2D',
      href: '/treasury/reports',
      modal: false,
    },
    {
      label: 'Member Contribution',
      icon: Users,
      filled: false,
      textColor: bodyText,
      borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#C5C5C5',
      href: '/treasury/members-finance',
      modal: false,
    },
    {
      label: 'Asset Register',
      icon: Layers,
      filled: false,
      textColor: '#2C5F2D',
      borderColor: '#2C5F2D',
      href: null,
      modal: true,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-7">
        {/* Back link */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/treasury')}
            className="flex items-center gap-1 text-xs font-semibold transition-all hover:opacity-60"
            style={{ color: bodyText }}
          >
            <ChevronLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl lg:text-[2.4rem] font-black leading-tight"
              style={{ color: primaryColor }}
            >
              Treasury Dashboard
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: subText }}>
              Financial overview and management for {TREASURY_SUMMARY.churchName}
            </p>
          </div>
          <button
            className="self-start sm:self-auto flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-sm whitespace-nowrap transition-all hover:opacity-90 active:scale-95 shadow"
            style={{
              backgroundColor: accentColor,
              color: autoText(accentColor),
              borderRadius: '10px',
            }}
          >
            <Plus size={15} strokeWidth={2.5} /> Generate Report
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Tithe (YTD)', value: TREASURY_SUMMARY.titheYTD, Icon: Church },
            { label: 'Offerings (YTD)', value: TREASURY_SUMMARY.offeringsYTD, Icon: Gift },
            { label: 'Projects (YTD)', value: TREASURY_SUMMARY.projectsYTD, Icon: Layers },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5"
              style={{
                backgroundColor: sidebarColor,
                border: `1px solid ${borderCol}`,
                borderRadius: '10px',
              }}
            >
              <div
                className="w-11 h-11 sm:w-13 sm:h-13 flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundColor: `${accentColor}25`,
                  borderRadius: '10px',
                  width: 48,
                  height: 48,
                }}
              >
                <Icon size={20} style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black" style={{ color: bodyText }}>
                  {TREASURY_SUMMARY.currency}
                  {value.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: subText }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {quickActions.map(
            ({ label, icon: Icon, filled, bg, textColor, borderColor, href, modal }) => (
              <button
                key={label}
                onClick={() => {
                  if (modal) {
                    setShowAssetModal(true);
                  } else if (href) {
                    router.push(href);
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm transition-all hover:opacity-80 active:scale-95"
                style={{
                  borderRadius: '8px',
                  backgroundColor: filled ? bg : 'transparent',
                  color: filled && bg ? autoText(bg) : textColor,
                  border: `2px solid ${filled && bg ? bg : borderColor}`,
                }}
              >
                <Icon size={13} />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            )
          )}
        </div>

        {/* Pending requests */}
        <PendingRequestsSection
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Department budgets */}
        <DepartmentBudgetSection budgets={DUMMY_DEPARTMENT_BUDGETS} />
      </div>

      {showAssetModal && <AssetRegisterModal action={async () => setShowAssetModal(false)} />}
    </div>
  );
}
