import { Megaphone } from 'lucide-react';
import DeptComingSoon from '@/components/departments/DeptComingSoon';
export default function AnnouncementsPage() {
  return <DeptComingSoon title="Announcements" icon={<Megaphone size={56} strokeWidth={1.2} />} />;
}
