'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Megaphone, Eye, Loader2, Pin, Sparkles, Search, RefreshCw, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MembershipTopbar from '@/components/membership/MembershipTopbar';
import { AnnouncementDetailModal } from '@/components/announcements/AnnouncementDetailModal';
import { QuickCreateModal } from '@/components/announcements/QuickCreateModal';
import { getAccessToken } from '@/lib/api';
import {
  fetchAnnouncementsListAllPages,
  type AnnouncementListItemApi,
} from '@/lib/announcementsApi';
import { mapListItemToAnnouncement } from '@/lib/announcementMappers';
import { announcementService } from '@/services/announcementService';
import type { Announcement } from '@/services/announcementService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

function excerptText(raw: string | undefined, max = 220): string {
  const t = (raw || '').replace(/\s+/g, ' ').trim();
  if (!t) {
    return '';
  }
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function sortFeedRows(rows: AnnouncementListItemApi[]): AnnouncementListItemApi[] {
  return [...rows].sort((a, b) => {
    if (Boolean(a.is_pinned) !== Boolean(b.is_pinned)) {
      return a.is_pinned ? -1 : 1;
    }
    if (Boolean(a.is_featured) !== Boolean(b.is_featured)) {
      return a.is_featured ? -1 : 1;
    }
    const ta = new Date(a.publish_at || a.created_at).getTime();
    const tb = new Date(b.publish_at || b.created_at).getTime();
    return tb - ta;
  });
}

export default function MembershipAnnouncementsPage() {
  const [rows, setRows] = useState<AnnouncementListItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [publishedOnly, setPublishedOnly] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getAccessToken()) {
        setRows([]);
        setError('Sign in to view church announcements.');
        return;
      }
      const data = await fetchAnnouncementsListAllPages({
        page_size: 50,
        maxPages: 80,
      });
      setRows(sortFeedRows(data));
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'Could not load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = rows;
    if (publishedOnly) {
      list = list.filter((r) => (r.status || '').toUpperCase() === 'PUBLISHED');
    }
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((r) => {
      const title = (r.title || '').toLowerCase();
      const body = (r.content || '').toLowerCase();
      const cat =
        typeof r.category === 'string'
          ? r.category.toLowerCase()
          : ((r.category as { name?: string })?.name || '').toLowerCase();
      return title.includes(q) || body.includes(q) || cat.includes(q);
    });
  }, [rows, query, publishedOnly]);

  const signedIn = Boolean(getAccessToken());

  const onCreateModalOpenChange = useCallback(
    (open: boolean) => {
      setCreateOpen(open);
      if (!open) {
        void load();
      }
    },
    [load]
  );

  const openDetail = useCallback(async (row: AnnouncementListItemApi) => {
    try {
      const full = await announcementService.getAnnouncementById(row.id);
      setSelected(full);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
      setSelected(mapListItemToAnnouncement(row, row.content || ''));
    }
    setDetailOpen(true);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      <MembershipTopbar
        title="Announcements"
        subtitle="Published updates and notices from your church"
        icon={<Megaphone className="text-[#2FC4B2]" size={24} />}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or content…"
            className="pl-9 h-10"
            aria-label="Search announcements"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5 bg-[#2FC4B2] hover:bg-[#28b0a0] text-white"
            disabled={!signedIn}
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create announcement
          </Button>
          <Button
            type="button"
            variant={publishedOnly ? 'secondary' : 'outline'}
            size="sm"
            className="h-9"
            onClick={() => setPublishedOnly((v) => !v)}
          >
            {publishedOnly ? 'Showing: Published only' : 'Filter: Published only'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading announcements…</span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card className="p-10 text-center text-[14px] text-slate-600 border border-slate-200/90 rounded-xl space-y-4">
          <p>
            {rows.length === 0
              ? 'No announcements are available yet.'
              : 'No announcements match your search or filter.'}
          </p>
          {rows.length === 0 && (
            <Button
              type="button"
              size="sm"
              className="bg-[#2FC4B2] hover:bg-[#28b0a0] text-white gap-1.5"
              disabled={!signedIn}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create announcement
            </Button>
          )}
        </Card>
      )}

      {!loading && (
        <div className="flex flex-col gap-3 pb-10">
          {filtered.map((row) => {
            const statusLabel = row.status_display || row.status;
            const isPublished = (row.status || '').toUpperCase() === 'PUBLISHED';
            return (
              <Card
                key={row.id}
                className="p-4 sm:p-5 flex flex-col gap-4 bg-white border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] transition-all rounded-xl"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.is_pinned && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] gap-1 bg-sky-100 text-sky-900 border-sky-200"
                      >
                        <Pin className="h-3 w-3" /> Pinned
                      </Badge>
                    )}
                    {row.is_featured && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] gap-1 bg-amber-100 text-amber-950 border-amber-200"
                      >
                        <Sparkles className="h-3 w-3" /> Featured
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[11px] font-medium border-none',
                        isPublished
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {statusLabel}
                    </Badge>
                    {typeof row.priority_display === 'string' && (
                      <span className="text-[12px] text-slate-500">{row.priority_display}</span>
                    )}
                  </div>
                  <h2 className="text-[17px] sm:text-[18px] font-bold text-[#0A2E46] leading-snug">
                    {row.title}
                  </h2>
                  <p className="text-[13px] text-slate-600 line-clamp-3">
                    {excerptText(row.content) || 'Open to read the full message.'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
                    <span>
                      <span className="font-medium text-slate-600">Published: </span>
                      {formatPublishedAt(row.publish_at || row.created_at)}
                    </span>
                    <span>
                      <span className="font-medium text-slate-600">Category: </span>
                      {typeof row.category === 'string'
                        ? row.category
                        : (row.category as { name?: string })?.name || '—'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-[#0A2E46] border-[#2FC4B2]/40 hover:bg-[#2FC4B2]/10"
                    onClick={() => void openDetail(row)}
                  >
                    <Eye className="h-4 w-4" />
                    Read full announcement
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <QuickCreateModal open={createOpen} onOpenChange={onCreateModalOpenChange} />

      <AnnouncementDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcement={selected}
      />
    </div>
  );
}
