'use client';

/**
 * KPICard.tsx
 */

import { type ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  badge: string;
  badgePositive?: boolean;
  icon: ReactNode;
  accentColor: string;
  textColor: string;
  cardBg: string;
  index?: number;
}

// Colors for cards
const COLORS = [
  { solid: '#09A30C', light: '#D1FADF' }, // Green (Total Income)
  { solid: '#1775D6', light: '#D1E9FF' }, // Blue (Net Balance)
  { solid: '#F76D6F', light: '#FEE4E2' }, // Red (Total Expenses)
  { solid: '#E88D0E', light: '#FEF0C7' }, // Orange (Transaction Count)
];

export default function KPICard({
  title,
  value,
  badge,
  icon,
  textColor,
  cardBg,
  index = 0,
}: KPICardProps) {
  const colorSet = COLORS[index % COLORS.length];

  return (
    <div
      style={{
        backgroundColor: cardBg,
        borderRadius: '24px',
        borderLeft: `6px solid ${colorSet.solid}`,
        padding: '32px 24px',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        flex: 1,
        minWidth: '240px',
        height: '100%',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Solid Icon Box - Icons are white on these backgrounds */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: colorSet.solid,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#FFFFFF',
        }}
      >
        {icon}
      </div>

      {/* Content Area */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          {/* Main Financial Value */}
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: textColor,
              letterSpacing: '-0.5px',
            }}
          >
            {value}
          </span>

          {/* Trend Badge */}
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: '11px',
              color: colorSet.solid,
              backgroundColor: colorSet.light,
              padding: '4px 10px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        </div>

        {/* Metric Title */}
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            fontSize: '13px',
            color: `${textColor}90`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}