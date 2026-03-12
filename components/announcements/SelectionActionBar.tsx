'use client';

import { Button } from '@/components/ui/button';
import { CheckSquare, X, Settings2 } from 'lucide-react';

interface SelectionActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onConfigurePresentation: () => void;
  onExitSelectMode: () => void;
}

export function SelectionActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onConfigurePresentation,
  onExitSelectMode,
}: SelectionActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="flex items-center justify-between gap-4 bg-card border border-border shadow-2xl rounded-2xl px-5 py-3.5">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-full bg-primary/10">
              <CheckSquare className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedCount} of {totalCount} selected
              </p>
              <p className="text-xs text-muted-foreground">Choose announcements to present</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {selectedCount < totalCount ? (
              <Button variant="ghost" size="sm" onClick={onSelectAll} className="text-xs h-8">
                Select All
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-xs h-8">
                Clear
              </Button>
            )}

            <Button
              size="sm"
              onClick={onConfigurePresentation}
              disabled={selectedCount === 0}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4"
            >
              <Settings2 className="size-3.5" />
              Configure Presentation
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onExitSelectMode}
              className="size-8 text-muted-foreground hover:text-foreground"
              title="Exit Present Mode"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
