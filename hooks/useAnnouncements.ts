import { useQuery } from '@tanstack/react-query';
import { announcementService, AnnouncementListFilters } from '@/services/announcementService';

export const ANNOUNCEMENTS_QUERY_KEY = 'announcements';

export function useAnnouncements(filters: AnnouncementListFilters) {
  return useQuery({
    queryKey: [ANNOUNCEMENTS_QUERY_KEY, filters],
    queryFn: () => announcementService.fetchAnnouncements(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
