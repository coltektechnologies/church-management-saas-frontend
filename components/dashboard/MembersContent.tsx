'use client';

import { useState } from 'react';
import { Search, Edit2, Trash2, UserPlus, Phone, Mail, BadgeCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppData } from '@/components/dashboard/contexts/AppDataContext';

const MembersContent = () => {
  const { members, setMembers } = useAppData();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'Active' as 'Active' | 'Inactive',
    attendance: 80,
  };

  const [form, setForm] = useState(initialFormState);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.email) {
      return;
    } // Basic validation

    if (editingId) {
      setMembers((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...form } : m)));
    } else {
      setMembers((prev) => [
        ...prev,
        {
          ...form,
          id: crypto.randomUUID(),
          joinedDate: new Date().toISOString(),
        },
      ]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B2A4A] tracking-tight">
            Congregation ({members.length})
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Directory of church members.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search souls..."
              className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs w-[220px] focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground flex items-center gap-2 text-xs font-black py-2.5 px-5 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-primary/20 p-6 space-y-5 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="text-sm font-black text-[#0B2A4A] flex items-center gap-2">
            <BadgeCheck size={18} className="text-primary" />
            {editingId ? 'Modify Member Profile' : 'Register New Soul'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-xs w-full outline-none focus:bg-card focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Email Address
              </label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-xs w-full outline-none focus:bg-card focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-xs w-full outline-none focus:bg-card focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              onClick={resetForm}
              className="text-xs font-black px-5 py-2.5 text-muted-foreground hover:text-foreground"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="bg-primary text-primary-foreground text-xs font-black py-2.5 px-8 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40 h-12">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">
                Profile
              </TableHead>
              <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest">
                Contacts
              </TableHead>
              <TableHead className="hidden sm:table-cell text-[10px] font-black uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id} className="group hover:bg-muted/20 transition-colors h-16">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0B2A4A] leading-none mb-1">
                        {m.name}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground">
                        {m.role || 'Member'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Mail size={12} /> {m.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Phone size={12} /> {m.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}
                  >
                    {m.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setForm({
                          ...m,
                          department: m.department || '',
                          attendance: m.attendance || 80,
                        });
                        setEditingId(m.id);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border text-muted-foreground hover:text-primary transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                      className="p-2 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MembersContent;
