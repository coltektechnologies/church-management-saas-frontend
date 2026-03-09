import { MOCK_ANNOUNCEMENTS } from './announcements.mock';
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementStatus,
  PriorityLevel,
} from './announcements.mock';
export type { Announcement, AnnouncementCategory, AnnouncementStatus, PriorityLevel };

export interface AnnouncementListFilters {
  category?: AnnouncementCategory | 'All';
  status?: AnnouncementStatus[];
  dateRange?: { from: string; to: string } | null;
  search?: string;
  sortBy?: 'date' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAnnouncementPayload {
  category: AnnouncementCategory;
  priority: 'Low' | 'Medium' | 'High';
  title: string;
  content: string;
  audience: string[];
  status: AnnouncementStatus;
  scheduledDate?: string;
}

// TODO: Backend Dev - Set this to false to use real endpoints.
const USE_MOCK = true;
const STORAGE_KEY = 'church_announcements_db';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getStoredAnnouncements = (): Announcement[] => {
  if (typeof window === 'undefined') {
    return MOCK_ANNOUNCEMENTS;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ANNOUNCEMENTS));
    return MOCK_ANNOUNCEMENTS;
  }
  return JSON.parse(stored);
};

class AnnouncementService {
  async fetchAnnouncements(filters: AnnouncementListFilters): Promise<Announcement[]> {
    if (USE_MOCK) {
      await delay(400); // Simulate network latency
      let data = getStoredAnnouncements();

      if (filters.category && filters.category !== 'All') {
        data = data.filter((a) => a.category === filters.category);
      }
      if (filters.status && filters.status.length > 0) {
        data = data.filter((a) => filters.status!.includes(a.status));
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        data = data.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.content.toLowerCase().includes(query) ||
            a.author.toLowerCase().includes(query)
        );
      }

      // Default sorting by date desc
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return data;
    } else {
      // TODO: Implementation for real API
      /*
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      // ...append other filters
      const response = await fetch(`/api/announcements?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
      */
      throw new Error('Real API not yet implemented');
    }
  }

  async createAnnouncement(payload: CreateAnnouncementPayload): Promise<Announcement> {
    if (USE_MOCK) {
      await delay(500);
      const newAnn: Announcement = {
        id: `a_${Date.now()}`,
        ...payload,
        author: 'Ps Owusu William', // Mock current user
        authorRole: 'Admin',
        date: new Date().toISOString(),
      };
      const existing = getStoredAnnouncements();
      existing.unshift(newAnn);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return newAnn;
    } else {
      // TODO: Implementation for real API
      /*
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
      */
      throw new Error('Real API not yet implemented');
    }
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay(300);
      const existing = getStoredAnnouncements();
      const filtered = existing.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }
    throw new Error('Real API not yet implemented');
  }

  async updateAnnouncementStatus(id: string, newStatus: AnnouncementStatus): Promise<Announcement> {
    if (USE_MOCK) {
      await delay(300);
      const existing = getStoredAnnouncements();
      const index = existing.findIndex((a) => a.id === id);
      if (index === -1) {
        throw new Error('Announcement not found');
      }

      existing[index].status = newStatus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return existing[index];
    }
    throw new Error('Real API not yet implemented');
  }
}

export const announcementService = new AnnouncementService();
