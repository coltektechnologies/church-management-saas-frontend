import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService, CreateAnnouncementPayload } from '@/services/announcementService';
import { ANNOUNCEMENTS_QUERY_KEY } from './useAnnouncements';
import { toast } from 'sonner';
import { canInstantPublishAnnouncementsFromUi } from '@/lib/announcementPublishPolicy';

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => announcementService.createAnnouncement(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      if (variables.status !== 'Approved') {
        toast.success('Draft saved');
        return;
      }
      if (canInstantPublishAnnouncementsFromUi()) {
        toast.success('Announcement published');
      } else {
        toast.success('Submitted for secretariat approval');
      }
    },
    onError: (err) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to create announcement: ${errorMsg}`);
      console.error('Error creating announcement:', err);
    },
  });
}
