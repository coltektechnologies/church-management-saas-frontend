'use client';

import { Department } from '@/types/Department';
import { BudgetRequest } from '@/types/budget';
import { FaUniversity, FaCoins, FaClipboardList, FaClock } from 'react-icons/fa';
import { Calendar } from 'lucide-react';

// Module-level constant — Date.now() is called once when the module loads,
// not during render, so react-hooks/purity is satisfied
const MODULE_NOW = Date.now();

interface Props {
  departments: Department[];
  fiscalYear: string;
  budgetRequests?: BudgetRequest[];
  deadlineDate?: Date;
}

function computeDaysRemaining(deadlineDate: Date | undefined): number {
  if (!deadlineDate) {
    return 15;
  }
  return Math.max(Math.ceil((deadlineDate.getTime() - MODULE_NOW) / (1000 * 60 * 60 * 24)), 0);
}

function formatCurrency(v: number): string {
  if (v >= 1_000_000) {
    return `GHS${(v / 1_000_000).toFixed(1)}M`;
  }
  if (v >= 1000) {
    return `GHS${(v / 1000).toFixed(0)}K`;
  }
  return `GHS${v.toLocaleString()}`;
}

export default function BudgetDashboardHeader({
  departments,
  fiscalYear,
  budgetRequests = [],
  deadlineDate,
}: Props) {
  const activeDepartments = departments.filter((d) => d.status === 'active').length;
  const newDepartments = 2;
  const totalBudget = departments.reduce((sum, d) => sum + d.budgetUsed, 0);

  const departmentsWithNoBudget = departments.filter((d) => d.annualBudget === 0).length;
  const pendingRequests = budgetRequests.filter((r) => r.status === 'pending').length;
  const pendingSubmissions = departmentsWithNoBudget + pendingRequests;
  const awaitingReview = pendingRequests;

  const daysRemaining = computeDaysRemaining(deadlineDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Budget Submission</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and submit annual budget requests for your department
          </p>
        </div>
        {fiscalYear && (
          <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium w-fit">
            <Calendar size={15} />
            Fiscal Year {fiscalYear}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaUniversity size={20} className="text-teal-600" />}
          iconBg="bg-teal-100"
          value={activeDepartments}
          label="Active Departments"
          badge={`↑ +${newDepartments} this year`}
          badgeColor="text-green-600 bg-green-50"
        />
        <StatCard
          icon={<FaCoins size={20} className="text-blue-600" />}
          iconBg="bg-blue-100"
          value={formatCurrency(totalBudget)}
          label="Total Budget Allocated"
          badge="↑ 12% from last year"
          badgeColor="text-green-600 bg-green-50"
        />
        <StatCard
          icon={<FaClipboardList size={20} className="text-purple-600" />}
          iconBg="bg-purple-100"
          value={pendingSubmissions}
          label="Pending Submissions"
          badge={awaitingReview > 0 ? `${awaitingReview} awaiting review` : 'None awaiting review'}
          badgeColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={<FaClock size={20} className="text-orange-500" />}
          iconBg="bg-orange-100"
          value={`${daysRemaining} Days`}
          label="Deadline Remaining"
          badge="Submit by Mar 31, 2024"
          badgeColor="text-gray-600 bg-gray-100"
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
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className={`text-xs px-2.5 py-1 rounded-full w-fit font-medium ${badgeColor}`}>
        {badge}
      </div>
    </div>
  );
}
