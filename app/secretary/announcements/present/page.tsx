/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnnouncementSlide, GroupHeaderSlide } from '@/components/announcements/AnnouncementSlide';
import { getDisplayTemplate, DISPLAY_TEMPLATES } from '@/services/displayTemplates';
import {
  announcementService,
  type Announcement,
  type AnnouncementStatus,
} from '@/services/announcementService';
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
      // If ids are provided, fetch all so we don't accidentally filter out selected non-approved ones
      const fetchParams = idsParam ? {} : { status: ['Approved'] as AnnouncementStatus[] };
      const all = await announcementService.fetchAnnouncements(fetchParams);

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

  // Wheel events (debounced to avoid rapid scrolling)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      resetControlsTimer();
      // Only process wheel events if we are not currently debouncing
      if (wheelTimer.current) {
        return;
      }

      // Simple debounce for 800ms
      wheelTimer.current = setTimeout(() => {
        wheelTimer.current = null;
      }, 800);

      if (e.deltaY > 0 || e.deltaX > 0) {
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.deltaY < 0 || e.deltaX < 0) {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimer.current) {
        clearTimeout(wheelTimer.current);
      }
    };
  }, [slides.length, resetControlsTimer]);

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
      <div className="w-screen h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="size-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Layers className="size-6 text-white/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Presentation...</h2>
          <p className="text-white/60 text-sm">Preparing your slides</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex bg-zinc-950 relative text-white overflow-hidden select-none ${
        isFullscreen ? 'w-screen h-screen' : 'w-full h-[90vh]'
      }`}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Thumbnails Sidebar (only outside fullscreen) */}
      {!isFullscreen && (
        <div className="w-72 overflow-y-hidden shrink-0 border-r border-white/10 flex flex-col bg-zinc-900 z-10  md:flex">
          <div className="p-4 border-b border-white/10 font-semibold text-sm flex items-center justify-between">
            <span>Presentation Setup</span>
            <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
              {slides.length} slides
            </span>
          </div>
          <div className="flex-1  overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-full text-left group transition-all`}
              >
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">
                    {i + 1}
                  </span>
                  {slide.type === 'group-header' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      Header
                    </span>
                  )}
                </div>
                <div
                  className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all relative ${
                    i === clampedIndex
                      ? 'border-primary ring-4 ring-primary/20 scale-[1.02]'
                      : 'border-white/10 group-hover:border-white/30'
                  }`}
                >
                  {/* Miniature Slide Preview */}
                  <div className="absolute inset-0 bg-black">
                    <div className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none">
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
                  </div>
                  {/* Overlay for inactive slides to make them look faded */}
                  {i !== clampedIndex && (
                    <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/20" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Slide Area */}
      <div className="flex-1 relative flex items-center justify-center h-full overflow-hidden">
        {/* Aspect Ratio Container for Main Presentation Area */}
        <div
          className="relative bg-black shrink-0 overflow-hidden shadow-2xl"
          style={
            isFullscreen
              ? { width: '100%', height: '100%' }
              : {
                  width: '100%',
                  maxWidth: 'calc(100vh * 16 / 9)',
                  aspectRatio: '16/9',
                  borderRadius: '0.75rem',
                }
          }
        >
          {/* Slides container */}
          {transition === 'fade' ? (
            /* Fade mode: stack all slides, only show current */
            <div className="relative w-full h-full">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className=" inset-0 transition-opacity duration-700 ease-in-out"
                  style={{
                    opacity: i === clampedIndex ? 1 : 0,
                    zIndex: i === clampedIndex ? 1 : 0,
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
          ) : (
            /* Horizontal / Vertical scroll mode */
            <div
              className={`flex w-full h-full ${transition === 'vertical' ? 'flex-col' : 'flex-row'}`}
              style={getTransitionStyle()}
            >
              {slides.map((slide, i) => (
                <div key={i} className="shrink-0 w-full h-full relative">
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
        </div>

        {/* Presenter controls toolbar */}
        <div
          className="absolute bottom-6 left-0 right-0 z-50 transition-all duration-300 flex justify-center"
          style={{
            opacity: showControls ? 1 : 0,
            transform: showControls ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/10 text-white shadow-2xl">
            {/* Left: nav arrows */}
            <div className="flex items-center gap-1">
              <button
                title="Go Previous"
                onClick={goPrev}
                disabled={clampedIndex === 0}
                className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="size-5" />
              </button>
              <span className="text-sm font-medium px-3 tabular-nums w-20 text-center">
                {clampedIndex + 1} / {slides.length}
              </span>
              <button
                title="Go Next"
                onClick={goNext}
                disabled={clampedIndex === slides.length - 1}
                className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Center: play/pause + template */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="p-2 rounded-xl hover:bg-white/10 transition-all"
                title={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>

              <select
                title="Select Template"
                value={currentTemplateId}
                onChange={(e) => setCurrentTemplateId(e.target.value)}
                className="bg-white/10 border-none text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
              >
                {DISPLAY_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-gray-900">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: fullscreen + close */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl hover:bg-white/10 transition-all"
                title="Toggle fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </button>
              {!isFullscreen && (
                <button
                  onClick={() => window.close()}
                  className="p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                  title="Close presentation"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard hints (shown briefly) */}
        {showControls && (
          <div className="absolute top-4 right-4 z-50 text-white/40 text-xs space-y-1 select-none text-right">
            <p className="flex items-center justify-end gap-2">
              Navigate <span className="bg-white/10 px-1 rounded">←</span>{' '}
              <span className="bg-white/10 px-1 rounded">→</span>
            </p>
            <p className="flex items-center justify-end gap-2">
              Fullscreen <span className="bg-white/10 px-1 rounded">F</span>
            </p>
            <p className="flex items-center justify-end gap-2">
              Play/Pause <span className="bg-white/10 px-1 rounded">P</span>
            </p>
          </div>
        )}
      </div>
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
