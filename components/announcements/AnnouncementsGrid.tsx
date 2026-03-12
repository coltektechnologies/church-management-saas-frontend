import { Announcement } from '@/services/announcementService';
import { AnnouncementCard } from './AnnouncementCard';

interface AnnouncementsGridProps {
  announcements: Announcement[];
  isLoading: boolean;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  /** Present Mode selection props */
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function AnnouncementsGrid({
  announcements,
  isLoading,
  onShare,
  onDelete,
  onView,
  selectable = false,
  selectedIds,
  onToggleSelect,
}: AnnouncementsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-muted/50 animate-pulse border" />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-dashed rounded-xl">
        <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your filters or use the + button to create a new announcement.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onShare={onShare}
          onDelete={onDelete}
          onView={onView}
          selectable={selectable}
          selected={selectedIds?.has(announcement.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
