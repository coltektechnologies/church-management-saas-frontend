/**
 * Display Templates for Announcement Presentation
 *
 * These are VISUAL STYLES for how announcements appear on the projector/screen.
 * Separate from "creation templates" in announcementTemplates.ts which pre-fill form data.
 *
 * All colors use CSS custom properties (var(--...)) for theme compatibility.
 */

export interface DisplayTemplateStyles {
  /** Slide background (CSS background value — can be gradient) */
  background: string;
  /** Primary text color */
  textColor: string;
  /** Secondary/muted text color */
  subtextColor: string;
  /** Accent color for decorative elements, borders, icons */
  accentColor: string;
  /** Category header background */
  headerBackground: string;
  /** Category header text color */
  headerTextColor: string;
  /** Font family for the title */
  titleFont: string;
  /** Font family for body text */
  bodyFont: string;
  /** Optional CSS class for additional decorative effects */
  decorationClass?: string;
}

export interface DisplayTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  styles: DisplayTemplateStyles;
}

export const DISPLAY_TEMPLATES: DisplayTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and timeless with subtle gold accents',
    icon: '📜',
    styles: {
      background:
        'linear-gradient(180deg, hsl(var(--card-hsl, 0 0% 100%)) 0%, hsl(var(--muted-hsl, 0 0% 96%)) 100%)',
      textColor: 'var(--foreground)',
      subtextColor: 'var(--muted-foreground)',
      accentColor: 'var(--warning)',
      headerBackground: 'var(--muted)',
      headerTextColor: 'var(--foreground)',
      titleFont: "'Georgia', 'Times New Roman', serif",
      bodyFont: "'Georgia', 'Times New Roman', serif",
      decorationClass: 'template-classic',
    },
  },
  {
    id: 'bold-gradient',
    name: 'Bold Gradient',
    description: 'Modern dark gradient with vibrant accents',
    icon: '🎨',
    styles: {
      background: 'linear-gradient(135deg, #083344 0%, #0e4d5c 50%, #0a3a4a 100%)',
      textColor: '#ffffff',
      subtextColor: 'rgba(255, 255, 255, 0.7)',
      accentColor: 'var(--chart-1)',
      headerBackground: 'rgba(255, 255, 255, 0.1)',
      headerTextColor: '#ffffff',
      titleFont: "'Poppins', 'Segoe UI', sans-serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      decorationClass: 'template-bold-gradient',
    },
  },
  {
    id: 'warm-inviting',
    name: 'Warm & Inviting',
    description: 'Cozy warm tones with elegant typography',
    icon: '🕯️',
    styles: {
      background: 'linear-gradient(180deg, #fef7ed 0%, #fde8cd 50%, #fef7ed 100%)',
      textColor: '#451a03',
      subtextColor: '#78552b',
      accentColor: 'var(--warning)',
      headerBackground: 'rgba(234, 179, 8, 0.15)',
      headerTextColor: '#451a03',
      titleFont: "'Georgia', 'Palatino Linotype', serif",
      bodyFont: "'Georgia', 'Palatino Linotype', serif",
      decorationClass: 'template-warm',
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Sleek and minimal — perfect for projectors',
    icon: '🌙',
    styles: {
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      textColor: '#f1f5f9',
      subtextColor: '#94a3b8',
      accentColor: 'var(--info)',
      headerBackground: 'rgba(255, 255, 255, 0.05)',
      headerTextColor: '#e2e8f0',
      titleFont: "'Poppins', 'Segoe UI', sans-serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      decorationClass: 'template-minimal-dark',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Majestic purple with gold accents for formal occasions',
    icon: '👑',
    styles: {
      background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #3b0764 100%)',
      textColor: '#faf5ff',
      subtextColor: 'rgba(250, 245, 255, 0.7)',
      accentColor: '#fbbf24',
      headerBackground: 'rgba(251, 191, 36, 0.15)',
      headerTextColor: '#fef3c7',
      titleFont: "'Georgia', 'Palatino Linotype', serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      decorationClass: 'template-royal',
    },
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Peaceful earth tones with a serene feel',
    icon: '🌿',
    styles: {
      background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
      textColor: '#14532d',
      subtextColor: '#3f6f52',
      accentColor: 'var(--success)',
      headerBackground: 'rgba(34, 197, 94, 0.1)',
      headerTextColor: '#14532d',
      titleFont: "'Georgia', 'Palatino Linotype', serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      decorationClass: 'template-nature',
    },
  },
  {
    id: 'celebration',
    name: 'Celebration',
    description: 'Festive and vibrant for joyful announcements',
    icon: '🎉',
    styles: {
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #ede9fe 70%, #eef2ff 100%)',
      textColor: '#581c87',
      subtextColor: '#7c3aed',
      accentColor: '#ec4899',
      headerBackground: 'rgba(236, 72, 153, 0.1)',
      headerTextColor: '#831843',
      titleFont: "'Poppins', 'Segoe UI', sans-serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      decorationClass: 'template-celebration',
    },
  },
  {
    id: 'urgent-alert',
    name: 'Urgent / Alert',
    description: 'High-contrast attention-grabbing design for urgent messages',
    icon: '🚨',
    styles: {
      background: 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
      textColor: '#fef2f2',
      subtextColor: '#fca5a5',
      accentColor: 'var(--destructive)',
      headerBackground: 'rgba(239, 68, 68, 0.2)',
      headerTextColor: '#fef2f2',
      titleFont: "'Poppins', 'Segoe UI', sans-serif",
      bodyFont: "'Poppins', 'Segoe UI', sans-serif",
      decorationClass: 'template-urgent',
    },
  },
];

export function getDisplayTemplate(id: string): DisplayTemplate {
  return DISPLAY_TEMPLATES.find((t) => t.id === id) || DISPLAY_TEMPLATES[0];
}
