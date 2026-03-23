/**
 * Presentation Presets — Save & Load configured presentations
 *
 * Stores presets in localStorage for now. Backend integration later.
 */

export type TransitionStyle = 'horizontal' | 'vertical' | 'fade';
export type GroupingOrder = 'none' | 'category' | 'priority' | 'date';
export type AutoPlayInterval = 0 | 10 | 15 | 20 | 30;

export interface PresentationPreset {
  id: string;
  name: string;
  /** ISO date string */
  createdAt: string;
  /** IDs of selected announcements */
  announcementIds: string[];
  /** Display template ID */
  templateId: string;
  /** Slide transition style */
  transition: TransitionStyle;
  /** How to group/order announcements */
  grouping: GroupingOrder;
  /** Auto-play interval in seconds (0 = disabled) */
  autoPlayInterval: AutoPlayInterval;
}

const STORAGE_KEY = 'church_presentation_presets';

function getAll(): PresentationPreset[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveAll(presets: PresentationPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export const presetService = {
  getPresets(): PresentationPreset[] {
    return getAll();
  },

  getPresetById(id: string): PresentationPreset | undefined {
    return getAll().find((p) => p.id === id);
  },

  savePreset(preset: Omit<PresentationPreset, 'id' | 'createdAt'>): PresentationPreset {
    const newPreset: PresentationPreset = {
      ...preset,
      id: `preset_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const existing = getAll();
    existing.unshift(newPreset);
    saveAll(existing);
    return newPreset;
  },

  updatePreset(
    id: string,
    updates: Partial<Omit<PresentationPreset, 'id' | 'createdAt'>>
  ): PresentationPreset | null {
    const existing = getAll();
    const index = existing.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    existing[index] = { ...existing[index], ...updates };
    saveAll(existing);
    return existing[index];
  },

  deletePreset(id: string): boolean {
    const existing = getAll();
    const filtered = existing.filter((p) => p.id !== id);
    if (filtered.length === existing.length) {
      return false;
    }
    saveAll(filtered);
    return true;
  },
};
