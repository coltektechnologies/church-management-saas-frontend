'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Heart } from 'lucide-react';
import type { MemberContribution } from '@/services/treasuryService';
import { formatCurrency } from '@/services/treasuryService';

interface MemberContributionsProps {
  data?: MemberContribution[];
  isLoading: boolean;
}

const panel =
  'bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10';

export function MemberContributions({ data, isLoading }: MemberContributionsProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = (data ?? []).filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const selected = data?.find((m) => m.id === selectedId);

  if (isLoading) {
    return <div className={`h-80 rounded-xl ${panel} animate-pulse opacity-80`} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left – Member List */}
      <div className={`${panel} p-5 flex flex-col`}>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            👥 Member Contributions
          </h3>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[360px] pr-1 flex-1">
          {filtered.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedId(member.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                selectedId === member.id
                  ? 'bg-primary/10 dark:bg-white/10 border border-primary/20 dark:border-white/15'
                  : 'hover:bg-muted/50 dark:hover:bg-white/5'
              }`}
            >
              <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{member.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {member.id}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {member.phone}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <p className="text-[13px] font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(member.totalAmount)}
                </p>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400">
                  ACTIVE
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No members found</p>
          )}
        </div>
      </div>

      {/* Right – Contribution Overview */}
      <div className={`${panel} p-5 flex flex-col`}>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          📋 Member Contributions Overview
        </h3>

        {selected ? (
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-white/5 rounded-lg border border-[var(--admin-border)]/60">
              <div className="size-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground">
                  Total: {formatCurrency(selected.totalAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                History
              </p>
              {selected.contributions.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm p-2 rounded border border-[var(--admin-border)] dark:bg-white/[0.03]"
                >
                  <div>
                    <p className="font-medium">{c.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
            <Heart className="size-16 text-primary/20 mb-4" />
            <p className="font-medium text-foreground/70">Select a member to view</p>
            <p className="text-sm">contribution details</p>
          </div>
        )}
      </div>
    </div>
  );
}
