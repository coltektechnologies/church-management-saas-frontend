'use client';

import { Department } from '@/types/Department';

type LocalMember = {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
};

type MockChurchMember = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

interface Props {
  department: Department;
  departmentMembers: LocalMember[];
  setDepartmentMembers: React.Dispatch<React.SetStateAction<LocalMember[]>>;
  mockChurchMembers: MockChurchMember[];
  onAddClick: () => void;
  onUpdateDepartment: (updated: Department) => void;
}

export default function MembersTab({
  department,
  departmentMembers,
  setDepartmentMembers,
  mockChurchMembers,
  onAddClick,
  onUpdateDepartment,
}: Props) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-2xl font-semibold text-gray-900">
          Department Members
          <span className="ml-2 text-base font-normal text-gray-500">({department.members})</span>
        </h3>

        <button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          + Add Member
        </button>
      </div>

      <div className="mt-8">
        {departmentMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-lg font-medium text-gray-800">No members yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              Add members from your church records to assign them to this department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {departmentMembers.map((member) => {
              const fullMember = mockChurchMembers.find((m) => m.id === member.id);

              return (
                <div
                  key={member.id}
                  className="bg-gray-100 rounded-2xl px-6 py-6 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-gray-200"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                    {fullMember?.image ? (
                      <img
                        src={fullMember.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-semibold text-gray-600">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-green-700 text-base">{member.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>
                        Member Since{' '}
                        {new Date(member.joinedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                        })}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          member.role === 'Leader'
                            ? 'bg-purple-100 text-purple-700'
                            : member.role === 'Assistant'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
