'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Pencil,
  MessageCircle,
  UserMinus,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface Member {
  id: string;
  name: string;
  memberId: string;
  phone: string;
  email: string;
  department: string;
  role: string;
  status: string;
  memberSince: Date;
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Pastor Owusu William',
    memberId: 'SDA2026-014',
    phone: '+233 596 038 258',
    email: 'owusuwilliam2344@gmail.com',
    department: 'Treasury, Adventist Youth Sabbath School',
    role: 'Admin',
    status: 'Active',
    memberSince: new Date(2026, 0, 9),
  },
  {
    id: '2',
    name: 'Elder Kofi Mensah',
    memberId: 'SDA2026-015',
    phone: '+233 550 123 456',
    email: 'kofimensah@gmail.com',
    department: 'Treasury, Adventist Youth Sabbath School',
    role: 'Core Admin',
    status: 'Pending',
    memberSince: new Date(2026, 0, 10),
  },
  {
    id: '3',
    name: 'Sis Abena Osei',
    memberId: 'SDA2026-016',
    phone: '+233 244 789 012',
    email: 'abenaosei@gmail.com',
    department: 'Treasury, Adventist Youth Sabbath School',
    role: 'Member',
    status: 'Active',
    memberSince: new Date(2026, 0, 8),
  },
  {
    id: '4',
    name: 'Bro Kwame Asante',
    memberId: 'SDA2026-017',
    phone: '+233 554 321 098',
    email: 'kwameasante@gmail.com',
    department: 'Treasury, Adventist Youth Sabbath School',
    role: 'Department Head',
    status: 'Active',
    memberSince: new Date(2025, 11, 15),
  },
  {
    id: '5',
    name: 'Sis Grace Addo',
    memberId: 'SDA2026-018',
    phone: '+233 201 456 789',
    email: 'graceaddo@gmail.com',
    department: 'Treasury, Adventist Youth Sabbath School',
    role: 'Core Admin',
    status: 'Pending',
    memberSince: new Date(2026, 0, 11),
  },
  {
    id: '6',
    name: 'Elder Daniel Tetteh',
    memberId: 'SDA2026-019',
    phone: '+233 577 654 321',
    email: 'danieltetteh@gmail.com',
    department: 'Treasury, Adventist Youth Sabbath School',
    role: 'Core Admin',
    status: 'Active',
    memberSince: new Date(2025, 10, 20),
  },
];

const roleStyles: Record<string, string> = {
  Admin: 'bg-red-100 text-red-800',
  'Core Admin': 'bg-gray-100 text-gray-800',
  Member: 'bg-blue-100 text-blue-800',
  'Department Head': 'bg-amber-100 text-amber-800',
};

const statusStyles: Record<string, string> = {
  Active: 'border-green-500 text-green-600 bg-white',
  Pending: 'border-amber-500 text-amber-600 bg-white',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
}

export default function MembersTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const totalPages = 3;

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-between px-4"
        style={{
          width: 1090,
          height: 67,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottom: '2px solid #F6F8FA',
          background: '#FFFFFF',
        }}
      >
        <h3 className="text-lg font-bold text-gray-900">All Members</h3>
        <div
          className="flex items-center justify-end gap-2 ml-auto rounded-[5px]"
          style={{ width: 357, height: 32 }}
        >
          <Button variant="outline" size="sm" className="rounded-[5px] h-8">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 bg-gray-50">
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 gap-1.5">
            CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 gap-1.5">
            PDF
          </Button>
          <Button variant="outline" size="sm" className="rounded-[5px] h-8 gap-1.5">
            Excel
          </Button>
        </div>
      </div>

      <div
        className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
        style={{ width: 1112 }}
      >
        <Table>
          <TableHeader>
            <TableRow
              className="border-gray-200 hover:bg-transparent"
              style={{ height: 56, background: '#F6F8FA' }}
            >
              <TableHead className="w-12">
                <input type="checkbox" className="rounded-none border-gray-300" />
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Member</TableHead>
              <TableHead className="font-semibold text-gray-900">Contact</TableHead>
              <TableHead className="font-semibold text-gray-900 min-w-[180px]">
                Department
              </TableHead>
              <TableHead className="font-semibold text-gray-900 min-w-[120px]">Role</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Member Since</TableHead>
              <TableHead className="font-semibold text-gray-900">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMembers.map((member) => (
              <TableRow
                key={member.id}
                className="border-gray-200"
                style={{ height: 70, borderBottom: '1px solid #e5e7eb' }}
              >
                <TableCell>
                  <input type="checkbox" className="rounded-none border-gray-300" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-green-100">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.memberId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[140px] max-w-[180px] break-words whitespace-normal leading-tight">
                  <div>
                    <p className="font-medium text-gray-900">{member.phone}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 min-w-[180px] max-w-[200px] break-words whitespace-normal leading-tight">
                  {member.department}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      roleStyles[member.role] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                      statusStyles[member.status] || ''
                    }`}
                  >
                    {member.status}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">
                  {format(member.memberSince, 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="h-9 rounded-none border border-gray-300 px-3 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
