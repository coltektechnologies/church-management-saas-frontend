'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { AdminUser } from './AdminManagementTab';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (admin: Omit<AdminUser, 'id' | 'status'>) => void;
}

const AddAdminModal = ({ open, onClose, onAdd }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('Admin');

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      return;
    }
    onAdd({ name: name.trim(), email: email.trim(), role });
    setName('');
    setEmail('');
    setRole('Admin');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0B2A4A]">Add System Admin</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Full Name
            </Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Mensah"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Email Address
            </Label>
            <Input
              type="email"
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@church.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Permission Level
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminUser['role'])}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                <SelectItem value="Editor">Editor (Content only)</SelectItem>
                <SelectItem value="Viewer">Viewer (Read-only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-white rounded-xl font-bold px-8 shadow-lg shadow-primary/20"
          >
            Grant Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminModal;
