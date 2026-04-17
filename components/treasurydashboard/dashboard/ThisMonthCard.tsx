'use client';

/**
 * ThisMonthCard.tsx
 */

import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  YAxis,
} from 'recharts';

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

const TITHE_DATA    = [{ v: 120 }, { v: 280 }, { v: 180 }, { v: 450 }, { v: 220 }, { v: 80 }, { v: 110 }, { v: 280 }];
const OFFERING_DATA = [{ v: 200 }, { v: 110 }, { v: 280 }, { v: 180 }, { v: 450 }, { v: 220 }, { v: 90 }, { v: 120 }];
const TITHE_PEAK    = 3;
const OFFERING_PEAK = 4;

interface SparkProps {
  data: { v: number }[];
  peakIndex: number;
  color: string;
}

function SparkBar({ data, peakIndex, color }: SparkProps) {
  return (
    <div style={{ width: '100%', flex: 1, minHeight: 120, marginTop: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* FIX: barCategoryGap moved here to the BarChart component */}
        <BarChart 
            data={data} 
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="15%" 
        >
          <YAxis hide type="number" domain={[0, 'auto']} />
          <Bar 
            dataKey="v" 
            radius={[4, 4, 0, 0]} 
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={color}
                fillOpacity={i === peakIndex ? 1 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ThisMonthCard() {
  const { profile, isReady } = useTreasuryProfile();

  const isDark       = isReady ? profile.darkMode : false;
  const cardBg       = isDark  ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const textColor    = autoText(cardBg);
  const accentColor  = isDark  ? profile.darkAccentColor  || '#2FC4B2' : profile.accentColor  || '#2FC4B2';
  const primaryColor = isDark  ? profile.darkPrimaryColor || '#0B2A4A' : profile.primaryColor || '#0B2A4A';

  return (
    <div style={{
      backgroundColor: cardBg,
      border: `1.5px solid ${accentColor}40`,
      borderRadius: 16,
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
    }}>
      <h3 style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        fontSize: 18,
        color: textColor,
        margin: '0 0 24px 0',
      }}>
        This Month
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 24,
        flex: 1,     
      }}>
        {/* ── Tithing Column ── */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: `${textColor}80`,
            margin: '0 0 6px 0',
          }}>
            Tithing
          </p>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: textColor,
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            GHS250,025,222
          </p>

          <SparkBar data={TITHE_DATA} peakIndex={TITHE_PEAK} color={accentColor} />
        </div>

        {/* ── Offerings Column ── */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: `${textColor}80`,
            margin: '0 0 6px 0',
          }}>
            Offerings
          </p>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: textColor,
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            GHS250,025
          </p>

          <SparkBar data={OFFERING_DATA} peakIndex={OFFERING_PEAK} color={primaryColor} />
        </div>
      </div>
    </div>
  );
}