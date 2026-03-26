'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, PlusCircle, CreditCard, ClipboardList } from 'lucide-react';

interface QuickActionsProps {
  onRecordIncome?: () => void;
  onRecordExpenditure?: () => void;
  onExpenseRequest?: () => void;
  onMemberContribution?: () => void;
  onAssetRegister?: () => void;
  onFinancialStatement?: () => void;
}

const actions = [
  {
    label: 'Record income',
    icon: BookOpen,
    color: 'bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white border-transparent',
    handler: 'onRecordIncome' as const,
  },
  {
    label: 'Record expense',
    icon: FileText,
    color: 'bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-white border-transparent',
    handler: 'onRecordExpenditure' as const,
  },
  {
    label: 'Expense Request',
    icon: CreditCard,
    color: 'bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white border-transparent',
    handler: 'onExpenseRequest' as const,
  },
  {
    label: 'Member Contribution',
    icon: PlusCircle,
    color: 'bg-white hover:bg-muted text-foreground border border-border',
    handler: 'onMemberContribution' as const,
  },
  {
    label: 'Asset Register',
    icon: ClipboardList,
    color: 'bg-white hover:bg-muted text-foreground border border-border [&>svg]:text-emerald-500',
    handler: 'onAssetRegister' as const,
  },
  {
    label: 'Financial Statement',
    icon: FileText,
    color:
      'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 border border-emerald-200 mt-2 sm:mt-0 lg:ml-auto w-full sm:w-auto',
    handler: 'onFinancialStatement' as const,
  },
];

export function QuickActions(props: QuickActionsProps) {
  const router = useRouter();

  const handleAction = (handlerName: keyof QuickActionsProps) => {
    if (handlerName === 'onRecordIncome') {
      router.push('/admin/treasury/record?type=income');
    } else if (handlerName === 'onRecordExpenditure') {
      router.push('/admin/treasury/record?type=expense');
    } else {
      const fn = props[handlerName];
      if (fn) {
        fn();
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          onClick={() => handleAction(action.handler)}
          className={`${action.color} rounded-md px-4 h-9 gap-2 shadow-sm cursor-pointer font-medium transition-colors`}
        >
          <action.icon className="size-4" />
          <span className="text-[13px]">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
