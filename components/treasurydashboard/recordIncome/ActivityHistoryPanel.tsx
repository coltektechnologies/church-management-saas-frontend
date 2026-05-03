'use client';

/**
 * ActivityHistoryPanel.tsx
 */

import { useState, useEffect, useMemo } from 'react';
import { History, Search, X, ChevronDown, ChevronUp, Filter, Clock } from 'lucide-react';
import {
  loadHistory,
  saveHistory,
  formatTimestamp,
  actionIcon,
  actionColor,
  type ActivityEntry,
  type ActivityCategory} from './activityHistory';

// ── Props ─────────────────────────────────────────────────────────────────────
interface ActivityHistoryPanelProps {
  textColor?: string;
  accentColor?: string;
  cardBg?: string;
  borderColor?: string;
  primaryColor?: string;
  isDark?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function groupByDate(entries: ActivityEntry[]): { date: string; items: ActivityEntry[] }[] {
  const map = new Map<string, ActivityEntry[]>();
  entries.forEach((e) => {
    const dateKey = new Date(e.timestamp).toLocaleDateString('en-GH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'});
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    // Use optional chaining + nullish coalescing to avoid a non-null assertion
    const bucket = map.get(dateKey) ?? [];
    bucket.push(e);
    map.set(dateKey, bucket);
  });
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  income: 'Income',
  dropdown: 'Dropdowns',
  export: 'Exports',
  filter: 'Filters',
  settings: 'Settings'};

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  income: '#15803D',
  dropdown: '#D97706',
  export: '#7C3AED',
  filter: '#0891B2',
  settings: '#475569'};

// ── Entry row ─────────────────────────────────────────────────────────────────
function EntryRow({
  entry,
  textColor,
  borderColor}: {
  entry: ActivityEntry;
  textColor: string;
  borderColor: string;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = actionColor(entry.action);

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        paddingBottom: '16px',
        position: 'relative'}}
    >
      {/* Timeline dot */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: `${color}18`,
            border: `2px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            flexShrink: 0}}
        >
          {actionIcon(entry.action)}
        </div>
        <div
          style={{
            width: '2px',
            flex: 1,
            backgroundColor: `${borderColor}`,
            marginTop: '4px',
            minHeight: '8px'}}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px'}}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontWeight: 600,
                fontSize: '12px',
                color: textColor,
                lineHeight: 1.4,
                margin: 0}}
            >
              {entry.summary}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '3px',
                flexWrap: 'wrap'}}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  color: `${textColor}60`}}
              >
                <Clock size={9} />
                {formatTimestamp(entry.timestamp)}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: `${textColor}50`}}
              >
                by <strong style={{ color: `${textColor}80` }}>{entry.actor}</strong>
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: `${CATEGORY_COLORS[entry.category]}18`,
                  color: CATEGORY_COLORS[entry.category],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'}}
              >
                {CATEGORY_LABELS[entry.category]}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {entry.detail && (
              <button
                onClick={() => setExpanded((p) => !p)}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${textColor}10`,
                  border: 'none',
                  cursor: 'pointer',
                  color: `${textColor}60`}}
              >
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            )}
          </div>
        </div>

        {expanded && entry.detail && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: `${textColor}06`,
              border: `1px solid ${borderColor}`,
              fontSize: '11px',
              color: `${textColor}70`,
              fontStyle: 'italic',
              lineHeight: 1.5}}
          >
            {entry.detail}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ActivityHistoryPanel({
  textColor = '#0B2A4A',
  accentColor = '#2FC4B2',
  cardBg = '#FFFFFF',
  borderColor = '#DFDADA',
  primaryColor = '#0B2A4A',
  isDark = false}: ActivityHistoryPanelProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => loadHistory());
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | ''>('');
  const [showClearAll, setShowClearAll] = useState(false);

  // auto refresh every 2 seconds
  useEffect(() => {
    const id = window.setInterval(() => {
      setEntries(loadHistory());
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    let result = entries;
    if (filterCategory) {
      result = result.filter((e) => e.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.summary.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          (e.detail ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, filterCategory, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleDelete = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const inputStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: textColor,
    caretColor: textColor,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${borderColor}`,
    borderRadius: '8px',
    outline: 'none',
    padding: '8px 12px'};

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    border: `1px solid ${active ? accentColor : borderColor}`,
    backgroundColor: active ? `${accentColor}18` : 'transparent',
    color: active ? accentColor : `${textColor}60`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const});

  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'}}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px'}}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${primaryColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'}}
          >
            <History size={16} style={{ color: primaryColor }} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: textColor,
                margin: 0}}
            >
              Activity History
            </h3>
            <p
              style={{
                fontSize: '11px',
                color: `${textColor}60`,
                margin: 0}}
            >
              {entries.length} event{entries.length !== 1 ? 's' : ''} recorded
              {filtered.length !== entries.length && (
                <span style={{ color: accentColor, fontWeight: 600 }}>
                  {' '}
                  · {filtered.length} shown
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Search + category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: `${textColor}50`}}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity…"
            style={{ ...inputStyle, paddingLeft: '30px', width: '100%' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: `${textColor}50`,
                display: 'flex'}}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '16px',
          alignItems: 'center'}}
      >
        <Filter size={11} style={{ color: `${textColor}40` }} />
        <button onClick={() => setFilterCategory('')} style={pillStyle(!filterCategory)}>
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as ActivityCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
            style={pillStyle(filterCategory === cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div style={{ height: '1px', backgroundColor: borderColor, marginBottom: '16px' }} />

      {/* Timeline */}
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: `${textColor}40` }}>
          <History size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
          <p style={{ fontSize: '13px' }}>
            No activity recorded yet.
          </p>
          <p
            style={{
              fontSize: '11px',
              marginTop: '4px',
              opacity: 0.7}}
          >
            Activity appears here as you record income, manage dropdowns, and more.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: `${textColor}40` }}>
          <Search size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p style={{ fontSize: '13px' }}>
            No activity matches your filters.
          </p>
        </div>
      ) : (
        <div>
          {grouped.map((group) => (
            <div key={group.date} style={{ marginBottom: '24px' }}>
              {/* Date header */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
              >
                <div style={{ height: '1px', flex: 1, backgroundColor: borderColor }} />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: `${textColor}55`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap'}}
                >
                  {group.date}
                </span>
                <div style={{ height: '1px', flex: 1, backgroundColor: borderColor }} />
              </div>

              {group.items.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  textColor={textColor}
                  borderColor={borderColor}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Clear all confirm */}
      {showClearAll && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)'}}
        >
          <div
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'}}
          >
            <h4
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: '15px',
                color: textColor,
                margin: '0 0 8px'}}
            >
              Clear All Activity?
            </h4>
            <p
              style={{
                fontSize: '12px',
                color: `${textColor}70`,
                margin: '0 0 16px',
                lineHeight: 1.6}}
            >
              This will permanently delete all {entries.length} activity entries. This cannot be
              undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowClearAll(false)}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: `${textColor}12`,
                  color: textColor,
                  border: 'none',
                  cursor: 'pointer'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
