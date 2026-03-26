'use client';

import { LucideIcon, Inbox } from 'lucide-react';

interface DashboardEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
}

const DashboardEmptyState = ({
  icon: Icon = Inbox,
  title = 'No data yet',
  message = 'Data will appear here once records are added.',
}: DashboardEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Icon size={22} className="text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
  </div>
);

export default DashboardEmptyState;
