'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Trash2, Play, Calendar, Layers, Clock, ChevronRight } from 'lucide-react';
import { presetService, type PresentationPreset } from '@/services/presentationPresets';
import { DISPLAY_TEMPLATES } from '@/services/displayTemplates';
import { format } from 'date-fns';

interface SavedPresetsSectionProps {
  onLoadPreset: (preset: PresentationPreset) => void;
}

export function SavedPresetsSection({ onLoadPreset }: SavedPresetsSectionProps) {
  const [presets, setPresets] = useState<PresentationPreset[]>(presetService.getPresets() || []); //when wiring with the backend , you will have to place the presetService.getPresets() in a use effect
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    presetService.deletePreset(id);
    setPresets(presetService.getPresets());
    setDeletingId(null);
  };

  if (presets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center">
        <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-3">
          <BookOpen className="size-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold mb-1">No Saved Presets</h3>
        <p className="text-xs text-muted-foreground max-w-[260px]">
          Configure a presentation and save it as a preset for quick access later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {presets.map((preset) => {
        const template = DISPLAY_TEMPLATES.find((t) => t.id === preset.templateId);
        const isDeleting = deletingId === preset.id;

        return (
          <div
            key={preset.id}
            className="group flex items-center gap-4 p-4 bg-card border rounded-xl hover:shadow-md transition-all duration-200"
          >
            {/* Template icon */}
            <div className="flex items-center justify-center size-12 rounded-xl bg-muted shrink-0 text-xl">
              {template?.icon || '📋'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{preset.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {format(new Date(preset.createdAt), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="size-3" />
                  {preset.announcementIds.length} slides
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {preset.autoPlayInterval > 0 ? `${preset.autoPlayInterval}s auto` : 'Manual'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {template?.name || 'Unknown'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium capitalize">
                  {preset.transition}
                </span>
                {preset.grouping !== 'none' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium capitalize">
                    By {preset.grouping}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {isDeleting ? (
                <div className="flex items-center gap-1 animate-in fade-in duration-150">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => setDeletingId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(preset.id)}
                  >
                    Confirm
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeletingId(preset.id)}
                    title="Delete preset"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onLoadPreset(preset)}
                    className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3"
                  >
                    <Play className="size-3" />
                    Present
                    <ChevronRight className="size-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
