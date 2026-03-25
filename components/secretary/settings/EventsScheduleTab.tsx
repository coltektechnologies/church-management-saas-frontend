'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, CalendarDays, Pencil, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  useEvents,
  type ChurchEvent,
  type EventStatus,
  type EventType,
  type EventReminder,
} from '@/components/secretary/contexts/EventsContext';
import { useLogEvent } from '@/components/secretary/contexts/ActivityContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EVENT_COLORS = [
  { label: 'Primary', value: 'bg-primary' },
  { label: 'Red', value: 'bg-destructive' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Violet', value: 'bg-violet-500' },
  { label: 'Pink', value: 'bg-pink-500' },
  { label: 'Green', value: 'bg-emerald-500' },
  { label: 'Sky', value: 'bg-sky-500' },
];

interface EventForm {
  name: string;
  day: string;
  date: string;
  time: string;
  type: EventType;
  color: string;
  status: EventStatus;
  reminders: EventReminder[];
}

const EMPTY: EventForm = {
  name: '',
  day: 'Sunday',
  date: '',
  time: '09:00',
  type: 'service',
  color: 'bg-primary',
  status: 'upcoming',
  reminders: [],
};

export default function EventsScheduleTab() {
  const { events, addEvent, updateEvent, removeEvent } = useEvents();
  const log = useLogEvent();

  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<EventForm>(EMPTY);

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setShowAdd(true);
  };
  const openEdit = (e: ChurchEvent) => {
    setForm({
      name: e.name,
      day: e.day,
      date: e.date,
      time: e.time,
      type: e.type,
      color: e.color,
      status: e.status,
      reminders: e.reminders ?? [],
    });
    setEditId(e.id);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Please provide a name for the event');
      return;
    }
    if (!form.date) {
      toast.error('Please select a date');
      return;
    }

    if (editId) {
      updateEvent(editId, form);
      log.logUpdated(form.name);
      toast.success('Event updated', { description: `"${form.name}" has been updated.` });
    } else {
      addEvent(form);
      log.logAdded(form.name);
      toast.success('Event added', { description: `"${form.name}" will appear on the calendar.` });
    }
    setShowAdd(false);
  };

  const handleDelete = (id: string, name: string) => {
    removeEvent(id);
    log.logRemoved(name);
    toast.info('Event removed');
  };

  const handleStatus = (id: string, name: string, status: EventStatus) => {
    updateEvent(id, { status });
    log.logStatus(name, status);
    toast.info(`Event marked as ${status}`);
  };

  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const pastEvents = events.filter((e) => e.status !== 'upcoming');

  return (
    <div className="bg-card rounded-[24px] border border-border p-8 space-y-8 max-w-4xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight">
              Events &amp; Services Schedule
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Manage services and events. They&apos;ll show on your calendar and dashboard.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={openAdd}
          className="rounded-xl border-border font-bold gap-2 text-foreground hover:bg-muted/30"
        >
          <Plus size={16} /> Add Event
        </Button>
      </div>

      {/* Upcoming */}
      {upcomingEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-muted/10 rounded-[24px] border-2 border-dashed border-border">
          <CalendarDays className="text-muted-foreground/30 mb-4" size={48} />
          <p className="text-muted-foreground font-bold text-sm">
            No events or services configured yet.
          </p>
          <button
            onClick={openAdd}
            className="mt-2 text-primary font-black text-xs hover:underline"
          >
            Click here to add your first event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
            Upcoming
          </h4>
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="group flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card border border-border p-4 rounded-2xl hover:shadow-md transition-all"
            >
              <div
                className={`h-10 w-10 rounded-lg ${event.color} flex items-center justify-center shrink-0`}
              >
                <span className="text-white text-sm">📅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{event.name}</p>
                <p className="text-xs text-muted-foreground">
                  {event.day} · {event.date} · {event.time}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {event.type}
                </Badge>
                <Select
                  value={event.status}
                  onValueChange={(v) => handleStatus(event.id, event.name, v as EventStatus)}
                >
                  <SelectTrigger className="h-8 w-[120px] text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(event)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(event.id, event.name)}
                  className="h-8 w-8 text-destructive/50 hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past */}
      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
            Past / Other
          </h4>
          {pastEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-muted/10 border border-border p-4 rounded-2xl opacity-60"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Clock size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{event.name}</p>
                <p className="text-xs text-muted-foreground">
                  {event.day} · {event.date}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] capitalize">
                {event.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(event)}
                className="h-8 w-8"
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(event.id, event.name)}
                className="h-8 w-8 text-destructive/50 hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground">
              {editId ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Event Name
              </Label>
              <Input
                className="h-12 bg-muted/20 border-none font-bold rounded-xl"
                value={form.name}
                placeholder="e.g. Sunday Morning Worship"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Type
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as EventType })}
                >
                  <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Day
                </Label>
                <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                  <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  className="h-12 bg-muted/20 border-none font-bold rounded-xl"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Time
                </Label>
                <Input
                  type="time"
                  className="h-12 bg-muted/20 border-none font-bold rounded-xl"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Color Tag
              </Label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={`w-8 h-8 rounded-lg ${c.value} border-2 transition-all ${form.color === c.value ? 'border-foreground scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
            {editId && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as EventStatus })}
                >
                  <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
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
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-xl font-bold px-8 shadow-lg">
              {editId ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
