'use client';

import { Department } from '@/types/Department';

interface Props {
  department: Department;
}

export default function OverviewTab({ department }: Props) {
  return (
    <>
      {/* Info Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <InfoCard title="Department Head" value="Not Assigned" />
        <InfoCard title="Assistant Head" value="Not Assigned" />
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

      {/* Description */}
      <div>
        <h4 className="text-gray-500 mb-2">Department Description</h4>
        <p className="text-lg text-gray-800">
          {department.description || 'No description provided.'}
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard label="Total Members" value={department.members} />
        <StatCard label="Upcoming Activities" value={department.activities} />
        <StatCard label="Announcements This Month" value={0} />
        <StatCard label="Budget Utilisation" value={`${department.budgetUsed}%`} />
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
    <div className="bg-gray-50 p-6 rounded-xl">
      <p className="text-gray-500">{title}</p>
      <div className="mt-2 text-lg font-medium flex items-center gap-2">
        {isStatus && <span className="w-3 h-3 rounded-full bg-green-600"></span>}
        {value}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl text-center">
      <p className="text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
