'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementsGrid } from '@/components/announcements/AnnouncementsGrid';
import { AnnouncementDetailModal } from '@/components/announcements/AnnouncementDetailModal';
import { announcementService } from '@/services/announcementService';
import type { Announcement } from '@/services/announcementService';
import { Button } from '@/components/ui/button';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';

/** Same card grid data as `/admin/announcements` (shared filters + React Query cache). */
export default function AdminSecretaryPage() {
  const { filters } = useAnnouncementStore();
  const { data: announcements = [], isLoading } = useAnnouncements(filters);

  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleView = useCallback(
    async (id: string) => {
      let ann = announcements.find((a) => a.id === id);
      if (!ann) {
        return;
      }
      try {
        ann = await announcementService.getAnnouncementById(id);
      } catch {
        /* keep list row */
      }
      setDetailAnnouncement(ann);
      setIsDetailOpen(true);
    },
    [announcements]
  );

  const handleShare = useCallback(
    (id: string) => {
      const ann = announcements.find((a) => a.id === id);
      if (!ann) {
        return;
      }
      if (navigator.share) {
        navigator
          .share({
            title: ann.title,
            text: ann.content,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          })
          .catch(() => {});
      } else if (typeof navigator.clipboard?.writeText === 'function') {
        void navigator.clipboard.writeText(`${ann.title}\n\n${ann.content}`);
      }
    },
    [announcements]
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--admin-text, #111827)' }}
          >
            Secretariat
          </h1>
          <p
            className="mt-1 text-sm max-w-2xl"
            style={{ color: 'var(--admin-text-muted, #6b7280)' }}
          >
            Same announcement cards as Church Announcements. Filters and counts stay in sync when
            you switch between this page and the full hub.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 border-[var(--admin-border)]"
          asChild
        >
          <Link href="/admin/announcements">
            <ExternalLink className="h-4 w-4" aria-hidden />
            Full announcements hub
          </Link>
        </Button>
      </div>

      <AnnouncementsGrid
        announcements={announcements}
        isLoading={isLoading}
        onView={handleView}
        onShare={handleShare}
        onDelete={() => {}}
      />

      <AnnouncementDetailModal
        announcement={detailAnnouncement}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailAnnouncement(null);
          }
        }}
      />
    </div>
  );
}
