'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (activity: Activity) => void;
}

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
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Schedule Activity</h3>

        <input
          placeholder="Activity Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">
            Cancel
          </button>

          <button onClick={handleSubmit} className="px-3 py-2 bg-blue-600 text-white rounded">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
