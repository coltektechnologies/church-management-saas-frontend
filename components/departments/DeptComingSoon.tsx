'use client';

import type { ReactNode } from 'react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

interface ComingSoonProps {
  title: string;
  icon: ReactNode;
}

export default function DeptComingSoon({ title, icon }: ComingSoonProps) {
  const { profile, isReady } = useDepartmentProfile();
  const primaryColor = isReady
    ? profile.darkMode
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const accentColor = isReady
    ? profile.darkMode
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div style={{ color: accentColor }}>{icon}</div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        This section is under construction. Check back soon.
      </p>
      <span
        className="px-4 py-1.5 text-xs font-semibold tracking-wide"
        style={{ borderRadius: '8px', color: primaryColor, backgroundColor: `${primaryColor}18` }}
      >
        Coming Soon
      </span>
    </div>
  );
}
