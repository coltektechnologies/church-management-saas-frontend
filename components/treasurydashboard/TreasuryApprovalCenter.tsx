'use client';

/**
 * Treasury portal approval hub — same queues as admin ({@link ApprovalCenter} variant admin):
 * announcements, program proposals, and expense requests (all workflow stages).
 * Maps treasury theme colors onto ApprovalCenter CSS variables.
 */

import { useMemo, type CSSProperties } from 'react';

import ApprovalCenter from '@/components/admin/approvals/ApprovalCenter';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

export default function TreasuryApprovalCenter() {
  const { profile, isReady } = useTreasuryProfile();

  const cssVars = useMemo(() => {
    const isDark = isReady ? (profile.darkMode ?? false) : false;
    const surface = isDark ? profile.darkSidebarColor || '#0D1F36' : '#FFFFFF';
    const border = isDark ? 'rgba(255,255,255,0.12)' : '#E0E5ED';
    const text = isDark ? '#FFFFFF' : '#0B2A4A';
    const muted = isDark ? 'rgba(255,255,255,0.58)' : 'rgba(11,42,74,0.58)';
    const bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,42,74,0.04)';
    const primary = isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2';
    return {
      '--admin-surface': surface,
      '--admin-border': border,
      '--admin-text': text,
      '--admin-text-muted': muted,
      '--admin-bg': bg,
      '--color-primary': primary,
    } as CSSProperties;
  }, [isReady, profile]);

  return (
    <div className="max-w-5xl mx-auto w-full" style={cssVars}>
      <ApprovalCenter variant="treasury" />
    </div>
  );
}
