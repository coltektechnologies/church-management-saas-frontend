'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { AnnouncementsGrid } from '@/components/announcements/AnnouncementsGrid';
import { FloatingActions } from '@/components/announcements/FloatingActions';
import { QuickCreateModal } from '@/components/announcements/QuickCreateModal';
import { TemplatesModal } from '@/components/announcements/TemplatesModal';
import { AnnouncementDetailModal } from '@/components/announcements/AnnouncementDetailModal';
import { SelectionActionBar } from '@/components/announcements/SelectionActionBar';
import {
  PresentationSetupModal,
  type PresentationConfig,
} from '@/components/announcements/PresentationSetupModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useDeleteAnnouncement } from '@/hooks/useDeleteAnnouncement';
import { SavedPresetsSection } from '@/components/announcements/SavedPresetsSection';
import { NotificationCenterPanel } from '@/components/announcements/NotificationCenterPanel';
import { MOCK_NOTIFICATIONS } from '@/services/notificationsMock';
import {
  announcementService,
  type CreateAnnouncementPayload,
  type Announcement,
  type AnnouncementStatus,
  type AnnouncementCategory,
} from '@/services/announcementService';
import type { PresentationPreset } from '@/services/presentationPresets';
import { Search, Presentation, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAnnouncementsPortal } from '@/components/announcements/AnnouncementsPortalContext';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  'All',
  'Thanksgiving',
  'Prayer Request',
  'Birthday Wishes',
  'Funeral/Bereavements',
  'General Church',
  'Events & Programs',
  'Baptism Celebration',
  'Weddings',
  'Departmental Updates',
  'Community Outreach',
  'Health and Wellness',
  'Youth Activities',
];

type ActiveTab = 'announcements' | 'presets';

