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
        alignItems: 'center', // Centers icon vertically with the text block
        gap: '18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        flex: 1,
        minWidth: '240px',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Icon Box */}
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

      {/* Content Area: Wraps Value, Badge, and Title for shared alignment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            color: textColor,
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}
        >
          {value}
        </span>

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
            width: 'fit-content',
          }}
        >
          {badge}
        </span>

        {/* Metric Title aligned to the same start point */}
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            fontSize: '13px',
            color: `${textColor}90`,
            textAlign: 'left',
            marginTop: '4px',
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
