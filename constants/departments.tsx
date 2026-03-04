import {
  FaPrayingHands,
  FaMusic,
  FaHeart,
  FaFemale,
  FaHome,
  FaFileAlt,
  FaWrench,
  FaExchangeAlt,
} from 'react-icons/fa';
import type { ReactNode } from 'react';

export const DEPARTMENT_COLORS: { name: string; class: string }[] = [
  { name: 'navy', class: 'bg-[#0F1C2E]' },
  { name: 'pink', class: 'bg-[#C0268E]' },
  { name: 'yellow', class: 'bg-[#B5A600]' },
  { name: 'green', class: 'bg-[#2F6B2F]' },
  { name: 'blue', class: 'bg-[#1E5FAF]' },
  { name: 'purple', class: 'bg-[#7C3AED]' },
];

export const DEPARTMENT_ICONS: { name: string; icon: ReactNode }[] = [
  { name: 'prayer', icon: <FaPrayingHands /> },
  { name: 'music', icon: <FaMusic /> },
  { name: 'love', icon: <FaHeart /> },
  { name: 'women', icon: <FaFemale /> },
  { name: 'home', icon: <FaHome /> },
  { name: 'document', icon: <FaFileAlt /> },
  { name: 'tools', icon: <FaWrench /> },
  { name: 'exchange', icon: <FaExchangeAlt /> },
];

export const COLOR_MAP = Object.fromEntries(DEPARTMENT_COLORS.map((c) => [c.name, c.class]));
export const ICON_MAP = Object.fromEntries(DEPARTMENT_ICONS.map((i) => [i.name, i.icon]));
export type ThemeColor = (typeof DEPARTMENT_COLORS)[number]['name'];
