import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Share2,
  Eye,
  Trash2,
  Calendar,
  User,
  Users,
  Pencil,
  Check,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { Announcement, AnnouncementCategory, PriorityLevel } from '@/services/announcementService';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AnnouncementCardProps {
  announcement: Announcement;
  onShare?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  /** Present Mode props */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const categoryColors: Record<AnnouncementCategory | 'All', string> = {
  All: 'var(--color-primary)',
  'Events & Programs': '#ef4444', // red-500
  'Prayer Request': '#3b82f6', // blue-500
  Thanksgiving: '#22c55e', // green-500
  'Youth Activities': '#f97316', // orange-500
  'Birthday Wishes': '#eab308',
  'Funeral/Bereavements': '#71717a',
  'General Church': '#a855f7',
  'Baptism Celebration': '#06b6d4',
  Weddings: '#ec4899',
  'Departmental Updates': '#14b8a6',
  'Community Outreach': '#84cc16',
  'Health and Wellness': '#10b981',
};

const priorityStyles: Record<PriorityLevel, string> = {
  High: 'bg-destructive/10 text-destructive border-transparent',
  Medium: 'bg-warning/10 text-warning border-transparent',
  Low: 'bg-success/10 text-success border-transparent',
};

export function AnnouncementCard({
  announcement,
  onShare,
  onDelete,
  onView,
  onEdit,
  selectable = false,
  selected = false,
  onToggleSelect,
}: AnnouncementCardProps) {
  const catColor = categoryColors[announcement.category] || categoryColors.All;

  const handleCardClick = () => {
    if (selectable && onToggleSelect) {
      onToggleSelect(announcement.id);
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md group flex flex-col h-full border-l-4 ${
        selectable ? 'cursor-pointer' : ''
      } ${selected ? 'ring-2 ring-primary shadow-md' : ''}`}
      style={{ borderLeftColor: catColor }}
      onClick={selectable ? handleCardClick : undefined}
    >
      {/* Selection checkbox overlay */}
      {selectable && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className={`flex items-center justify-center size-6 rounded-md border-2 transition-all duration-200 ${
              selected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/40 bg-background hover:border-primary'
            }`}
          >
            {selected && <Check className="size-3.5" strokeWidth={3} />}
          </div>
        </div>
      )}

      <CardHeader className="pb-3 flex-row justify-between items-start space-y-0">
        <div className="flex flex-col gap-1">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: catColor }}
          >
            {announcement.category}
          </span>
          <h3 className="font-bold text-lg leading-tight line-clamp-2" title={announcement.title}>
            {announcement.title}
          </h3>
        </div>
        {!selectable && (
          <Badge variant="outline" className={priorityStyles[announcement.priority]}>
            {announcement.priority}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{announcement.content}</p>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5" title="Author">
            <User className="size-3.5" />
            <span>{announcement.author}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Date">
            <Calendar className="size-3.5" />
            <span>{format(new Date(announcement.date), 'EEE, MMM d')}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Audience">
            <Users className="size-3.5" />
            <span className="truncate max-w-[100px]">
              {announcement.audience?.length ? announcement.audience.join(', ') : 'Everyone'}
            </span>
          </div>
        </div>
      </CardContent>

      {!selectable && (
        <CardFooter className="pt-0 justify-between items-center border-t px-6 py-3 mt-auto bg-muted/20">
          <span className="text-xs font-medium text-foreground">{announcement.status}</span>
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onView?.(announcement.id)}
              title="View"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onEdit?.(announcement.id)}
              title="Edit"
            >
              <Pencil className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" title="Share">
                  <Share2 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onShare?.(announcement.id)}>
                  <Mail className="size-4 mr-2" />
                  Email to Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(announcement.id)}>
                  <Smartphone className="size-4 mr-2" />
                  Send via SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(announcement.id)}>
                  <MessageSquare className="size-4 mr-2" />
                  Share to WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete?.(announcement.id)}
              title="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardFooter>
      )}

      {/* In selectable mode, show a simpler footer */}
      {selectable && (
        <CardFooter className="pt-0 justify-between items-center border-t px-6 py-3 mt-auto bg-muted/20">
          <span className="text-xs font-medium text-foreground">{announcement.status}</span>
          <Badge variant="outline" className={priorityStyles[announcement.priority]}>
            {announcement.priority}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
