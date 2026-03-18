import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcementService';
import type { Announcement } from '@/services/announcementService';
import { ANNOUNCEMENTS_QUERY_KEY } from './useAnnouncements';
import { toast } from 'sonner';

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Announcement> }) =>
      announcementService.updateAnnouncement(id, payload),
    onSuccess: () => {
      // Invalidate the announcements query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      toast.success('Announcement updated successfully');
    },
    onError: (err) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update announcement: ${errorMsg}`);
      console.error('Error updating announcement:', err);
    },
  });
}
