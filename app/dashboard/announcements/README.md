# Announcements Dashboard Page

This document provides instructions for backend developers to plug in real APIs and swap out the mock implementation in the Announcements page.

## Where things live

- **Page Component:** `src/app/dashboard/announcements/page.tsx`
- **UI Components:** `src/components/announcements/`
- **React Query Hooks:** `src/hooks/useAnnouncements.ts`, `src/hooks/useCreateAnnouncement.ts`
- **Data Service:** `src/services/announcementService.ts`
- **Mocks:** `src/services/announcements.mock.ts`

## How to switch from Mock to Real API

1. Open `src/services/announcementService.ts`.
2. Find the constant: `const USE_MOCK = true;`
3. Change it to: `const USE_MOCK = false;`
4. In the same file, locate the `// TODO: Implementation for real API` comments inside methods like `fetchAnnouncements` and `createAnnouncement`.
5. Uncomment and modify the provided `fetch` blocks with the actual endpoint URLs and include any required auth headers.

## Expected Backend Shape

The frontend expects the `Announcement` interface to look like this:

```typescript
export interface Announcement {
  id: string;
  category: 'All' | 'Thanksgiving' | 'Prayer Request' | ...;
  priority: 'Low' | 'Medium' | 'High';
  title: string;
  content: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Archived';
  author: string;
  authorRole: string;
  date: string; // ISO 8601 Database string
  audience: string[];
}
```

The payload for creating an announcement is shape:

```typescript
export interface CreateAnnouncementPayload {
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  title: string;
  content: string;
  audience: string[];
  status: string;
}
```

## Caching Strategy

The page uses `@tanstack/react-query`.
The queries are keyed by `['announcements', filters]`.
When mutating data (e.g. creating/editing/deleting), the hook `useCreateAnnouncement` currently calls `queryClient.invalidateQueries({ queryKey: ['announcements'] })` which forces the grid to refetch new data automatically. Make sure the mutations succeed correctly so the cache invalidation runs.
