import { Receipt } from 'lucide-react';
import DeptComingSoon from '@/components/departments/DeptComingSoon';
export default function ExpensesPage() {
  return <DeptComingSoon title="Expense Requests" icon={<Receipt size={56} strokeWidth={1.2} />} />;
}
