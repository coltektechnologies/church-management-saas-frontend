import { create } from 'zustand';
import { AnnouncementListFilters, AnnouncementStatus } from '@/services/announcementService';

interface AnnouncementStore {
  filters: AnnouncementListFilters;
  setFilters: (filters: Partial<AnnouncementListFilters>) => void;
  toggleStatus: (status: AnnouncementStatus) => void;
  resetFilters: () => void;
}

const defaultFilters: AnnouncementListFilters = {
  category: 'All',
  status: [],
};

export const useAnnouncementStore = create<AnnouncementStore>((set) => ({
  filters: defaultFilters,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  toggleStatus: (status) =>
    set((state) => {
      const currentStatus = state.filters.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status];
      return { filters: { ...state.filters, status: newStatus } };
    }),

  resetFilters: () => set({ filters: defaultFilters }),
}));
