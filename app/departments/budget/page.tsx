import { Wallet } from 'lucide-react';
import DeptComingSoon from '@/components/departments/DeptComingSoon';
export default function BudgetPage() {
  return <DeptComingSoon title="Budget & Expenses" icon={<Wallet size={56} strokeWidth={1.2} />} />;
}
