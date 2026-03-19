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
import { Checkbox } from '@/components/ui/checkbox';
import type { AdminUser } from './AdminManagementTab';

export interface AdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  role: AdminUser['role'];
  notification_preference: string;
  send_credentials: boolean;
  church_groups: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (admin: AdminPayload) => void;
}

const AddAdminModal = ({ open, onClose, onAdd }: Props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('Admin');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [notifPref, setNotifPref] = useState('both');
  const [sendCredentials, setSendCredentials] = useState(true);
  const [churchGroups] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) {
      e.firstName = 'Required';
    }
    if (!lastName.trim()) {
      e.lastName = 'Required';
    }
    if (!email.trim()) {
      e.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Invalid email';
    }
    if (!username.trim()) {
      e.username = 'Required';
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    onAdd({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      role,
      notification_preference: notifPref,
      send_credentials: sendCredentials,
      church_groups: churchGroups,
    });

    // Reset form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setRole('Admin');
    setNotifPref('both');
    setSendCredentials(true);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0B2A4A]">Add System Admin</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5 py-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              First Name <span className="text-red-400">*</span>
            </Label>
            <Input
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.firstName ? 'ring-1 ring-red-400' : ''}`}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors((p) => ({ ...p, firstName: '' }));
              }}
              placeholder="e.g. Collins"
            />
            {errors.firstName && (
              <p className="text-[10px] text-red-400 ml-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Last Name <span className="text-red-400">*</span>
            </Label>
            <Input
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.lastName ? 'ring-1 ring-red-400' : ''}`}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrors((p) => ({ ...p, lastName: '' }));
              }}
              placeholder="e.g. Doe"
            />
            {errors.lastName && <p className="text-[10px] text-red-400 ml-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Email Address <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.email ? 'ring-1 ring-red-400' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: '' }));
              }}
              placeholder="e.g. admin@church.com"
            />
            {errors.email && <p className="text-[10px] text-red-400 ml-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Phone Number
            </Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +233xxxxxxxxx "
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Username <span className="text-red-400">*</span>
            </Label>
            <Input
              className={`h-12 rounded-xl bg-slate-50 border-none font-bold ${errors.username ? 'ring-1 ring-red-400' : ''}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((p) => ({ ...p, username: '' }));
              }}
              placeholder="e.g. collins_admin"
            />
            {errors.username && <p className="text-[10px] text-red-400 ml-1">{errors.username}</p>}
          </div>

          {/* Permission Level */}
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

          {/* Notification Preference */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Notifications
            </Label>
            <Select value={notifPref} onValueChange={setNotifPref}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Send credentials */}
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="credentials"
              checked={sendCredentials}
              onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
            />
            <Label
              htmlFor="credentials"
              className="text-sm font-bold text-[#0B2A4A] cursor-pointer"
            >
              Send login credentials via email
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="ghost" onClick={handleClose} className="rounded-xl font-bold">
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
