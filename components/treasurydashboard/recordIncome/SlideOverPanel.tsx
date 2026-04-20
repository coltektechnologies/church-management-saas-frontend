'use client';

/**
 * SlideOverPanel.tsx
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  textColor?: string;
  cardBg?: string;
  borderColor?: string;
  accentColor?: string;
  pageBg?: string;
  [key: string]: unknown;
}

export default function SlideOverPanel({
  open,
  onClose,
  title,
  icon,
  children,
  textColor   = '#0B2A4A',
  cardBg      = '#FFFFFF',
  borderColor = '#E0E5ED',
  accentColor = '#2FC4B2',
  pageBg      = '#EEF2F7',
}: SlideOverPanelProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) {return;}
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {onClose();}
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) {return null;}

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex' }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.36)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 'min(600px, 96vw)',
          backgroundColor: pageBg,
          borderLeft: `1px solid ${borderColor}`,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-16px 0 56px rgba(0,0,0,0.14)',
          animation: 'ri-slideIn 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              backgroundColor: `${accentColor}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accentColor,
            }}>
              {icon}
            </div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: '15px', color: textColor }}>
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: textColor,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes ri-slideIn {
          from { transform: translateX(100%); opacity: 0.4; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </div>
  );
}