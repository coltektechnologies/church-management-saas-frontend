import { Plus, FileText, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionsProps {
  onOpenCreate: () => void;
  onOpenTemplates: () => void;
  /** Opens the notification center (in-app alerts) */
  onOpenNotifications?: () => void;
  /** Unread count for the badge; omit to hide badge */
  notificationUnreadCount?: number;
  /** When true, hide floating buttons (present mode takes focus) */
  hidden?: boolean;
}

export function FloatingActions({
  onOpenCreate,
  onOpenTemplates,
  onOpenNotifications,
  notificationUnreadCount = 0,
  hidden = false,
}: FloatingActionsProps) {
  if (hidden) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center gap-4 z-40">
      <div className="relative group">
        <Button
          size="icon"
          title="Notifications"
          type="button"
          onClick={() => onOpenNotifications?.()}
          className="size-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"
          aria-label="Open notifications"
        >
          <Megaphone className="size-5" />
        </Button>
        {notificationUnreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full px-1',
              'bg-destructive text-[10px] font-bold text-white shadow-sm pointer-events-none'
            )}
            aria-hidden
          >
            {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
          </span>
        )}
      </div>

      <Button
        size="icon"
        title="Templates"
        className="size-12 rounded-full bg-warning hover:bg-warning/90 text-warning-foreground shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"
        aria-label="Templates"
        onClick={onOpenTemplates}
      >
        <FileText className="size-5" />
      </Button>

      <Button
        size="icon"
        title="Create Announcement"
        className="size-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"
        onClick={onOpenCreate}
        aria-label="Create Announcement"
      >
        <Plus className="size-6" />
      </Button>
    </div>
  );
}
