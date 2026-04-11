import { Info, CheckCircle, Archive, Check } from 'lucide-react';
import { StatCard } from './StatCard';

export default function App() {
  const stats = [
    {
      icon: Info,
      value: 8,
      label: 'Pending Requests',
      iconBgColor: 'bg-orange-500',
      iconColor: 'text-white',
    },
    {
      icon: CheckCircle,
      value: 12,
      label: 'Approved Requests',
      iconBgColor: 'bg-green-600',
      iconColor: 'text-white',
    },
    {
      icon: Archive,
      value: 20,
      label: 'Total Requests',
      iconBgColor: 'bg-blue-700',
      iconColor: 'text-white',
    },
    {
      icon: Check,
      value: 16,
      label: 'Already Recorded',
      iconBgColor: 'bg-purple-600',
      iconColor: 'text-white',
    },
  ];

  return (
    <div className="size-full flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
    </div>
  );
}
