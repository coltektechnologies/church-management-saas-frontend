'use client';

/**
 * Treasury financial reports — same finance report endpoints as admin ({@link AdminReportsHub}),
 * with treasury theme variables applied.
 */

import { useMemo, type CSSProperties } from 'react';

import AdminReportsHub from '@/components/admin/reports/AdminReportsHub';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

export default function TreasuryReportsHub() {
  const { profile, isReady } = useTreasuryProfile();

  const cssVars = useMemo(() => {
    const isDark = isReady ? (profile.darkMode ?? false) : false;
    const surface = isDark ? profile.darkSidebarColor || '#0D1F36' : '#FFFFFF';
    const border = isDark ? 'rgba(255,255,255,0.12)' : '#E0E5ED';
    const text = isDark ? '#FFFFFF' : '#0B2A4A';
    const muted = isDark ? 'rgba(255,255,255,0.58)' : 'rgba(11,42,74,0.58)';
    const bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,42,74,0.04)';
    const accent = isDark ? profile.darkAccentColor || '#2FC4B2' : profile.accentColor || '#2FC4B2';
    return {
      '--admin-surface': surface,
      '--admin-border': border,
      '--admin-text': text,
      '--admin-text-muted': muted,
      '--admin-bg': bg,
      '--color-primary': accent,
      '--color-accent': accent,
    } as CSSProperties;
  }, [isReady, profile]);

  return (
    <div className="w-full" style={cssVars}>
      <AdminReportsHub variant="treasury" />
    </div>
  );
}
