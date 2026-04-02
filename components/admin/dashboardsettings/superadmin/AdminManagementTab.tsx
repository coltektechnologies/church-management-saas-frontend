'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import AddAdminModal, { type AdminPayload } from './AddAdminModal';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Suspended';
}

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-primary/10 text-primary border-primary/20',
  Admin: 'bg-blue-50 text-blue-700 border-blue-200',
  Editor: 'bg-amber-50 text-amber-700 border-amber-200',
  Viewer: 'bg-slate-50 text-slate-600 border-slate-200',
};

const AdminManagementTab = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Super Admin',
      email: 'owner@church.com',
      role: 'Super Admin',
      status: 'Active',
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);

  // handleAdd receives an AdminPayload (whatever AddAdminModal provides).
  // We derive the display name from email if the payload has no name field,
  // so the component compiles regardless of whether AdminPayload includes name.
  const handleAdd = (payload: AdminPayload) => {
    const newAdmin: AdminUser = {
      id: crypto.randomUUID(),
      name:
        'name' in payload && typeof payload.name === 'string'
          ? payload.name
          : payload.email.split('@')[0],
      email: payload.email,
      role: payload.role as AdminUser['role'],
      status: 'Active',
    };
    setAdmins((prev) => [...prev, newAdmin]);
    toast.success(`${newAdmin.name} added successfully`);
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (admin?.role === 'Super Admin') {
      toast.error('Security: Super Admin cannot be removed');
      return;
    }
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    toast.success('Admin access revoked');
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A]">System Access</h3>
          <p className="text-xs text-slate-400">
            Manage administrative privileges for your church staff.
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-[#2FC4B2] hover:bg-[#28b0a0] rounded-xl font-bold gap-2"
        >
          <Plus size={16} /> Add Admin
        </Button>
      </div>

      {admins.length <= 1 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-[24px] border-2 border-dashed border-slate-100">
          <Users className="mx-auto text-slate-200 mb-4" size={40} />
          <p className="text-slate-400 font-bold">
            Only you have access. Add team members to help manage.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-50 rounded-2xl">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase">Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Role</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell>
                    <div className="font-bold text-sm text-[#0B2A4A]">{a.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{a.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${ROLE_COLORS[a.role]} font-black text-[9px] uppercase`}
                    >
                      {a.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={a.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {a.role !== 'Super Admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(a.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddAdminModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </div>
  );
};

export default AdminManagementTab;
