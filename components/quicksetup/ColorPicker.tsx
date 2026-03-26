'use client';

import { useState, useCallback, useEffect } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

type ColorMode = 'hex' | 'rgb' | 'rgba' | 'hsl';

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const [mode, setMode] = useState<ColorMode>('hex');
  const [textInput, setTextInput] = useState(value);

  const getDisplayValue = useCallback((currentValue: string, currentMode: ColorMode) => {
    const cRgb = hexToRgb(currentValue);
    const cHsl = rgbToHsl(cRgb.r, cRgb.g, cRgb.b);

    switch (currentMode) {
      case 'hex':
        return currentValue;
      case 'rgb':
        return `rgb(${cRgb.r}, ${cRgb.g}, ${cRgb.b})`;
      case 'rgba':
        return `rgba(${cRgb.r}, ${cRgb.g}, ${cRgb.b}, 1)`;
      case 'hsl':
        return `hsl(${cHsl.h}, ${cHsl.s}%, ${cHsl.l}%)`;
    }
  }, []);

  useEffect(() => {
    setTextInput(getDisplayValue(value, mode));
  }, [value, mode, getDisplayValue]);

  const parseInput = (input: string) => {
    const s = input.trim();

    if (/^#?[0-9a-fA-F]{6}$/.test(s)) {
      return s.startsWith('#') ? s : `#${s}`;
    }

    const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
      return rgbToHex(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]);
    }

    const hslMatch = s.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
    if (hslMatch) {
      const { r, g, b } = hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
      return rgbToHex(r, g, b);
    }

    return null;
  };

  const handleTextChange = (val: string) => {
    setTextInput(val);
    const hex = parseInput(val);
    if (hex) {
      onChange(hex);
    }
  };

  const MODES: ColorMode[] = ['hex', 'rgb', 'rgba', 'hsl'];

  return (
    <>
      <div className="space-y-2 py-4">
        <label className="text-xs font-medium text-foreground">{label}</label>

        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer shadow-sm"
              style={{ backgroundColor: value }}
            />
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setTextInput(getDisplayValue(e.target.value, mode));
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <input
            type="text"
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            className="flex-1 min-w-0 font-mono text-xs py-2 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="#2FC4B2"
          />
        </div>

        <div className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setTextInput(getDisplayValue(value, m));
              }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase transition-colors ${
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ColorPicker;
