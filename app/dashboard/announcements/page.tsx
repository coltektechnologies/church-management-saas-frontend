'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { AnnouncementsGrid } from '@/components/announcements/AnnouncementsGrid';
import { FloatingActions } from '@/components/announcements/FloatingActions';
import { QuickCreateModal } from '@/components/announcements/QuickCreateModal';
import { TemplatesModal } from '@/components/announcements/TemplatesModal';
import { CreateAnnouncementPayload } from '@/services/announcementService';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  'All',
  'Thanksgiving',
  'Prayer Request',
  'Birthday Wishes',
  'Funeral/Bereavements',
  'General Church',
  'Events & Programs',
  'Baptism Celebration',
  'Weddings',
  'Departmental Updates',
  'Community Outreach',
  'Health and Wellness',
  'Youth Activities',
];

export default function AnnouncementsPage() {
  const { filters, setFilters, toggleStatus, resetFilters } = useAnnouncementStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [templatePayload, setTemplatePayload] = useState<
    Partial<CreateAnnouncementPayload> | undefined
  >();

  const { data: announcements = [], isLoading } = useAnnouncements(filters);

  // Status configuration with custom icons
  const statuses = [
    { label: 'Pending', value: 'Pending', icon: '/announcements/pending.svg' },
    { label: 'Approved', value: 'Approved', icon: '/announcements/approved.svg' },
    { label: 'Rejected', value: 'Rejected', icon: '/announcements/rejected.svg' },
    { label: 'Scheduled', value: 'Scheduled', icon: '/announcements/scheduled.svg' },
    { label: 'Archived', value: 'Archived', icon: '/announcements/archived.svg' },
  ];

  const pendingCount = 1; // Can be computed based on stats API in the future
  const isAllActive = !filters.status || filters.status.length === 0;

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const current = filters.dateRange || { from: '', to: '' };
    setFilters({ dateRange: { ...current, [type]: value } });
  };

  return (
    <div className="flex flex-col h-full w-full">
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

        {/* Toolbar: Category, Dates, Search & Status Filters */}
        <div className="flex flex-col gap-4 mb-6 bg-card p-4 rounded-xl border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Primary Filters (Category + Date) */}
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={filters.category || 'All'}
                onValueChange={(val) => setFilters({ category: val as any })}
              >
                <SelectTrigger className="w-[200px] h-9 bg-background">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-36 h-9 text-sm"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="date"
                  className="w-36 h-9 text-sm"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>

              {(filters.category !== 'All' || filters.dateRange) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-muted-foreground h-9 px-3"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                className="pl-9 h-9 bg-background"
                value={filters.search || ''}
                onChange={(e) => setFilters({ search: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full h-px bg-border my-1" />

          {/* Secondary Filters (Status Toggles) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 pb-1 hide-scrollbar">
            <button
              onClick={() => setFilters({ status: [] })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                isAllActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted font-medium'
              }`}
            >
              <div className="relative size-[18px]">
                <Image
                  src="/announcements/all-annuncements.svg"
                  alt="All"
                  fill
                  className={isAllActive ? 'opacity-100' : 'opacity-60'}
                />
              </div>
              All Announcements
            </button>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

            {statuses.map((item) => {
              const isActive = (filters.status || []).includes(item.value as any);
              return (
                <button
                  key={item.value}
                  onClick={() => toggleStatus(item.value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted font-medium'
                  }`}
                >
                  <div className="relative size-[18px]">
                    <Image
                      src={item.icon}
                      alt={item.label}
                      fill
                      className={isActive ? 'opacity-100' : 'opacity-60'}
                    />
                  </div>
                  <span>{item.label}</span>
                  {item.value === 'Pending' && (
                    <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full size-5 ml-1 leading-none pb-[1px]">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
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

      <FloatingActions
        onOpenCreate={() => {
          setTemplatePayload(undefined);
          setIsModalOpen(true);
        }}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      <QuickCreateModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={templatePayload}
      />

      <TemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onSelectTemplate={(payload) => {
          setTemplatePayload(payload);
          setIsModalOpen(true); // Open the create modal immediately after selecting simple template
        }}
      />
    </div>
  );
}
