'use client';

import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) { return 'Good morning'; }
  if (h < 17) { return 'Good afternoon'; }
  return 'Good evening';
}

function autoText(hex: string): string {
  const h = (hex || '#ffffff').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

export default function WelcomeHeader() {
  const { profile, isReady } = useTreasuryProfile();

  const isDark    = isReady ? profile.darkMode            : false;
  const bgColor   = isDark  ? profile.darkBackgroundColor || '#0A1628' : '#F5F7FA';
  const textColor = autoText(bgColor);

  // Prefer preferredName → adminName → warm generic fallback (no role label)
  const displayName = isReady
    ? (profile.preferredName || profile.adminName || null)
    : null;

  const greeting = isReady ? getTimeGreeting() : 'Welcome';

  // "Good morning, welcome back 👋"
  const headline = isReady
    ? displayName
      ? `${greeting}, ${displayName}`
      : `${greeting}, welcome back 👋`
    : '\u00A0';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <h1
          suppressHydrationWarning
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: textColor,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h1>
        <p
          suppressHydrationWarning
          style={{
            fontFamily: "'OV Soge', sans-serif",
            fontSize: 13,
            color: `${textColor}60`,
            margin: '4px 0 0',
          }}
        >
          {isReady ? "Here's your treasury overview for today." : '\u00A0'}
        </p>
      </div>
    </div>
  );
}