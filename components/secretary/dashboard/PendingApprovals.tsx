'use client';

/**
 * Preview of items in the secretary approval queue (same sources as ApprovalCenter variant=secretary).
 * Full workflow remains on `/secretary/record-approvals`.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  buildPendingPreviewItems,
  useSecretaryDashboardApi,
} from '@/components/secretary/contexts/SecretaryDashboardApiContext';

function initials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function PendingApprovals() {
  const { status, pendingAnnouncements, pendingPrograms, refetch } = useSecretaryDashboardApi();
  const loading = status === 'loading' || status === 'idle';
  const items = buildPendingPreviewItems(pendingAnnouncements, pendingPrograms, 8);

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-7" asChild>
            <Link href="/secretary/record-approvals">Open queue</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            disabled={loading}
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-24 rounded-lg border border-border bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No items waiting — you are caught up.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 border border-border rounded-lg p-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(a.title)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-600 border-amber-300 bg-amber-50"
                    >
                      Pending
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {a.kind === 'announcement' ? 'Announcement' : 'Program'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                </div>
                <Button size="sm" className="text-[10px] h-7 shrink-0" asChild>
                  <Link href="/secretary/record-approvals">Review</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
