'use client';

import {
  Database,
  Users,
  Wallet,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Circle,
  LucideIcon,
} from 'lucide-react';

// Added specific interface to replace 'any'
interface DashboardEmptyStateProps {
  stats: {
    totalMembers: number;
    monthlyIncome: number;
    eventsCount: number;
  };
  onNavigate: (id: string) => void;
}

// Added Type for the steps array to ensure icon rendering is type-safe
interface Step {
  id: string;
  label: string;
  done: boolean;
  icon: LucideIcon;
  color: string;
}

export const DashboardEmptyState = ({ stats, onNavigate }: DashboardEmptyStateProps) => {
  const steps: Step[] = [
    {
      id: 'members',
      label: 'Add first member',
      done: stats.totalMembers > 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      id: 'treasury',
      label: 'Record income',
      done: stats.monthlyIncome > 0,
      icon: Wallet,
      color: 'text-emerald-500',
    },
    {
      id: 'secretary',
      label: 'Schedule event',
      done: stats.eventsCount > 0,
      icon: Calendar,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in zoom-in duration-700">
      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 rotate-6 border border-slate-200">
        <Database size={32} className="text-slate-400" />
      </div>

      <h2 className="text-3xl font-black text-[#0B2A4A] tracking-tighter">Welcome to Churchly</h2>
      <p className="text-slate-500 mb-10 text-center max-w-sm">
        Complete your setup to unlock dashboard analytics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {steps.map((step) => (
          <div key={step.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <step.icon className={`${step.color} mb-4`} size={24} />
            <div className="flex items-center gap-2 mb-4">
              {step.done ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <Circle size={16} className="text-slate-300" />
              )}
              <span className="text-sm font-bold text-[#0B2A4A]">{step.label}</span>
            </div>
            {!step.done && (
              <button
                onClick={() => onNavigate(step.id)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest hover:gap-3 transition-all"
              >
                Get Started <ArrowRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
