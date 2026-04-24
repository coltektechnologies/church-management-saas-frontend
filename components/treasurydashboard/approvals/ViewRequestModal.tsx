'use client';

// /components/treasurydashboard/approvals/ViewRequestModal.tsx

import { X, FileText, User, Calendar, Tag, Paperclip, CheckCircle, XCircle } from 'lucide-react';
import type { ExpenseRequest } from './approvalsData';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

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

type Props = {
  request: ExpenseRequest | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export default function ViewRequestModal({ request, onClose, onApprove, onReject }: Props) {
  const { profile, isReady } = useTreasuryProfile();
  const isDark = isReady ? profile.darkMode : false;

  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const sidebarColor = isDark
    ? profile.darkSidebarColor || '#0D1F36'
    : profile.sidebarColor || '#FFFFFF';

  const textOnPrimary = autoText(primaryColor);
  const borderCol = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : '#6B7280';
  const bodyText = isDark ? 'rgba(255,255,255,0.9)' : '#1F2937';
  const metaBg = isDark ? `${primaryColor}30` : '#F5F7FA';

  if (!request) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg overflow-hidden flex flex-col"
        style={{
          backgroundColor: sidebarColor,
          border: `1px solid ${borderCol}`,
          borderRadius: '10px 10px 0 0',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${borderCol}`, backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}25`, borderRadius: '10px' }}
            >
              <FileText size={17} style={{ color: accentColor }} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: `${textOnPrimary}55` }}
              >
                Request Summary
              </p>
              <p className="text-sm font-black" style={{ color: textOnPrimary }}>
                {request.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-70"
            style={{
              backgroundColor: `${textOnPrimary}15`,
              color: textOnPrimary,
              borderRadius: '8px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {/* Title + desc */}
          <div>
            <h2 className="text-base sm:text-lg font-black" style={{ color: bodyText }}>
              {request.title}
            </h2>
            <p className="text-xs sm:text-sm mt-1.5 leading-relaxed" style={{ color: mutedText }}>
              {request.description}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: User, label: 'Requested By', value: request.requestedBy },
              { icon: Tag, label: 'Department', value: request.department },
              { icon: Calendar, label: 'Date', value: request.date },
              { icon: FileText, label: 'Category', value: request.category },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="p-3"
                style={{
                  backgroundColor: metaBg,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '10px',
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} style={{ color: accentColor }} />
                  <p
                    className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: mutedText }}
                  >
                    {label}
                  </p>
                </div>
                <p className="text-xs font-bold" style={{ color: bodyText }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Amount banner */}
          <div
            className="p-4 flex items-center justify-between"
            style={{
              background: `linear-gradient(120deg, ${primaryColor} 0%, ${accentColor}99 100%)`,
              borderRadius: '10px',
            }}
          >
            <p className="text-xs sm:text-sm font-bold" style={{ color: `${textOnPrimary}70` }}>
              Requested Amount
            </p>
            <p className="text-xl sm:text-2xl font-black" style={{ color: textOnPrimary }}>
              {request.currency} {request.amount.toLocaleString()}
            </p>
          </div>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: mutedText }}
              >
                Attachments
              </p>
              <div className="flex flex-wrap gap-1.5">
                {request.attachments.map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                      border: `1px solid ${accentColor}30`,
                      borderRadius: '8px',
                    }}
                  >
                    <Paperclip size={10} /> {file}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-2.5 px-5 py-4 shrink-0"
          style={{ borderTop: `1px solid ${borderCol}` }}
        >
          <button
            onClick={() => {
              onReject(request.id);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-sm transition-all hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: '#FA5C5C22',
              color: '#FA5C5C',
              border: '1px solid #FA5C5C44',
              borderRadius: '8px',
            }}
          >
            <XCircle size={14} /> Reject
          </button>
          <button
            onClick={() => {
              onApprove(request.id);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-sm transition-all hover:opacity-80 active:scale-95"
            style={{ backgroundColor: '#2BAF2E', color: '#fff', borderRadius: '8px' }}
          >
            <CheckCircle size={14} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}
