'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useActivity } from '@/components/secretary/contexts/ActivityContext';

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) {
    return 'Just now';
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)} min ago`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hr ago`;
  }
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ActivityFeed() {
  const { activities, isReady, clearActivity } = useActivity();

  // Both server and client render the same empty state until isReady
  // This prevents the hydration mismatch on the "Clear all" button and activity list
  const showActivities = isReady && activities.length > 0;

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Activity Feed</CardTitle>
        {/* Only render button client-side after isReady — no server/client mismatch */}
        {showActivities && (
          <button
            onClick={clearActivity}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-[280px] overflow-auto">
        {!showActivities ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet — actions across pages appear here.
          </p>
        ) : (
          <>
            {activities.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {a.icon}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                  {timeAgo(a.timestamp)}
                </span>
              </div>
            ))}
            <p className="text-right text-xs text-primary cursor-pointer hover:underline">
              Browse all
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
