import { Department } from '@/types/Department';

interface DepartmentCardProps {
  department: Department;
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[360px] flex flex-col">
      <div className={`${department.themeColor} px-6 py-6 text-white`}>
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
            ) : (
              <span className="text-2xl">{department.icon || '🏛️'}</span>
            )}
          </div>
        </div>
      </div>

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

        <div className="w-full bg-gray-200 h-2.5 rounded-full">
          <div
            className="bg-black/30 h-2.5 rounded-full"
            style={{ width: `${department.budgetUsed}%` }}
          />
        </div>

        <p className="text-base text-gray-600 leading-relaxed">{department.description}</p>

        <div className="flex gap-4 pt-2">
          <button className="flex-1 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
            👁️ View Details
          </button>

          <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
