'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Megaphone, FileEdit, Eye, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { QuickCreateModal } from '@/components/announcements/QuickCreateModal';
import { AnnouncementDetailModal } from '@/components/announcements/AnnouncementDetailModal';
import {
  announcementService,
  type Announcement,
  type AnnouncementListFilters,
  type CreateAnnouncementPayload,
} from '@/services/announcementService';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { toast } from 'sonner';

type TabFilter = 'All' | 'Pending' | 'Approved';

function filtersForTab(tab: TabFilter): AnnouncementListFilters {
  /** Only announcements this department user authored (matches backend `mine_only`). */
  const portal: Pick<AnnouncementListFilters, 'mineOnly'> = { mineOnly: true };
  if (tab === 'Pending') {
    return { category: 'All', status: ['Pending'], ...portal };
  }
  if (tab === 'Approved') {
    return { category: 'All', status: ['Approved'], ...portal };
  }
  return { category: 'All', ...portal };
}

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [announcementToEdit, setAnnouncementToEdit] = useState<
    (Partial<CreateAnnouncementPayload> & { id?: string }) | undefined
  >(undefined);

  const listFilters = useMemo(() => filtersForTab(activeTab), [activeTab]);

  const {
    data: announcements = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAnnouncements(listFilters);

  const handleCreateAnnouncement = () => {
    setAnnouncementToEdit(undefined);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalOpen(true);
  };

  const handleEditAnnouncement = useCallback(async (announcement: Announcement) => {
    try {
      let ann = announcement;
      const needsDetail =
        !ann.content?.trim() || (ann.content.includes('Tap') && ann.content.includes('View'));
      if (needsDetail) {
        ann = await announcementService.getAnnouncementById(announcement.id);
      }
      setAnnouncementToEdit({
        id: ann.id,
        category: ann.category,
        priority: ann.priority,
        title: ann.title,
        content: ann.content,
        audience: ann.audience,
        status: ann.status,
        publish_at: ann.publish_at,
        expires_at: ann.expires_at,
      });
      setIsCreateModalOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Could not load announcement for editing: ${msg}`);
    }
  }, []);

  const showEmpty = !isLoading && !isError && announcements.length === 0;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 mb-1">
        <div className="flex items-center gap-2.5 text-info">
          <Megaphone className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Department Announcements</h1>
        </div>
        <Button
          onClick={handleCreateAnnouncement}
          className="bg-linear-to-r from-[#0c2a44] to-[#1c5a8a] text-white hover:opacity-90 w-full sm:w-auto font-medium shadow-sm transition-all rounded-md px-5 py-2"
        >
          + Create Announcement
        </Button>
      </div>

      <Separator className="bg-slate-200 mt-5" />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['All', 'Pending', 'Approved'] as const).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`rounded-[8px] px-5 py-1.5 h-9 transition-all duration-200 whitespace-nowrap text-[14px] ${
              activeTab === tab
                ? 'bg-white text-[#0A2E46] border border-slate-200 shadow-sm font-medium'
                : 'text-slate-600 hover:bg-white/80 hover:text-[#0A2E46] font-medium'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading announcements…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center space-y-3">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Could not load announcements.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3.5 pt-1 pb-10">
          {isFetching && announcements.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
            </p>
          )}

          {showEmpty && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center space-y-2 shadow-sm">
              <p className="text-slate-600 text-sm">
                No announcements found for this filter yet.
              </p>
              <Button variant="secondary" size="sm" onClick={handleCreateAnnouncement}>
                Create your first announcement
              </Button>
            </div>
          )}

          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-all duration-300 rounded-xl"
            >
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[17px] font-bold text-[#0A2E46] tracking-tight">
                  {announcement.title}
                </h3>
                <div className="flex flex-col items-start text-[13px] font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Megaphone
                      className="h-4 w-4 text-slate-700 dark:text-slate-300"
                      strokeWidth={1.75}
                    />
                    <span>
                      {announcement.priority === 'High' ? 'Urgent' : announcement.priority} •{' '}
                      {announcement.date.split('T')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between md:flex-col items-start md:items-end gap-3.5">
                <Badge
                  variant="secondary"
                  className="bg-info/15 hover:bg-info/25 text-info border-none font-medium px-3.5 py-0.5 text-[12px] rounded-full pointer-events-none"
                >
                  {announcement.status}
                </Badge>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleViewDetails(announcement)}
                    className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md"
                    title="View Announcement"
                  >
                    <Eye className="h-5 w-5" strokeWidth={1.75} />
                    <span className="sr-only">View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEditAnnouncement(announcement)}
                    className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md"
                    title="Edit Announcement"
                  >
                    <FileEdit className="h-5 w-5" strokeWidth={1.75} />
                    <span className="sr-only">Edit</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <QuickCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        initialData={announcementToEdit}
      />

      <AnnouncementDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
