'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

export default function MemberFilters() {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{
        height: 80,
        border: '1px solid #D9DADC',
        background: '#FFFFFF',
        gap: 40,
      }}
    >
      <div
        className="flex items-center justify-between rounded-none px-3 flex-1 min-w-0"
        style={{
          height: 42,
          background: '#FFFFFF',
          color: '#2B2B2C',
        }}
      >
        <div className="relative w-full max-w-[200px] min-w-[120px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search member..."
            className="pl-9 h-9 rounded-none border-[#D9DADC] bg-white text-[#2B2B2C] placeholder:text-gray-400 text-sm"
          />
        </div>
        <select className="h-9 px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none">
          <option>All Status</option>
        </select>
        <select className="h-9 px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none">
          <option>All Roles</option>
        </select>
        <select className="h-9 px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none">
          <option>All Departments</option>
        </select>
        <select className="h-9 px-3 rounded-none text-sm font-medium text-[#2B2B2C] bg-white border border-[#D9DADC] focus:ring-2 focus:ring-blue-500 outline-none">
          <option>All Dates</option>
        </select>
      </div>
      <Link href="/admin/members/add">
        <Button
          className="flex items-center justify-center shrink-0 hover:opacity-90"
          style={{
            width: 156,
            height: 42,
            borderRadius: 8,
            padding: '9px 17px',
            gap: 13,
            background: '#0B2A4A',
            color: '#FFFFFF',
            fontFamily: 'OV Soge, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '100%',
            letterSpacing: 0,
          }}
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </Link>
    </div>
  );
}
