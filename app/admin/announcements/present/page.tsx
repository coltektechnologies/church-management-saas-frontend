/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnnouncementSlide, GroupHeaderSlide } from '@/components/announcements/AnnouncementSlide';
import { getDisplayTemplate, DISPLAY_TEMPLATES } from '@/services/displayTemplates';
import { announcementService, type Announcement } from '@/services/announcementService';
import type {
  TransitionStyle,
  GroupingOrder,
  // AutoPlayInterval,
} from '@/services/presentationPresets';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  Layers,
  X,
} from 'lucide-react';

interface SlideItem {
  type: 'announcement' | 'group-header';
  announcement?: Announcement;
  groupLabel?: string;
  groupCount?: number;
}

function buildSlides(announcements: Announcement[], grouping: GroupingOrder): SlideItem[] {
  if (grouping === 'none') {
    return announcements.map((a) => ({ type: 'announcement', announcement: a }));
  }

  const groupKeyFn = (a: Announcement): string => {
    switch (grouping) {
      case 'category':
        return a.category;
      case 'priority':
        return a.priority;
      case 'date':
        return new Date(a.date).toLocaleDateString();
      default:
        return '';
    }
  };

  // Group announcements
  const groups = new Map<string, Announcement[]>();
  announcements.forEach((a) => {
    const key = groupKeyFn(a);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)?.push(a);
  });

  const slides: SlideItem[] = [];
  groups.forEach((items, label) => {
    // Add group header slide
    slides.push({
      type: 'group-header',
      groupLabel: label,
      groupCount: items.length,
    });
    // Add announcement slides
    items.forEach((a) => {
      slides.push({
        type: 'announcement',
        announcement: a,
        groupLabel: label,
      });
    });
  });

  return slides;
}

export function PresentationClient() {
  const searchParams = useSearchParams();

  // Read config from URL params
  const templateId = searchParams.get('template') || 'classic';
  const transition = (searchParams.get('transition') || 'horizontal') as TransitionStyle;
  const grouping = (searchParams.get('grouping') || 'none') as GroupingOrder;
  const autoPlayParam = searchParams.get('autoplay') || '0';
  const idsParam = searchParams.get('ids') || '';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(Number(autoPlayParam) > 0);
  const [autoInterval] = useState<number>(Number(autoPlayParam));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTemplateId, setCurrentTemplateId] = useState(templateId);

  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const template = getDisplayTemplate(currentTemplateId);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  };

  // Fetch announcements
  useEffect(() => {
    async function load() {
      const all = await announcementService.fetchAnnouncements({ status: ['Approved'] });
      let selected: Announcement[];
      if (idsParam) {
        const ids = idsParam.split(',');
        selected = ids.map((id) => all.find((a) => a.id === id)).filter(Boolean) as Announcement[];
      } else {
        selected = all;
      }
      setAnnouncements(selected);
    }
    load();
  }, [idsParam]);
  // Build slides derived from announcements + grouping
  const slides = useMemo(() => buildSlides(announcements, grouping), [announcements, grouping]);

  // Clamp currentIndex to valid range when slides array shrinks
  const clampedIndex = slides.length > 0 ? Math.min(currentIndex, slides.length - 1) : 0;

  // Auto-play timer
  useEffect(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
    if (isPlaying && autoInterval > 0 && slides.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, autoInterval * 1000);
    }
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isPlaying, autoInterval, slides.length]);

  // Hide controls after inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // Initialize and clean up controls auto-hide timer
  useEffect(() => {
    // Set initial timer directly (avoid calling resetControlsTimer which triggers setState)
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      resetControlsTimer();
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        case 'p':
        case 'P':
          setIsPlaying((prev) => !prev);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length, isFullscreen, resetControlsTimer]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  const goPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  // Transition classes
  const getTransitionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease',
    };
    switch (transition) {
      case 'horizontal':
        return { ...base, transform: `translateX(-${clampedIndex * 100}%)` };
      case 'vertical':
        return { ...base, transform: `translateY(-${clampedIndex * 100}%)` };
      case 'fade':
        return {};
      default:
        return base;
    }
  };

  if (slides.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Presentation...</h2>
          <p className="text-muted-foreground text-sm">Preparing your slides</p>
        </div>
      </div>
    );
  }

  // const currentSlide = slides[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Slides container */}
      {transition === 'fade' ? (
        /* Fade mode: stack all slides, only show current */
        <div className="relative w-full h-full">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === clampedIndex ? 1 : 0, zIndex: i === clampedIndex ? 1 : 0 }}
            >
              {slide.type === 'group-header' ? (
                <GroupHeaderSlide
                  label={slide.groupLabel!}
                  count={slide.groupCount!}
                  template={template}
                  fullscreen
                />
              ) : (
                <AnnouncementSlide
                  announcement={slide.announcement!}
                  template={template}
                  groupLabel={grouping !== 'none' ? slide.groupLabel : undefined}
                  fullscreen
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Horizontal / Vertical scroll mode */
        <div
          className="flex h-full"
          style={{
            ...(transition === 'vertical' ? { flexDirection: 'column' } : {}),
            ...getTransitionStyle(),
            width: transition === 'horizontal' ? `${slides.length * 100}vw` : '100vw',
            height: transition === 'vertical' ? `${slides.length * 100}vh` : '100vh',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="shrink-0"
              style={{
                width: '100vw',
                height: '100vh',
              }}
            >
              {slide.type === 'group-header' ? (
                <GroupHeaderSlide
                  label={slide.groupLabel!}
                  count={slide.groupCount!}
                  template={template}
                  fullscreen
                />
              ) : (
                <AnnouncementSlide
                  announcement={slide.announcement!}
                  template={template}
                  groupLabel={grouping !== 'none' ? slide.groupLabel : undefined}
                  fullscreen
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Presenter controls toolbar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div className="flex items-center justify-between gap-4 mx-auto max-w-3xl mb-6 px-3 py-2 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/10 text-white shadow-2xl">
          {/* Left: nav arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              disabled={clampedIndex === 0}
              className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-sm font-medium px-3 tabular-nums">
              {clampedIndex + 1} / {slides.length}
            </span>
            <button
              onClick={goNext}
              disabled={clampedIndex === slides.length - 1}
              className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Center: play/pause + template */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
              title={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>

            <select
              value={currentTemplateId}
              onChange={(e) => setCurrentTemplateId(e.target.value)}
              className="bg-white/10 border-none text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/30"
            >
              {DISPLAY_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id} className="bg-gray-900">
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right: fullscreen + close */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
              title="Toggle fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </button>
            <button
              onClick={() => window.close()}
              className="p-2 rounded-xl hover:bg-white/10 text-red-400 transition-all"
              title="Close presentation"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard hints (shown briefly) */}
      {showControls && (
        <div className="absolute top-4 right-4 z-50 text-white/40 text-xs space-y-1 select-none">
          <p>← → Navigate</p>
          <p>F Fullscreen</p>
          <p>P Play/Pause</p>
        </div>
      )}
    </div>
  );
}

export default function PresentationPage() {
  return (
    <Suspense>
      <PresentationClient />
    </Suspense>
  );
}
