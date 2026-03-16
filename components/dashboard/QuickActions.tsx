'use client';

import React from 'react';
import {
  UserPlus,
  Megaphone,
  HandCoins,
  MessageSquare,
  CalendarPlus,
  FileBarChart,
  ClipboardList,
  Building2,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType; // Replaced 'any'
}

const defaultActions: QuickAction[] = [
  { id: 'add-member', label: 'Add Member', icon: UserPlus },
  { id: 'announcement', label: 'Post Notice', icon: Megaphone },
  { id: 'offerings', label: 'Record Cash', icon: HandCoins },
  { id: 'message', label: 'Send SMS', icon: MessageSquare },
  { id: 'event', label: 'Book Event', icon: CalendarPlus },
  { id: 'report', label: 'Financials', icon: FileBarChart },
  { id: 'attendance', label: 'Attendance', icon: ClipboardList },
  { id: 'departments', label: 'Manage Units', icon: Building2 },
];

const QuickActions = ({ onAction }: { onAction?: (id: string) => void }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
    {defaultActions.map((action) => {
      const Icon = action.icon;
      return (
        <button
          key={action.id}
          onClick={() => onAction?.(action.id)}
          className="group flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="p-3 rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Icon size={20} />
          </div>
          <span className="text-[10px] font-black text-[#0B2A4A] leading-tight uppercase tracking-tighter">
            {action.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default QuickActions;
