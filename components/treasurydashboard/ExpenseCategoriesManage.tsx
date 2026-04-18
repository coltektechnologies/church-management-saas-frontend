'use client';

import { useEffect, useState } from 'react';
import { Tags, Plus, RefreshCw } from 'lucide-react';
import {
  createExpenseCategory,
  fetchExpenseCategoriesAll,
  type ExpenseCategoryItem,
} from '@/lib/treasuryApi';

export default function ExpenseCategoriesManage() {
  const [rows, setRows] = useState<ExpenseCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    setListError('');
    setLoading(true);
    try {
      const list = await fetchExpenseCategoriesAll();
      setRows(list.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      setRows([]);
      setListError(e instanceof Error ? e.message : 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !code.trim()) {
      setFormError('Name and code are required.');
      return;
    }
    setSaving(true);
    try {
      await createExpenseCategory({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        is_active: true,
      });
      setName('');
      setCode('');
      setDescription('');
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="text-teal-600" size={26} />
            Expense categories
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Categories listed here appear in expense requests from departments (e.g. Utilities,
            Ministry programs). Codes are stored uppercase.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Plus size={16} className="text-teal-600" />
            New category
          </h2>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ministry programs"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MINISTRY"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short note for reports"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create category'}
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Existing categories</h2>
          </div>
          {listError && (
            <p className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
              {listError}
            </p>
          )}
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No categories yet. Add one on the left.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
              {rows.map((c) => (
                <li key={c.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs font-mono text-teal-700 mt-0.5">{c.code}</p>
                    {c.description ? (
                      <p className="text-xs text-gray-500 mt-1">{String(c.description)}</p>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
