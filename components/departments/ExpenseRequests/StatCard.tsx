import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconBgColor: string;
  iconColor: string;
}

export function StatCard({ icon: Icon, value, label, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg">
      <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${iconBgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    </div>
  );
}
