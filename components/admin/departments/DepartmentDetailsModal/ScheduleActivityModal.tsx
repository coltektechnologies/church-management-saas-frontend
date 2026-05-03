'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (activity: Activity) => void;
}

const inputCls =
  'w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/70 dark:[color-scheme:dark]';

export default function ScheduleActivityModal({ isOpen, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!title || !date) {
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      title,
      description,
      scheduledAt: new Date(date).toISOString(),
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
    setDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[var(--admin-surface)] text-foreground border border-[var(--admin-border)] p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
        <h3 className="text-lg font-semibold">Schedule Activity</h3>

        <input
          placeholder="Activity Title"
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className={`${inputCls} min-h-[80px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="datetime-local"
          className={inputCls}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
