'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (expense: Expense) => void;
}

export default function SubmitExpenseModal({ isOpen, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!title || !amount) {
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      title,
      description,
      amount: Number(amount),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Submit Expense Request</h3>

        <input
          placeholder="Expense Title"
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
          type="number"
          placeholder="Amount"
          className="w-full border p-2 rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">
            Cancel
          </button>

          <button onClick={handleSubmit} className="px-3 py-2 bg-blue-600 text-white rounded">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
