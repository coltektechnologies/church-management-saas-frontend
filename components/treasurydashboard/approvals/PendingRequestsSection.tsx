'use client';

// /components/treasurydashboard/approvals/PendingRequestsSection.tsx

import { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import type { ExpenseRequest } from './approvalsData';
import ViewRequestModal from './ViewRequestModal';

type Props = {
  requests: ExpenseRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export default function PendingRequestsSection({ requests, onApprove, onReject }: Props) {
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

  // Card bg is always white in light mode, sidebar in dark
  const cardBg = isDark ? sidebarColor : '#FFFFFF';
  const infoBorderColor = isDark ? 'rgba(255,255,255,0.12)' : '#C5C5C5';
  const outerBorderCol = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : '#6B7280';
  const bodyText = isDark ? 'rgba(255,255,255,0.9)' : '#1F2937';
  const sectionBg = isDark ? `${primaryColor}18` : bgColor;

  const [search, setSearch] = useState('');
  const [viewRequest, setViewRequest] = useState<ExpenseRequest | null>(null);

  const filtered = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter((r) => r.status === 'pending');
  const resolved = filtered.filter((r) => r.status !== 'pending');

  const RequestCard = ({ req }: { req: ExpenseRequest }) => {
    const isResolved = req.status !== 'pending';
    const statusBg =
      req.status === 'approved' ? '#2BAF2E20' : req.status === 'rejected' ? '#FA5C5C20' : '';
    const statusColor = req.status === 'approved' ? '#2BAF2E' : '#FA5C5C';

    return (
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: cardBg,
          borderRadius: '10px',
          border: `1px solid ${outerBorderCol}`,
          opacity: isResolved ? 0.75 : 1,
        }}
      >
        {/* Inner info area */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4"
          style={{ border: `1px solid ${infoBorderColor}`, margin: '6px', borderRadius: '8px' }}
        >
          {/* Left: title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold" style={{ color: bodyText }}>
                {req.title}
              </p>
              {isResolved && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: statusBg, color: statusColor }}
                >
                  {req.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: mutedText }}>
              {req.department} · Requested by {req.requestedBy} · {req.date}
            </p>
          </div>

          {/* Right: amount + buttons */}
          <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-black" style={{ color: '#FA5C5C' }}>
                {req.currency}
                {req.amount.toLocaleString()}
              </p>
              <p className="text-[10px]" style={{ color: mutedText }}>
                ID: {req.id}
              </p>
            </div>

            {!isResolved && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onApprove(req.id)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 font-bold text-[11px] sm:text-xs transition-all hover:opacity-80 active:scale-95 whitespace-nowrap"
                  style={{ backgroundColor: '#2BAF2E', color: '#fff', borderRadius: '8px' }}
                >
                  <CheckCircle size={11} /> Approve
                </button>
                <button
                  onClick={() => setViewRequest(req)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 font-bold text-[11px] sm:text-xs transition-all hover:opacity-80 active:scale-95"
                  style={{ backgroundColor: '#D9D9D9', color: '#1F2937', borderRadius: '8px' }}
                >
                  <Eye size={11} /> View
                </button>
                <button
                  onClick={() => onReject(req.id)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 font-bold text-[11px] sm:text-xs transition-all hover:opacity-80 active:scale-95"
                  style={{ backgroundColor: '#FA5C5C', color: '#fff', borderRadius: '8px' }}
                >
                  <XCircle size={11} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          backgroundColor: sectionBg,
          borderRadius: '10px',
          border: `1px solid ${outerBorderCol}`,
          padding: '20px 16px',
        }}
      >
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            {/* Icon matching design */}
            <div className="w-6 h-6 flex items-center justify-center" style={{ color: bodyText }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="16"
                  height="16"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 6h10M4 9h7M4 12h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-sm sm:text-base font-black" style={{ color: bodyText }}>
              Pending Expense Requests
            </h2>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 w-full sm:w-56"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${outerBorderCol}`,
              borderRadius: '8px',
            }}
          >
            <Search size={13} style={{ color: mutedText, flexShrink: 0 }} />
            <input
              className="flex-1 text-xs bg-transparent outline-none"
              style={{ color: bodyText }}
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Pending list */}
        <div className="space-y-2 sm:space-y-3">
          {pending.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <CheckCircle size={28} style={{ color: accentColor, opacity: 0.4 }} />
              <p className="text-sm font-semibold" style={{ color: mutedText }}>
                {search ? 'No matching requests' : 'All caught up! No pending requests.'}
              </p>
            </div>
          ) : (
            pending.map((req) => <RequestCard key={req.id} req={req} />)
          )}
        </div>

        {/* Resolved */}
        {resolved.length > 0 && (
          <div className="mt-5">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: mutedText }}
            >
              Recently Resolved
            </p>
            <div className="space-y-2">
              {resolved.map((req) => (
                <RequestCard key={req.id} req={req} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ViewRequestModal
        request={viewRequest}
        onClose={() => setViewRequest(null)}
        onApprove={onApprove}
        onReject={onReject}
      />
    </>
  );
}
