import { MOCK_ANNOUNCEMENTS } from './announcements.mock';
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementStatus,
  PriorityLevel,
} from './announcements.mock';
export type { Announcement, AnnouncementCategory, AnnouncementStatus, PriorityLevel };

import { getAccessToken } from '@/lib/api';
import { isMockAnnouncementsEnabled } from '@/lib/featureFlags';
import {
  fetchAnnouncementCategories,
  fetchAnnouncementsList,
  fetchAnnouncementsListAllPages,
  fetchAnnouncementDetail,
  createAnnouncementApi,
  patchAnnouncementApi,
  deleteAnnouncementApi,
  submitAnnouncementApi,
  approveAnnouncementApi,
  publishAnnouncementApi,
} from '@/lib/announcementsApi';
import {
  mapDetailToAnnouncement,
  mapListItemToAnnouncement,
  uiPriorityToApi,
} from '@/lib/announcementMappers';
import { canInstantPublishAnnouncementsFromUi } from '@/lib/announcementPublishPolicy';

export interface AnnouncementListFilters {
  category?: AnnouncementCategory | 'All';
  status?: AnnouncementStatus[];
  dateRange?: { from: string; to: string } | null;
  search?: string;
  sortBy?: 'date' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  /** Department portal: list only announcements authored by the signed-in user. */
  mineOnly?: boolean;
  /**
   * `/admin/secretary`: backend narrows to secretariat pipeline + secretariat-authored items.
   */
  secretariatFeed?: boolean;
}

export interface CreateAnnouncementPayload {
  category: AnnouncementCategory;
  priority: 'Low' | 'Medium' | 'High';
  title: string;
  content: string;
  status: AnnouncementStatus;
  publish_at?: string | null;
  expires_at?: string | null;
  audience?: string[];
  scheduleType?: 'Instant' | 'SpecificDate';
  scheduledDate?: string;
  displayDurationType?: 'OneTime' | 'Duration';
  displayDurationDays?: number;
}

const STORAGE_KEY = 'church_announcements_db';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function shouldUseLiveApi(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  if (isMockAnnouncementsEnabled()) {
    return false;
  }
  return !!getAccessToken();
}

let categoriesCache: Awaited<ReturnType<typeof fetchAnnouncementCategories>> | null = null;

async function resolveCategoryId(name: AnnouncementCategory | 'All'): Promise<string | null> {
  if (name === 'All') {
    return null;
  }
  try {
    if (!categoriesCache) {
      categoriesCache = await fetchAnnouncementCategories();
    }
    const lower = name.toLowerCase();
    const hit = categoriesCache.find((c) => c.name.toLowerCase() === lower);
    return hit?.id ?? null;
  } catch {
    return null;
  }
}

