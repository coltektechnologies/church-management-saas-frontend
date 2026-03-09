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

export function MemberContributions({ data, isLoading }: MemberContributionsProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = (data ?? []).filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const selected = data?.find((m) => m.id === selectedId);

  if (isLoading) {
    return <div className="h-80 rounded-xl bg-muted animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left – Member List */}
      <div className="bg-card border rounded-xl p-5 flex flex-col">
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
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">ID: {member.id}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(member.totalAmount)}
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No members found</p>
          )}
        </div>
      </div>

      {/* Right – Contribution Overview */}
      <div className="bg-card border rounded-xl p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          📋 Member Contributions Overview
        </h3>

        {selected ? (
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
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
                  className="flex items-center justify-between text-sm p-2 rounded border border-border/50"
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
                  <span className="font-semibold text-emerald-600">{formatCurrency(c.amount)}</span>
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
