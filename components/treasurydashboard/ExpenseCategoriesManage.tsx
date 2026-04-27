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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tags className="text-teal-600 dark:text-[var(--secretary-accent,#2FC4B2)]" size={26} />
            Expense categories
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Categories listed here appear in expense requests from departments (e.g. Utilities,
            Ministry programs). Codes are stored uppercase.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-600 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Plus size={16} className="text-teal-600 dark:text-[var(--secretary-accent,#2FC4B2)]" />
            New category
          </h2>
          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ministry programs"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/80 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MINISTRY"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/80 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short note for reports"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm resize-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/80 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
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

        <div className="bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Existing categories
            </h2>
          </div>
          {listError && (
            <p className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900/50">
              {listError}
            </p>
          )}
          {loading ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              No categories yet. Add one on the left.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
              {rows.map((c) => (
                <li key={c.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="text-xs font-mono text-teal-700 dark:text-teal-400 mt-0.5">
                      {c.code}
                    </p>
                    {c.description ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {String(c.description)}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      c.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
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
