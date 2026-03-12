import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcementService';
import { ANNOUNCEMENTS_QUERY_KEY } from './useAnnouncements';
import { toast } from 'sonner';

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      // Invalidate the announcements query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      toast.success('Announcement deleted successfully');
    },
    onError: (err) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete announcement: ${errorMsg}`);
      console.error('Error deleting announcement:', err);
    },
  });
}
