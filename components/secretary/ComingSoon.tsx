'use client';

import type { ReactNode } from 'react';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

interface ComingSoonProps {
  title: string;
  icon: ReactNode;
}

export default function ComingSoon({ title, icon }: ComingSoonProps) {
  const { profile, isReady } = useSecretaryProfile();
  const primaryColor = isReady ? profile.primaryColor || '#0B2A4A' : '#0B2A4A';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      {/* Icon colour is injected via CSS var set by applyTheme — works automatically */}
      <div style={{ color: primaryColor }}>{icon}</div>

      <h1 className="text-2xl font-bold text-foreground">{title}</h1>

      <p className="text-muted-foreground text-sm max-w-sm">
        This section is under construction. Check back soon.
      </p>

      <span
        className="px-4 py-1.5 text-xs font-semibold tracking-wide"
        style={{
          borderRadius: '8px',
          color: primaryColor,
          backgroundColor: `${primaryColor}18`,
        }}
      >
        Coming Soon
      </span>
    </div>
  );
}
