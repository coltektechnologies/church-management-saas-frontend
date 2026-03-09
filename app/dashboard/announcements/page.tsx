'use client';

import React, { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { AnnouncementsGrid } from '@/components/announcements/AnnouncementsGrid';
import { FloatingActions } from '@/components/announcements/FloatingActions';
import { QuickCreateModal } from '@/components/announcements/QuickCreateModal';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AnnouncementsPage() {
  const { filters, setFilters, toggleStatus } = useAnnouncementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: announcements = [], isLoading } = useAnnouncements(filters);

  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Scheduled', 'Archived'];

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#083344] tracking-tight dark:text-gray-100">
              Church Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and communicate with your congregation effectively
            </p>
          </div>

          <div className="hidden sm:block">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = '/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="mr-2">◄</span> Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Toolbar: Search & Status Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 bg-card p-2 rounded-xl border">
          <div className="flex items-center gap-5 px-3 overflow-x-auto pb-2 xl:pb-0 shrink-0">
            <span className="text-sm font-medium flex items-center gap-2 whitespace-nowrap text-[var(--color-success)]">
              <span className="flex size-4 items-center justify-center rounded text-[var(--color-success)]">
                ✓
              </span>{' '}
              All Announcements
            </span>
            <div className="w-px h-4 bg-border hidden sm:block" />

            {statusOptions.map((status) => {
              const isActive = (filters.status || []).includes(status as any);
              return (
                <label
                  key={status}
                  className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-sm hover:text-foreground transition-colors group"
                >
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-foreground border-foreground'
                        : 'border-muted-foreground/30 group-hover:border-foreground/50'
                    }`}
                    onClick={() => toggleStatus(status as any)}
                  >
                    {isActive && <div className="size-1.5 bg-background rounded-full" />}
                  </div>
                  <span
                    className={isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}
                  >
                    {status}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="relative w-full xl:w-64 shrink-0 mt-2 xl:mt-0 px-2 xl:px-0">
            <Search className="absolute left-4 xl:left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              className="pl-9 h-9"
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto pb-24 pr-1">
          <AnnouncementsGrid
            announcements={announcements}
            isLoading={isLoading}
            onShare={(id) => console.log('Share', id)}
            onDelete={(id) => console.log('Delete', id)}
            onView={(id) => console.log('View', id)}
          />
        </div>
      </div>

      <FloatingActions onOpenCreate={() => setIsModalOpen(true)} />

      <QuickCreateModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
