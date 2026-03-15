'use client';

import { Expense } from '@/types/expense';
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Props {
  expenses: Expense[];
  departmentName: string;
  departmentCode: string;
}

export default function ExpenseDashboardHeader({
  expenses,
  departmentName,
  departmentCode,
}: Props) {
  const total = expenses.length;
  const pending = expenses.filter((e) => e.status === 'pending').length;
  const approved = expenses.filter((e) => e.status === 'approved').length;
  const rejected = expenses.filter((e) => e.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Expense Request</h1>
        <p className="text-sm text-gray-500 mt-1">
          {departmentName} · {departmentCode}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaClipboardList size={18} className="text-blue-600" />}
          iconBg="bg-blue-100"
          value={total}
          label="Total Requests"
        />
        <StatCard
          icon={<FaClock size={18} className="text-amber-500" />}
          iconBg="bg-amber-100"
          value={pending}
          label="Pending"
        />
        <StatCard
          icon={<FaCheckCircle size={18} className="text-green-600" />}
          iconBg="bg-green-100"
          value={approved}
          label="Approved"
        />
        <StatCard
          icon={<FaTimesCircle size={18} className="text-red-500" />}
          iconBg="bg-red-100"
          value={rejected}
          label="Rejected"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
