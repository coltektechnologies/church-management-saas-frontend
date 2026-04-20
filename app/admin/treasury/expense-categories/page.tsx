import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ExpenseCategoriesManage from '@/components/treasurydashboard/ExpenseCategoriesManage';

export default function AdminTreasuryExpenseCategoriesPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/treasury"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Treasury
      </Link>
      <ExpenseCategoriesManage />
    </div>
  );
}
