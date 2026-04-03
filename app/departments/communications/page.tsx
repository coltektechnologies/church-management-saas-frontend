import { MessageSquare } from 'lucide-react';
import DeptComingSoon from '@/components/departments/DeptComingSoon';
export default function CommunicationsPage() {
  return (
    <DeptComingSoon title="Message Member" icon={<MessageSquare size={56} strokeWidth={1.2} />} />
  );
}
