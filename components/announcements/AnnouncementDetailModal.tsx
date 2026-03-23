'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Users, Tag, Clock } from 'lucide-react';
import type {
  Announcement,
  PriorityLevel,
  AnnouncementStatus,
} from '@/services/announcementService';
import { format } from 'date-fns';

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig: Record<PriorityLevel, { class: string; icon: string }> = {
  High: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: '🔴' },
  Medium: { class: 'bg-warning/10 text-warning border-warning/30', icon: '🟡' },
  Low: { class: 'bg-success/10 text-success border-success/30', icon: '🟢' },
};

const statusConfig: Record<AnnouncementStatus, { class: string }> = {
  Pending: { class: 'bg-warning/15 text-warning border-warning/30' },
  Approved: { class: 'bg-success/15 text-success border-success/30' },
  Rejected: { class: 'bg-destructive/15 text-destructive border-destructive/30' },
  Scheduled: { class: 'bg-info/15 text-info border-info/30' },
  Archived: { class: 'bg-muted text-muted-foreground border-border' },
};

export function AnnouncementDetailModal({
  announcement,
  open,
  onOpenChange,
}: AnnouncementDetailModalProps) {
  if (!announcement) {
    return null;
  }

  const priority = priorityConfig[announcement.priority];
  const status = statusConfig[announcement.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header with gradient accent */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-warning/5" />
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className={`${priority.class} text-xs`}>
                {priority.icon} {announcement.priority} Priority
              </Badge>
              <Badge variant="outline" className={`${status.class} text-xs`}>
                {announcement.status}
              </Badge>
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {announcement.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-6" />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category tag */}
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-primary">{announcement.category}</span>
          </div>

          {/* Content */}
          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
            <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line">
              {announcement.content}
            </p>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-center size-9 rounded-full bg-primary/10">
                <User className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium">{announcement.author}</p>
                <p className="text-xs text-muted-foreground">{announcement.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-center size-9 rounded-full bg-warning/10">
                <Calendar className="size-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(announcement.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(announcement.date), 'h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-center size-9 rounded-full bg-info/10">
                <Users className="size-4 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Audience</p>
                <p className="text-sm font-medium">
                  {announcement.audience?.length ? announcement.audience.join(', ') : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-center size-9 rounded-full bg-muted">
                <Clock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{announcement.status}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
