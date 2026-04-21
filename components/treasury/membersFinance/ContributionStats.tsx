'use client';

import { MemberContribution } from '@/types/memberFinance';

interface Props {
  member: MemberContribution;
}

function StatCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-1.5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default function ContributionStats({ member }: Props) {
  const total = member.titheYTD + member.offeringsYTD + member.projectsYTD;

  return (
    <div className="grid grid-cols-2 gap-4 px-6 py-5">
      <StatCard
        label="Tithe (YTD)"
        value={`GHS${member.titheYTD.toLocaleString()}`}
        valueColor="text-teal-600"
      />
      <StatCard
        label="Offerings (YTD)"
        value={`GHS${member.offeringsYTD.toLocaleString()}`}
        valueColor="text-green-600"
      />
      <StatCard
        label="Projects (YTD)"
        value={`GHS${member.projectsYTD.toLocaleString()}`}
        valueColor="text-gray-800"
      />
      <StatCard
        label="Total (YTD)"
        value={`GHS${total.toLocaleString()}`}
        valueColor="text-blue-600"
      />
    </div>
  );
}
