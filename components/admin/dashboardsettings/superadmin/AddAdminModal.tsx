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

// Define a concrete interface for the admin data payload
interface AdminPayload {
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
  // Explicitly typing this helps prevent the 'never' type error in parent components
  onAdd: (admin: AdminPayload) => void;
}

const AddAdminModal = ({ open, onClose, onAdd }: Props) => {
  // Existing state with default values
  const [firstName, setFirstName] = useState('Collins');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('kyerematengcollins93@gmail.com');
  const [role, setRole] = useState<AdminUser['role']>('Admin');

  // New state from your data merge
  const [phone, setPhone] = useState('+233549361771');
  const [username, setUsername] = useState('Taken');
  const [notifPref, setNotifPref] = useState('both');
  const [sendCredentials, setSendCredentials] = useState(true);
  const [churchGroups] = useState(['b10d4fc2-6666-405a-8d7b-41d1ab5ac396']);

  const handleSubmit = () => {
    // Validation check
    if (!firstName.trim() || !email.trim() || !lastName.trim()) {
      return;
    }

    // Constructing the payload exactly as the backend expects
    onAdd({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      role: role,
      notification_preference: notifPref,
      send_credentials: sendCredentials,
      church_groups: churchGroups,
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
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
              First Name
            </Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Collins"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Last Name
            </Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Email Address
            </Label>
            <Input
              type="email"
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kyerematengcollins93@gmail.com"
            />
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
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</Label>
            <Input
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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

          {/* Credentials Checkbox */}
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
