import { UserSquare, Calendar, ShieldCheck, Shield, Briefcase } from 'lucide-react';
import type { MemberDetail } from '@/lib/api';
import { formatEnumLabel, primarySecondaryDepartments, shortMemberRef } from '@/components/membership/memberProfileDisplay';

type Props = {
  member: MemberDetail | null;
  loading: boolean;
};

export default function ChurchInfoTab({ member, loading }: Props) {
  const { primary, secondary } = primarySecondaryDepartments(member?.department_names);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const baptismLabel =
    member?.baptism_status === 'BAPTISED'
      ? 'Baptised'
      : member?.baptism_status === 'NOT_BAPTISED'
        ? 'Not baptised'
        : member?.baptism_status
          ? formatEnumLabel(member.baptism_status)
          : '—';

  const fields = [
    { label: 'Member ID', value: member ? shortMemberRef(member.id) : '—', icon: UserSquare, outlined: true },
    { label: 'Baptism', value: baptismLabel, icon: Calendar, outlined: true },
    {
      label: 'Membership Status',
      value: member?.membership_status ? formatEnumLabel(member.membership_status) : '—',
      icon: ShieldCheck,
      outlined: false,
    },
    { label: 'Primary Department', value: primary, icon: Shield, outlined: false },
    { label: 'Secondary Departments', value: secondary, icon: Shield, outlined: true },
    {
      label: 'Service Attendance',
      value: '—',
      icon: Briefcase,
      outlined: false,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
        {fields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-[#2FC4B2]" />
                <span className="text-[13px] font-bold text-[#0A2E46]">{field.label}</span>
              </div>
              <div
                className={`flex items-center px-4 py-2.5 text-[13px] text-[#0A2E46] font-medium min-h-10 rounded-md ${
                  field.outlined
                    ? 'border border-[#2FC4B2] bg-[#F4FDFB]'
                    : 'bg-[#F1F5F9] border border-transparent'
                }`}
              >
                {field.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
