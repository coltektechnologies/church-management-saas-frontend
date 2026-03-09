'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, ArrowUpFromLine, FileBarChart, Users, Package } from 'lucide-react';

interface QuickActionsProps {
  onRecordIncome?: () => void;
  onRecordExpenditure?: () => void;
  onExpenseReport?: () => void;
  onMemberContribution?: () => void;
  onAssetRegister?: () => void;
}

const actions = [
  {
    label: 'Record Income',
    icon: ArrowDownToLine,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    handler: 'onRecordIncome' as const,
  },
  {
    label: 'Record Expenditure',
    icon: ArrowUpFromLine,
    color: 'bg-orange-500 hover:bg-orange-600',
    handler: 'onRecordExpenditure' as const,
  },
  {
    label: 'Expense Report',
    icon: FileBarChart,
    color: 'bg-blue-500 hover:bg-blue-600',
    handler: 'onExpenseReport' as const,
  },
  {
    label: 'Member Contribution',
    icon: Users,
    color: 'bg-violet-500 hover:bg-violet-600',
    handler: 'onMemberContribution' as const,
  },
  {
    label: 'Asset Register',
    icon: Package,
    color: 'bg-slate-600 hover:bg-slate-700',
    handler: 'onAssetRegister' as const,
  },
];

export function QuickActions(props: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          onClick={props[action.handler]}
          className={`${action.color} text-white rounded-full px-4 h-9 gap-2 shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5`}
        >
          <action.icon className="size-4" />
          <span className="text-xs font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
