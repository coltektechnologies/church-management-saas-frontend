import { CalendarDays } from 'lucide-react';
import DeptComingSoon from '@/components/departments/DeptComingSoon';
export default function ActivitiesPage() {
  return (
    <DeptComingSoon
      title="Activities & Events"
      icon={<CalendarDays size={56} strokeWidth={1.2} />}
    />
  );
}
