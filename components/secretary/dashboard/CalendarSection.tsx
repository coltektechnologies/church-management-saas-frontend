'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Edit2,
  Trash2,
  Bell,
  Mail,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  useEvents,
  type ChurchEvent,
  type EventType,
  type EventStatus,
  type EventReminder,
  type ReminderMethod,
} from '@/components/secretary/contexts/EventsContext';
import { useLogEvent } from '@/components/secretary/contexts/ActivityContext';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const EVENT_COLORS = [
  'bg-primary',
  'bg-destructive',
  'bg-amber-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-sky-500',
];

const REMINDER_TIMES = [
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
  { label: '1 week before', value: 10080 },
];

interface EventForm {
  name: string;
  date: string;
  time: string;
  type: EventType;
  status: EventStatus;
  color: string;
  reminders: EventReminder[];
}

const emptyForm = (date?: string): EventForm => ({
  name: '',
  date: date || new Date().toISOString().split('T')[0],
  time: '09:00',
  type: 'event',
  status: 'upcoming',
  color: 'bg-primary',
  reminders: [],
});

const fmt12 = (t: string) => {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

function ReminderRow({
  reminder,
  index,
  onChange,
  onRemove,
}: {
  reminder: EventReminder;
  index: number;
  onChange: (idx: number, patch: Partial<EventReminder>) => void;
  onRemove: (idx: number) => void;
}) {
  const placeholder = reminder.method === 'email' ? 'Email address' : 'Phone e.g. +233241234567';
  const addContact = () => onChange(index, { contacts: [...reminder.contacts, ''] });
  const updateContact = (ci: number, val: string) =>
    onChange(index, { contacts: reminder.contacts.map((c, i) => (i === ci ? val : c)) });
  const removeContact = (ci: number) =>
    onChange(index, { contacts: reminder.contacts.filter((_, i) => i !== ci) });

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/10 border border-border">
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg overflow-hidden border border-border flex-shrink-0">
          {(['email', 'whatsapp'] as ReminderMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(index, { method: m })}
              className={[
                'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold transition-colors',
                reminder.method === m
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/30',
              ].join(' ')}
            >
              {m === 'email' ? <Mail size={11} /> : <MessageCircle size={11} />}
              <span className="hidden sm:inline">{m === 'email' ? 'Email' : 'WhatsApp'}</span>
              <span className="sm:hidden">{m === 'email' ? 'Mail' : 'WA'}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ml-auto p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <Select
        value={String(reminder.minutesBefore)}
        onValueChange={(v) => onChange(index, { minutesBefore: parseInt(v) })}
      >
        <SelectTrigger className="h-9 bg-muted/20 border-none rounded-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-muted-foreground" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {REMINDER_TIMES.map((t) => (
            <SelectItem key={t.value} value={String(t.value)}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground">
            Recipients ({reminder.contacts.length})
          </p>
          <button
            type="button"
            onClick={addContact}
            className="flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline"
          >
            <UserPlus size={11} /> Add
          </button>
        </div>
        {reminder.contacts.length === 0 ? (
          <button
            type="button"
            onClick={addContact}
            className="w-full text-[11px] text-muted-foreground border border-dashed border-border rounded-lg py-1.5 hover:border-primary hover:text-primary transition-colors"
          >
            + Add recipient
          </button>
        ) : (
          reminder.contacts.map((contact, ci) => (
            <div key={ci} className="flex items-center gap-1.5">
              <Input
                placeholder={placeholder}
                value={contact}
                onChange={(e) => updateContact(ci, e.target.value)}
                className="h-8 bg-muted/20 border-none rounded-lg text-xs flex-1"
              />
              {reminder.contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(ci)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))
        )}
        {reminder.contacts.filter((c) => c.trim()).length > 0 && (
          <p className="text-[9px] text-muted-foreground pl-1">
            Sending to {reminder.contacts.filter((c) => c.trim()).length} recipient
            {reminder.contacts.filter((c) => c.trim()).length > 1 ? 's' : ''} via{' '}
            {reminder.method === 'email' ? 'email' : 'WhatsApp'}
          </p>
        )}
      </div>
    </div>
  );
}

export function CalendarSection() {
  const { events, isReady, addEvent, updateEvent, removeEvent } = useEvents();
  const log = useLogEvent();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getMonth() === month && now.getFullYear() === year ? now.getDate() : -1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const eventsByDay = useMemo(() => {
    if (!isReady) {
      return new Map<number, ChurchEvent[]>();
    }
    const map = new Map<number, ChurchEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map.has(day)) {
          map.set(day, []);
        }
        // Safe access — we just set it above if it wasn't present, so it always exists here
        const bucket = map.get(day);
        if (bucket) {
          bucket.push(e);
        }
      }
    });
    return map;
  }, [events, isReady, month, year]);

  const latestEvents = useMemo(() => {
    if (!isReady) {
      return [];
    }
    return events
      .filter((e) => e.status === 'completed' || (e.status === 'upcoming' && e.date < todayStr))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [events, isReady, todayStr]);

  const prevMonth = () => (month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1));
  const nextMonth = () => (month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1));
  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const openCreate = (day?: number) => {
    setForm(emptyForm(day ? toDateStr(day) : undefined));
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (ev: ChurchEvent) => {
    setForm({
      name: ev.name,
      date: ev.date,
      time: ev.time,
      type: ev.type,
      status: ev.status,
      color: ev.color,
      reminders: ev.reminders ?? [],
    });
    setEditingId(ev.id);
    setDialogOpen(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) {
      return;
    }
    const day = new Date(form.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (editingId) {
      updateEvent(editingId, { ...form, day });
      log.logUpdated(form.name);
    } else {
      addEvent({ ...form, day });
      log.logAdded(form.name);
    }
    setDialogOpen(false);
  };
  const handleDelete = (id: string, name: string) => {
    removeEvent(id);
    log.logRemoved(name);
    setDialogOpen(false);
  };

  const addReminder = () =>
    setForm((p) => ({
      ...p,
      reminders: [...p.reminders, { method: 'email', minutesBefore: 60, contacts: [''] }],
    }));
  const updateReminder = (idx: number, patch: Partial<EventReminder>) =>
    setForm((p) => ({
      ...p,
      reminders: p.reminders.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  const removeReminder = (idx: number) =>
    setForm((p) => ({ ...p, reminders: p.reminders.filter((_, i) => i !== idx) }));

  const selectedDayEvents =
    isReady && selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar */}
      <Card className="bg-card lg:col-span-2">
        <CardContent className="p-2 sm:p-4">
          {/* Nav */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <h3 className="text-xs sm:text-sm md:text-base font-semibold min-w-0 text-center truncate">
                {MONTHS[month]} {year}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                onClick={nextMonth}
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs ml-0.5 sm:ml-2 h-6 sm:h-7 px-2 sm:px-3 flex-shrink-0"
                onClick={() => {
                  setMonth(now.getMonth());
                  setYear(now.getFullYear());
                }}
              >
                Today
              </Button>
            </div>
            <Button
              size="sm"
              className="h-7 sm:h-8 gap-1 sm:gap-1.5 text-xs flex-shrink-0 px-2 sm:px-3"
              onClick={() => openCreate()}
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline sm:inline">Add Event</span>
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((d, i) => (
              <div
                key={i}
                className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground py-1.5 sm:py-2 text-center"
              >
                <span className="hidden sm:inline">{DAYS_FULL[i]}</span>
                <span className="sm:hidden">{d}</span>
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayEvents = day ? (eventsByDay.get(day) ?? []) : [];
              const isToday = day === todayDate;
              const dateStr = day ? toDateStr(day) : '';
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={i}
                  className={[
                    'min-h-[52px] sm:min-h-[72px] md:min-h-[80px] border-b border-r border-border p-0.5 sm:p-1 transition-colors',
                    i % 7 === 0 ? 'border-l' : '',
                    day ? 'cursor-pointer hover:bg-muted/30' : 'bg-muted/10',
                    isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : '',
                  ].join(' ')}
                  onClick={() => day && setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  onDoubleClick={() => day && openCreate(day)}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={[
                            'text-[10px] sm:text-xs font-medium inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full',
                            isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                          ].join(' ')}
                        >
                          {day}
                        </span>
                        {dayEvents.some((ev) => ev.reminders?.length > 0) && (
                          <Bell
                            size={7}
                            className="text-muted-foreground/60 sm:w-[9px] sm:h-[9px]"
                          />
                        )}
                      </div>
                      <div className="space-y-px sm:space-y-0.5">
                        {/* Mobile: dot indicators */}
                        <div className="flex flex-wrap gap-px sm:hidden">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <button
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(ev);
                              }}
                              className={`w-1.5 h-1.5 rounded-full ${ev.color}`}
                              title={ev.name}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-primary font-bold leading-none">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                        {/* sm+: chips */}
                        <div className="hidden sm:block space-y-0.5">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <button
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(ev);
                              }}
                              className={[
                                'w-full flex items-center gap-0.5 sm:gap-1 text-left text-[9px] sm:text-[10px] leading-tight px-0.5 sm:px-1 py-0.5 rounded font-medium text-white truncate',
                                ev.color,
                              ].join(' ')}
                              title={`${fmt12(ev.time)} — ${ev.name}`}
                            >
                              <span className="hidden md:inline flex-shrink-0 opacity-80 text-[9px]">
                                {fmt12(ev.time)}
                              </span>
                              <span className="truncate">{ev.name}</span>
                            </button>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] sm:text-[10px] text-primary font-medium pl-0.5 sm:pl-1 block">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date detail */}
          {isReady && selectedDate && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg bg-muted/20 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-semibold">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 sm:h-7 gap-1 text-xs px-2"
                    onClick={() => openCreate(parseInt(selectedDate.split('-')[2]))}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 sm:h-7 w-6 sm:w-7 p-0"
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                  </Button>
                </div>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No events. Double-click a day or press Add.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-2 sm:gap-3 group">
                      <div className={`w-1.5 sm:w-2 h-8 rounded-full flex-shrink-0 ${ev.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <p className="text-xs sm:text-sm font-medium truncate">{ev.name}</p>
                          {ev.reminders?.length > 0 && (
                            <Bell size={10} className="text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {fmt12(ev.time)}
                          {ev.status !== 'upcoming' && (
                            <span
                              className={[
                                'ml-1.5 sm:ml-2 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium',
                                ev.status === 'cancelled'
                                  ? 'bg-destructive/10 text-destructive'
                                  : '',
                                ev.status === 'postponed' ? 'bg-amber-500/10 text-amber-600' : '',
                                ev.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : '',
                              ].join(' ')}
                            >
                              {ev.status}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 sm:h-7 sm:w-7"
                          onClick={() => openEdit(ev)}
                        >
                          <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 sm:h-7 sm:w-7 text-destructive"
                          onClick={() => handleDelete(ev.id, ev.name)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Events */}
      <Card className="bg-card">
        <CardContent className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-3">Latest Events</h3>
          <div className="space-y-2 max-h-[320px] sm:max-h-[400px] overflow-y-auto">
            {!isReady || latestEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No past events yet</p>
            ) : (
              latestEvents.map((e) => {
                const d = new Date(e.date + 'T00:00:00');
                const totalRecipients = (e.reminders ?? []).reduce(
                  (sum, r) => sum + r.contacts.filter((c) => c.trim()).length,
                  0
                );
                return (
                  <div
                    key={e.id}
                    className="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/10 border border-border cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => openEdit(e)}
                  >
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-semibold flex-1 truncate">{e.name}</p>
                      {e.reminders?.length > 0 && (
                        <Bell size={10} className="text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {d.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      · {fmt12(e.time)}
                    </p>
                    {totalRecipients > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                        {totalRecipients} reminder recipient{totalRecipients > 1 ? 's' : ''}
                      </p>
                    )}
                    {e.status !== 'upcoming' && (
                      <span
                        className={[
                          'inline-block mt-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium',
                          e.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : '',
                          e.status === 'postponed' ? 'bg-amber-500/10 text-amber-600' : '',
                          e.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : '',
                        ].join(' ')}
                      >
                        {e.status}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[500px] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">
              {editingId ? 'Edit Event' : 'New Event'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 mt-2">
            <Input
              placeholder="Event name"
              value={form.name}
              autoFocus
              className="h-9 sm:h-10 text-sm"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as EventType })}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as EventStatus })}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Colour */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-2">Colour</p>
              <div className="flex gap-2 flex-wrap">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${c} transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Bell size={12} /> Reminders
                </Label>
                <button
                  type="button"
                  onClick={addReminder}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <Plus size={11} /> Add reminder
                </button>
              </div>
              {form.reminders.length === 0 ? (
                <p className="text-[11px] text-muted-foreground pl-1">
                  No reminders set. Add one to notify multiple people via email or WhatsApp.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.reminders.map((r, idx) => (
                    <ReminderRow
                      key={idx}
                      reminder={r}
                      index={idx}
                      onChange={updateReminder}
                      onRemove={removeReminder}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-1 sm:pt-2 gap-2">
              {editingId && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs h-8 sm:h-9"
                  onClick={() => handleDelete(editingId, form.name)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              )}
              <div className={`flex gap-2 ${editingId ? '' : 'ml-auto'}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 sm:h-9"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-8 sm:h-9"
                  onClick={handleSave}
                  disabled={!form.name.trim()}
                >
                  {editingId ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
