import { FileBarChart } from 'lucide-react';
import DeptComingSoon from '@/components/departments/DeptComingSoon';
export default function ReportsPage() {
  return (
    <DeptComingSoon
      title="Department Reports"
      icon={<FileBarChart size={56} strokeWidth={1.2} />}
    />
  );
}
