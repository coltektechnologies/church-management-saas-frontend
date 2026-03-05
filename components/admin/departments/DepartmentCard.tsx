import { Department } from '@/types/Department';
import { COLOR_MAP, ICON_MAP } from '@/constants/departments';
import { Eye } from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
  onViewDetails: (department: Department) => void;
}

export default function DepartmentCard({ department, onViewDetails }: DepartmentCardProps) {
  const isActive = department.status === 'active';

  const themeClass = COLOR_MAP[department.themeColor] ?? 'bg-gray-700';
  const iconMap = ICON_MAP;

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[360px] flex flex-col transition-all duration-300
        ${isActive ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-70'}
      `}
    >
      {/* Header */}
      <div className={`${themeClass} px-6 pt-8 pb-6 text-white relative`}>
        {/* Status Badge */}
        <span
          className={`
           absolute top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full
            ${isActive ? 'bg-green-500' : 'bg-gray-600'}
          `}
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
              <img
                src={department.icon}
                alt="Department Icon"
                className="h-10 w-10 object-cover rounded-full"
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
        <div className="flex justify-between text-gray-800">
          <div>
            <p className="font-semibold text-lg">{department.members}</p>
            <p className="text-sm text-gray-500">Members</p>
          </div>

          <div>
            <p className="font-semibold text-lg">{department.activities}</p>
            <p className="text-sm text-gray-500">Activities</p>
          </div>

          <div>
            <p className="font-semibold text-lg">{department.budgetUsed}%</p>
            <p className="text-sm text-gray-500">Budget Used</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div className={`${themeClass} h-2.5`} style={{ width: `${department.budgetUsed}%` }} />
        </div>

        <p className="text-base text-gray-600 leading-relaxed">{department.description}</p>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          {isActive ? (
            <button
              onClick={() => onViewDetails(department)}
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Eye size={16} /> View Details
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-3 rounded-lg bg-gray-400 text-white text-sm font-medium cursor-not-allowed"
            >
              Inactive
            </button>
          )}

          <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
