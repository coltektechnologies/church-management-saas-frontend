import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService, CreateAnnouncementPayload } from '@/services/announcementService';
import { ANNOUNCEMENTS_QUERY_KEY } from './useAnnouncements';
import { toast } from 'sonner';

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => announcementService.createAnnouncement(data),
    onSuccess: () => {
      // Invalidate the announcements query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      toast.success('Announcement created successfully');
    },
    onError: (err) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to create announcement: ${errorMsg}`);
      console.error('Error creating announcement:', err);
    },
  });
}
