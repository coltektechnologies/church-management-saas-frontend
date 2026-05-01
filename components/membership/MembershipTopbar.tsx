import { ReactNode } from 'react';

interface MembershipTopbarProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export default function MembershipTopbar({ title, subtitle, icon }: MembershipTopbarProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6 shadow-sm flex items-center gap-4">
      {icon && (
        <div className="w-10 h-10 rounded-full bg-[#0A2E46] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-[20px] font-bold text-[#0A2E46] leading-none mb-1">{title}</h1>
        {subtitle && <p className="text-[13px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
