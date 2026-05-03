'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  BarChart3,
  FileText,
  PlusCircle,
  CreditCard,
  ClipboardList,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';

interface QuickActionsProps {
  onRecordIncome?: () => void;
  onRecordExpenditure?: () => void;
  onExpenseRequest?: () => void;
  onMemberContribution?: () => void;
  onAssetRegister?: () => void;
  onFinancialStatement?: () => void;
}

type ActionDef =
  | {
      label: string;
      icon: LucideIcon | string;
      color: string;
      handler:
        | 'onRecordIncome'
        | 'onRecordExpenditure'
        | 'onExpenseRequest'
        | 'onMemberContribution'
        | 'onAssetRegister'
        | 'onFinancialStatement';
    }
  | {
      label: string;
      icon: LucideIcon | string;
      color: string;
      href: string;
    };

const actions: ActionDef[] = [
  {
    label: 'Record income',
    icon: BookOpen,
    color: 'bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white border-transparent',
    handler: 'onRecordIncome',
  },
  {
    label: 'Record expense',
    icon: FileText,
    color: 'bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-white border-transparent',
    handler: 'onRecordExpenditure',
  },
  {
    label: 'Expense categories',
    icon: Tags,
    color: 'bg-violet-600 hover:bg-violet-600/90 text-white border-transparent',
    href: '/admin/treasury/expense-categories',
  },
  {
    label: 'Expense Request',
    icon: CreditCard,
    color: 'bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white border-transparent',
    handler: 'onExpenseRequest',
  },
  {
    label: 'Member Contribution',
    icon: PlusCircle,
    color:
      'bg-[var(--admin-surface)] hover:bg-muted text-foreground border border-[var(--admin-border)] dark:hover:bg-white/10',
    handler: 'onMemberContribution',
  },
  {
    label: 'Asset Register',
    icon: ClipboardList,
    color:
      'bg-[var(--admin-surface)] hover:bg-muted text-foreground border border-[var(--admin-border)] dark:hover:bg-white/10 [&>svg]:text-emerald-500 dark:[&>svg]:text-emerald-400',
    handler: 'onAssetRegister',
  },
  {
    label: 'Financial Statement',
    icon: BarChart3,
    color:
      'bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mt-2 sm:mt-0 lg:ml-auto w-full sm:w-auto',
    handler: 'onFinancialStatement',
  },
];

export function QuickActions(props: QuickActionsProps) {
  const router = useRouter();

  const handleAction = (handlerName: keyof QuickActionsProps) => {
    const fn = props[handlerName];
    if (fn) {
      fn();
    } else if (handlerName === 'onRecordIncome') {
      router.push('/admin/treasury/record?type=income');
    } else if (handlerName === 'onRecordExpenditure') {
      router.push('/admin/treasury/record?type=expense');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          onClick={() =>
            'href' in action ? router.push(action.href) : handleAction(action.handler)
          }
          className={`${action.color} rounded-md px-4 h-9 gap-2 shadow-sm cursor-pointer font-medium transition-colors`}
        >
          {typeof action.icon === 'string' ? (
            <Image
              alt={action.label}
              src={action.icon}
              width={18}
              height={18}
              className="shrink-0"
            />
          ) : (
            <action.icon className="size-[18px] shrink-0" aria-hidden />
          )}
          <span className="text-[13px]">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
