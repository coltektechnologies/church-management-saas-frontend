'use client';

/**
 * MemberRegistrationSuccess.tsx
 * Updated with specific Mint & Forest Green palette from the design.
 */

import { useEffect, useState } from 'react';
import { Check, UserPlus, LayoutDashboard } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';

// ── Helper: WCAG-based auto-contrast text colour ────────────────────────────

function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.179 ? '#111827' : '#FFFFFF';
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MemberRegistrationSuccessProps {
  memberId: string;
  memberName: string;
  onAddAnother: () => void;
  onDashboard: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MemberRegistrationSuccess({
  memberId,
  memberName,
  onAddAnother,
  onDashboard,
}: MemberRegistrationSuccessProps) {
  const [visible, setVisible] = useState(false);
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // ── Palette from Image ──────────────────────────────────────────────────────
  const mintBg = '#FAF6F6'; // The soft off-white/mint background
  const successGreen = '#24D427'; // The vibrant green for the check circle
  const forestGreen = '#419443'; // The deep green for the heading
  const darkText = '#111827'; // Primary body text
  const mutedGray = '#6B7280'; // Muted notes/subtext
  const borderGray = '#E5E7EB'; // Subtle borders

  // ── Theme Overrides ─────────────────────────────────────────────────────────
  const primary = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';

  // Card background and shadows
  const cardBg = isDark ? (isReady ? profile.darkSidebarColor || '#0D1F36' : '#0D1F36') : mintBg;
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : borderGray;
  const cardShadow = isDark
    ? `0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px ${primary}40`
    : '0 24px 80px rgba(0,0,0,0.10)';

  // Text Colors
  const headingClr = isDark ? '#2FC4B2' : forestGreen;
  const bodyText = isDark ? '#F1F5F9' : darkText;
  const mutedText = isDark ? 'rgba(241,245,249,0.55)' : mutedGray;

  // Member-ID chip
  const chipBg = isDark ? `${primary}30` : mintBg;
  const chipBorder = isDark ? `${primary}55` : borderGray;
  const chipText = isDark ? '#F1F5F9' : darkText;

  // Check circle
  const circleBg = isDark ? '#2FC4B2' : successGreen;
  const circleText = autoText(circleBg);

  // Buttons
  const addBtnBg = isDark ? 'rgba(255,255,255,0.06)' : mintBg;
  const addBtnBorder = isDark ? 'rgba(255,255,255,0.12)' : borderGray;
  const addBtnText = isDark ? '#CBD5E1' : '#374151';

  const dashBtnBg = '#2A7A2C';
  const dashBtnText = autoText(primary);
  const dashShadow = `0 4px 16px ${primary}55`;

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes mrs-slideUp {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mrs-pulse-ring {
          0%   { box-shadow: 0 0 0 0 ${circleBg}66; }
          70%  { box-shadow: 0 0 0 14px ${circleBg}00; }
          100% { box-shadow: 0 0 0 0 ${circleBg}00; }
        }

        .mrs-card {
          background: ${cardBg};
          border: 1px solid ${cardBorder};
          border-radius: 20px;
          padding: 48px 40px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: ${cardShadow};
          box-sizing: border-box;
        }
        .mrs-card.visible {
          animation: mrs-slideUp 0.38s cubic-bezier(0.34,1.36,0.64,1) both;
        }

        @media (max-width: 520px) {
          .mrs-card { padding: 32px 18px 28px !important; border-radius: 14px !important; }
        }

        .mrs-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: ${circleBg};
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          animation: mrs-pulse-ring 2s ease-out 0.4s;
          flex-shrink: 0;
        }

        .mrs-h2 {
          font-weight: 800;
          font-size: 26px;
          color: ${headingClr};
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .mrs-sub {
          font-size: 14px;
          color: ${mutedText};
          margin-bottom: 24px;
          line-height: 1.65;
        }

        .mrs-chip {
          background: ${chipBg};
          border: 1px solid ${chipBorder};
          border-radius: 10px;
          padding: 16px 24px;
          margin-bottom: 18px;
          display: inline-block;
          width: 100%;
          box-sizing: border-box;
        }
        .mrs-chip-text {
          font-weight: 800;
          font-size: 22px;
          color: ${chipText};
          letter-spacing: 0.06em;
          margin: 0;
        }

        .mrs-note {
          font-size: 13px;
          color: ${mutedText};
          margin-bottom: 32px;
          line-height: 1.65;
        }

        .mrs-btns {
          display: flex;
          gap: 12px;
        }

        .mrs-btn-add {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid ${addBtnBorder};
          background: ${addBtnBg};
          color: ${addBtnText};
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .mrs-btn-add:hover { opacity: 0.75; }

        .mrs-btn-dash {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 16px;
          border-radius: 10px;
          border: none;
          background: ${dashBtnBg};
          color: ${dashBtnText};
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: ${dashShadow};
          transition: opacity 0.15s;
        }
        .mrs-btn-dash:hover { opacity: 0.87; }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          minHeight: '500px',
          boxSizing: 'border-box',
          width: '100%',
          background: isDark
            ? isReady
              ? profile.darkBackgroundColor || '#0A1628'
              : '#0A1628'
            : '#F5F7FA',
          transition: 'background 0.3s ease',
        }}
      >
        <div className={`mrs-card${visible ? ' visible' : ''}`}>
          <div className="mrs-icon">
            <Check size={34} color="#fff" strokeWidth={1} />
          </div>

          <h2 className="mrs-h2">Registration Successful!</h2>

          <p className="mrs-sub">
            Congratulations!! You have successfully registered{' '}
            <span style={{ color: bodyText, fontWeight: 700 }}>{memberName}</span> to your
            Department.
          </p>

          <div className="mrs-chip">
            <p className="mrs-chip-text">{memberId}</p>
          </div>

          <p className="mrs-note">
            Login credentials will be sent to the member&apos;s phone and email shortly.
          </p>

          <div className="mrs-btns">
            <button className="mrs-btn-add" type="button" onClick={onAddAnother}>
              <UserPlus size={16} />
              Add Another
            </button>

            <button className="mrs-btn-dash" type="button" onClick={onDashboard}>
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
