'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftRight, ArrowUpDown, Sparkles, Play, Save, Monitor, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DISPLAY_TEMPLATES } from '@/services/displayTemplates';
import type {
  TransitionStyle,
  GroupingOrder,
  AutoPlayInterval,
} from '@/services/presentationPresets';
import { presetService } from '@/services/presentationPresets';
import { AnnouncementSlide } from './AnnouncementSlide';
import type { Announcement } from '@/services/announcementService';

interface PresentationSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAnnouncements: Announcement[];
  onLaunchPresentation: (config: PresentationConfig) => void;
}

export interface PresentationConfig {
  templateId: string;
  transition: TransitionStyle;
  grouping: GroupingOrder;
  autoPlayInterval: AutoPlayInterval;
}

const transitionOptions: { value: TransitionStyle; label: string; icon: React.ReactNode }[] = [
  { value: 'horizontal', label: 'Horizontal Slide', icon: <ArrowLeftRight className="size-4" /> },
  { value: 'vertical', label: 'Vertical Slide', icon: <ArrowUpDown className="size-4" /> },
  { value: 'fade', label: 'Fade Crossfade', icon: <Sparkles className="size-4" /> },
];

const groupingOptions: { value: GroupingOrder; label: string }[] = [
  { value: 'none', label: 'No Grouping (Original Order)' },
  { value: 'category', label: 'Group by Category' },
  { value: 'priority', label: 'Group by Priority' },
  { value: 'date', label: 'Group by Date' },
];

const autoPlayOptions: { value: AutoPlayInterval; label: string }[] = [
  { value: 0, label: 'Manual (Off)' },
  { value: 10, label: '10 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 20, label: '20 seconds' },
  { value: 30, label: '30 seconds' },
];

export function PresentationSetupModal({
  open,
  onOpenChange,
  selectedAnnouncements,
  onLaunchPresentation,
}: PresentationSetupModalProps) {
  const [templateId, setTemplateId] = useState<string>('classic');
  const [transition, setTransition] = useState<TransitionStyle>('horizontal');
  const [grouping, setGrouping] = useState<GroupingOrder>('none');
  const [autoPlayInterval, setAutoPlayInterval] = useState<AutoPlayInterval>(15);
  const [presetName, setPresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeTemplate = DISPLAY_TEMPLATES.find((t) => t.id === templateId) || DISPLAY_TEMPLATES[0];
  const previewAnnouncement = selectedAnnouncements[0];

  const handleLaunch = () => {
    onLaunchPresentation({ templateId, transition, grouping, autoPlayInterval });
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      return;
    }
    presetService.savePreset({
      name: presetName.trim(),
      announcementIds: selectedAnnouncements.map((a) => a.id),
      templateId,
      transition,
      grouping,
      autoPlayInterval,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveInput(false);
      setPresetName('');
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2 text-foreground">
            <Monitor className="size-5 text-primary" />
            Configure Presentation
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedAnnouncements.length} announcement
            {selectedAnnouncements.length !== 1 ? 's' : ''} selected
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Live mini-preview */}
          {previewAnnouncement && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Live Preview
              </Label>
              <div className="w-full rounded-xl overflow-hidden border shadow-sm">
                <AnnouncementSlide
                  announcement={previewAnnouncement}
                  template={activeTemplate}
                  groupLabel={grouping === 'category' ? previewAnnouncement.category : undefined}
                />
              </div>
            </div>
          )}

          {/* Display Template Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Display Template
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DISPLAY_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-md',
                    templateId === tpl.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <span className="text-2xl">{tpl.icon}</span>
                  <span className="text-xs font-semibold text-foreground">{tpl.name}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {tpl.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transition Style */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Transition Style</Label>
            <div className="flex gap-3">
              {transitionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTransition(opt.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium',
                    transition === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {opt.icon}
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grouping & Auto-play row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Grouping / Order</Label>
              <Select value={grouping} onValueChange={(val) => setGrouping(val as GroupingOrder)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Auto-play Interval</Label>
              <Select
                value={String(autoPlayInterval)}
                onValueChange={(val) => setAutoPlayInterval(Number(val) as AutoPlayInterval)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {autoPlayOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save Preset */}
          {showSaveInput && (
            <div className="flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm">Preset Name</Label>
                <Input
                  placeholder="e.g., Sunday March 10 Service"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                />
              </div>
              <Button
                onClick={handleSavePreset}
                disabled={!presetName.trim() || saveSuccess}
                className="h-10"
              >
                {saveSuccess ? '✓ Saved!' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10 gap-2 sm:gap-0">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setShowSaveInput(!showSaveInput)}
              className="gap-2"
            >
              <Save className="size-3.5" />
              {showSaveInput ? 'Cancel Save' : 'Save Preset'}
            </Button>

            <Button
              onClick={handleLaunch}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              <Play className="size-4" />
              Launch Presentation
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
