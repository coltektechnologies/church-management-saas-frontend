import { UserSquare, Calendar, ShieldCheck, Shield, Briefcase } from 'lucide-react';

export default function ChurchInfoTab() {
  const fields = [
    { label: 'Member ID', value: 'M-0241', icon: UserSquare, outlined: true },
    { label: 'Baptism Date', value: 'December 10, 2021', icon: Calendar, outlined: true },
    { label: 'Membership Status', value: 'Active Member', icon: ShieldCheck, outlined: false },
    { label: 'Primary Department', value: 'Music Ministry', icon: Shield, outlined: false },
    { label: 'Secondary Departments', value: 'Youth Dept, Outreach', icon: Shield, outlined: true },
    { label: 'Service Attendance', value: '83% (Last 3 Months)', icon: Briefcase, outlined: false },
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
