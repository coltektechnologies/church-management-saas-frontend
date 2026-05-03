'use client';

import { Department } from '@/types/Department';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';

type LocalMember = {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
};

interface Props {
  department: Department;
  departmentMembers: LocalMember[];
}

export default function OverviewTab({ department, departmentMembers }: Props) {
  const { can } = usePermissions();

  const budgetPercentage =
    department.annualBudget === 0
      ? 0
      : Math.min((department.budgetUsed / department.annualBudget) * 100, 100);

  const departmentHead =
    department.headDisplayName?.trim() ||
    departmentMembers.find((m) => m.role === 'Leader')?.name ||
    'Not Assigned';
  const assistantHead =
    department.assistantHeadDisplayName?.trim() ||
    departmentMembers.find((m) => m.role === 'Assistant')?.name ||
    'Not Assigned';
  const elderInCharge = department.elderInChargeDisplayName?.trim() || 'Not Assigned';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <InfoCard title="Department Head" value={departmentHead} />
        <InfoCard title="Assistant Head" value={assistantHead} />
        <InfoCard title="Elder in charge" value={elderInCharge} />
        <InfoCard
          title="Status"
          value={department.status === 'active' ? 'Active' : 'Inactive'}
          isStatus
        />
        <InfoCard
          title="Date Established"
          value={new Date(department.dateEstablished).toLocaleDateString()}
        />
      </div>

      <div>
        <h4 className="text-muted-foreground mb-2">Department Description</h4>
        <p className="text-lg text-foreground">
          {department.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800 p-6 rounded-xl">
        <div>
          <p className="text-sm text-muted-foreground">Annual Budget</p>
          <p className="font-semibold text-lg text-foreground">
            GHS {department.annualBudget.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{budgetPercentage.toFixed(0)}% used</p>
        </div>

        {can('canAssignBudget') && (
          <Link
            href={`/departments/${department.id}/budget/new`}
            className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-400"
          >
            Assign Budget
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard label="Total Members" value={department.members} />
        <StatCard label="Upcoming Activities" value={department.activities} />
        <StatCard label="Announcements This Month" value={0} />
        <StatCard label="Budget Utilisation" value={`${budgetPercentage.toFixed(0)}%`} />
      </div>
    </>
  );
}

function InfoCard({
  title,
  value,
  isStatus,
}: {
  title: string;
  value: string;
  isStatus?: boolean;
}) {
  return (
    <div className="bg-muted/30 dark:bg-white/[0.04] border border-[var(--admin-border)] p-6 rounded-xl">
      <p className="text-muted-foreground">{title}</p>
      <div className="mt-2 text-lg font-medium flex items-center gap-2 text-foreground">
        {isStatus && (
          <span className="w-3 h-3 rounded-full bg-green-600 dark:bg-emerald-400 shrink-0" />
        )}
        {value}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/30 dark:bg-white/[0.04] border border-[var(--admin-border)] p-6 rounded-xl text-center">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-2 text-foreground">{value}</p>
    </div>
  );
}
