'use client';

/**
 * CompareSeriesPanel.tsx
 */

import { useState } from 'react';
import { Check, Search, X, EyeOff } from 'lucide-react';
import {
  getAllOptionsIncludingHidden,
  type DropdownOption} from '@/components/treasurydashboard/recordIncome/dropdownOptions';

export const PALETTE = [
  '#2FC4B2',
  '#0B2A4A',
  '#E4002B',
  '#FFB020',
  '#6366F1',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#22C55E',
  '#A855F7',
  '#EAB308',
  '#3B82F6',
];

interface CompareSeriesPanelProps {
  liveTypes: DropdownOption[];
  selectedTypes: string[];
  seriesColors: Record<string, string>;
  onToggle: (value: string) => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
  isDark?: boolean;
}

export default function CompareSeriesPanel({
  liveTypes,
  selectedTypes,
  seriesColors,
  onToggle,
  textColor,
  accentColor,
  borderColor,
  isDark = false}: CompareSeriesPanelProps) {
  const [query, setQuery] = useState('');
  const allTypes: DropdownOption[] = getAllOptionsIncludingHidden('income_types');
  const visibleValues = new Set(liveTypes.map((t) => t.value));

  // Filter by search query
  const displayed = query.trim()
    ? allTypes.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()))
    : allTypes;

  const getColor = (tv: string, i: number) => seriesColors[tv] ?? PALETTE[i % PALETTE.length];
  const indexMap = new Map(allTypes.map((t, i) => [t.value, i]));
  const sectionLabel: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    color: `${textColor}50`,
    textTransform: 'uppercase',
    letterSpacing: '0.08em'};

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 8,
          flexWrap: 'wrap'}}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={sectionLabel}>Income Series</div>
          <span
            style={{ fontSize: 9, color: `${textColor}40` }}
          >
            {selectedTypes.length} of {allTypes.filter((t) => !t.isHidden).length} active selected
          </span>
        </div>
        {selectedTypes.length > 0 && (
          <span
            style={{
              fontSize: 9,
              color: accentColor,
              fontWeight: 700}}
          >
            {selectedTypes.length} selected
          </span>
        )}
      </div>

      {/* Search box */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search
          size={12}
          style={{
            position: 'absolute',
            left: 9,
            top: '50%',
            transform: 'translateY(-50%)',
            color: `${textColor}45`,
            pointerEvents: 'none'}}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search income types…"
          style={{
            width: '100%',
            padding: '7px 32px 7px 28px',
            fontSize: 11,
            color: textColor,
            caretColor: accentColor,
            backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${borderColor}`,
            borderRadius: 7,
            outline: 'none'}}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: `${textColor}50`,
              display: 'flex',
              padding: 2}}
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Type pills */}
      {displayed.length === 0 ? (
        <span
          style={{ fontSize: 11, color: `${textColor}40` }}
        >
          No types match your search.
        </span>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {displayed.map((t) => {
            const active = selectedTypes.includes(t.value);
            const idx = indexMap.get(t.value) ?? 0;
            const col = getColor(t.value, idx);
            const isHidden = t.isHidden || !visibleValues.has(t.value);

            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onToggle(t.value)}
                title={
                  isHidden
                    ? `"${t.label}" is hidden from the form but can still be compared`
                    : undefined
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  border: `1px ${isHidden ? 'dashed' : 'solid'} ${active ? col : isHidden ? `${textColor}30` : borderColor}`,
                  backgroundColor: active
                    ? `${col}1A`
                    : isHidden
                      ? `${textColor}05`
                      : 'transparent',
                  color: active ? col : isHidden ? `${textColor}45` : `${textColor}65`,
                  transition: 'all 0.12s',
                  opacity: isHidden && !active ? 0.7 : 1}}
              >
                {/* Colour dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isHidden && !active ? `${textColor}30` : col,
                    flexShrink: 0,
                    display: 'inline-block'}}
                />

                {t.label}

                {/* Hidden badge */}
                {isHidden && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: 8,
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: 4,
                      backgroundColor: `${textColor}10`,
                      color: `${textColor}45`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'}}
                  >
                    <EyeOff size={7} /> hidden
                  </span>
                )}

                {active && <Check size={9} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Hint about hidden types */}
      {allTypes.some((t) => t.isHidden) && (
        <p
          style={{
            fontSize: 9,
            color: `${textColor}35`,
            marginTop: 8,
            lineHeight: 1.4}}
        >
          <EyeOff size={8} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
          Dashed-border types are hidden from the income form but can still be charted.
        </p>
      )}
    </div>
  );
}
