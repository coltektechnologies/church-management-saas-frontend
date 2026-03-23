'use client';

import { User } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
}

const defaultItems: ActivityItem[] = [
  { id: '1', title: 'Member Added', subtitle: 'Owusu William' },
  { id: '2', title: 'Expenses Request', subtitle: 'From Treasury' },
];

const ActivityFeed = ({ items = defaultItems }: ActivityFeedProps) => (
  <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
    <h3 className="text-base font-bold text-foreground mb-4">Activity Feeds</h3>
    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No recent activity.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/20">
              <User size={14} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
            </div>
          </div>
        ))
      )}
    </div>
    <button className="text-xs text-primary font-bold mt-4 hover:underline w-full text-right transition-all">
      Browse all activities →
    </button>
  </div>
);

export default ActivityFeed;
