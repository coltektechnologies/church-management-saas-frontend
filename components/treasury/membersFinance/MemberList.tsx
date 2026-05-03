'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import MemberCard from './MemberCard';
import { MemberContribution } from '@/types/memberFinance';

interface Props {
  members: MemberContribution[];
  selectedId: string | null;
  onSelect: (member: MemberContribution) => void;
  pageSize?: number;
  isLoading?: boolean;
  loadError?: string | null;
}

export default function MemberList({
  members,
  selectedId,
  onSelect,
  pageSize = 7,
  isLoading = false,
  loadError = null}: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.memberId.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search)
      ),
    [members, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const currentCount = Math.min(page * pageSize, filtered.length);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users
          size={20}
          className="text-teal-600 dark:text-[var(--secretary-accent,#2FC4B2)] flex-shrink-0"
        />
        <h2
          className="text-base font-bold text-slate-900 dark:text-slate-100"
        >
          Member Contributions
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isLoading}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-[var(--secretary-accent,#2FC4B2)]/30 focus:border-teal-500 dark:focus:border-slate-500 outline-none bg-white dark:bg-slate-800/90 transition disabled:opacity-60"
        />
      </div>

      {loadError ? (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 rounded-xl px-3 py-2">
          {loadError}
        </p>
      ) : null}

      {/* List */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-0.5">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/80 dark:border-slate-600/80"
              />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={32} className="text-slate-200 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {members.length === 0 ? 'No members loaded.' : 'No matches — try another search.'}
            </p>
          </div>
        ) : (
          paginated.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isSelected={selectedId === member.id}
              onClick={() => onSelect(member)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="flex items-center justify-center gap-3 pt-1 flex-shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium tabular-nums">
            {currentCount} / {filtered.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
