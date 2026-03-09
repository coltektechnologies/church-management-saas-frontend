import React from 'react';
import { Plus, FileText, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionsProps {
  onOpenCreate: () => void;
  onOpenTemplates: () => void;
}

export function FloatingActions({ onOpenCreate, onOpenTemplates }: FloatingActionsProps) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center gap-4 z-40">
      <div className="relative group">
        <Button
          size="icon"
          title="Notifications"
          className="size-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"
          aria-label="Notifications"
        >
          <Megaphone className="size-5" />
        </Button>
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm cursor-pointer ">
          3
        </span>
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
