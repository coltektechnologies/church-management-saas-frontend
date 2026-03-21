import { MessageSquare } from 'lucide-react';
import ComingSoon from '@/components/secretary/ComingSoon';

export default function CommunicationsPage() {
  return (
    <ComingSoon
      title="Communications"
      icon={<MessageSquare className="w-10 h-10 text-primary" />}
    />
  );
}
