'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Megaphone, FileEdit, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { QuickCreateModal } from '@/components/announcements/QuickCreateModal';
import { AnnouncementDetailModal } from '@/components/announcements/AnnouncementDetailModal';
import type { Announcement } from '@/services/announcementService';

// Mock data based on the screenshot
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Hymnals Available',
    author: 'Bro. OWUSU WILLIAMS',
    authorRole: 'Department Head',
    date: '2024-08-15T00:00:00Z',
    publish_at: '2024-08-15T00:00:00Z',
    expires_at: null,
    content: 'We are pleased to announce that new hymnals are now available for all department members. Please ensure you grab one before the next service.',
    category: 'General Church',
    priority: 'High',
    status: 'Approved',
    audience: ['Adventist Youth'],
  },
  {
    id: '2',
    title: 'New Hymnals Available',
    author: 'Bro. OWUSU WILLIAMS',
    authorRole: 'Department Head',
    date: '2024-08-15T00:00:00Z',
    publish_at: '2024-08-15T00:00:00Z',
    expires_at: null,
    content: 'We are pleased to announce that new hymnals are now available.',
    category: 'General Church',
    priority: 'High',
    status: 'Approved',
    audience: ['Adventist Youth'],
  },
  {
    id: '3',
    title: 'New Hymnals Available',
    author: 'Bro. OWUSU WILLIAMS',
    authorRole: 'Department Head',
    date: '2024-08-15T00:00:00Z',
    publish_at: '2024-08-15T00:00:00Z',
    expires_at: null,
    content: 'We are pleased to announce that new hymnals are now available.',
    category: 'General Church',
    priority: 'High',
    status: 'Approved',
    audience: ['Adventist Youth'],
  },
  {
    id: '4',
    title: 'New Hymnals Available',
    author: 'Bro. OWUSU WILLIAMS',
    authorRole: 'Department Head',
    date: '2024-08-15T00:00:00Z',
    publish_at: '2024-08-15T00:00:00Z',
    expires_at: null,
    content: 'We are pleased to announce that new hymnals are now available.',
    category: 'General Church',
    priority: 'High',
    status: 'Approved',
    audience: ['Adventist Youth'],
  },
  {
    id: '5',
    title: 'New Hymnals Available',
    author: 'Bro. OWUSU WILLIAMS',
    authorRole: 'Department Head',
    date: '2024-08-15T00:00:00Z',
    publish_at: '2024-08-15T00:00:00Z',
    expires_at: null,
    content: 'We are pleased to announce that new hymnals are now available.',
    category: 'General Church',
    priority: 'High',
    status: 'Approved',
    audience: ['Adventist Youth'],
  },
];

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // States for viewing and editing
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Partial<any> | undefined>(undefined);

  const handleCreateAnnouncement = () => {
    setAnnouncementToEdit(undefined);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    // We pass initialData to QuickCreateModal
    setAnnouncementToEdit(announcement);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="w-full bg-background flex-1 p-4 sm:p-6 lg:px-8 lg:py-6 space-y-5 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 mb-1">
        <div className="flex items-center gap-2.5 text-info">
          <Megaphone className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Department Announcements</h1>
        </div>
        <Button 
          onClick={handleCreateAnnouncement}
          className="bg-linear-to-r from-[#0c2a44] to-[#1c5a8a] text-white hover:opacity-90 w-full sm:w-auto font-medium shadow-sm transition-all rounded-md px-5 py-2"
        >
          + Create Announcement
        </Button>
      </div>

      <Separator className="bg-foreground/20 mt-5" />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['All', 'Pending', 'Approved'].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`rounded-[8px] px-5 py-1.5 h-9 transition-all duration-200 whitespace-nowrap text-[14px] ${
              activeTab === tab 
                ? 'bg-muted-foreground/30 text-secondary-foreground hover:bg-secondary/90 font-medium shadow-sm' 
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-3.5 pt-1 pb-10">
        {mockAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id} 
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-muted-foreground/5 border-transparent shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:bg-muted-foreground/40 transition-all duration-300 rounded-xl"
          >
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[17px] font-bold text-foreground tracking-tight">{announcement.title}</h3>
              <div className="flex flex-col items-start text-[13px] font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-slate-700 dark:text-slate-300" strokeWidth={1.75} />
                  <span>
                    {announcement.priority === 'High' ? 'Urgent' : announcement.priority} • {announcement.date.split('T')[0]}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row justify-between md:flex-col items-start md:items-end gap-3.5">
              <Badge variant="secondary" className="bg-info/15 hover:bg-info/25 text-info border-none font-medium px-3.5 py-0.5 text-[12px] rounded-full pointer-events-none">
                {announcement.status}
              </Badge>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <button 
                  onClick={() => handleViewDetails(announcement)}
                  className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md" 
                  title="View Announcement"
                >
                  <Eye className="h-5 w-5" strokeWidth={1.75} />
                  <span className="sr-only">View</span>
                </button>
                <button 
                  onClick={() => handleEditAnnouncement(announcement)}
                  className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md" 
                  title="Edit Announcement"
                >
                  <FileEdit className="h-5 w-5" strokeWidth={1.75} />
                  <span className="sr-only">Edit</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modals from existing codebase */}
      <QuickCreateModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        initialData={announcementToEdit}
      />
      
      <AnnouncementDetailModal 
        open={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen} 
        announcement={selectedAnnouncement}
      />

    </div>
  );
}
