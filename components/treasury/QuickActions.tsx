'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
    icon: '/treasury/record-income.svg',
    color:
      'bg-[#0B2A4A] hover:bg-[#1e3a8a]/90 hover:-translate-y-1 transition-all duration-150 ease-in  text-white border-transparent',
    handler: 'onRecordIncome' as const,
  },
  {
    label: 'Record expense',
    icon: '/treasury/record-expense.svg',
    color:
      'bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 hover:-translate-y-1 transition-all duration-150 ease-in text-white border-transparent',
    handler: 'onRecordExpenditure' as const,
  },
  {
    label: 'Expense Request',
    icon: '/treasury/expense-request.svg',
    color:
      'bg-[#3b82f6] hover:bg-[#3b82f6]/90 hover:-translate-y-1 transition-all duration-150 ease-in text-white border-transparent',
    handler: 'onExpenseRequest' as const,
  },
  {
    label: 'Member Contribution',
    icon: '/treasury/member-contribution.svg',
    color:
      'bg-white hover:bg-muted hover:-translate-y-1 transition-all duration-150 ease-in text-foreground border border-border',
    handler: 'onMemberContribution' as const,
  },
  {
    label: 'Asset Register',
    icon: '/treasury/asset-register.svg',
    color:
      'bg-white hover:bg-muted hover:-translate-y-1 transition-all duration-150 ease-in text-foreground border border-border [&>svg]:text-emerald-500',
    handler: 'onAssetRegister' as const,
  },
  {
    label: 'Financial Statement',
    icon: '/treasury/financial-statement.svg',
    color:
      'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 border hover:-translate-y-1 transition-all duration-150 ease-in border-emerald-200 mt-2 sm:mt-0 lg:ml-auto w-full sm:w-auto',
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
          <Image alt={`${action.label}`} src={action.icon} width={24} height={24} />
          <span className="text-[13px]">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
