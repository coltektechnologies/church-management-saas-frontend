'use client';

/**
 * MembersGridView.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Card-grid alternative view for the members list.
 * Shown when the user switches to "grid" mode in MembersTableHeader.
 */

import { Eye, Pencil, Trash2, UserCog } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import type { DepartmentMember, MemberRole, MemberStatus } from './membersDummyData';

// ── Badge colour maps ─────────────────────────────────────────────────────────

const ROLE_COLORS: Record<MemberRole, { bg: string; text: string }> = {
  Admin: { bg: '#DBEAFE', text: '#1D4ED8' },
  'Core Admin': { bg: '#F3E8FF', text: '#7C3AED' },
  'Departmental Head': { bg: '#FEF3C7', text: '#D97706' },
  Member: { bg: '#D1FAE5', text: '#059669' },
};
const ROLE_COLORS_DARK: Record<MemberRole, { bg: string; text: string }> = {
  Admin: { bg: '#1E3A5F', text: '#60A5FA' },
  'Core Admin': { bg: '#2D1B4E', text: '#C084FC' },
  'Departmental Head': { bg: '#3D2A00', text: '#FBBF24' },
  Member: { bg: '#064E3B', text: '#34D399' },
};
const STATUS_COLORS: Record<MemberStatus, { bg: string; text: string }> = {
  Active: { bg: '#F0FDF4', text: '#16A34A' },
  Inactive: { bg: '#FEF2F2', text: '#DC2626' },
  Pending: { bg: '#FFFBEB', text: '#D97706' },
};
const STATUS_COLORS_DARK: Record<MemberStatus, { bg: string; text: string }> = {
  Active: { bg: '#052E16', text: '#4ADE80' },
  Inactive: { bg: '#450A0A', text: '#F87171' },
  Pending: { bg: '#451A03', text: '#FCD34D' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface MembersGridViewProps {
  members: DepartmentMember[];
  onView: (m: DepartmentMember) => void;
  onEdit: (m: DepartmentMember) => void;
  onRemove: (m: DepartmentMember) => void;
  onAssignRole: (m: DepartmentMember) => void;
}

// ── MembersGridView ────────────────────────────────────────────────────────────

export default function MembersGridView({
  members,
  onView,
  onEdit,
  onRemove,
  onAssignRole,
}: MembersGridViewProps) {
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const cardBg = isDark ? '#0D1F36' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';
  const innerBg = isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB';

  if (members.length === 0) {
    return (
      <div
        className="py-20 text-center"
        style={{
          background: cardBg,
          fontFamily: "'Poppins', sans-serif",
          fontSize: '13px',
          color: mutedColor,
        }}
      >
        No members found.
      </div>
    );
  }

  return (
    <div
      className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      style={{ background: cardBg }}
    >
      {members.map((member) => {
        const rc = isDark ? ROLE_COLORS_DARK[member.role] : ROLE_COLORS[member.role];
        const sc = isDark ? STATUS_COLORS_DARK[member.status] : STATUS_COLORS[member.status];
        const initials = member.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        return (
          <div
            key={member.id}
            className="flex flex-col rounded-xl overflow-hidden transition-shadow duration-200"
            style={{
              background: innerBg,
              border: `1px solid ${borderColor}`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 4px 20px rgba(0,0,0,0.10)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            {/* Top: avatar + name */}
            <div className="flex flex-col items-center pt-5 pb-3 px-4 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden mb-3"
                style={{ background: member.avatarUrl ? 'transparent' : accentColor }}
              >
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "'OV Soge', sans-serif",
                      fontWeight: 700,
                      fontSize: '16px',
                      color: '#FFFFFF',
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  color: textColor,
                  lineHeight: '1.3',
                }}
              >
                {member.name}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '11px',
                  color: mutedColor,
                  marginTop: '2px',
                }}
              >
                {member.memberId}
              </p>

              {/* Role + Status badges */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{ background: rc.bg, color: rc.text, fontFamily: "'Poppins', sans-serif" }}
                >
                  {member.role}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: sc.bg, color: sc.text, fontFamily: "'Poppins', sans-serif" }}
                >
                  {member.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div
              className="px-4 py-3 space-y-1.5 flex-1"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '11px',
                  color: mutedColor,
                }}
              >
                📞 {member.phone}
              </p>
              <p
                className="hidden sm:block"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '11px',
                  color: mutedColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                ✉️ {member.email}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {member.departments.map((d) => (
                  <span
                    key={d}
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: `${accentColor}18`,
                      color: accentColor,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-around px-2 py-2"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              {[
                { icon: Eye, label: 'View', fn: () => onView(member), danger: false },
                { icon: Pencil, label: 'Edit', fn: () => onEdit(member), danger: false },
                { icon: UserCog, label: 'Role', fn: () => onAssignRole(member), danger: false },
                { icon: Trash2, label: 'Remove', fn: () => onRemove(member), danger: true },
              ].map(({ icon: Icon, label, fn, danger }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onClick={fn}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors"
                  style={{ color: danger ? '#DC2626' : mutedColor, cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = danger
                      ? 'rgba(220,38,38,0.08)'
                      : `${borderColor}`;
                    (e.currentTarget as HTMLButtonElement).style.color = danger
                      ? '#DC2626'
                      : textColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = danger
                      ? '#DC2626'
                      : mutedColor;
                  }}
                >
                  <Icon size={13} />
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '9px',
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}