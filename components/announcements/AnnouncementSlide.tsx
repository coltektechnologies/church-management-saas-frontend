'use client';

import type { Announcement } from '@/services/announcementService';
import type { DisplayTemplate } from '@/services/displayTemplates';
import { Calendar, User, Users } from 'lucide-react';
import { format } from 'date-fns';

interface AnnouncementSlideProps {
  announcement: Announcement;
  template: DisplayTemplate;
  /** Optional group header to show above the slide (e.g., category name) */
  groupLabel?: string;
  /** If true, renders at full viewport size for presentation mode */
  fullscreen?: boolean;
}

export function AnnouncementSlide({
  announcement,
  template,
  groupLabel,
  fullscreen = false,
}: AnnouncementSlideProps) {
  const { styles } = template;

  const containerClass = fullscreen ? 'w-full h-full' : 'w-full aspect-video max-w-full';

  return (
    <div
      className={`${containerClass} relative overflow-hidden flex flex-col `}
      style={{ background: styles.background }}
    >
      {/* Decoration overlay */}
      <div className={`absolute inset-0 pointer-events-none ${styles.decorationClass || ''}`} />

      {/* Group header band */}
      {groupLabel && (
        <div
          className="relative z-10 px-8 py-3 flex items-center gap-3 text-sm font-bold uppercase tracking-widest"
          style={{
            background: styles.headerBackground,
            color: styles.headerTextColor,
            borderBottom: `2px solid ${styles.accentColor}`,
          }}
        >
          <span
            className="inline-block size-3 rounded-full"
            style={{ background: styles.accentColor }}
          />
          {groupLabel}
        </div>
      )}

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 sm:px-16 py-8 text-center">
        {/* Category pill */}
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
          style={{
            background: styles.headerBackground,
            color: styles.accentColor,
          }}
        >
          {announcement.category}
        </span>

        {/* Title */}
        <h1
          className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-4xl"
          style={{
            color: styles.textColor,
            fontFamily: styles.titleFont,
          }}
        >
          {announcement.title}
        </h1>

        {/* Accent divider */}
        <div className="w-24 h-1 rounded-full mb-6" style={{ background: styles.accentColor }} />

        {/* Content body */}
        <p
          className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl whitespace-pre-line"
          style={{
            color: styles.subtextColor,
            fontFamily: styles.bodyFont,
          }}
        >
          {announcement.content}
        </p>
      </div>

      {/* Bottom metadata bar */}
      <div
        className="relative z-10 px-8 py-4 flex items-center justify-between text-xs sm:text-sm"
        style={{
          background: styles.headerBackground,
          color: styles.subtextColor,
          borderTop: `1px solid ${styles.accentColor}20`,
        }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {announcement.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {format(new Date(announcement.date), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {announcement.audience?.length ? announcement.audience.join(', ') : 'Everyone'}
        </span>
      </div>
    </div>
  );
}

/**
 * Group header slide — shown before a group of announcements
 * when grouping is enabled (e.g., "Events & Programs — 3 announcements")
 */
interface GroupHeaderSlideProps {
  label: string;
  count: number;
  template: DisplayTemplate;
  fullscreen?: boolean;
}

export function GroupHeaderSlide({
  label,
  count,
  template,
  fullscreen = false,
}: GroupHeaderSlideProps) {
  const { styles } = template;
  const containerClass = fullscreen ? 'w-full h-full' : 'w-full aspect-video max-w-full';

  return (
    <div
      className={`${containerClass} relative overflow-hidden flex flex-col items-center justify-center`}
      style={{ background: styles.background }}
    >
      <div className={`absolute inset-0 pointer-events-none ${styles.decorationClass || ''}`} />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
        <div className="w-20 h-1 rounded-full" style={{ background: styles.accentColor }} />
        <h2
          className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wide"
          style={{
            color: styles.textColor,
            fontFamily: styles.titleFont,
          }}
        >
          {label}
        </h2>
        <p className="text-lg sm:text-xl" style={{ color: styles.subtextColor }}>
          {count} announcement{count !== 1 ? 's' : ''}
        </p>
        <div className="w-20 h-1 rounded-full" style={{ background: styles.accentColor }} />
      </div>
    </div>
  );
}