/** After create: move DRAFT → PUBLISHED via submit → approve → publish (admin workflow). */
async function tryPublishAnnouncement(id: string): Promise<void> {
  await submitAnnouncementApi(id);
  await approveAnnouncementApi(id);
  await publishAnnouncementApi(id);
}

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
  /**
   * Full detail (includes `content`) for edit modal / presentation.
   */
  async getAnnouncementById(id: string): Promise<Announcement> {
    if (shouldUseLiveApi()) {
      const d = await fetchAnnouncementDetail(id);
      return mapDetailToAnnouncement(d);
    }
    const list = getStoredAnnouncements();
    const found = list.find((a) => a.id === id);
    if (!found) {
      throw new Error('Announcement not found');
    }
    return found;
  }

  async fetchAnnouncements(filters: AnnouncementListFilters): Promise<Announcement[]> {
    if (shouldUseLiveApi()) {
      const rows =
        filters.secretariatFeed === true
          ? await fetchAnnouncementsListAllPages({
              page_size: 80,
              maxPages: 25,
              search: filters.search?.trim() || undefined,
              secretariat_feed: true,
            })
          : await fetchAnnouncementsList({
              page_size: 100,
              search: filters.search || undefined,
              mine_only: filters.mineOnly === true ? true : undefined,
            });
      // List API has no body; leave content empty so cards do not show an internal placeholder string.
      let mapped = rows.map((r) => mapListItemToAnnouncement(r, ''));

      if (filters.category && filters.category !== 'All') {
        mapped = mapped.filter((a) => a.category === filters.category);
      }
      const statusFilter = filters.status;
      if (statusFilter && statusFilter.length > 0) {
        mapped = mapped.filter((a) => statusFilter.includes(a.status));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q) ||
            a.author.toLowerCase().includes(q)
        );
      }
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const from = new Date(filters.dateRange.from).getTime();
        const to = new Date(filters.dateRange.to).getTime();
        mapped = mapped.filter((a) => {
          const t = new Date(a.date).getTime();
          return t >= from && t <= to;
        });
      }

      const sortBy = filters.sortBy ?? 'date';
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      mapped.sort((a, b) => {
        if (sortBy === 'title') {
          return order * a.title.localeCompare(b.title);
        }
        if (sortBy === 'priority') {
          const pr = { High: 3, Medium: 2, Low: 1 };
          return order * ((pr[a.priority] ?? 0) - (pr[b.priority] ?? 0));
        }
        return order * (new Date(a.date).getTime() - new Date(b.date).getTime());
      });

      return mapped;
    }

    await delay(400);
    let data = getStoredAnnouncements();

    if (filters.category && filters.category !== 'All') {
      data = data.filter((a) => a.category === filters.category);
    }
    const statusFilter = filters.status;
    if (statusFilter && statusFilter.length > 0) {
      data = data.filter((a) => statusFilter.includes(a.status));
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

    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return data;
  }

  async createAnnouncement(payload: CreateAnnouncementPayload): Promise<Announcement> {
    if (shouldUseLiveApi()) {
      const category_id = await resolveCategoryId(payload.category);
      const body = {
        title: payload.title.trim(),
        content: payload.content.trim(),
        priority: uiPriorityToApi(payload.priority),
        category_id: category_id ?? undefined,
        publish_at: payload.publish_at ?? null,
        expires_at: payload.expires_at ?? null,
      };
      const created = await createAnnouncementApi(body);
      if (payload.status === 'Approved') {
        if (canInstantPublishAnnouncementsFromUi()) {
          try {
            await tryPublishAnnouncement(created.id);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            throw new Error(`Announcement was saved, but the publish workflow failed: ${msg}`);
          }
        } else {
          await submitAnnouncementApi(created.id);
        }
      }
      const refreshed = await fetchAnnouncementDetail(created.id);
      return mapDetailToAnnouncement(refreshed);
    }

    await delay(500);
    const newAnn: Announcement = {
      id: `a_${Date.now()}`,
      ...payload,
      audience: payload.audience?.length ? payload.audience : ['All members'],
      author: 'Ps Owusu William',
      authorRole: 'Admin',
      date: new Date().toISOString(),
    };
    const existing = getStoredAnnouncements();
    existing.unshift(newAnn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return newAnn;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (shouldUseLiveApi()) {
      await deleteAnnouncementApi(id);
      return true;
    }
    await delay(300);
    const existing = getStoredAnnouncements();
    const filtered = existing.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  async updateAnnouncementStatus(id: string, newStatus: AnnouncementStatus): Promise<Announcement> {
    if (shouldUseLiveApi()) {
      if (newStatus === 'Approved') {
        if (canInstantPublishAnnouncementsFromUi()) {
          try {
            await tryPublishAnnouncement(id);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            throw new Error(`Status update failed: ${msg}`);
          }
        } else {
          await submitAnnouncementApi(id);
        }
      }
      const refreshed = await fetchAnnouncementDetail(id);
      return mapDetailToAnnouncement(refreshed);
    }
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

  async updateAnnouncement(id: string, payload: Partial<Announcement>): Promise<Announcement> {
    if (shouldUseLiveApi()) {
      const category_id =
        payload.category !== undefined && payload.category !== null
          ? await resolveCategoryId(payload.category as AnnouncementCategory)
          : undefined;
      const patch: Parameters<typeof patchAnnouncementApi>[1] = {};
      if (payload.title !== undefined && payload.title !== null) {
        patch.title = payload.title;
      }
      if (payload.content !== undefined && payload.content !== null) {
        patch.content = payload.content;
      }
      if (payload.priority !== undefined && payload.priority !== null) {
        patch.priority = uiPriorityToApi(payload.priority);
      }
      if (payload.publish_at !== undefined) {
        patch.publish_at = payload.publish_at;
      }
      if (payload.expires_at !== undefined) {
        patch.expires_at = payload.expires_at;
      }
      if (category_id !== undefined) {
        patch.category_id = category_id;
      }
      await patchAnnouncementApi(id, patch);
      const refreshed = await fetchAnnouncementDetail(id);
      return mapDetailToAnnouncement(refreshed);
    }
    await delay(400);
    const existing = getStoredAnnouncements();
    const index = existing.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Announcement not found');
    }
    const updated = { ...existing[index], ...payload };
    existing[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return updated;
  }
}

export const announcementService = new AnnouncementService();
