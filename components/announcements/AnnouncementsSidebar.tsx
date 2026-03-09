import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePathname } from 'next/navigation';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { AnnouncementCategory } from '@/services/announcementService';
import { Star, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Used standard hex colors since Tailwind arbitrary values are less dynamic when passed as data
const categoriesWithColors: { name: AnnouncementCategory | 'All'; color: string }[] = [
  { name: 'All', color: 'var(--color-primary)' },
  { name: 'Thanksgiving', color: '#22c55e' },
  { name: 'Prayer Request', color: '#3b82f6' },
  { name: 'Birthday Wishes', color: '#eab308' },
  { name: 'Funeral/Bereavements', color: '#71717a' },
  { name: 'General Church', color: '#a855f7' },
  { name: 'Events & Programs', color: '#ef4444' },
  { name: 'Baptism Celebration', color: '#06b6d4' },
  { name: 'Weddings', color: '#ec4899' },
  { name: 'Departmental Updates', color: '#14b8a6' },
  { name: 'Community Outreach', color: '#84cc16' },
  { name: 'Health and Wellness', color: '#10b981' },
  { name: 'Youth Activities', color: '#f97316' },
];

export function AnnouncementsSidebar({ className }: { className?: string }) {
  const { filters, setFilters, resetFilters } = useAnnouncementStore();
  const selectedCategory = filters.category || 'All';

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const current = filters.dateRange || { from: '', to: '' };
    setFilters({
      dateRange: { ...current, [type]: value },
    });
  };

  return (
    <aside className={cn('w-64 bg-white border-r border-gray-200 flex flex-col', className)}>
      {/* Header Match Admin Sidebar */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Star className="size-4" /> Categories
            </h3>
            {(selectedCategory !== 'All' || filters.dateRange) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-auto py-1 px-2 text-xs text-muted-foreground hover:bg-gray-100"
              >
                Clear
              </Button>
            )}
          </div>

          <ul className="space-y-1">
            {categoriesWithColors.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <li key={cat.name}>
                  <button
                    onClick={() => setFilters({ category: cat.name })}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left hover:bg-gray-100',
                      isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    )}
                  >
                    <Star
                      className="size-4 shrink-0"
                      style={{
                        color: isSelected ? 'currentColor' : cat.color,
                        fill: isSelected ? 'currentColor' : 'transparent',
                      }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-4">
            <Filter className="size-4" /> Filters
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date Range</Label>
              <div className="flex flex-col gap-2">
                <Input
                  type="date"
                  className="h-9 text-sm px-3 bg-gray-50 border-gray-200"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <span className="text-xs text-center text-muted-foreground ">to</span>
                <Input
                  type="date"
                  className="h-9 text-sm px-3 bg-gray-50 border-gray-200"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Match Admin Sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Ps William</p>
          <p className="text-xs">Admin</p>
        </div>
      </div>
    </aside>
  );
}
