import { User, Activity, CalendarDays, GraduationCap, Briefcase, Heart } from 'lucide-react';
import type { MemberDetail } from '@/lib/api';
import {
  ageFromDob,
  displayMemberName,
  formatDateLong,
  formatEnumLabel,
} from '@/components/membership/memberProfileDisplay';

type Props = {
  member: MemberDetail | null;
  loading: boolean;
};

export default function PersonalInfoTab({ member, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ageStr = ageFromDob(member?.date_of_birth);

  const fields = [
    { label: 'Full Name', value: member ? displayMemberName(member) : '—', icon: User },
    {
      label: 'Gender',
      value: member?.gender ? formatEnumLabel(member.gender) : '—',
      icon: Activity,
    },
    {
      label: 'Date of Birth',
      value: formatDateLong(member?.date_of_birth),
      icon: CalendarDays,
    },
    { label: 'Age', value: ageStr ?? '—', icon: Activity },
    {
      label: 'Education',
      value: member?.education_level ? formatEnumLabel(member.education_level) : '—',
      icon: GraduationCap,
    },
    {
      label: 'Occupation',
      value: member?.occupation?.trim() || '—',
      icon: Briefcase,
    },
    {
      label: 'Marital Status',
      value: member?.marital_status ? formatEnumLabel(member.marital_status) : '—',
      icon: Heart,
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
              <div className="bg-[#F1F5F9] border border-transparent rounded-md px-4 py-2.5 text-[13px] text-[#0A2E46] font-medium min-h-[40px] flex items-center">
                {field.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
