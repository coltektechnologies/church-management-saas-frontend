'use client';

/**
 * Activity feed: prefers church audit log from API (`GET /api/activity/`) when the secretary
 * dashboard provider has loaded rows; otherwise falls back to local `ActivityContext` (client-only log).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useActivity } from '@/components/secretary/contexts/ActivityContext';
import { useOptionalSecretaryDashboardApi } from '@/components/secretary/contexts/SecretaryDashboardApiContext';

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

function auditIcon(userDisplay: string | null | undefined, modelName: string): string {
  const u = (userDisplay || '').trim();
  if (u.length >= 2) {
    return u
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return (modelName || '•').slice(0, 2).toUpperCase();
}

export function ActivityFeed() {
  const { activities, isReady, clearActivity } = useActivity();
  const api = useOptionalSecretaryDashboardApi();
  const serverRows = api?.activityFeed ?? [];
  const serverLoading = api?.status === 'loading' || api?.status === 'idle';

  const useServer = serverRows.length > 0;
  const showLocal = isReady && activities.length > 0 && !useServer;

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Activity Feed</CardTitle>
        {showLocal && (
          <button
            type="button"
            onClick={clearActivity}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear local
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-[280px] overflow-auto">
        {serverLoading && !useServer && !showLocal ? (
          <div className="space-y-3 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted/60 shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-3 w-[75%] max-w-full rounded bg-muted/60" />
                  <div className="h-2 w-[50%] max-w-full rounded bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {useServer ? (
          <>
            <p className="text-[10px] text-muted-foreground -mt-1 mb-2">
              Church audit log (latest first)
            </p>
            {serverRows.map((row) => {
              const ts = new Date(row.created_at).getTime();
              const label = row.action_display || row.action || 'Activity';
              const detail = row.description || row.model_name || '';
              return (
                <div key={row.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {auditIcon(row.user_display, row.model_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {!Number.isNaN(ts) ? timeAgo(ts) : '—'}
                  </span>
                </div>
              );
            })}
          </>
        ) : showLocal ? (
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
            <p className="text-right text-xs text-muted-foreground pt-1">Local session only</p>
          </>
        ) : !serverLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity in the audit log. Local actions can still be logged from other
            secretary pages.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
