import { ClipboardCheck } from 'lucide-react';
import ComingSoon from '@/components/secretary/ComingSoon';

export default function RecordApprovalsPage() {
  return (
    <ComingSoon
      title="Record Approvals"
      icon={<ClipboardCheck className="w-10 h-10 text-primary" />}
    />
  );
}
