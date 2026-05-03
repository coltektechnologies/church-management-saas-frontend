'use client';

/**
 * AppearancePanel.tsx
 * Panel for toggling grid, labels, legend, and card border.
 */

interface AppearancePanelProps {
  showGrid: boolean;
  gridStyle: 'dashed' | 'solid';
  showLabels: boolean;
  showBorder: boolean;
  legendPos: 'bottom' | 'top' | 'none';
  onShowGrid: (v: boolean) => void;
  onGridStyle: (v: 'dashed' | 'solid') => void;
  onShowLabels: (v: boolean) => void;
  onShowBorder: (v: boolean) => void;
  onLegendPos: (v: 'bottom' | 'top' | 'none') => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

function pill(active: boolean, accent: string, border: string, text: string): React.CSSProperties {
  return {
    padding: '5px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: active ? 700 : 500,
    border: `1px solid ${active ? accent : border}`,
    backgroundColor: active ? `${accent}18` : 'transparent',
    color: active ? accent : `${text}60`,
    transition: 'all 0.12s',
  };
}

export default function AppearancePanel({
  showGrid,
  gridStyle,
  showLabels,
  showBorder,
  legendPos,
  onShowGrid,
  onGridStyle,
  onShowLabels,
  onShowBorder,
  onLegendPos,
  textColor,
  accentColor,
  borderColor,
}: AppearancePanelProps) {
  const sectionLabel: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    color: `${textColor}50`,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 10,
  };

  return (
    <div>
      <div style={sectionLabel}>Appearance</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          type="button"
          onClick={() => onShowGrid(!showGrid)}
          style={pill(showGrid, accentColor, borderColor, textColor)}
        >
          Grid {showGrid ? 'On' : 'Off'}
        </button>

        {showGrid && (
          <button
            type="button"
            onClick={() => onGridStyle(gridStyle === 'dashed' ? 'solid' : 'dashed')}
            style={pill(false, accentColor, borderColor, textColor)}
          >
            {gridStyle === 'dashed' ? '- - - Dashed' : '─── Solid'}
          </button>
        )}

        <button
          type="button"
          onClick={() => onShowLabels(!showLabels)}
          style={pill(showLabels, accentColor, borderColor, textColor)}
        >
          Data Labels {showLabels ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          onClick={() => onShowBorder(!showBorder)}
          style={pill(showBorder, accentColor, borderColor, textColor)}
        >
          Card Border {showBorder ? 'On' : 'Off'}
        </button>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 9,
              color: `${textColor}50`,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Legend:
          </span>
          {(['bottom', 'top', 'none'] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onLegendPos(pos)}
              style={{
                ...pill(legendPos === pos, accentColor, borderColor, textColor),
                textTransform: 'capitalize',
                padding: '4px 8px',
              }}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
