import { User, Activity, CalendarDays, GraduationCap, Briefcase, Heart } from 'lucide-react';

export default function PersonalInfoTab() {
  const fields = [
    { label: 'Full Name', value: 'Owusu William', icon: User },
    { label: 'Gender', value: 'Male', icon: Activity }, // Using Activity as placeholder for gender symbol in lucide, could also use others
    { label: 'Date of Birth', value: 'May 02, 2000', icon: CalendarDays },
    { label: 'Age', value: '26 years', icon: Activity },
    { label: 'Education', value: 'Bachelor Degree', icon: GraduationCap },
    { label: 'Occupation', value: 'Unemployed', icon: Briefcase },
    { label: 'Marital Status', value: 'Single', icon: Heart },
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