export default function AnnouncementsPage() {
  const { announcementsBasePath } = useAnnouncementsPortal();
  const { filters, setFilters, toggleStatus, resetFilters } = useAnnouncementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [templatePayload, setTemplatePayload] = useState<
    Partial<CreateAnnouncementPayload> | undefined
  >();

  // Detail modal state (eye icon on card)
  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Present mode state
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('announcements');

  // Notification center (mock — wire to GET /api/notifications/notifications/)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationUnread, setNotificationUnread] = useState(
    () => MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length
  );

  const { data: announcements = [], isLoading } = useAnnouncements(filters);
  const deleteMutation = useDeleteAnnouncement();

  // Delete & Edit Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  const handleEdit = useCallback(
    async (id: string) => {
      let ann = announcements.find((a) => a.id === id);
      if (!ann) {
        return;
      }
      const needsDetail =
        !ann.content?.trim() || (ann.content.includes('Tap') && ann.content.includes('View'));
      if (needsDetail) {
        try {
          ann = await announcementService.getAnnouncementById(id);
        } catch {
          /* keep list row */
        }
      }
      setTemplatePayload({
        id: ann.id,
        category: ann.category,
        priority: ann.priority,
        title: ann.title,
        content: ann.content,
        audience: ann.audience,
        status: ann.status,
        publish_at: ann.publish_at,
        expires_at: ann.expires_at,
        scheduleType: ann.scheduleType,
        scheduledDate: ann.scheduledDate,
        displayDurationType: ann.displayDurationType,
        displayDurationDays: ann.displayDurationDays,
      } as Partial<CreateAnnouncementPayload> & { id: string });
      setIsModalOpen(true);
    },
    [announcements]
  );

  const confirmDelete = useCallback((id: string) => {
    setAnnouncementToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setAnnouncementToDelete(null);
        },
      });
    }
  }, [announcementToDelete, deleteMutation]);

  const handleShare = useCallback(
    (id: string) => {
      const ann = announcements.find((a) => a.id === id);
      if (!ann) {
        return;
      }

      // In a real app, this would use the Web Share API if available
      if (navigator.share) {
        navigator
          .share({
            title: ann.title,
            text: ann.content,
            url: window.location.href, // Or a specific public link for the announcement
          })
          .catch(console.error);
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(`${ann.title}\n\n${ann.content}`).then(() => {
          // Could show a toast here using sonner, but leaving simple for demo
          alert('Announcement copied to clipboard!');
        });
      }
    },
    [announcements]
  );

  // Status configuration with custom icons
  const statuses = [
    { label: 'Pending', value: 'Pending', icon: '/announcements/pending.svg' },
    { label: 'Approved', value: 'Approved', icon: '/announcements/approved.svg' },
    { label: 'Rejected', value: 'Rejected', icon: '/announcements/rejected.svg' },
    { label: 'Scheduled', value: 'Scheduled', icon: '/announcements/scheduled.svg' },
    { label: 'Archived', value: 'Archived', icon: '/announcements/archived.svg' },
  ];

  const pendingCount = useMemo(
    () => announcements.filter((a) => a.status === 'Pending').length,
    [announcements]
  );
  const isAllActive = !filters.status || filters.status.length === 0;

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const current = filters.dateRange || { from: '', to: '' };
    setFilters({ dateRange: { ...current, [type]: value } });
  };

  // View handler — list rows omit body; fetch detail like handleEdit so modal shows real content
  const handleView = useCallback(
    async (id: string) => {
      let ann = announcements.find((a) => a.id === id);
      if (!ann) {
        return;
      }
      const needsDetail =
        !ann.content?.trim() || (ann.content.includes('Tap') && ann.content.includes('View'));
      if (needsDetail) {
        try {
          ann = await announcementService.getAnnouncementById(id);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Could not load announcement');
          return;
        }
      }
      setDetailAnnouncement(ann);
      setIsDetailOpen(true);
    },
    [announcements]
  );

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(announcements.map((a) => a.id)));
  }, [announcements]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleExitPresentMode = useCallback(() => {
    setIsPresentMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleEnterPresentMode = useCallback(() => {
    setIsPresentMode(true);
    setActiveTab('announcements');
  }, []);

  // Launch presentation
  const handleLaunchPresentation = useCallback(
    (config: PresentationConfig) => {
      const ids = Array.from(selectedIds).join(',');
      const params = new URLSearchParams({
        template: config.templateId,
        transition: config.transition,
        grouping: config.grouping,
        autoplay: String(config.autoPlayInterval),
        ids,
      });
      window.open(`${announcementsBasePath}/present?${params.toString()}`, '_blank');
      setIsSetupModalOpen(false);
    },
    [selectedIds, announcementsBasePath]
  );

  // Load preset
  const handleLoadPreset = useCallback(
    (preset: PresentationPreset) => {
      const params = new URLSearchParams({
        template: preset.templateId,
        transition: preset.transition,
        grouping: preset.grouping,
        autoplay: String(preset.autoPlayInterval),
        ids: preset.announcementIds.join(','),
      });
      window.open(`${announcementsBasePath}/present?${params.toString()}`, '_blank');
    },
    [announcementsBasePath]
  );

  // Get selected announcements for the setup modal
  const selectedAnnouncements = announcements.filter((a) => selectedIds.has(a.id));

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#083344] tracking-tight dark:text-gray-100">
              Church Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and communicate with your congregation effectively
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {!isPresentMode && (
              <Button variant="outline" onClick={handleEnterPresentMode} className="gap-2 text-sm">
                <Presentation className="size-4" />
                Present Mode
              </Button>
            )}
            {isPresentMode && (
              <Button
                variant="outline"
                onClick={handleExitPresentMode}
                className="gap-2 text-sm border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Exit Present Mode
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => (window.location.href = '/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="mr-2">◄</span> Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Tabs: Announcements / Saved Presets */}
        <div className="flex items-center gap-1 mb-4 border-b">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'announcements'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Presentation className="size-4" />
            Announcements
          </button>
          <button
            onClick={() => {
              setActiveTab('presets');
              if (isPresentMode) {
                handleExitPresentMode();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="size-4" />
            Saved Presets
          </button>
        </div>

        {activeTab === 'announcements' && (
          <>
            {/* Toolbar: Category, Dates, Search & Status Filters */}
            <div className="flex flex-col gap-4 mb-6 bg-card p-4 rounded-xl border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Primary Filters (Category + Date) */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={filters.category || 'All'}
                    onValueChange={(val) => setFilters({ category: val as AnnouncementCategory })}
                  >
                    <SelectTrigger className="w-[200px] h-9 bg-background">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      className="w-36 h-9 text-sm"
                      value={filters.dateRange?.from || ''}
                      onChange={(e) => handleDateChange('from', e.target.value)}
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="date"
                      className="w-36 h-9 text-sm"
                      value={filters.dateRange?.to || ''}
                      onChange={(e) => handleDateChange('to', e.target.value)}
                    />
                  </div>

                  {(filters.category !== 'All' || filters.dateRange) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-muted-foreground h-9 px-3"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-72 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    className="pl-9 h-9 bg-background"
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ search: e.target.value })}
                  />
                </div>
              </div>

              <div className="w-full h-px bg-border my-1" />

              {/* Secondary Filters (Status Toggles) */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 pb-1 hide-scrollbar">
                <button
                  onClick={() => setFilters({ status: [] })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                    isAllActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted font-medium'
                  }`}
                >
                  <div className="relative size-[18px]">
                    <Image
                      src="/announcements/all-annuncements.svg"
                      alt="All"
                      fill
                      className={isAllActive ? 'opacity-100' : 'opacity-60'}
                    />
                  </div>
                  All Announcements
                </button>

                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

                {statuses.map((item) => {
                  const isActive = (filters.status || []).includes(
                    item.value as AnnouncementStatus
                  );
                  return (
                    <button
                      key={item.value}
                      onClick={() => toggleStatus(item.value as AnnouncementStatus)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted font-medium'
                      }`}
                    >
                      <div className="relative size-[18px]">
                        <Image
                          src={item.icon}
                          alt={item.label}
                          fill
                          className={isActive ? 'opacity-100' : 'opacity-60'}
                        />
                      </div>
                      <span>{item.label}</span>
                      {item.value === 'Pending' && pendingCount > 0 && (
                        <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full size-5 min-w-5 ml-1 leading-none pb-[1px]">
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Present Mode banner */}
            {isPresentMode && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <Presentation className="size-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Present Mode:</span> Select the announcements you
                  want to present, then configure your presentation.
                </p>
              </div>
            )}

            {/* Grid Area */}
            <div className={`flex-1 overflow-y-auto ${isPresentMode ? 'pb-32' : 'pb-24'} pr-1`}>
              <AnnouncementsGrid
                announcements={announcements}
                isLoading={isLoading}
                onShare={handleShare}
                onDelete={confirmDelete}
                onEdit={handleEdit}
                onView={handleView}
                selectable={isPresentMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
              />
            </div>
          </>
        )}

        {activeTab === 'presets' && (
          <div className="flex-1 overflow-y-auto pb-24 pr-1">
            <div className="max-w-3xl">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Saved Presentations</h2>
                <p className="text-sm text-muted-foreground">
                  Prepare presentations ahead of time and load them instantly during service.
                </p>
              </div>
              <SavedPresetsSection onLoadPreset={handleLoadPreset} />
            </div>
          </div>
        )}
      </div>

      {/* Floating actions — hidden in present mode */}
      <FloatingActions
        onOpenCreate={() => {
          setTemplatePayload(undefined);
          setIsModalOpen(true);
        }}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenNotifications={() => setNotificationPanelOpen(true)}
        notificationUnreadCount={notificationUnread}
        hidden={isPresentMode}
      />

      <NotificationCenterPanel
        open={notificationPanelOpen}
        onOpenChange={setNotificationPanelOpen}
        onUnreadCountChange={setNotificationUnread}
      />

      {/* Selection action bar — shown in present mode */}
      {isPresentMode && (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          totalCount={announcements.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onConfigurePresentation={() => setIsSetupModalOpen(true)}
          onExitSelectMode={handleExitPresentMode}
        />
      )}

      {/* Quick create modal */}
      <QuickCreateModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={templatePayload}
      />

      {/* Templates modal */}
      <TemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onSelectTemplate={(payload) => {
          setTemplatePayload(payload);
          setIsModalOpen(true);
        }}
      />

      {/* Announcement detail modal */}
      <AnnouncementDetailModal
        announcement={detailAnnouncement}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Presentation setup modal */}
      <PresentationSetupModal
        open={isSetupModalOpen}
        onOpenChange={setIsSetupModalOpen}
        selectedAnnouncements={selectedAnnouncements}
        onLaunchPresentation={handleLaunchPresentation}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
