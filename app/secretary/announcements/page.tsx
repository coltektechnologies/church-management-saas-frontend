import { Megaphone } from 'lucide-react';
import ComingSoon from '@/components/secretary/ComingSoon';

export default function AnnouncementsPage() {
  return (
    <ComingSoon title="Announcements" icon={<Megaphone className="w-10 h-10 text-primary" />} />
  );
}
