'use client';

import { useEffect, useRef } from 'react';
import {
  useEvents,
  type ChurchEvent,
  type EventReminder,
} from '@/components/secretary/contexts/EventsContext';
import { toast } from 'sonner';

const FIRED_KEY = 'secretary_reminders_fired_v1';

function getFired(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function markFired(key: string) {
  const fired = getFired();
  fired.add(key);
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify([...fired].slice(-500)));
  } catch {
    /* ignore */
  }
}

function buildEmailLink(contact: string, event: ChurchEvent): string {
  const subject = encodeURIComponent(`Reminder: ${event.name}`);
  const body = encodeURIComponent(
    `Hi,\n\nReminder for:\n\nEvent: ${event.name}\nDate: ${event.date}\nTime: ${event.time}\nType: ${event.type}\n\nPlease make the necessary arrangements.\n\nRegards`
  );
  return `mailto:${contact}?subject=${subject}&body=${body}`;
}

function buildWhatsAppLink(contact: string, event: ChurchEvent): string {
  const phone = contact.replace(/\D/g, '');
  const text = encodeURIComponent(
    `*Reminder: ${event.name}*\n📅 Date: ${event.date}\n⏰ Time: ${event.time}\n📌 Type: ${event.type}\n\nPlease make the necessary arrangements.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

function fireReminder(reminder: EventReminder, event: ChurchEvent, contactIdx: number) {
  const contact = reminder.contacts[contactIdx]?.trim();
  if (!contact) {
    return;
  }

  const link =
    reminder.method === 'email'
      ? buildEmailLink(contact, event)
      : buildWhatsAppLink(contact, event);
  const label = reminder.method === 'email' ? '📧 Email' : '💬 WhatsApp';
  const mins = reminder.minutesBefore;
  const when = mins >= 10080 ? '1 week' : mins >= 1440 ? '1 day' : `${mins} min`;

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(`Reminder: ${event.name}`, {
      body: `Starts in ${when}. Notify ${contact} via ${reminder.method}.`,
      icon: '/favicon.ico',
    });
  }

  toast.info(`Reminder: ${event.name} in ${when}`, {
    description: `Send ${label} to ${contact}`,
    duration: 10000,
    action: {
      label: `Open ${label}`,
      onClick: () => window.open(link, '_blank'),
    },
  });
}

export function ReminderEngine() {
  const { events, isReady } = useEvents();
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (!isReady || hasRequestedPermission.current) {
      return;
    }
    hasRequestedPermission.current = true;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const check = () => {
      const now = Date.now();
      events.forEach((event) => {
        if (event.status !== 'upcoming') {
          return;
        }
        if (!event.reminders?.length) {
          return;
        }

        const eventMs = new Date(`${event.date}T${event.time}`).getTime();
        if (isNaN(eventMs)) {
          return;
        }

        event.reminders.forEach((reminder, rIdx) => {
          const fireAt = eventMs - reminder.minutesBefore * 60_000;
          // Fire each contact separately
          reminder.contacts.forEach((contact, cIdx) => {
            if (!contact?.trim()) {
              return;
            }
            const firedKey = `${event.id}_r${rIdx}_c${cIdx}_${reminder.minutesBefore}`;
            const fired = getFired();
            if (!fired.has(firedKey) && now >= fireAt - 90_000 && now <= fireAt + 90_000) {
              markFired(firedKey);
              fireReminder(reminder, event, cIdx);
            }
          });
        });
      });
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [events, isReady]);

  return null;
}
