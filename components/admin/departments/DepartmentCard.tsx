import { Department } from '@/types/Department';
import { COLOR_MAP, ICON_MAP } from '@/constants/departments';
import { Eye } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import Image from 'next/image';

interface DepartmentCardProps {
  department: Department;
  onViewDetails: (department: Department) => void;
  onEdit: (department: Department) => void;
}

export default function DepartmentCard({ department, onViewDetails, onEdit }: DepartmentCardProps) {
  const { can } = usePermissions();
  const isActive = department.status === 'active';
  const themeClass = COLOR_MAP[department.themeColor] ?? 'bg-gray-700';
  const iconMap = ICON_MAP;

  const budgetPercentage =
    department.annualBudget === 0
      ? 0
      : Math.min((department.budgetUsed / department.annualBudget) * 100, 100);

  return (
    <div
      className={`
        bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] overflow-hidden min-h-[360px] flex flex-col transition-all duration-300
        dark:shadow-none dark:ring-1 dark:ring-white/10
        ${isActive ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-70'}
      `}
    >
      {/* Header */}
      <div className={`${themeClass} px-6 pt-8 pb-6 text-white relative`}>
        <span
          className={`absolute top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full ${
            isActive ? 'bg-green-500 dark:bg-green-600' : 'bg-black/40 dark:bg-white/25'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold leading-tight">{department.name}</h3>
            <p className="text-sm opacity-90 mt-1">{department.code}</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {department.icon?.startsWith('data:') ? (
              <Image
                src={department.icon}
                alt="Department Icon"
                width={40}
                height={40}
                className="object-cover rounded-full"
                unoptimized
              />
            ) : iconMap[department.icon] ? (
              <span className="text-2xl text-white">{iconMap[department.icon]}</span>
            ) : (
              <span className="text-2xl">{department.icon || '🏛️'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-6 flex flex-col justify-between space-y-6">
        <div className="flex justify-between text-foreground">
          <div>
            <p className="font-semibold text-lg">{department.members}</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{department.activities}</p>
            <p className="text-sm text-muted-foreground">Activities</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{budgetPercentage.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground">Budget Used</p>
          </div>
        </div>

        <div className="w-full bg-muted dark:bg-white/15 h-2.5 rounded-full overflow-hidden">
          <div className={`${themeClass} h-2.5`} style={{ width: `${budgetPercentage}%` }} />
        </div>

        <p className="text-base text-muted-foreground leading-relaxed">{department.description}</p>

        <div className="flex gap-4 pt-2">
          {isActive ? (
            <button
              onClick={() => onViewDetails(department)}
              className="flex-1 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition flex items-center justify-center gap-2"
            >
              <Eye size={16} /> View Details
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
            >
              Inactive
            </button>
          )}

          {can('canEditDepartment') && (
            <button
              onClick={() => onEdit(department)}
              className="flex-1 py-3 rounded-lg border border-[var(--admin-border)] text-foreground text-sm font-medium hover:bg-muted/60 dark:hover:bg-white/5 transition"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
