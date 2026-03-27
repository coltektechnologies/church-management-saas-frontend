'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type EventStatus = 'upcoming' | 'completed' | 'cancelled' | 'postponed';
export type EventType = 'service' | 'event';
export type ReminderMethod = 'email' | 'whatsapp';

export interface EventReminder {
  method: ReminderMethod;
  minutesBefore: number;
  contacts: string[];
}

export interface ChurchEvent {
  id: string;
  name: string;
  day: string;
  date: string;
  time: string;
  type: EventType;
  color: string;
  status: EventStatus;
  reminders: EventReminder[];
}

interface EventsContextValue {
  events: ChurchEvent[];
  isReady: boolean;
  addEvent: (e: Omit<ChurchEvent, 'id'>) => void;
  updateEvent: (id: string, patch: Partial<Omit<ChurchEvent, 'id'>>) => void;
  removeEvent: (id: string) => void;
}

const STORAGE_KEY = 'secretary_events_v1';

function load(): ChurchEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ChurchEvent[];
    return parsed.map((e) => ({
      ...e,
      reminders: (e.reminders ?? []).map((r: EventReminder & { contact?: string }) => ({
        method: r.method ?? 'email',
        minutesBefore: r.minutesBefore ?? 60,
        contacts: r.contacts ?? (r.contact ? [r.contact] : []),
      })),
    }));
  } catch {
    return [];
  }
}

function save(list: ChurchEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ChurchEvent[]>(load);

  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const mutate = useCallback((next: ChurchEvent[]) => {
    setEvents(next);
    save(next);
  }, []);

  const addEvent = useCallback(
    (e: Omit<ChurchEvent, 'id'>) => {
      mutate([...events, { id: crypto.randomUUID(), ...e }]);
    },
    [events, mutate]
  );

  const updateEvent = useCallback(
    (id: string, patch: Partial<Omit<ChurchEvent, 'id'>>) => {
      mutate(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [events, mutate]
  );

  const removeEvent = useCallback(
    (id: string) => {
      mutate(events.filter((e) => e.id !== id));
    },
    [events, mutate]
  );

  return (
    <EventsContext.Provider value={{ events, isReady, addEvent, updateEvent, removeEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error('useEvents must be used within <EventsProvider>');
  }
  return ctx;
}
